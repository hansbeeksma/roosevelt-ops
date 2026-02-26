# Monitoring Runbook — Roosevelt OPS

This document covers day-to-day operational procedures for the automated monitoring and budget alerting system.

---

## Table of Contents

1. [Adding a New Health Check](#1-adding-a-new-health-check)
2. [Alert Escalation Procedure](#2-alert-escalation-procedure)
3. [Adjusting Budget Thresholds](#3-adjusting-budget-thresholds)
4. [Inngest Dashboard and Replaying Failed Functions](#4-inngest-dashboard-and-replaying-failed-functions)

---

## 1. Adding a New Health Check

Health checks run every 5 minutes via the `scheduled-health-checks` Inngest function defined in:

```
apps/api/src/inngest/health-check-cron.ts
```

### Steps

1. **Write the check function** inside `health-check-cron.ts`.
   Follow the same pattern as `checkSupabaseHealth` or `checkApiHealth`:

   ```typescript
   async function checkMyService(): Promise<HealthCheckResult> {
     const start = Date.now()
     const service = 'my-service'

     try {
       // perform the check — HTTP ping, DB query, etc.
       return {
         service,
         status: 'healthy',
         latency_ms: Date.now() - start,
         checked_at: new Date().toISOString(),
       }
     } catch (err) {
       return {
         service,
         status: 'down',
         latency_ms: Date.now() - start,
         checked_at: new Date().toISOString(),
         error: err instanceof Error ? err.message : 'Unknown error',
       }
     }
   }
   ```

2. **Register the check** in `runHealthChecks()`:

   ```typescript
   export async function runHealthChecks(): Promise<HealthCheckResult[]> {
     const results = await Promise.all([
       checkSupabaseHealth(),
       checkApiHealth(),
       checkPlaneHealth(),
       checkMyService(),  // add here
     ])
     return results
   }
   ```

3. **Run locally** to verify:

   ```bash
   npx ts-node -e "import('./apps/api/src/inngest/health-check-cron').then(m => m.runHealthChecks()).then(console.log)"
   ```

4. **Commit and deploy** — the next cron run picks up the new check automatically.

### Status Values

| Status     | Meaning                                           |
|------------|---------------------------------------------------|
| `healthy`  | Service is reachable and responding normally      |
| `degraded` | Service responds but returns errors or high latency |
| `down`     | Service is unreachable or threw an exception      |

---

## 2. Alert Escalation Procedure

Slack alerts are sent to `SLACK_MONITORING_WEBHOOK_URL` on every **status transition** (e.g. `healthy` → `down`, `down` → `healthy`).

### Severity Matrix

| Transition             | Action                                    |
|------------------------|-------------------------------------------|
| `healthy` → `degraded` | Slack warning — investigate within 30 min |
| `healthy` → `down`     | Slack critical — investigate immediately  |
| `degraded` → `down`    | Slack critical — escalate to on-call      |
| Any → `healthy`        | Slack recovery notification               |

### Escalation Steps

1. **L1 — Automated alert**: Slack message posted to monitoring channel.
2. **L2 — On-call engineer**: Acknowledge alert within 15 minutes. Check the Inngest run for detailed error context (see section 4).
3. **L3 — Incident declaration**: If the service remains `down` for more than 15 minutes, open a formal incident via `/incident declare` in Slack.
4. **L4 — Post-mortem**: For any SEV-1/SEV-2 incident, complete a blameless post-mortem within 48 hours.

### Silencing Alerts

To suppress alerts during planned maintenance, remove `SLACK_MONITORING_WEBHOOK_URL` from the API environment and redeploy. Restore it when maintenance is complete.

---

## 3. Adjusting Budget Thresholds

Budget configurations are defined inline in:

```
apps/api/src/inngest/daily-budget-check.ts
```

The `DEFAULT_BUDGETS` array controls per-service limits (amounts are in EUR):

```typescript
const DEFAULT_BUDGETS: CostBudget[] = [
  { service: 'vercel',    monthlyLimit: 50,  alertThreshold: 0.8 },
  { service: 'supabase',  monthlyLimit: 25,  alertThreshold: 0.8 },
  { service: 'anthropic', monthlyLimit: 100, alertThreshold: 0.7 },
  { service: 'github',    monthlyLimit: 20,  alertThreshold: 0.9 },
  { service: 'sentry',    monthlyLimit: 26,  alertThreshold: 0.8 },
  { service: 'clerk',     monthlyLimit: 25,  alertThreshold: 0.8 },
  { service: 'slack',     monthlyLimit: 15,  alertThreshold: 0.9 },
  { service: 'resend',    monthlyLimit: 20,  alertThreshold: 0.8 },
]
```

### To change a limit

1. Update `monthlyLimit` or `alertThreshold` for the relevant service.
2. Commit and deploy — the next 09:00 cron run uses the new values.

### To add a new service

1. Append a new entry to `DEFAULT_BUDGETS`.
2. Ensure cost data for that service is written to the `service_costs` table with a matching `service` string and `period: 'YYYY-MM'`.
3. Commit and deploy.

### Budget Slack Channel

Budget alerts are sent to `SLACK_BUDGET_WEBHOOK_URL`. If that variable is not set, they fall back to `SLACK_MONITORING_WEBHOOK_URL`. Configure both in the API environment for separate Slack channel routing.

---

## 4. Inngest Dashboard and Replaying Failed Functions

### Dashboard Location

```
https://app.inngest.com
```

Log in with the team account and navigate to **Functions** in the left sidebar.

| Function ID                | Schedule        | Purpose                                |
|---------------------------|-----------------|----------------------------------------|
| `scheduled-health-checks` | `*/5 * * * *`   | Run health checks every 5 minutes      |
| `daily-budget-check`      | `0 9 * * *`     | Check service costs daily at 09:00     |

### Viewing Run History

1. Open the Inngest dashboard.
2. Click **Functions** in the left sidebar.
3. Select the function you want to inspect.
4. Click any run to see step-by-step output, timing, and error messages.

### Replaying a Failed Function

If a run fails (e.g. Supabase was briefly unreachable), replay it:

1. Open the failed run in the Inngest dashboard.
2. Click **Replay** in the top-right corner.
3. The function re-executes from scratch with the same event payload.

> Note: Replaying a health check run inserts new rows into `health_check_results` with updated timestamps. This is safe — it does not overwrite existing rows.

### Local Development

To test cron functions locally, use the Inngest Dev Server:

```bash
npx inngest-cli@latest dev
```

Then trigger functions manually from the local dashboard at `http://localhost:8288`.

### Environment Variables

| Variable                       | Purpose                                                              |
|--------------------------------|----------------------------------------------------------------------|
| `INNGEST_EVENT_KEY`            | API key for sending events to Inngest                                |
| `INNGEST_SIGNING_KEY`          | Signing key for verifying Inngest webhook payloads                   |
| `SLACK_MONITORING_WEBHOOK_URL` | Slack incoming webhook for health transition alerts                  |
| `SLACK_BUDGET_WEBHOOK_URL`     | Slack incoming webhook for budget alerts (falls back to monitoring)  |
| `SUPABASE_URL`                 | Supabase project URL                                                 |
| `SUPABASE_SERVICE_ROLE_KEY`    | Supabase service role key (server-side only, never expose to client) |
| `API_BASE_URL`                 | Base URL of the Fastify API (default: `http://localhost:3001`)       |
| `PLANE_API_TOKEN`              | Plane API token for the Plane health check (optional)                |
