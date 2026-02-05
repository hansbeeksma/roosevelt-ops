# Observability Stack (OpenTelemetry + Grafana Cloud)

Complete observability setup voor Roosevelt OPS metrics dashboard met distributed tracing, custom metrics en structured logging.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│         Next.js App (Vercel Serverless)                 │
│  • API Routes (Server Components)                       │
│  • Client Components (Browser)                          │
│  • Edge Functions (Middleware)                          │
└────────────────┬────────────────────────────────────────┘
                 │ OpenTelemetry SDK
                 │ (@vercel/otel)
                 ▼
┌─────────────────────────────────────────────────────────┐
│           Grafana Cloud (Free Tier)                     │
├─────────────────────────────────────────────────────────┤
│  • Tempo: Distributed tracing (50GB/month)              │
│  • Loki: Log aggregation (50GB/month)                   │
│  • Mimir: Metrics storage (10K series)                  │
│  • Grafana: Visualization dashboards                    │
└─────────────────────────────────────────────────────────┘
```

---

## Setup Guide

### Step 1: Create Grafana Cloud Account

1. Go to https://grafana.com/auth/sign-up/create-user
2. Sign up for **Free Forever** plan:
   - **Metrics:** 10K series, 14 days retention
   - **Logs:** 50GB/month, 14 days retention
   - **Traces:** 50GB/month, 14 days retention
   - **Dashboards:** Unlimited
3. Create a new stack (e.g., `roosevelt-ops`)
4. Note your stack URL: `https://[your-stack].grafana.net`

### Step 2: Generate Grafana Cloud Credentials

#### API Token for OTLP

1. Go to **Grafana Cloud Portal** → **Security** → **API Keys**
2. Click **Create API Key**
   - Name: `roosevelt-ops-otlp`
   - Role: `MetricsPublisher` (includes traces & logs)
   - TTL: No expiry (or 1 year)
3. Copy the generated key (e.g., `glc_xxx...`)

#### Get OTLP Endpoint

1. Go to **Connections** → **Add new connection** → **OpenTelemetry**
2. Note the endpoint URLs:
   - **Traces (Tempo):** `https://otlp-gateway-[region].grafana.net/otlp`
   - **Metrics (Mimir):** `https://otlp-gateway-[region].grafana.net/otlp`
   - **Logs (Loki):** `https://otlp-gateway-[region].grafana.net/otlp`
3. Note your **Instance ID** (for authentication)

### Step 3: Configure Environment Variables

Add to **Vercel Environment Variables** (all environments):

```bash
# Grafana Cloud OTLP Configuration
vercel env add OTEL_EXPORTER_OTLP_ENDPOINT production --scope roosevelt-d9f64ff6
# Value: https://otlp-gateway-prod-eu-west-0.grafana.net/otlp

vercel env add OTEL_EXPORTER_OTLP_HEADERS production --scope roosevelt-d9f64ff6
# Value: Authorization=Basic <base64(instance-id:api-key)>

vercel env add OTEL_SERVICE_NAME production --scope roosevelt-d9f64ff6
# Value: roosevelt-ops-metrics
```

#### Generate Authorization Header

```bash
# Replace with your actual values
INSTANCE_ID="your-instance-id"
API_KEY="glc_xxx..."

# Generate base64 encoded auth
echo -n "${INSTANCE_ID}:${API_KEY}" | base64
# Result: aW5zdGFuY2UtaWQ6Z2xjX3h4eC4uLg==

# Full header value:
# Authorization=Basic aW5zdGFuY2UtaWQ6Z2xjX3h4eC4uLg==
```

#### Local Development (.env.local)

```env
# OpenTelemetry Configuration
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-eu-west-0.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <your-base64-encoded-credentials>
OTEL_SERVICE_NAME=roosevelt-ops-metrics

# Optional: Enable debug logging
OTEL_LOG_LEVEL=debug
```

### Step 4: Update .env.local.example

```bash
cat >> .env.local.example << 'EOF'

# OpenTelemetry / Grafana Cloud
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-eu-west-0.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <base64(instance-id:api-key)>
OTEL_SERVICE_NAME=roosevelt-ops-metrics
OTEL_LOG_LEVEL=info
EOF
```

---

## Implementation Details

### Instrumentation Hook

File: `instrumentation.ts`

```typescript
import { registerOTel } from '@vercel/otel'

export function register() {
  registerOTel({
    serviceName: 'roosevelt-ops-metrics',
    // Endpoint and headers configured via environment variables
  })
}
```

**How it works:**
- Next.js calls `register()` on app startup
- `@vercel/otel` automatically instruments:
  - HTTP requests (fetch, axios)
  - Database queries (Supabase client)
  - Server components
  - API routes
- Exports traces to Grafana Cloud via OTLP protocol

### Next.js Configuration

File: `next.config.js`

```javascript
const nextConfig = {
  experimental: {
    instrumentationHook: true, // Enable instrumentation.ts
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}
```

