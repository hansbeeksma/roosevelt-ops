# MCP Integration Patterns

**Issue:** ROOSE-53 (MCP Ecosystem Expansion)
**Version:** 1.0.0
**Date:** 2026-02-17

---

## Overview

This document defines standard patterns for integrating MCP servers into the Roosevelt OPS development workflow. These patterns ensure consistency, reliability, and efficient context usage across all MCP integrations.

---

## Pattern 1: Validate-Then-Act

Always validate resources exist before operating on them.

### Problem
MCP tool calls that assume resources exist fail with cryptic errors when IDs are stale or resources have been deleted.

### Solution
```
1. List/Get resource to validate existence
2. Extract fresh ID from response
3. Perform operation with validated ID
4. Verify result
```

### Example: Plane Issue Creation

```
Step 1: mcp__plane__list-projects() -> Get fresh project ID
Step 2: mcp__plane__list-labels(project_id) -> Get label IDs
Step 3: mcp__plane__create-issue(project_id, ..., labels: [label_ids])
Step 4: mcp__plane__get-issue(project_id, issue_id) -> Verify created
```

### Anti-Pattern
```
WRONG: Use cached project ID from file
       mcp__plane__create-issue(stale_id, ...)
       -> HTTP 404
```

---

## Pattern 2: Fallback Chain

Define fallback strategies when primary MCP server is unavailable.

### Problem
MCP servers can be offline, rate-limited, or returning errors.

### Solution

```
Primary MCP Server
    |
    | failure
    v
Secondary MCP Server (if available)
    |
    | failure
    v
CLI Fallback (gh, curl, etc.)
    |
    | failure
    v
Manual Instructions (document steps)
```

### Current Fallback Chains

| Primary | Secondary | CLI Fallback |
|---------|-----------|-------------|
| GitHub MCP | -- | `gh` CLI |
| Brave Search | Exa | WebSearch tool |
| Perplexity | Exa | WebSearch tool |
| Plane MCP | -- | Plane web UI |
| Figma (community) | Fig (official) | Figma web UI |
| Memory MCP | -- | File-based state |
| Supabase MCP | -- | `supabase` CLI |

---

## Pattern 3: Response Pagination

Handle large response sets efficiently.

### Problem
MCP tools returning 100+ items consume significant context (~50-200KB).

### Solution

```typescript
// Step 1: Get count or first page
const firstPage = await mcp__plane__list_issues({
  project_id: id,
  per_page: 25,  // Start small
  state_id: inProgressState  // Filter aggressively
});

// Step 2: Only paginate if needed
if (firstPage.next_cursor) {
  const nextPage = await mcp__plane__list_issues({
    project_id: id,
    per_page: 25,
    cursor: firstPage.next_cursor
  });
}
```

### Best Practices

| Practice | Impact |
|----------|--------|
| Always use filters | Reduces response 50-90% |
| Set per_page limits | Predictable context cost |
| Paginate on demand | Only fetch what Claude needs |
| Prefer specific getters | `get-issue(id)` vs `list-issues()` |

---

## Pattern 4: Deferred Loading

Load MCP tools only when needed.

### Problem
Loading all 400+ MCP tools at session start consumes context and slows initialization.

### Solution

```
Session Start: Only core tools loaded
    |
    v
User Request: "Check Sentry errors"
    |
    v
ToolSearch: "sentry errors" -> Load sentry tools
    |
    v
Tool Call: mcp__sentry__search_issues(...)
```

### Implementation

In `~/.claude.json`, MCP servers are registered but tools are deferred. Claude Code uses `ToolSearch` to discover and load tools on demand.

### Which Servers to Defer

| Frequency | Strategy | Example |
|-----------|----------|---------|
| Every session | Always loaded | filesystem, github |
| Most sessions | Early deferred | plane, eslint |
| Some sessions | Standard deferred | sentry, playwright |
| Rare sessions | Late deferred | blender, maestro |

---

## Pattern 5: Context-Aware Tool Selection

Choose the right MCP tool based on context budget.

### Problem
Same data can often be retrieved multiple ways with different context costs.

### Solution

| Context Level | Strategy | Tool Choice |
|--------------|----------|-------------|
| <50% | Full responses OK | Any tool, full detail |
| 50-70% | Filtered responses | Use filters, pagination |
| 70-85% | Minimal responses | Specific getters only |
| 85%+ | Critical only | Avoid bulk MCP calls |

### Example: "Show project issues"

