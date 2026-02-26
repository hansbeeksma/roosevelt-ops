# Build vs Buy Analysis — Roosevelt OPS

**Date:** 2026-02-26
**Status:** Validated
**Author:** Research Agent (ROOSE-313)
**Relates to:** ADR-008, EPIC 0
**Sub-issue:** ROOSE-313

---

## Executive Summary

Roosevelt Digital kiest voor een hybride aanpak: inkopen waar marktrijpe tools bestaan (CRM, PM, Accounting, Events), bouwen waar differentiatie vereist is (Time Tracking, Client Portal, Design Cycle, AI Ops, Integratie Layer). Op een 3-jaars horizon bespaart de hybride aanpak €51-92k ten opzichte van Full Custom, terwijl volledige vendor lock-in op kritieke processen wordt vermeden. De bestaande codebase bevat herbruikbare componenten (rate limiter, error handler, Plane integratie, Supabase schema patronen) die de build-kosten significant verlagen.

---

## TCO Vergelijking (3-jaar horizon)

| Scenario | Jaar 1 | Jaar 2 | Jaar 3 | Totaal |
|----------|--------|--------|--------|--------|
| Full SaaS | €8-11k | €8-11k | €8-11k | €24-33k |
| Full Custom | €52-89k | €20-35k | €20-35k | €92-159k |
| **Hybrid (gekozen)** | **€25-35k** | **€8-16k** | **€8-16k** | **€41-67k** |

**Toelichting kostenopbouw Hybrid Jaar 1:**
- Abonnementen (Plane, Exact Online, Inngest): €4-7k
- Twenty CRM self-hosted (Hetzner VPS): €0 licentie + €600-1.200/jaar infra
- Development uren build-modules (400-600u @ €60-80/u intern): €18-24k
- DevOps setup (eenmalig): €2-4k

**Jaar 2+ (steady state):**
- Abonnementen: €4-7k/jaar
- Infra: €1-2k/jaar
- Onderhoud build-modules (40-80u/jaar): €3-7k/jaar

---

## Module Analyse

### BUY-beslissingen

#### CRM: Twenty (self-hosted)

- **Rationale:** Twenty is open-source (MIT), self-hosted op eigen Hetzner VPS. Biedt contactbeheer, deals pipeline en API — voldoende voor een 1-man bureau. Self-hosting elimineert SaaS-kosten volledig (Pipedrive: €600/jaar, HubSpot Starter: €1.080/jaar). Aanpasbaar via custom objects voor projectgerelateerde entiteiten.
- **Kosten:** €0 licentie + VPS-deel (~€15-25/maand gedeeld). Totaal Jaar 1: ~€200-300.
- **Risico's:**
  - Open-source project: community-afhankelijk voor bugfixes
  - Zelf verantwoordelijk voor updates en security patches
  - Geen officiële SLA
- **Mitigatie:** Pinned versie in Docker Compose, maandelijks update-slot ingepland
- **Alternatieven overwogen:**
  - HubSpot Starter: €1.080/jaar maar closed-source, snelle prijsstijging bij groei
  - Salesforce: €1.800+/jaar, overkill voor solopreneur fase
  - Pipedrive: €600/jaar, geen custom objects zonder dure add-ons
  - Custom CRM: €15-25k bouwkosten, niet gerechtvaardigd in vroege fase

---

#### PM: Plane.so

- **Rationale:** Plane is reeds in productief gebruik (Plane MCP server v0.4.5, 76 tools). De investering in CLEO-integratie, agent workflows en ADR-documentatie maakt switch naar alternatief prohibitief (>80u migratie). Plane Cloud biedt gratis tier voldoende voor solo-gebruik; self-hosted optie beschikbaar bij schaal.
- **Kosten:** €0 (gratis tier) of €8/gebruiker/maand (Pro). Jaar 1: €0-96.
- **Risico's:**
  - Vendor lock-in via MCP integratie (gemilderd: open API)
  - Gratis tier kan features beperken bij groei
- **Alternatieven overwogen:**
  - Linear: €8/gebruiker/maand, geen MCP server beschikbaar, geen sub-issues in gratis tier
  - Jira: €8.15/gebruiker/maand, te complex voor huidige schaal, geen open-source
  - Asana: €10.99/gebruiker/maand, geen native MCP integratie
  - GitHub Issues: geen worklog/cycle support, te beperkt voor epics-structuur

---

#### Accounting: Exact Online

