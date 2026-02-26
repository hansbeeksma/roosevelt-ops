/**
 * API Performance Metrics
 *
 * Core tracking layer for request-level performance data. Writes raw metric
 * rows to Supabase and provides aggregation helpers for the ops dashboard.
 *
 * Design notes:
 *  - recordMetric is fire-and-forget at the call site; callers should not await
 *    unless they need confirmation (the Fastify plugin calls it async/void).
 *  - getPerformanceSummary and getSlowEndpoints use the aggregation view
 *    `api_performance_summary` created by the migration.
 */

import { createClient } from '@supabase/supabase-js'

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface PerformanceMetric {
  endpoint: string
  method: string
  durationMs: number
  statusCode: number
  timestamp: string
  userId?: string
}

export interface PerformanceSummary {
  p50: number
  p90: number
  p99: number
  avgMs: number
  errorRate: number
  requestCount: number
}

export interface SlowEndpoint extends PerformanceSummary {
  endpoint: string
}

// ── Supabase client (server-side: service role) ───────────────────────────────

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars are required for performance metrics'
    )
  }

  return createClient(url, key)
}

// ── Core operations ───────────────────────────────────────────────────────────

/**
 * Persist a single request metric row to Supabase.
 *
 * Non-blocking at the call site: the Fastify plugin fires this in the
 * `onResponse` hook without awaiting the result, so errors are logged rather
 * than surfaced to the request.
 */
export async function recordMetric(metric: PerformanceMetric): Promise<void> {
  const supabase = getServiceClient()

  const { error } = await supabase.from('api_performance_metrics').insert({
    endpoint: metric.endpoint,
    method: metric.method.toUpperCase(),
    duration_ms: metric.durationMs,
    status_code: metric.statusCode,
    user_id: metric.userId ?? null,
    created_at: metric.timestamp,
  })

  if (error) {
    // Surface in server logs without blocking the request lifecycle
    console.error('[performance-metrics] insert failed:', error.message)
  }
}

/**
 * Query aggregated performance statistics for a single endpoint over a rolling
 * time window.
 *
 * @param endpoint     - The normalised route path (e.g. '/api/metrics/dora')
 * @param windowHours  - How many hours of history to include (default: 24)
 */
export async function getPerformanceSummary(
  endpoint: string,
  windowHours: number
): Promise<PerformanceSummary> {
  const supabase = getServiceClient()
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('api_performance_metrics')
    .select('duration_ms, status_code')
    .eq('endpoint', endpoint)
    .gte('created_at', since)

  if (error) {
    throw new Error(`Failed to query performance metrics for ${endpoint}: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return { p50: 0, p90: 0, p99: 0, avgMs: 0, errorRate: 0, requestCount: 0 }
  }

  return computeSummary(data)
}

/**
 * Find the slowest endpoints over a time window, ranked by P99 descending.
 *
 * @param thresholdMs  - Only return endpoints where P99 exceeds this value
 * @param windowHours  - Rolling window in hours
 */
export async function getSlowEndpoints(
  thresholdMs: number,
  windowHours: number
): Promise<SlowEndpoint[]> {
  const supabase = getServiceClient()
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('api_performance_metrics')
    .select('endpoint, duration_ms, status_code')
    .gte('created_at', since)

  if (error) {
    throw new Error(`Failed to query slow endpoints: ${error.message}`)
  }

  if (!data || data.length === 0) return []

  // Group rows by endpoint
  const grouped = data.reduce<Record<string, Array<{ duration_ms: number; status_code: number }>>>(
    (acc, row) => {
      const bucket = acc[row.endpoint] ?? []
      return { ...acc, [row.endpoint]: [...bucket, row] }
    },
    {}
  )

  // Compute per-endpoint summaries, filter by threshold, sort by P99 desc
  const results: SlowEndpoint[] = Object.entries(grouped)
    .map(([endpoint, rows]) => ({ endpoint, ...computeSummary(rows) }))
    .filter((s) => s.p99 >= thresholdMs)
    .sort((a, b) => b.p99 - a.p99)

  return results
}

// ── Internal helpers ──────────────────────────────────────────────────────────

interface RawRow {
  duration_ms: number
  status_code: number
}

function computeSummary(rows: RawRow[]): PerformanceSummary {
  const durations = rows.map((r) => r.duration_ms).sort((a, b) => a - b)
  const errorCount = rows.filter((r) => r.status_code >= 500).length
  const count = durations.length

  return {
    p50: percentile(durations, 0.5),
    p90: percentile(durations, 0.9),
    p99: percentile(durations, 0.99),
    avgMs: Math.round(durations.reduce((sum, d) => sum + d, 0) / count),
    errorRate: errorCount / count,
    requestCount: count,
  }
}

/**
 * Nearest-rank percentile calculation (sorted ascending array assumed).
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = Math.ceil(p * sorted.length) - 1
  return sorted[Math.max(0, idx)]
}
