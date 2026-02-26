# MCP Ecosystem — Roosevelt OPS

**Issue:** ROOSE-53 (MCP Ecosystem Expansion)
**Version:** 1.0.0
**Date:** 2026-02-26

This document is the primary reference for MCP server usage in Roosevelt OPS. It covers which
servers are available, what they do for this project, when to prefer MCP over direct API calls,
and how each server is configured.

For integration patterns (pagination, fallback chains, error recovery, etc.) see
[MCP Integration Patterns](../mcp/MCP-INTEGRATION-PATTERNS.md).

For a full audit of all 30 servers and the expansion roadmap see
[MCP Ecosystem Audit](../mcp/MCP-ECOSYSTEM-AUDIT.md).

---

## Available MCP Servers for Roosevelt OPS

### Project Management — Plane

| Tool prefix | `mcp__plane__*` |
|-------------|-----------------|
| Server | `@disrex/plane-mcp-server` v0.4.5 |
| Tools | 76 |
| Usage | High — daily |

**Roosevelt OPS use cases:**

- Create and update ROOSE issues directly from Claude sessions
- Transition issue states (Backlog → In Progress → Done)
- Add comments and links to issues after code changes
- Query open issues to understand current sprint scope
- Create sub-issues for task decomposition

**Key constants (see `lib/mcp/plane-client.ts`):**

```
Project ID : c7d0b955-a97f-40b6-be03-7c05c2d0b1c3
Workspace  : rooseveltdigital
Backlog    : e167edf7-d46e-48b4-ba76-31a33e5fb933
In Progress: e7e9879e-f38c-4140-a1ec-79cec5d1cf00
Done       : c8bfdf86-913c-422a-873c-e7a09e6f2589
```

---

### Version Control — GitHub

| Tool prefix | `mcp__github__*` |
|-------------|-----------------|
| Server | Official GitHub MCP |
| Tools | 20+ |
| Usage | High — every PR/release |

**Roosevelt OPS use cases:**

- Create feature branches and pull requests
- Query PR status and review threads
- Link PRs to Plane issues via create_issue_link
- Read file contents from remote branches
- Search code across the repository

---

### Design — Figma

| Tool prefix | `mcp__figma__*` (community) |
|-------------|------------------------------|
| Server | Community Figma MCP |
| Tools | 2 |
| Usage | Medium — design token sync |

| Tool prefix | `mcp__fig__*` (official) |
|-------------|--------------------------|
| Server | Official Figma MCP |
| Tools | 10+ |
| Usage | Medium — full design data |

**Roosevelt OPS use cases:**

- Fetch design tokens from the Claude-Designs Figma file
- Extract component variants and styles for implementation
- Validate implemented components against design specs
- Sync colour/typography tokens with `tailwind.config.ts`

**Figma file:** `https://figma.com/file/D9lhL1k3Hz3RuBXPyZ4zXJ/Claude-Designs`

For programmatic access see `lib/mcp/figma-client.ts`.

---

### Error Tracking — Sentry

| Tool prefix | `mcp__sentry__*` |
|-------------|-----------------|
| Server | Official Sentry MCP |
| Tools | 10+ |
| Usage | Medium — incident triage |

**Roosevelt OPS use cases:**

- Search and triage production errors
- Fetch event details and stack traces during incident response
- Link Sentry issues to Plane incident issues
- Get performance profiles for slow endpoints

---

### Database — Supabase

| Tool prefix | `mcp__supabase__*` |
|-------------|-------------------|
| Server | Official Supabase MCP |
| Tools | 15+ |
| Usage | Medium — schema changes |

**Roosevelt OPS use cases:**

- Execute SQL for schema migrations and data queries
- Apply migrations in coordination with `supabase/` directory
- Generate TypeScript types after schema changes
- List tables and extensions during development

---

### Communication — Slack

| Tool prefix | `mcp__slack__*` |
|-------------|----------------|
| Server | Community Slack MCP |
| Tools | 4 |
| Usage | Medium — incident comms |

**Roosevelt OPS use cases:**

- Post incident notifications to relevant channels
- Read incident thread context during postmortem writing
- Search historical messages for incident timelines

---

### Infrastructure — Vercel

| Tool prefix | `mcp__vc__*` |
|-------------|-------------|
| Server | Official Vercel MCP |
| Tools | 100+ |
| Usage | Medium — deployments |

**Roosevelt OPS use cases:**

- Query deployment status and logs
- Manage environment variables across preview and production
- Investigate failed deployments
- Manage project domains

---

### Search — Perplexity / Exa / Brave

| Tool prefix | `mcp__perplexity__*` · `mcp__exa__*` · `mcp__bs__*` |
|-------------|------------------------------------------------------|
| Usage | Medium — research and documentation |

