# ADR Index — Roosevelt OPS

> Architecture Decision Records documenteren significante architecturale beslissingen voor het Roosevelt OPS platform.

**Format:** Vereenvoudigd ADR formaat (Context, Decision, Consequences, Alternatieven)
**Locatie:** `docs/decisions/ADR-XXX.md`
**Volledige tekst:** `docs/DECISIONS.md` bevat ADR-001 t/m ADR-004

---

## Overzicht

| ADR | Titel | Status | Datum |
|-----|-------|--------|-------|
| [ADR-001](../DECISIONS.md#adr-001-file-based-locking-for-multi-agent-coordination) | File-Based Locking voor Multi-Agent Coordinatie | Accepted | 2026-02-08 |
| [ADR-002](../DECISIONS.md#adr-002-git-worktrees-for-agent-isolation) | Git Worktrees voor Agent Isolatie | Accepted | 2026-02-08 |
| [ADR-003](../DECISIONS.md#adr-003-plane-first-workflow) | Plane-First Workflow | Accepted | 2026-02-06 |
| [ADR-004](../DECISIONS.md#adr-004-shared-package-strategy) | Shared Package Strategy | Accepted | 2026-02-06 |
| [ADR-005](./ADR-005.md) | Modular Monolith Architecture | Accepted | 2026-02-26 |
| [ADR-006](./ADR-006.md) | NX Monorepo | Accepted | 2026-02-26 |
| [ADR-007](./ADR-007.md) | Inngest voor Event-Driven Workflows | Accepted | 2026-02-26 |
| [ADR-008](./ADR-008.md) | Build vs Buy Strategy | Accepted | 2026-02-26 |
| [ADR-009](./ADR-009.md) | Clerk voor Authenticatie | Accepted | 2026-02-26 |
| [ADR-010](./ADR-010.md) | Fastify voor API Layer | Accepted | 2026-02-26 |
| [ADR-011](./ADR-011.md) | Twenty CRM | Accepted | 2026-02-26 |
| [ADR-012](./ADR-012.md) | shadcn/ui als Component Library | Accepted | 2026-02-26 |

---

## Per Thema

### Infrastructuur & Tooling
- [ADR-001](../DECISIONS.md#adr-001-file-based-locking-for-multi-agent-coordination) — File-based locking voor multi-agent coördinatie
- [ADR-002](../DECISIONS.md#adr-002-git-worktrees-for-agent-isolation) — Git worktrees voor agent isolatie
- [ADR-006](./ADR-006.md) — NX Monorepo met pnpm

### Architectuur
- [ADR-005](./ADR-005.md) — Modular Monolith (Next.js + Fastify)
- [ADR-008](./ADR-008.md) — Build vs Buy strategie

### Backend & Integraties
- [ADR-007](./ADR-007.md) — Inngest voor event-driven workflows
- [ADR-010](./ADR-010.md) — Fastify als API layer

### Authenticatie & Autorisatie
- [ADR-009](./ADR-009.md) — Clerk voor multi-tenant auth

### Externe Tools (Buy)
- [ADR-003](../DECISIONS.md#adr-003-plane-first-workflow) — Plane als project management tool
- [ADR-011](./ADR-011.md) — Twenty CRM (self-hosted)

### Frontend & Design
- [ADR-012](./ADR-012.md) — shadcn/ui als component library

### Interne Tools & Patterns
- [ADR-004](../DECISIONS.md#adr-004-shared-package-strategy) — Shared package strategy

---

## Hoe een nieuwe ADR te schrijven

1. Kopieer het template uit `docs/DECISIONS.md`
2. Maak `docs/decisions/ADR-0XX.md` aan (volgnummer)
3. Voeg de ADR toe aan dit INDEX.md
4. Link naar de ADR vanuit `docs/DECISIONS.md` onder "Future ADRs" of "See Also"

**Template:**
```markdown
# ADR-0XX: [Titel]

**Status:** Accepted
**Date:** YYYY-MM-DD
**Deciders:** Roosevelt Digital Team

## Context
[Waarom moesten we een beslissing nemen?]

## Decision
[Wat hebben we besloten en waarom?]

## Consequences
### Positief
- ...

### Negatief / Trade-offs
- ...

## Alternatieven overwogen
- **[Alternatief A]:** [Reden waarom niet gekozen]
```