**Note:** `instrumentationHook` is required for Next.js 14. In Next.js 15+, it's enabled by default.

---

## Custom Tracing

### Adding Custom Spans

For detailed business logic tracing:

```typescript
import { trace } from '@opentelemetry/api'

const tracer = trace.getTracer('roosevelt-ops')

export async function calculateDoraMetrics() {
  return tracer.startActiveSpan('calculate-dora-metrics', async (span) => {
    try {
      span.setAttribute('metrics.type', 'dora')

      const deploymentFreq = await tracer.startActiveSpan(
        'fetch-deployment-frequency',
        async (childSpan) => {
          const result = await supabase.from('dora_summary').select('*')
          childSpan.setAttribute('rows.count', result.data?.length || 0)
          childSpan.end()
          return result
        }
      )

      span.setStatus({ code: SpanStatusCode.OK })
      span.end()
      return deploymentFreq
    } catch (error) {
      span.recordException(error)
      span.setStatus({ code: SpanStatusCode.ERROR })
      span.end()
      throw error
    }
  })
}
```

### API Route Tracing

Automatic tracing for API routes:

```typescript
// app/api/metrics/route.ts
export async function GET() {
  // Automatically traced by @vercel/otel
  const { data } = await supabase.from('dora_metrics').select('*')

  return Response.json(data)
}
```

### Custom Metrics

Add custom business metrics:

```typescript
import { metrics } from '@opentelemetry/api'

const meter = metrics.getMeter('roosevelt-ops')
const deploymentCounter = meter.createCounter('deployments.total', {
  description: 'Total number of deployments',
})

export function recordDeployment() {
  deploymentCounter.add(1, {
    environment: process.env.VERCEL_ENV || 'development',
    status: 'success',
  })
}
```

---

## Grafana Dashboards

### Pre-built Dashboards

Grafana Cloud includes pre-built dashboards:

1. **Go to Dashboards** → **Browse** → **Filter by: OpenTelemetry**
2. Import recommended dashboards:
   - **APM Overview**: Service health, latency, error rate
   - **RED Metrics**: Rate, Errors, Duration
   - **Request Duration**: P50, P95, P99 latencies

### Custom Dashboard

Create dashboard for DORA metrics:

```json
{
  "dashboard": {
    "title": "Roosevelt OPS - DORA Metrics",
    "panels": [
      {
        "title": "Deployment Frequency",
        "targets": [
          {
            "expr": "rate(deployments_total[1h])",
            "legendFormat": "{{environment}}"
          }
        ]
      },
      {
        "title": "API Response Time (P95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_server_duration_bucket)",
            "legendFormat": "{{route}}"
          }
        ]
      }
    ]
  }
}
```

---

## Querying Traces

### Find Slow Requests

**TraceQL Query:**

```traceql
{
  service.name="roosevelt-ops-metrics"
  && duration > 2s
  && http.status_code >= 200
  && http.status_code < 300
}
```

### Error Analysis

```traceql
{
  service.name="roosevelt-ops-metrics"
  && status=error
  && resource.name=~".*dora.*"
}
| rate() by (span.name)
```

### Database Query Performance

```traceql
{
  service.name="roosevelt-ops-metrics"
  && db.system="postgresql"
  && db.operation="SELECT"
}
| quantile_over_time(duration, 0.95) by (db.statement)
```

---

## Performance Considerations

### Sampling Strategy

For serverless (cost optimization):

```typescript
// instrumentation.ts
import { registerOTel } from '@vercel/otel'

export function register() {
  registerOTel({
    serviceName: 'roosevelt-ops-metrics',
    tracesSampler: {
      // Sample 10% of successful requests
      root: 0.1,
      // Sample 100% of errors
      error: 1.0,
    },
  })
}
```

### Cold Start Impact

OpenTelemetry SDK adds ~50-100ms to cold starts on Vercel:
- **Acceptable** for dashboard app (not user-facing API)
- **Mitigation**: Use Vercel's warm instances (Pro plan)

### Bundle Size

```bash
# Check bundle impact
npm run build

# OpenTelemetry adds ~150KB gzipped
# Split chunks to avoid client bundle bloat
```

---

## Alerting

### Configure Alert Rules

1. **Go to Grafana Cloud** → **Alerting** → **Alert rules**
2. Create alert for **High Error Rate**:

```yaml
name: High Error Rate
query: |
  rate(http_server_requests_total{status_code=~"5.."}[5m]) > 0.05
for: 5m
labels:
  severity: critical
annotations:
  summary: "Error rate > 5% for 5 minutes"
  description: "Service {{ $labels.service_name }} has {{ $value }}% errors"
```

3. Create alert for **Slow Requests**:

```yaml
name: Slow API Responses
query: |
  histogram_quantile(0.95,
    http_server_duration_bucket{route=~"/api/.*"}
  ) > 2
for: 10m
labels:
  severity: warning
annotations:
  summary: "P95 latency > 2s"
```