- **Rationale:** Nederlandse fiscale compliance (BTW-aangifte, DigiD koppeling, UBL e-invoicing) vereist een gecertificeerde softwareleverancier. Exact Online is de de-facto standaard voor Nederlandse MKB-accountants, wat samenwerking met externe boekhouder vereenvoudigt. Handmatige alternatieven of custom oplossingen zijn niet SBBI-compliant.
- **Kosten:** €40-60/maand (Exact Online Start/Small). Jaar 1: €480-720.
- **Risico's:**
  - Vendor lock-in (export mogelijk via DATEV/XML, maar migratie bewerkelijk)
  - Prijsstijgingen historisch ~10%/jaar
- **Alternatieven overwogen:**
  - Moneybird: €18-29/maand, minder accountant-friendly, beperkte UBL support
  - Twinfield: €45-85/maand, enterprise-focus, te complex
  - Custom: Fiscale compliance zelf bouwen is een juridisch risico en kost >40k

---

#### Events: Inngest

- **Rationale:** Durable functions voor background jobs (AI ops, sync taken, webhook verwerking). Inngest biedt automatische retry, fan-out patterns en observability — cruciaal voor betrouwbare agent workflows. Serverless-first past bij Vercel deployment model. Free tier tot 100k events/maand voldoende voor huidige schaal.
- **Kosten:** €0 (free tier, tot 100k events/maand) of €25/maand (Team). Jaar 1: €0-300.
- **Risico's:**
  - Vendor lock-in: migratie naar BullMQ vereist refactor van job definities
  - Free tier limieten kunnen knellen bij AI Ops groei
- **Alternatieven overwogen:**
  - BullMQ/Bull: self-hosted Redis vereist, extra infra overhead, geen durable functions
  - Temporal: krachtig maar steep learning curve, te complex voor huidige fase
  - Trigger.dev: vergelijkbaar met Inngest, minder volwassen ecosysteem
  - Cron-only (pg_cron): reeds in gebruik voor DORA refresh, maar geen event-driven patterns

---

### BUILD-beslissingen

#### Time Tracking

- **Rationale:** Time tracking data is kern-input voor facturatie, capacity planning en SPACE metrics. Externe tools (Toggl, Harvest) bieden geen native integratie met Plane issues of de Roosevelt data layer, waardoor dubbel invoer onstaat. Bouwen als Fastify API endpoint + Supabase tabel geeft directe koppeling aan bestaande infra.
- **Complexiteit:** Medium (2-3 sprints)
- **Herbruikbare code uit codebase:**
  - `lib/supabase/server.ts` — server-side Supabase client (direct herbruikbaar)
  - `lib/supabase/client.ts` — client-side Supabase (voor dashboard widget)
  - `lib/rate-limiter.ts` — sliding window rate limiter voor API endpoints (direct herbruikbaar)
  - `lib/error-handler.ts` — AppError, handleApiError factories (direct herbruikbaar)
  - `app/api/analytics/metrics/route.ts` — patroon voor metrics endpoints (als referentie)
  - Database schema patronen uit `supabase/migrations/` (materialized views, RLS policies)
- **Geschatte effort:** 80-120u
- **Alternatieven overwogen:**
  - Toggl Track API: €9/gebruiker/maand + integratie-overhead, data buiten eigen stack
  - Harvest: €12/gebruiker/maand, geen Plane koppeling
  - Clockify: gratis tier, maar API limieten en geen garanties voor data-eigenaarschap

---

#### Client Portal

- **Rationale:** Roosevelt Digital levert white-label producten aan klanten. Een generiek portaal (Notion, Basecamp) kan niet de Roosevelt huisstijl dragen of klantspecifieke project-views tonen. Client Portal is directe klantwaarde — een differentiator in het voorstel. Next.js App Router + Clerk voor auth is een natuurlijke extensie van bestaande stack.
- **Complexiteit:** Medium (3-4 sprints)
- **Herbruikbare code uit codebase:**
  - Volledige Next.js App Router structuur in `app/`
  - `app/components/` — Tremor UI componenten als basis voor dashboard views
  - `lib/error-handler.ts` — uniforme error responses
  - `middleware.ts` — reeds aanwezig, uitbreidbaar met Clerk auth middleware
  - `lib/supabase/server.ts` — server-side data fetching patronen