```
At 30% context: mcp__plane__list-issues(project_id) -> Full list
At 60% context: mcp__plane__list-issues(project_id, state: "in_progress") -> Filtered
At 80% context: mcp__plane__get-issue(project_id, specific_id) -> Single issue
At 90% context: "Check Plane web UI at https://app.plane.so/rooseveltdigital/"
```

---

## Pattern 6: Idempotent Operations

Ensure MCP operations are safe to retry.

### Problem
Network timeouts or errors may cause operations to be retried, leading to duplicate resources.

### Solution

```typescript
// Before creating, check if exists
const existing = await mcp__plane__list_labels(project_id);
const label = existing.results.find(l => l.name === "my-label");

if (label) {
  // Already exists, use it
  return label.id;
}

// Does not exist, create
const newLabel = await mcp__plane__create_label({
  project_id,
  name: "my-label",
  color: "#FF0000"
});
return newLabel.id;
```

### Anti-Pattern
```
WRONG: Create without checking
       mcp__plane__create_label(...)  // May create duplicate!
```

---

## Pattern 7: Error Recovery

Handle MCP errors gracefully.

### Error Categories

| HTTP Status | Category | Action |
|-------------|----------|--------|
| 400 | Bad Request | Fix input, do not retry |
| 401/403 | Auth Error | Check API key, do not retry |
| 404 | Not Found | Validate resource exists |
| 409 | Conflict | Check current state, resolve |
| 422 | Validation | Fix business logic constraint |
| 429 | Rate Limit | Wait and retry with backoff |
| 500+ | Server Error | Retry with backoff (max 3) |

### Retry Strategy

```
Attempt 1: Immediate
Attempt 2: Wait 1s
Attempt 3: Wait 3s
Give up: Use fallback or report error
```

---

## Pattern 8: Multi-Server Coordination

Coordinate operations across multiple MCP servers.

### Problem
Complex workflows require data from multiple servers (e.g., create GitHub PR then link in Plane).

### Solution

```
1. Plane: Get issue details
2. GitHub: Create branch and PR
3. Plane: Link PR to issue via create_issue_link
4. Plane: Update issue state to "In Review"
5. Slack: Notify team about PR
```

### Failure Handling

If step 3 fails, steps 1 and 2 are already complete:
- Log the failure
- Continue with remaining steps
- Note the unlinked PR in issue comment
- Do not rollback successful operations

---

## Pattern 9: Authentication Management

Handle API keys and tokens securely.

### Principles

1. **Never hardcode** secrets in MCP server code
2. **Environment variables** for API keys
3. **No secrets in responses** returned to Claude
4. **Rotate keys** periodically
5. **Minimal permissions** per server

### Configuration

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "API_KEY": "stored-in-env-not-git"
      }
    }
  }
}
```

### Key Rotation Checklist

- [ ] Generate new API key in service dashboard
- [ ] Update `~/.claude.json` with new key
- [ ] Restart Claude Code session
- [ ] Verify server works with new key
- [ ] Revoke old key

---

## Pattern 10: Monitoring and Observability

Track MCP server health and usage.

### Metrics to Track

| Metric | Collection | Purpose |
|--------|-----------|---------|
| Tool call count | Per session | Usage patterns |
| Error rate | Per server | Health monitoring |
| Response time | Per call | Performance |
| Response size | Per call | Context impact |
| Token cost | Per session | Budget tracking |

### Health Checks

```bash
# Monthly MCP audit (from mcp-context-monitoring.md)
jq '.mcpServers | keys' ~/.claude.json  # List servers
# Verify each server starts without errors
# Check for unused servers
```

---

## Quick Reference: When to Use Which Pattern

| Situation | Pattern |
|-----------|---------|
| Creating/updating resources | Validate-Then-Act |
| Server might be down | Fallback Chain |
| Listing many items | Response Pagination |
| Rarely-used server | Deferred Loading |
| High context usage | Context-Aware Selection |
| Create if not exists | Idempotent Operations |
| API returns error | Error Recovery |
| Cross-service workflow | Multi-Server Coordination |
| Configuring new server | Authentication Management |
| Ongoing maintenance | Monitoring and Observability |

---

## Related Documents

- [MCP Ecosystem Audit](MCP-ECOSYSTEM-AUDIT.md)
- [MCP Server Development Guide](MCP-SERVER-DEVELOPMENT-GUIDE.md)
- [MCP Context Monitoring](../procedures/mcp-context-monitoring.md)
- [MCP Reference](~/.claude/docs/MCP-REFERENCE.md)
- [MCP Best Practices](~/.claude/docs/MCP-BEST-PRACTICES.md)
