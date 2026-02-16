# Roosevelt OPS Architecture

> **Project:** Roosevelt OPS (Internal Operations Platform)
> **Status:** IN_PROGRESS
> **Last Updated:** 2026-02-16

---

## Overview

Roosevelt OPS is an internal operations and project management platform designed to streamline multi-agent collaboration, task management, and development workflows across all Roosevelt Digital projects.

## System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Roosevelt OPS                            │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │   CLEO       │    │   Plane      │    │  Terminal    │    │
│  │   (Local)    │◄───┤   (Cloud)    │◄───┤   Sync       │    │
│  │              │    │              │    │  (Git)       │    │
│  └──────────────┘    └──────────────┘    └──────────────┘    │
│         │                    │                    │            │
│         └────────────────────┴────────────────────┘            │
│                              │                                 │
│                   ┌──────────┴──────────┐                     │
│                   │                     │                      │
│            ┌──────▼──────┐      ┌──────▼──────┐              │
│            │   Shared    │      │   Scripts   │              │
│            │   Packages  │      │   & Hooks   │              │
│            └─────────────┘      └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### 1. CLEO (Task Management)

**Purpose:** Persistent local task tracking with session management

**Key Features:**
- Hierarchical task organization (epics → tasks → subtasks)
- Multi-session support for parallel agent workflows
- Phase-based workflow management
- Research output integration

**Storage:** `.cleo/` directory (JSON files)

**See:** `~/.cleo/docs/TODO_Task_Management.md`

### 2. Plane Integration

**Purpose:** Cloud-based source of truth for all project work

**Key Features:**
- 76 MCP tools via `@disrex/plane-mcp-server`
- Sub-issue management for epic decomposition
- Issue lifecycle management (state transitions)
- Label-based organization and filtering

**API:** Plane MCP server (`~/.claude.json`)

**See:** `~/.claude/rules/plane-mcp-workflow.md`

### 3. Terminal Sync (Multi-Agent Coordination)

**Purpose:** Cross-terminal synchronization for parallel agent work

**Key Features:**
- File-based locking (flock) for atomic operations
- Git worktree isolation per agent
- Active file tracking to prevent conflicts
- Heartbeat monitoring for stale detection

**Storage:** `~/.claude/sync/` directory

**See:** `~/.claude/docs/TERMINAL-SYNC.md`

### 4. Shared Infrastructure

**Purpose:** Reusable packages and utilities across projects

**Components:**
- `~/Development/shared/cache-layer/` - Redis/Upstash cache abstraction
- `~/Development/shared/commit-tools/` - Commit message validation
- `~/.claude/scripts/` - Shell utilities and automation
- `~/.claude/skills/` - Claude Code skill library

## Data Flow

```
User Request
     │
     ├─ Plane API ────────► Cloud Issue Tracking
     │                     │
     ├─ CLEO CLI ─────────► Local Task Management
     │                     │
     ├─ Terminal Sync ────► Agent Coordination
     │                     │
     └─ Shared Packages ──► Reusable Components
                           │
                           └─► Git Repository (Source of Truth)
```

## Key Design Decisions

See `docs/DECISIONS.md` for ADRs (Architecture Decision Records):

1. **File-Based Locking** for multi-agent coordination (flock over Redis)
2. **Git Worktrees** for agent isolation (vs. branch switching)
3. **Plane-First Workflow** for project management (vs. Vibe Kanban for 95% of work)
4. **Shared Package Strategy** for cross-project code reuse

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Task Management** | CLEO (Node.js CLI) |
| **Project Management** | Plane (cloud SaaS + MCP) |
| **Version Control** | Git + GitHub |
| **CI/CD** | GitHub Actions (11 workflows) |
| **Security** | Gitleaks, Semgrep, npm audit |
| **Testing** | Vitest (80%+ coverage target) |
| **Documentation** | Markdown + ADRs |

## Performance Considerations

- **File locking overhead:** ~200ms per lock acquisition (acceptable for agent coordination)
- **Plane API rate limits:** 100 requests/minute (monitored via MCP)
- **CLEO session size:** Max 5 concurrent sessions (configurable)

## Security

- **Secret detection:** Pre-commit hook with Gitleaks
- **OWASP Top 10 scanning:** Semgrep rules (253 patterns)
- **Dependency auditing:** npm audit on CI and pre-commit
- **Access control:** File-based locks prevent concurrent modification

## Scalability

- **Agent limit:** Designed for 5-10 concurrent agents
- **File storage:** CLEO handles 1000s of tasks efficiently
- **Plane projects:** Currently 5 active projects, supports 50+

## Monitoring & Observability

- **CLEO context alerts:** Automated context window monitoring
- **Terminal sync heartbeat:** 30-second heartbeat, 90-second stale threshold
- **Git worktree cleanup:** Automatic pruning of stale worktrees

---

**See Also:**
- [DECISIONS.md](DECISIONS.md) - Architecture Decision Records
- [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) - Deployment procedures
- [TERMINAL-SYNC.md](~/.claude/docs/TERMINAL-SYNC.md) - Coordination system details
