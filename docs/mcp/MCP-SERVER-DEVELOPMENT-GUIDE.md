# MCP Server Development Guide

**Issue:** ROOSE-53 (MCP Ecosystem Expansion)
**Version:** 1.0.0
**Date:** 2026-02-17

---

## Overview

This guide covers building custom MCP (Model Context Protocol) servers for Roosevelt OPS internal tools and integrations. MCP is a vendor-neutral protocol for connecting AI models to external tools and data sources.

---

## MCP Protocol Fundamentals

### Architecture

```
Claude Code (Client)
    |
    v
MCP Client (JSON-RPC over stdio)
    |
    v
MCP Server (Your code)
    |
    v
External API / Database / Tool
```

### Message Flow

1. Claude Code starts MCP server as subprocess
2. Client sends `initialize` with capabilities
3. Server responds with tool definitions
4. Client sends `tools/call` when tool is needed
5. Server executes and returns result
6. Server stays alive for session duration

### Transport

- **stdio** (default) -- stdin/stdout JSON-RPC
- **SSE** (server-sent events) -- HTTP-based, for remote servers

---

## Quick Start: TypeScript MCP Server

### Project Setup

```bash
mkdir my-mcp-server
cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "declaration": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

### src/index.ts -- Minimal Server

```typescript
#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Tool input schemas
const GreetInputSchema = z.object({
  name: z.string().describe("Name to greet"),
});

// Create server
const server = new Server(
  {
    name: "my-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "greet",
      description: "Generate a greeting message",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: {
            type: "string",
            description: "Name to greet",
          },
        },
        required: ["name"],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "greet": {
      const { name: personName } = GreetInputSchema.parse(args);
      return {
        content: [
          {
            type: "text" as const,
            text: `Hello, ${personName}! Welcome to Roosevelt OPS.`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running on stdio");
}

main().catch(console.error);
```

### Build and Register

```bash
# Build
npx tsc

# Register in Claude Code
# Add to ~/.claude.json:
```

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/my-mcp-server/dist/index.js"],
      "env": {}
    }
  }
}
```

---

## Advanced Patterns

### API Wrapper Pattern

Most custom MCP servers wrap an external REST API:

```typescript
import { z } from "zod";

// Define API client
class MyApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }
}

// Use in tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const client = new MyApiClient(
    process.env.API_BASE_URL || "https://api.example.com",
    process.env.API_KEY || ""
  );

  switch (request.params.name) {
    case "list-items": {
      const items = await client.get("/items");
      return {
        content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      };
    }
    // ... more tools
  }
});
```

### CLI Wrapper Pattern

Wrap existing CLI tools as MCP servers:

```typescript
import { execSync } from "child_process";

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "run-lighthouse": {
      const { url } = z
        .object({ url: z.string().url() })
        .parse(request.params.arguments);

      const result = execSync(
        `npx lighthouse ${url} --output=json --quiet`,
        {
          encoding: "utf-8",
          timeout: 60000,
        }
      );

      const report = JSON.parse(result);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                performance: report.categories.performance.score,
                accessibility: report.categories.accessibility.score,
                bestPractices: report.categories["best-practices"].score,
                seo: report.categories.seo.score,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
});
```

### Error Handling Pattern

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    // ... tool logic
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: "text",
            text: `Validation error: ${error.errors.map((e) => e.message).join(", ")}`,
          },
        ],
        isError: true,
      };
    }

    if (error instanceof Error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: "Unknown error occurred" }],
      isError: true,
    };
  }
});
```

---

## Roosevelt OPS Custom Servers

### Planned Custom MCP Servers

#### 1. roosevelt-internal

Internal tooling bridge for Roosevelt OPS workflows.

**Tools:**
- `list-active-projects` -- Get all active projects with status
- `get-project-health` -- Health metrics for a project
- `deployment-status` -- Current deployment state across all projects
- `team-availability` -- Check agent/resource availability

#### 2. deployment-pipeline

CI/CD orchestration combining GitHub Actions + Vercel.

**Tools:**
- `trigger-deploy` -- Trigger deployment for a project
- `deploy-status` -- Check deployment status
- `rollback` -- Rollback to previous deployment
- `preview-url` -- Get preview deployment URL

#### 3. metrics-collector

DORA/SPACE metrics from multiple sources.

**Tools:**
- `dora-metrics` -- Deployment frequency, lead time, MTTR, change failure rate
- `space-metrics` -- Satisfaction, performance, activity, communication, efficiency
- `project-velocity` -- Sprint velocity and burndown
- `quality-trends` -- Test coverage, bug rate, tech debt trends

---

## Testing MCP Servers

### Unit Testing

```typescript
import { describe, it, expect } from "vitest";

describe("greet tool", () => {
  it("should return greeting message", async () => {
    const result = await handleToolCall("greet", { name: "Sam" });
    expect(result.content[0].text).toContain("Hello, Sam!");
  });

  it("should reject empty name", async () => {
    await expect(handleToolCall("greet", { name: "" })).rejects.toThrow();
  });
});
```

### Integration Testing

```bash
# Test with Claude Code MCP Inspector
npx @modelcontextprotocol/inspector node dist/index.js

# Manual stdio test
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node dist/index.js
```

### End-to-End Testing

```bash
# Add server to Claude Code and test
# In Claude Code session:
# "Use my-server to greet Sam"
# Verify correct tool invocation and response
```

---

## Deployment Checklist

### Before Publishing

- [ ] All tools have clear descriptions
- [ ] Input schemas use Zod validation
- [ ] Error handling returns `isError: true`
- [ ] No hardcoded secrets (use env vars)
- [ ] TypeScript strict mode passes
- [ ] Unit tests cover all tools
- [ ] README with installation instructions
- [ ] Tool names are short (<50 chars after prefix)
- [ ] Response sizes are bounded (pagination for lists)

### Registration in Claude Code

```json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
      "env": {
        "API_KEY": "<secret>"
      }
    }
  }
}
```

### Context Efficiency

| Practice | Why |
|----------|-----|
| Short server names | Tool name = `mcp__name__tool` (128 char limit) |
| Bounded responses | Large responses consume context |
| Pagination support | Let Claude request pages |
| Filter parameters | Reduce response size at source |
| Deferred loading | Add to ToolSearch for lazy loading |

---

## Contributing to MCP Ecosystem

### Open Source Contribution

1. Build server for a gap in the ecosystem
2. Follow MCP SDK conventions
3. Publish to npm with `@rooseveltops/` scope (or contribute to community)
4. Add to MCP server registry (if available)
5. Document in this guide

### Server Registry

Track all custom servers in the ROOSE project:

| Server | Package | Status | Author |
|--------|---------|--------|--------|
| (planned) roosevelt-internal | `@rooseveltops/mcp-internal` | Planning | Team |
| (planned) deployment-pipeline | `@rooseveltops/mcp-deploy` | Planning | Team |
| (planned) metrics-collector | `@rooseveltops/mcp-metrics` | Planning | Team |

---

## Related Documents

- [MCP Ecosystem Audit](MCP-ECOSYSTEM-AUDIT.md)
- [MCP Integration Patterns](MCP-INTEGRATION-PATTERNS.md)
- [MCP Reference](~/.claude/docs/MCP-REFERENCE.md)
- [MCP Best Practices](~/.claude/docs/MCP-BEST-PRACTICES.md)
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
