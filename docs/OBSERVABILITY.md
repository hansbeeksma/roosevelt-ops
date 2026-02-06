# Observability Stack - Roosevelt OPS

Observability setup voor Roosevelt OPS (Next.js op Vercel). Enige live service.

---

## Huidige Stack (Actief)

| Component | Rol | Status |
|-----------|-----|--------|
| **Sentry** | Error tracking, session replay, Web Vitals | Actief |
| **@vercel/otel** | OpenTelemetry instrumentation (stub) | Geconfigureerd, geen export |
| **BetterStack** | Uptime monitoring | Nog te configureren (ROOSE-66) |

### Sentry Configuratie

| Bestand | tracesSampleRate | Functie |
|---------|-----------------|---------|
| `sentry.client.config.ts` | 1.0 | Browser tracing, Web Vitals (CLS, INP, LCP, TTFB), Session Replay |
| `sentry.server.config.ts` | 0.2 | Server-side performance traces |
| `sentry.edge.config.ts` | 0.2 | Edge/middleware traces |
| `app/global-error.tsx` | - | Vangt root-level React render errors |
| `next.config.js` | - | Source maps upload via `@sentry/nextjs` webpack plugin |

**Vereiste env vars:**

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token
```

### OpenTelemetry (Stub)

`instrumentation.ts` registreert `@vercel/otel` met `registerOTel()`. Momenteel exporteert dit **nergens** heen omdat de OTLP env vars niet gezet zijn. Zodra `OTEL_EXPORTER_OTLP_ENDPOINT` en `OTEL_EXPORTER_OTLP_HEADERS` worden geconfigureerd, werkt het automatisch.

**Dependencies (al geinstalleerd, nul overhead):**
- `@vercel/otel` ^2.1.0
- `@opentelemetry/api` ^1.9.0
- `@opentelemetry/sdk-node` ^0.211.0

---

## Fase C: OTEL Export naar Grafana Cloud (UITGESTELD)

Dit is de volgende stap wanneer triggers zich voordoen. Geen actie nodig tot dan.

### Triggers om Fase C te activeren

| Trigger | Waarom |
|---------|--------|
| Roosevelt OPS krijgt aparte backend/API service | Multi-service tracing nodig |
| H2WW of VetteShirts gaat weer live | Meer dan 1 service te monitoren |
| Sentry free tier limiet (5K errors/maand) nadert | Alternatief voor error tracking |
| Specifieke behoefte aan distributed tracing | Grafana Tempo biedt dit |

### Activatie stappen (als trigger optreedt)

1. **Grafana Cloud account aanmaken** (free tier: 50GB traces/maand, 10K metrics series)
2. **OTLP credentials genereren** via Grafana Cloud Portal
3. **Vercel env vars toevoegen:**
   ```bash
   vercel env add OTEL_EXPORTER_OTLP_ENDPOINT production
   # Value: https://otlp-gateway-prod-eu-west-0.grafana.net/otlp

   vercel env add OTEL_EXPORTER_OTLP_HEADERS production
   # Value: Authorization=Basic <base64(instance-id:api-key)>
   ```
4. **Deploy en verifieer** traces in Grafana Tempo
5. Geen codewijzigingen nodig - `instrumentation.ts` is al geconfigureerd

### Waarom uitgesteld

H2WW Platform en VetteShirts zijn naar conceptfase verhuisd (niet meer live). Het originele 6-fase LGTM plan was ontworpen voor 3 live services. Die realiteit bestaat niet meer. Voor 1 serverless Next.js app is Sentry + BetterStack voldoende.

**Vervallen onderdelen:**
- ~~Shared `@rooseveltops/otel-config` package~~ (1 consumer = overengineering)
- ~~H2WW Express OTEL instrumentatie~~ (concept, niet live)
- ~~Grafana Alloy log forwarding~~ (geen Docker infra)
- ~~Self-hosted LGTM stack~~ (massive overkill, Grafana Cloud free tier volstaat)

---

## Architectuurbeslissingen

### Waarom tracesSampleRate 0.2 voor server/edge?

- **Client** blijft op 1.0: essentieel voor Web Vitals (CLS, INP, LCP, TTFB)
- **Server/edge** op 0.2: intern dashboard, geen user-facing API, bespaart 80% Sentry quota
- Verhoog naar 0.5-1.0 als debugging nodig is

### Waarom geen shared OTEL package?

Met 1 consumer is een apart npm package overengineering. De configuratie staat inline in `instrumentation.ts`. Extraheer pas bij 3+ services.

### Waarom Sentry + Grafana Cloud (niet of/of)?

| Tool | Sterk in | Zwak in |
|------|----------|---------|
| **Sentry** | Error grouping, stack traces, session replay, Web Vitals | Distributed tracing, custom metrics |
| **Grafana Cloud** | Distributed tracing (Tempo), metrics (Mimir), dashboards | Error grouping, replay |

Ze vullen elkaar aan. Begin met Sentry (al actief), voeg Grafana Cloud toe bij trigger.

---

## Gerelateerde Documentatie

- `docs/MONITORING.md` - Sentry alert configuratie en response protocol
- `docs/METRICS-ALERTS-SETUP.md` - Metrics en alerts setup
- `docs/INCIDENT-MANAGEMENT.md` - Incident response procedures

## Gerelateerde Plane Issues

| Issue | Beschrijving | Status |
|-------|-------------|--------|
| ROOSE-51 | OTEL Export naar Grafana Cloud (Fase C) | Uitgesteld (Low) |
| ROOSE-63 | Global Error Handler | Todo (Medium) |
| ROOSE-64 | Source Maps Upload | Todo (Medium) |
| ROOSE-65 | Migrate Sentry Config to Instrumentation | Todo (Low) |
| ROOSE-66 | BetterStack Uptime Monitoring | Todo (Medium) |
| ROOSE-67 | Sentry Alert Notifications | Todo (Medium) |
| ROOSE-68 | Full LGTM Stack | Gecancelled |
| ROOSE-99 | Lower tracesSampleRate server/edge | Backlog (Medium) |

---

*Last Updated: 2026-02-06*
*Version: 2.0.0 (Herschreven na conceptfase migratie H2WW + VetteShirts)*
