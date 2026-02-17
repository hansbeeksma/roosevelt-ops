<!-- CLEO:START -->
@.cleo/templates/AGENT-INJECTION.md
<!-- CLEO:END -->

# Roosevelt OPS

Internal operations and project management platform for Roosevelt Digital.

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm test             # Run Vitest unit tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
npm run biome:check  # Lint + format check
npm run biome:fix    # Auto-fix lint + format
npm run db:types     # Regenerate Supabase types
npm run db:migrate   # Push migrations
```

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js (App Router) | `app/` directory |
| Database | Supabase (PostgreSQL) | RLS enabled, `lib/supabase/` |
| Monitoring | Sentry + OpenTelemetry | `@sentry/nextjs`, `@vercel/otel` |
| Analytics | Tremor (dashboards) | `@tremor/react` for metrics UI |
| Formatting | Biome | Single quotes, no semicolons |
| Testing | Vitest | `vitest run` |
| CI/CD | GitHub Actions (13 workflows) | Vercel deploy |
| Design | Figma integration | `.figma-workflow.json` |

## Architecture

```
app/
  api/
    analytics/     # DORA/SPACE metrics endpoints
    slack/         # Slack integration webhooks
  components/      # Shared UI components
  layout.tsx       # Root layout
  page.tsx         # Dashboard home
lib/
  integrations/    # External service clients
  supabase/        # Supabase client + server helpers
  types/           # Shared TypeScript types
docs/              # Extensive documentation (90+ files)
  design/          # Design system + Figma workflow
  operations/      # SOPs, onboarding, communication
  runbooks/        # Incident response playbooks
scripts/           # CI/automation scripts
infrastructure/    # IaC (Metabase, Hetzner)
```

## Domain Rules

- **Operations platform**: Not a customer-facing product. Internal tooling for Roosevelt Digital.
- **Multi-project oversight**: Monitors VINO12, VetteShirts, H2WW, and other Roosevelt products.
- **DORA metrics**: Deployment frequency, lead time, MTTR, change failure rate tracked via CI.
- **SPACE metrics**: Developer satisfaction and productivity framework.
- **Incident management**: Blameless postmortems, runbooks in `docs/runbooks/`.
- **Figma integration**: Design-to-code pipeline via `.figma-workflow.json`.

## Code Conventions

Project-specific overrides (global rules in `~/.claude/rules/`):

- Supabase types generated via `npm run db:types` — never edit `lib/database.types.ts` manually
- Dashboard components use `@tremor/react` charts
- API routes follow `/api/{service}/{action}` pattern
- OpenTelemetry spans wrap all external calls

## Agent Routing

| Code Domain | Agent | Trigger |
|-------------|-------|---------|
| `app/api/` | `agency-backend` | API endpoints, webhooks |
| `app/components/` | `agency-frontend` | UI components, dashboard |
| `docs/` | `agency-docs` | Documentation updates |
| `docs/design/` | `agency-design` | Design system, Figma |
| `.github/workflows/` | `agency-devops` | CI/CD pipeline |
| `infrastructure/` | `agency-devops` | IaC, Hetzner |
| `docs/runbooks/` | `agency-devops` | Incident playbooks |
| `scripts/` | `agency-devops` | Automation scripts |

## Environment

| Variable | Service | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Server-only |
| `SENTRY_DSN` | Sentry | Error tracking |
| `SENTRY_ORG` | Sentry | Organization slug |
| `VERCEL_ORG_ID` | Vercel | Deploy config |
| `VERCEL_PROJECT_ID` | Vercel | Deploy config |
| `SLACK_DEPLOY_WEBHOOK` | Slack | Deploy notifications |

## Gotchas

- **13 CI workflows**: Not all run on every push. `dora-metrics`, `space-metrics`, `metrics-alerts` require Supabase analytics tables.
- **Figma workflow**: Requires `.figma-workflow.json` config. Use `/figma-workflow` skill for design generation.
- **Vale linter**: `docs-quality.yml` uses Vale for docs. Sync styles with `vale sync` if missing.
- **Smoke tests**: `deploy.yml` expects `scripts/smoke-test.sh` to exist.
- **No E2E yet**: Playwright not configured (placeholder workflow exists).

## References

- Global config: `~/.claude/CLAUDE.md`
- Plane workflow: `~/.claude/rules/plane-mcp-workflow.md`
- MCP reference: `~/.claude/docs/MCP-REFERENCE.md`
- Design workflow: `docs/design/05-figma-workflow.md`
- Incident management: `docs/INCIDENT-MANAGEMENT.md`