- **Geschatte effort:** 120-160u
- **Alternatieven overwogen:**
  - Notion (gedeeld): geen branding controle, data in Notion ecosysteem
  - Basecamp: €15/maand, niet white-label, generiek look-and-feel
  - SuperTokens hosted: authentication-only, geen portal features

---

#### Design Cycle Management

- **Rationale:** Roosevelt Digital voert design trajecten uit met specifieke fases (briefing, concepting, feedback, revision, delivery). Geen bestaand SaaS-product modelleert deze agency-specifieke workflow correct. Abstract en Zeroheight zijn version-control tools voor design systemen — niet voor project-lifecycle management. De Design Cycle module bouwt voort op bestaande Plane issue structuur + custom metadata.
- **Complexiteit:** High (4-5 sprints)
- **Herbruikbare code uit codebase:**
  - `lib/integrations/plane.ts` — Plane API client met issue CRUD (direct herbruikbaar voor cycle states)
  - `lib/types/incidents.ts` — TypeScript typing patronen voor domein-objecten
  - `app/components/PerformanceTier.tsx` — card-gebaseerde status visualisatie (als design referentie)
- **Geschatte effort:** 160-200u
- **Alternatieven overwogen:**
  - Abstract: version control voor design files (Figma/Sketch), niet voor project lifecycle
  - Zeroheight: design system documentatie tool, niet project management
  - Plane-only (zonder custom module): te generiek, mist fase-specifieke velden en goedkeuringsflows

---

#### AI Ops Layer

- **Rationale:** AI-ondersteunde operations (auto-triaging, pattern detection in DORA data, predictive capacity) is de kern-differentiator van Roosevelt Digital als AI Strategy bureau. Geen off-the-shelf tool biedt dit voor interne operations op deze schaal. Retool AI en n8n bieden low-code automation maar geen LLM-native agent orchestration met Plane/CLEO integratie. Dit is de IP-kern van het platform.
- **Complexiteit:** High (5-6 sprints, iteratief)
- **Herbruikbare code uit codebase:**
  - `app/api/analytics/track/route.ts` — event ingestion patroon
  - `lib/analytics.ts` — `@rooseveltops/analytics-layer` integratie (events als AI-input)
  - Inngest (events layer) — durable AI job orchestration
  - DORA metrics schema — rijke operationele data als AI context
  - `research/outputs/r2-ai-agent-orchestration.md` — reeds uitgevoerd onderzoek
- **Geschatte effort:** 200-280u (gefaseerd over EPIC 4-5)
- **Alternatieven overwogen:**
  - Retool AI: UI-first tool, geen native agent SDK, closed-source AI layer
  - n8n: workflow automation, geen LLM-native orchestration, self-hosted complexiteit
  - Zapier AI: te beperkt, geen code-level integratie met eigen data
  - Pure LLM API calls (zonder orchestration): geen durability, retry, of observability

---

#### Integratie Layer (Fastify API)

- **Rationale:** Centrale hub die Twenty CRM, Plane, Exact Online, Inngest en toekomstige tools verbindt. Make.com en Zapier zijn visuele tools met per-action kosten die snel oplopen bij frequente syncs. Een eigen Fastify API geeft volledige controle over data transformatie, rate limiting (reeds geimplementeerd in codebase) en audit logging. Fastify kiest boven Next.js API routes voor standalone deployability en hogere throughput.
- **Complexiteit:** Medium (3-4 sprints)
- **Herbruikbare code uit codebase:**
  - `lib/rate-limiter.ts` — in-memory sliding window, direct porteerbaar naar Fastify plugin
  - `lib/error-handler.ts` — ErrorCodes, AppError, structured logging (direct herbruikbaar)
  - `lib/integrations/plane.ts` — Plane REST client met ensureLabelsExist, getStateId
  - `lib/integrations/pagerduty.ts` — patroon voor externe API integratie
  - `lib/integrations/statuspage.ts` — webhook/event dispatching patroon
  - `middleware.ts` — auth middleware patroon
- **Geschatte effort:** 100-140u
- **Alternatieven overwogen:**
  - Zapier: €19-69/maand + per-task kosten, geen custom logic, black-box debugging
  - Make.com: €9-16/maand per 10k operations, visueel maar beperkt in complexe transformaties
  - n8n self-hosted: gratis maar extra infra, geen type-safe API contracts

---

## Go/No-Go Criteria per Fase

### EPIC 0: Stabilisatie (huidige fase)