### Notification Channels

1. **Email**: Grafana Cloud → Alerting → Contact points → Add email
2. **Slack**: Integrate via webhook:
   ```yaml
   type: slack
   url: https://hooks.slack.com/services/xxx/yyy/zzz
   channel: #alerts
   ```

---

## Integration with Sentry

OpenTelemetry and Sentry work together:

**Sentry:** Error tracking + session replay
**Grafana:** Distributed tracing + metrics

### Correlation

Link Sentry errors to traces:

```typescript
import * as Sentry from '@sentry/nextjs'
import { trace } from '@opentelemetry/api'

export function captureError(error: Error) {
  const span = trace.getActiveSpan()
  const traceId = span?.spanContext().traceId

  Sentry.captureException(error, {
    tags: {
      trace_id: traceId, // Link to Grafana trace
    },
  })
}
```

---

## Troubleshooting

### No Traces Appearing

**Check:**
1. Environment variables configured correctly?
   ```bash
   vercel env ls
   ```
2. OTLP endpoint reachable?
   ```bash
   curl -v https://otlp-gateway-prod-eu-west-0.grafana.net/otlp
   ```
3. Authorization header correct?
   ```bash
   echo "instance-id:api-key" | base64
   ```

**Debug:**
```env
# .env.local
OTEL_LOG_LEVEL=debug
```

### High Cold Start Latency

**Solutions:**
- Enable sampling (10% of requests)
- Use Vercel Pro warm instances
- Consider conditional instrumentation:
  ```typescript
  if (process.env.VERCEL_ENV === 'production') {
    registerOTel({ ... })
  }
  ```

### Missing Database Spans

**Fix:** Ensure Supabase client is instrumented:

```typescript
import { createClient } from '@supabase/supabase-js'
import { trace } from '@opentelemetry/api'

const tracer = trace.getTracer('supabase')

export const supabase = createClient(url, key, {
  fetch: (url, options) => {
    return tracer.startActiveSpan('supabase-query', async (span) => {
      span.setAttribute('db.system', 'postgresql')
      span.setAttribute('db.operation', options?.method || 'GET')
      const result = await fetch(url, options)
      span.end()
      return result
    })
  },
})
```

---

## Cost Analysis

### Grafana Cloud Free Tier Limits

| Resource | Free Tier | Typical Usage (Roosevelt OPS) | Status |
|----------|-----------|-------------------------------|--------|
| **Metrics** | 10K series | ~500 series (DORA + SPACE) | ✅ 5% |
| **Logs** | 50GB/month | ~2GB/month (API logs) | ✅ 4% |
| **Traces** | 50GB/month | ~5GB/month (10% sampling) | ✅ 10% |
| **Retention** | 14 days | Sufficient for SRE | ✅ |

**Upgrade triggers:**
- Traces > 50GB/month → Need **Pro** ($50/month for 100GB)
- Metrics > 10K series → Need **Advanced** ($299/month for 50K series)

**Current projection:** Free tier sufficient for 6-12 months

---

## Next Steps

### Phase 1: Basic Setup (Complete ✅)
- [x] Install OpenTelemetry dependencies
- [x] Configure `instrumentation.ts`
- [x] Enable `instrumentationHook`
- [x] Document Grafana Cloud setup

### Phase 2: Grafana Cloud Configuration (Next)
- [ ] Create Grafana Cloud account
- [ ] Generate API key and OTLP credentials
- [ ] Add environment variables to Vercel
- [ ] Deploy and verify traces appear

### Phase 3: Custom Instrumentation
- [ ] Add custom spans for DORA metric calculation
- [ ] Add custom spans for SPACE metric calculation
- [ ] Instrument Supabase queries
- [ ] Create custom metrics (deployment counter, query duration)

### Phase 4: Dashboards & Alerts
- [ ] Import APM dashboard
- [ ] Create custom DORA dashboard
- [ ] Create custom SPACE dashboard
- [ ] Configure alert rules (error rate, latency)
- [ ] Setup Slack notifications

---

## References

- [Next.js OpenTelemetry Guide](https://nextjs.org/docs/app/guides/open-telemetry)
- [Vercel OTLP Documentation](https://vercel.com/docs/observability/otel-overview)
- [Grafana Cloud OpenTelemetry](https://grafana.com/docs/grafana-cloud/send-data/otlp/send-data-otlp/)
- [OpenTelemetry API](https://open-telemetry.github.io/opentelemetry-js/)

**Related Documentation:**
- `docs/MONITORING.md` - Sentry error tracking setup
- `supabase/migrations/20260205_dora_metrics_schema.sql` - DORA metrics schema
- `supabase/migrations/20260205120000_space_metrics_schema.sql` - SPACE metrics schema

---

*Last Updated: 2026-02-05*
*Version: 1.0.0 (Lightweight Observability Stack)*
