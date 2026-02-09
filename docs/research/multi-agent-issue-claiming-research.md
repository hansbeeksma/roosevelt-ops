# Multi-Agent Issue Claiming — Research Summary

**Epic:** ROOSE-158 | **Date:** 2026-02-08 | **Sources:** 4 Perplexity queries, 240+ bronnen

---

## Research Vragen

1. Hoe voorkom je dat meerdere agents dezelfde taak oppakken?
2. Welke locking strategieën werken voor file-based state?
3. Hoe isoleer je git werk tussen agents?
4. Hoe merge je werk van parallel agents veilig?

---

## Key Findings

### 1. Locking Strategieën

| Strategie | Geschikt? | Reden |
|-----------|-----------|-------|
| **flock() (gekozen)** | ✅ Ja | POSIX-compliant, atomic, werkt op macOS, geen externe deps |
| Pessimistic locking | ⚠️ Overkill | Blokkeert alle andere operaties, niet nodig voor file state |
| Optimistic locking (CAS) | ❌ Nee | Vereist versioning systeem, complex voor shell scripts |
| Lease-based locking | ✅ Geïmplementeerd | Via heartbeat mechanism (30s interval, 90s stale threshold) |
| Database locks (advisory) | ❌ Nee | Vereist database, overhead voor lokale multi-agent |
| Redis/etcd distributed locks | ❌ Nee | Externe dependency, overkill voor single-machine |

**Gekozen: flock() + lease-based heartbeat**

- `flock()` biedt atomic file locking op OS-niveau
- Heartbeat elke 30 seconden voorkomt stale claims
- Claims verlopen na 90 seconden zonder heartbeat
- Geen race conditions door OS-level enforcement

### 2. flock() op macOS

| Aspect | Detail |
|--------|--------|
| Beschikbaar | Ja, via `flock` command (Homebrew) of `shlock` (native) |
| Atomic | Ja, kernel-level guarantee |
| Performance | <1ms voor lock acquire |
| Cross-process | Ja, werkt tussen terminals |
| NFS veilig | Nee, alleen lokaal bestandssysteem |
| Cleanup | Automatisch bij process exit (geen orphan locks) |

**Implementatie patroon:**
```bash
exec 200>/tmp/issue-claim.lock
flock -n 200 || { echo "Lock held by another agent"; exit 1; }
# Critical section: claim issue
```

### 3. Git Worktrees voor Isolatie

| Aspect | Detail |
|--------|--------|
| Isolatie niveau | Volledig — eigen working directory per agent |
| Branch conflicten | Onmogelijk — elke worktree heeft eigen branch |
| Shared state | `.git/` directory gedeeld (disk-efficiënt) |
| Performance | Instant creation (<100ms) |
| Cleanup | `git worktree prune` verwijdert stale entries |

**Gekozen patroon:**
```
project/
├── .git/                          # Shared
├── .worktrees/
│   ├── agent-feature/VINO-42/    # Agent 1 workspace
│   └── agent-feature/VINO-55/    # Agent 2 workspace
└── src/                           # Main working tree
```

**Voordelen boven branches alleen:**
- Agents hoeven niet te stashen/switchen
- Geen merge conflicts tijdens actief werk
- Elke agent ziet een consistente working tree
- Main branch blijft ongewijzigd tot merge

### 4. CI/CD Merge Queues

| Aanpak | Status | Reden |
|--------|--------|-------|
| GitHub Merge Queue | Backlog (ROOSE-166) | Vereist GitHub Enterprise/Pro |
| Sequential merge script | Geïmplementeerd | `agent-push.sh` met pre-merge checks |
| Rebase-before-merge | Geïmplementeerd | Automatisch in agent-push flow |
| Feature flags | Niet nodig | Werk is al geïsoleerd via worktrees |

**Geïmplementeerde flow:**
1. Agent claimt issue → worktree created
2. Agent werkt in geïsoleerde worktree
3. Agent push: rebase op main, run tests, create PR
4. Merge via GitHub PR (review required)

---

## Implementatie Resultaat

### Scripts

| Script | Locatie | Functie |
|--------|---------|---------|
| `issue-claimer.sh` | `~/.claude/scripts/` | Atomic issue claim/release |
| `heartbeat-monitor.sh` | `~/.claude/scripts/` | Stale claim detection |
| `agent-push.sh` | `~/.claude/scripts/` | Safe merge met pre-checks |
| `issue-claim-guard.sh` | `~/.claude/hooks/` | PreToolUse hook (warn-only) |

### terminal-sync.sh Extensions (v2.1)

| Command | Functie |
|---------|---------|
| `tsync claim <issue-id>` | Claim issue met flock() |
| `tsync release <issue-id>` | Release claim + cleanup |
| `tsync stale-check` | Detect stale claims (>90s) |
| `tsync claims` | List alle actieve claims |
| `tsync push` | Safe push met conflict check |

### Configuration

```json
// coordination-config.json v2.1.0
{
  "issueLocking": {
    "enabled": true,
    "lockDir": "~/.claude/sync/claims/",
    "heartbeatInterval": 30,
    "staleThreshold": 90,
    "branchPattern": "agent-feature/{issue-id}"
  }
}
```

---

## Aanbevelingen (Niet Geïmplementeerd)

| Aanbeveling | Priority | Reden voor uitstel |
|-------------|----------|-------------------|
| Plane API integratie (ROOSE-163) | High | Vereist state updates in Plane bij claim/release |
| GitHub merge queue (ROOSE-166) | Low | Vereist GitHub Enterprise subscription |
| Distributed locking (Redis) | None | Overkill voor single-machine setup |
| Conflict resolution automation | Medium | Handmatige merge is veiliger in early stage |

---

## Bronnen Categorieën

| Categorie | Aantal | Key Bronnen |
|-----------|--------|-------------|
| File locking (POSIX) | ~40 | Linux man pages, GNU coreutils docs |
| Git worktrees | ~30 | Git docs, Atlassian tutorials |
| Distributed systems | ~50 | Martin Kleppmann, Jepsen analyses |
| CI/CD merge strategies | ~35 | GitHub docs, GitLab CI docs |
| Multi-agent coordination | ~45 | LangGraph, AutoGen, CrewAI patterns |
| Shell scripting patterns | ~40 | Bash Reference Manual, ShellCheck |

---

*Gelinkt aan: ROOSE-158 (Multi-Agent Issue Claiming & Conflict-Free Git Workflow)*
*Implementatie status: 6/9 sub-issues Done (ROOSE-159 t/m 165)*