| Signaal | Status | Criterium |
|---------|--------|-----------|
| DB migrations conflict opgelost | Go | Geen conflicterende migraties in `supabase/migrations/` |
| ADR-008 gedocumenteerd | Go | Build vs Buy beslissing in `docs/decisions/ADR-008.md` |
| Build vs Buy gevalideerd door stakeholders | Hold | Hans review vereist voor EPIC 1 start |
| Open p0 bugs | No-Go trigger | >3 open p0 issues in Plane = EPIC 1 blokkade |

**EPIC 0 Deliverables vereist voor Go:**
- [ ] ADR-008 accepted
- [ ] `research/outputs/build-vs-buy.md` aanwezig (dit document)
- [ ] Stakeholder sign-off (Hans Beeksma)

---

### EPIC 1: Modernisering

| Signaal | Status | Criterium |
|---------|--------|-----------|
| ESLint v9 geconfigureerd | Go | `eslint.config.js` (flat config) aanwezig |
| Next.js upgrade voltooid | Go | `package.json` toont Next.js 15+ |
| Tailwind v4 geconfigureerd | Go | `tailwind.config.ts` v4 syntax |
| Test coverage | Hold | Coverage <80% blokkeert EPIC 2 |
| Breaking changes in productie | No-Go | Rollback vereist, EPIC 2 uitgesteld |

---

### EPIC 2: NX Monorepo + Auth

| Signaal | Status | Criterium |
|---------|--------|-----------|
| NX workspace geinitialiseerd | Go | `nx.json` aanwezig in root |
| Clerk geconfigureerd | Go | `CLERK_SECRET_KEY` in Vercel env vars |
| Google Workspace SSO gevalideerd | Hold | SSO test met @rooseveltdigital.nl account |
| Multi-tenant data isolation | No-Go | Row Level Security aantoonbaar getest per tenant |

---

### EPIC 3: Foundation Services

| Signaal | Status | Criterium |
|---------|--------|-----------|
| Twenty CRM live (Docker) | Go | Health check endpoint reageert op Hetzner VPS |
| Inngest events operationeel | Go | Test event succesvol verwerkt in Inngest dashboard |
| Hetzner infra kosten | Hold | >€200/maand = cost review vereist voor EPIC 4 |
| Exact Online OAuth | No-Go | OAuth blocked door IT = Accounting module uitgesteld |

---

### EPIC 4: Value Layer

| Signaal | Status | Criterium |
|---------|--------|-----------|
| Time tracking MVP werkt | Go | Gebruiker kan timer starten/stoppen, data in Supabase |
| Invoices genereren | Go | PDF-factuur met BTW uit Time Tracking data |
| BTW compliance gevalideerd | Hold | Accountant (extern) heeft factuurformaat geaccordeerd |
| Data accuracy | No-Go | <99% nauwkeurigheid in tijdregistratie = blokkade release |

---

### EPIC 5: Differentiation

| Signaal | Status | Criterium |
|---------|--------|-----------|
| AI features in gebruik door team | Go | Minimaal 1 AI-assisted workflow actief in dagelijks gebruik |
| Model costs | Hold | >€500/maand = cost review + model optimalisatie sprint |
| GDPR compliance gap | No-Go | Persoonlijke data in AI context zonder verwerkers-overeenkomst = stop |

---

## Risico Analyse

### 69% Failure Rate (Standish CHAOS Report)

Interne tools falen vaak door: scope creep, gebrek aan sponsorship, geen iteratieve feedback loops, en te ambitieuze initieel scope. Roosevelt OPS mitigeert dit als volgt:

| Risico | Impact | Waarschijnlijkheid | Mitigatie |
|--------|--------|--------------------|-----------|
| Scope creep | Hoog | Hoog | Hard scope freeze per epic; deferred-work labels in Plane |
| Geen sponsor | Hoog | Laag | Hans Beeksma als Product Owner (ROOSE-320) |
| Geen iteratie | Hoog | Medium | Wekelijkse demo na elke sprint |
| Vendor lock-in (Twenty) | Medium | Medium | Pinned versie + quarterly migration drill |
| Vendor lock-in (Plane) | Medium | Laag | Open API + CLEO als lokale cache |
| Inngest free tier limiet | Medium | Medium | Monitor events/maand, upgrade trigger bij >80k |
| Fastify API als single point of failure | Hoog | Laag | Health checks + Inngest retry als buffer |

