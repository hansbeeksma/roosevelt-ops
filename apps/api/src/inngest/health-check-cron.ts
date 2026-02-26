import { createClient } from '@supabase/supabase-js'
import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'roosevelt-ops',
  name: 'Roosevelt OPS',
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HealthStatus = 'healthy' | 'degraded' | 'down'

interface HealthCheckResult {
  service: string
  status: HealthStatus
  latency_ms: number
  checked_at: string
  error?: string
  metadata?: Record<string, unknown>
}

interface StoredHealthResult {
  service: string
  status: HealthStatus
  latency_ms: number
  checked_at: string
  error: string | null
  metadata: Record<string, unknown> | null
}

// ---------------------------------------------------------------------------
// Supabase admin client (no cookie context — runs in Inngest worker)
// ---------------------------------------------------------------------------

function createSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured')
  }

  return createClient(url, key)
}

// ---------------------------------------------------------------------------
// Health check implementations
// lib/monitoring/health-checks.ts does not exist on this branch yet.
// Defined inline here. When that module is created, replace with an import.
// ---------------------------------------------------------------------------

async function checkSupabaseHealth(): Promise<HealthCheckResult> {
  const start = Date.now()
  const service = 'supabase'

  try {
    const supabase = createSupabaseAdmin()
    const { error } = await supabase.from('health_check_results').select('id').limit(1)

    return {
      service,
      status: error ? 'down' : 'healthy',
      latency_ms: Date.now() - start,
      checked_at: new Date().toISOString(),
      error: error?.message,
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

async function checkApiHealth(): Promise<HealthCheckResult> {
  const start = Date.now()
  const service = 'api'
  const apiUrl = process.env.API_BASE_URL || 'http://localhost:3001'

  try {
    const response = await fetch(`${apiUrl}/health`, {
      signal: AbortSignal.timeout(5000),
    })

    return {
      service,
      status: response.ok ? 'healthy' : 'degraded',
      latency_ms: Date.now() - start,
      checked_at: new Date().toISOString(),
      metadata: { http_status: response.status },
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

async function checkPlaneHealth(): Promise<HealthCheckResult> {
  const start = Date.now()
  const service = 'plane'
  const planeToken = process.env.PLANE_API_TOKEN

  if (!planeToken) {
    return {
      service,
      status: 'healthy',
      latency_ms: 0,
      checked_at: new Date().toISOString(),
      metadata: { skipped: true, reason: 'PLANE_API_TOKEN not configured' },
    }
  }

  try {
    const response = await fetch('https://api.plane.so/api/v1/', {
      headers: { 'X-API-Token': planeToken },
      signal: AbortSignal.timeout(5000),
    })

    return {
      service,
      status: response.ok ? 'healthy' : 'degraded',
      latency_ms: Date.now() - start,
      checked_at: new Date().toISOString(),
      metadata: { http_status: response.status },
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

export async function runHealthChecks(): Promise<HealthCheckResult[]> {
  const results = await Promise.all([checkSupabaseHealth(), checkApiHealth(), checkPlaneHealth()])
  return results
}

// ---------------------------------------------------------------------------
// Alerting utilities
// lib/monitoring/alerting.ts does not exist on this branch yet.
// Defined inline here. When that module is created, replace with an import.
// ---------------------------------------------------------------------------

async function postSlackAlert(text: string): Promise<void> {
  const webhookUrl = process.env.SLACK_MONITORING_WEBHOOK_URL

  if (!webhookUrl) {
    return
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
}

async function dispatchStatusTransitionAlert(
  service: string,
  previous: HealthStatus,
  current: HealthStatus
): Promise<void> {
  const isRecovery = previous !== 'healthy' && current === 'healthy'
  const isDegradation = previous === 'healthy' && current !== 'healthy'

  if (!isRecovery && !isDegradation) {
    return
  }

  const emoji = isRecovery ? ':white_check_mark:' : ':rotating_light:'
  const label = isRecovery ? 'recovered' : 'degraded'
  const text = `${emoji} *Roosevelt OPS Health Alert*\nService *${service}* ${label}: \`${previous}\` → \`${current}\``

  await postSlackAlert(text)
}

// ---------------------------------------------------------------------------
// Inngest scheduled function — every 5 minutes
// ---------------------------------------------------------------------------

export const scheduledHealthChecks = inngest.createFunction(
  {
    id: 'scheduled-health-checks',
    name: 'Scheduled Health Checks',
    retries: 2,
  },
  { cron: '*/5 * * * *' },
  async ({ step }) => {
    const results = await step.run('run-health-checks', async () => {
      return runHealthChecks()
    })

    const stored = await step.run('store-results', async () => {
      const supabase = createSupabaseAdmin()

      const rows: StoredHealthResult[] = results.map((r) => ({
        service: r.service,
        status: r.status,
        latency_ms: r.latency_ms,
        checked_at: r.checked_at,
        error: r.error ?? null,
        metadata: r.metadata ?? null,
      }))

      const { data, error } = await supabase.from('health_check_results').insert(rows).select('id')

      if (error) {
        throw new Error(`Failed to store health check results: ${error.message}`)
      }

      return { inserted: data?.length ?? 0 }
    })

    const alertsDispatched = await step.run('evaluate-alerts', async () => {
      const supabase = createSupabaseAdmin()
      const dispatched: string[] = []

      for (const result of results) {
        const { data: previous } = await supabase
          .from('health_check_results')
          .select('status')
          .eq('service', result.service)
          .lt('checked_at', result.checked_at)
          .order('checked_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        const previousStatus: HealthStatus =
          (previous?.status as HealthStatus | undefined) ?? 'healthy'

        if (previousStatus !== result.status) {
          await dispatchStatusTransitionAlert(result.service, previousStatus, result.status)
          dispatched.push(result.service)
        }
      }

      return dispatched
    })

    return {
      checkedAt: new Date().toISOString(),
      servicesChecked: results.length,
      stored,
      alertsDispatched,
      summary: results.map((r) => ({ service: r.service, status: r.status })),
    }
  }
)
