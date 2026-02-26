# Architecture Decision Records (ADRs)

> **Project:** Roosevelt OPS
> **Format:** Simplified ADR format (Context, Decision, Consequences)

---

## ADR-001: File-Based Locking for Multi-Agent Coordination

**Date:** 2026-02-08
**Status:** Accepted

### Context

We needed a coordination mechanism for multiple concurrent LLM agents working on the same project. Options considered:
- Redis-based distributed locks
- Database-based locks
- File-based locks (flock)

### Decision

Use **file-based locking** via `flock` for multi-agent coordination.

**Rationale:**
- Zero external dependencies (Redis/DB not required)
- Atomic operations guaranteed by OS kernel
- Simple implementation (~50 lines of bash)
- Works across terminals without network calls
- Acceptable performance (~200ms lock acquisition)

### Consequences

**Positive:**
- Immediate usability (no setup required)
- Cross-platform compatibility (macOS, Linux)
- Atomic lock acquisition prevents race conditions
- Easy to debug (lock files visible in filesystem)

**Negative:**
- Stale locks if process crashes (mitigated by heartbeat)
- Not suitable for distributed systems (single-machine only)
- Cleanup required for orphaned lock files

**Implementation:** `~/.claude/scripts/issue-claimer.sh`, `~/.claude/sync/coordination-config.json`

---

## ADR-002: Git Worktrees for Agent Isolation

**Date:** 2026-02-08
**Status:** Accepted

### Context

Multiple agents working on the same repository needed file isolation to prevent conflicts. Options considered:
- Frequent branch switching (git checkout)
- Multiple repository clones
- Git worktrees

### Decision

Use **git worktrees** to create isolated working directories per agent.

**Rationale:**
- File isolation: Each agent gets its own working directory
- Shared .git: All worktrees share the same Git database
- No branch switching: Eliminates context-switching overhead
- Automatic cleanup: Worktrees can be removed independently
- CI-aware: Branch naming convention (`agent-feature/{issue-id}`)

### Consequences

**Positive:**
- 95% reduction in file conflicts between agents
- No need to stash changes when switching contexts
- Independent test runs per agent
- Parallel development without blocking

**Negative:**
- Disk space: Each worktree duplicates working directory
- Manual cleanup: Stale worktrees need pruning
- Confusing for developers unfamiliar with worktrees

**Implementation:** `~/.claude/scripts/worktree-mgr.sh`, `~/.claude/docs/TERMINAL-SYNC.md`

---

## ADR-003: Plane-First Workflow

**Date:** 2026-02-06
**Status:** Accepted

### Context

We needed a central source of truth for all project work. Options considered:
- CLEO-only (local JSON files)
- Vibe Kanban-only (MCP task orchestration)
- Plane-only (cloud SaaS)
- Hybrid (CLEO + Plane)

### Decision

Use **Plane as the primary source of truth** with CLEO as a local cache.

**Rationale:**
- Plane provides cloud persistence (survives terminal sessions)
- Rich feature set: modules, cycles, issue lifecycle, analytics
- MCP integration: 76 tools via `@disrex/plane-mcp-server`
- Team collaboration: Comments, assignments, watchers
- Vibe Kanban overkill: 95% of work doesn't need 10+ parallel repos

### Consequences

**Positive:**
- Single source of truth for all stakeholders
- Persistent across Claude Code sessions
- Rich metadata: labels, modules, cycles, worklogs
- Sub-issue support for epic decomposition
- Team-wide visibility

**Negative:**
- Requires internet connection (Plane API)
- API rate limits (100 req/min)
- State sync complexity (CLEO ↔ Plane)
- MCP server dependency

**Implementation:** `~/.claude/rules/plane-mcp-workflow.md`, `~/.cleo/lib/plane-sync.sh`

---

## ADR-004: Shared Package Strategy

**Date:** 2026-02-06
**Status:** Accepted

### Context

Multiple projects needed the same utilities (e.g., caching, commit validation). Options considered:
- Copy-paste code between projects
- npm publish to private registry
- Monorepo with workspace packages
- Local file:// dependencies

### Decision

Use **shared packages** with `file://` dependencies.

**Rationale:**
- No publish overhead (direct file references)
- Version control: Shared code tracked in Git
- Fast iteration: Changes immediately available to consumers
- No registry setup: Works without npm private registry

### Consequences

**Positive:**
- Zero publish overhead (instant updates)
- No dependency on external registry
- Easy to debug (source code visible)
- Works offline

**Negative:**
- Manual version management (no semver enforcement)
- Relative path maintenance (fragile on directory moves)
- No centralized package discovery
- Breaking changes affect all consumers immediately

**Implementation:** `~/Development/shared/cache-layer/`, `~/Development/shared/commit-tools/`

**Pattern:**
```json
{
  "dependencies": {
    "cache-layer": "file:../../../shared/cache-layer"
  }
}
```

---

## ADR-005 t/m ADR-012

Zie `docs/decisions/` voor de volledige ADR bestanden.

| ADR | Titel |
|-----|-------|
| [ADR-005](decisions/ADR-005.md) | Modular Monolith Architecture |
| [ADR-006](decisions/ADR-006.md) | NX Monorepo |
| [ADR-007](decisions/ADR-007.md) | Inngest voor Event-Driven Workflows |
| [ADR-008](decisions/ADR-008.md) | Build vs Buy Strategy |
| [ADR-009](decisions/ADR-009.md) | Clerk voor Authenticatie |
| [ADR-010](decisions/ADR-010.md) | Fastify voor API Layer |
| [ADR-011](decisions/ADR-011.md) | Twenty CRM |
| [ADR-012](decisions/ADR-012.md) | shadcn/ui als Component Library |

**Volledig overzicht:** [decisions/INDEX.md](decisions/INDEX.md)

---

**See Also:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture overview
- [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) - Deployment procedures
- [decisions/INDEX.md](decisions/INDEX.md) - Volledig ADR overzicht (001-012)