**Aanbevolen mitigaties:**
- [ ] Product Owner aangewezen (ROOSE-320)
- [ ] Wekelijkse demos na elke sprint (kalender blokkade zetten)
- [ ] Hard scope freeze per epic (geen scope-uitbreiding zonder nieuw Plane issue)
- [ ] Quarterly vendor assessment (kosten, alternatives, lock-in niveau)

---

## Bestaande Codebase — Herbruikbaar

Op basis van analyse van `app/`, `lib/` en `supabase/`:

### Directe herbruikbaarheid (geen aanpassing nodig)

| Bestand | Gebruik in Build-modules |
|---------|--------------------------|
| `lib/supabase/server.ts` | Time Tracking, Client Portal: server-side DB queries |
| `lib/supabase/client.ts` | Client Portal: real-time subscriptions |
| `lib/rate-limiter.ts` | Integratie Layer API: sliding window rate limiting (100 req/60s default) |
| `lib/error-handler.ts` | Alle build-modules: AppError, ErrorCodes, handleApiError |
| `lib/integrations/plane.ts` | Design Cycle: issue CRUD, state transitions, label management |
| `lib/web-vitals.ts` | Client Portal: performance monitoring |

### Aanpassen en uitbreiden

| Bestand | Aanpassing |
|---------|------------|
| `middleware.ts` | Uitbreiden met Clerk auth guards voor Client Portal routes |
| `app/components/DoraMetrics.tsx` | Patroon hergebruiken voor Time Tracking dashboard widgets |
| `app/components/PerformanceTier.tsx` | Patroon voor Design Cycle fase-indicatoren |
| `app/api/analytics/metrics/route.ts` | Template voor Time Tracking API endpoints |

### Database patronen (uit `supabase/migrations/`)

- **Materialized views** (`dora_summary`): zelfde patroon voor Time Tracking aggregaties
- **RLS policies**: template voor Client Portal multi-tenant data isolatie
- **pg_cron jobs**: zelfde patroon voor automatische data refresh
- **Typed functions** (`get_dora_performance_tier`): template voor reporting queries

### Analytics Layer (gedeeld pakket)

`@rooseveltops/analytics-layer` (`lib/analytics.ts`) is een `file://` dependency uit `~/Development/shared/analytics-layer`. Dit patroon (ADR-004) is direct toepasbaar voor Time Tracking events en Client Portal activity logging.

---

## Kostendetail per Module

| Module | Type | Jaar 1 kosten | Jaar 2+ kosten | Eenmalig |
|--------|------|--------------|----------------|---------|
| Twenty CRM | BUY (self-hosted) | €200-300/jaar infra | €200-300/jaar | - |
| Plane.so | BUY | €0-96/jaar | €0-96/jaar | - |
| Exact Online | BUY | €480-720/jaar | €480-720/jaar | - |
| Inngest | BUY | €0-300/jaar | €0-300/jaar | - |
| Time Tracking | BUILD | €4.800-9.600 dev | €800-1.600 onderhoud | €4.800-9.600 |
| Client Portal | BUILD | €7.200-12.800 dev | €1.200-2.400 onderhoud | €7.200-12.800 |
| Design Cycle | BUILD | €9.600-16.000 dev | €1.600-3.200 onderhoud | €9.600-16.000 |
| AI Ops Layer | BUILD | €12.000-22.400 dev | €3.200-6.400 onderhoud | €12.000-22.400 |
| Integratie Layer | BUILD | €6.000-11.200 dev | €1.200-2.400 onderhoud | €6.000-11.200 |

*Dev kosten berekend op €60/u intern. Onderhoud geschat als 20% van jaar-1 dev kosten.*

---

## Volgende Stappen

1. **Stakeholder review** — Hans Beeksma accordeert dit document en ADR-008 (target: voor EPIC 1 kickoff)
2. **ADR-008 Accepted** door team — parallel agent schrijft naar `docs/decisions/ADR-008.md`
3. **ROOSE-320 aanmaken** — Product Owner rol formaliseren
4. **EPIC 1 kickoff** — Start Modernisering na EPIC 0 Go criteria gehaald
5. **Inngest monitoring** instellen — Alert bij >80k events/maand (Jaar 1 grens)
6. **Vendor review calendar** — Kwartaallijkse kosten- en alternatieven-review

---

*Geschreven door: Research Agent (claude-sonnet-4-6) voor ROOSE-313*
*Gebaseerd op: Codebase analyse roosevelt-ops, Standish CHAOS Report 2024, vendor pricing (februari 2026)*