**Roosevelt OPS use cases:**

- Research third-party API documentation and changelogs
- Find community examples for new integrations
- Validate technical approaches before implementation

---

### Reasoning — Sequential Thinking

| Tool prefix | `mcp__seq__*` |
|-------------|--------------|
| Server | Sequential Thinking MCP |
| Tools | 1 |
| Usage | High — complex problems |

**Roosevelt OPS use cases:**

- Architecture decision reasoning
- Debugging complex multi-system issues
- Planning large refactors

---

### Knowledge Graph — Memory

| Tool prefix | `mcp__memory__*` |
|-------------|----------------|
| Server | Memory MCP |
| Tools | 8 |
| Usage | High — cross-session context |

**Roosevelt OPS use cases:**

- Store project-specific knowledge between Claude sessions
- Track decisions, patterns, and known issues
- Maintain agent team context across long-running tasks

---

### Code Quality — ESLint

| Tool prefix | `mcp__eslint__*` |
|-------------|----------------|
| Tools | 1 |
| Usage | High — pre-commit |

**Roosevelt OPS use cases:**

- Lint TypeScript files before committing
- Enforce coding standards without leaving Claude session

---

## When to Use MCP vs Direct API

### Prefer MCP when

- Operating from a Claude session (no separate terminal needed)
- Chaining multiple operations across services (e.g. create PR → link to Plane → notify Slack)
- Reading data to inform code generation (design tokens, issue descriptions)
- State transitions are orchestrated by an agent

### Prefer direct API / SDK when

- Runtime application code needs to call an external service (use typed wrappers in `lib/integrations/`)
- The operation must be reproducible in CI/CD pipelines (no Claude session available)
- You need precise control over retry logic, timeouts, and error handling
- Data must be persisted to the database or event store

### Decision table

| Scenario | Approach |
|----------|----------|
| Claude agent updating issue state | MCP (`mcp__plane__update-issue`) |
| Application creating Plane issue on incident | Direct API (`lib/integrations/plane.ts`) |
| Developer querying Figma during implementation | MCP (`mcp__figma__get_figma_data`) |
| Application syncing design tokens at build time | Direct API (`lib/mcp/figma-client.ts`) |
| Claude investigating a Sentry error | MCP (`mcp__sentry__get_issue_details`) |
| Application linking Sentry event to incident | Direct API (Sentry REST API) |

---

## Configuration Reference

### Server registration pattern (`~/.claude.json`)

```json
{
  "mcpServers": {
    "plane": {
      "command": "npx",
      "args": ["-y", "@disrex/plane-mcp-server"],
      "env": {
        "PLANE_API_KEY": "<secret>",
        "PLANE_BASE_URL": "https://api.plane.so"
      }
    }
  }
}
```

### Required environment variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| `PLANE_API_KEY` | Plane MCP + `lib/integrations/plane.ts` | Plane REST API auth |
| `PLANE_WORKSPACE_SLUG` | `lib/integrations/plane.ts` | Workspace identifier |
| `FIGMA_ACCESS_TOKEN` | Figma MCP | Figma REST API auth |
| `GITHUB_TOKEN` | GitHub MCP + metrics | Higher rate limits |
| `SENTRY_AUTH_TOKEN` | Sentry MCP | Sentry API auth |

### Deferred loading

To keep session context lean, rarely-used servers are deferred. They are loaded on demand via
`ToolSearch` before first use.

| Server | Load strategy |
|--------|--------------|
| `plane`, `github`, `filesystem` | Always loaded |
| `eslint`, `supabase`, `sentry` | Early deferred |
| `figma`, `slack`, `vc` | Standard deferred |
| `blender`, `maestro`, `notebooklm` | Late deferred |

---

## Typed Client Wrappers

For application code that needs to call MCP-backed services programmatically:

| File | Purpose |
|------|---------|
| `lib/mcp/plane-client.ts` | Typed Plane operations with project/state constants |
| `lib/mcp/figma-client.ts` | Design token and component data fetching from Figma |
| `lib/integrations/plane.ts` | Incident-focused Plane integration (existing) |

---

## Related Documents

- [MCP Ecosystem Audit](../mcp/MCP-ECOSYSTEM-AUDIT.md)
- [MCP Integration Patterns](../mcp/MCP-INTEGRATION-PATTERNS.md)
- [MCP Server Development Guide](../mcp/MCP-SERVER-DEVELOPMENT-GUIDE.md)
- [Figma Workflow](../design/05-figma-workflow.md)
- [Plane MCP Workflow](~/.claude/rules/plane-mcp-workflow.md)
