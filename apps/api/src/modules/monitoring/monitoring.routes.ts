/**
 * Infrastructure Monitoring Routes
 *
 * Exposes health check endpoints for liveness probes, readiness probes, and
 * full infrastructure status. Intended for use by load balancers, deployment
 * pipelines, and the internal ops dashboard.
 *
 * Routes:
 *   GET /api/monitoring/health        – full health check across all services
 *   GET /api/monitoring/health/live   – fast liveness probe (always 200 if up)
 *   GET /api/monitoring/health/ready  – readiness probe (checks Supabase only)
 *
 * Rate limits:
 *   /health       : 60 req/min (dashboard polling)
 *   /health/live  : unlimited (L7 health probes fire frequently)
 *   /health/ready : unlimited (L7 health probes fire frequently)
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  runAllChecks,
  checkSupabase,
  type HealthStatus,
} from '../../../../lib/monitoring/health-checks.js'

// ── Types ─────────────────────────────────────────────────────────────────────

interface HealthCheckResult {
  service: string
  status: HealthStatus['status']
  latencyMs: number
  message?: string
}

interface FullHealthResponse {
  overall: 'healthy' | 'degraded' | 'unhealthy'
  services: HealthCheckResult[]
  checked_at: string
}

interface LivenessResponse {
  status: 'alive'
  uptime_seconds: number
  timestamp: string
}

interface ReadinessResponse {
  status: 'ready' | 'not_ready'
  database: HealthStatus['status']
  latencyMs: number
  timestamp: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Derives an overall system health status from individual service results.
 * Returns 'unhealthy' if any service is unhealthy, 'degraded' if any is
 * degraded, and 'healthy' only when all services are healthy.
 */
function deriveOverallStatus(results: Record<string, HealthStatus>): FullHealthResponse['overall'] {
  const statuses = Object.values(results).map((r) => r.status)

  if (statuses.some((s) => s === 'unhealthy')) {
    return 'unhealthy'
  }

  if (statuses.some((s) => s === 'degraded')) {
    return 'degraded'
  }

  return 'healthy'
}

/**
 * Maps overall status to an HTTP status code.
 * healthy/degraded → 200 (service is up; callers decide on action for degraded)
 * unhealthy        → 503 (signals downstream that the system is unavailable)
 */
function statusToHttpCode(status: FullHealthResponse['overall']): number {
  return status === 'unhealthy' ? 503 : 200
}

// ── Route handlers ────────────────────────────────────────────────────────────

async function handleFullHealth(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<FullHealthResponse> {
  const raw = await runAllChecks()

  const services: HealthCheckResult[] = Object.entries(raw).map(([service, s]) => ({
    service,
    status: s.status,
    latencyMs: s.latencyMs,
    ...(s.message !== undefined && { message: s.message }),
  }))

  const overall = deriveOverallStatus(raw)

  const body: FullHealthResponse = {
    overall,
    services,
    checked_at: new Date().toISOString(),
  }

  return reply.status(statusToHttpCode(overall)).send(body)
}

function handleLiveness(_request: FastifyRequest, reply: FastifyReply): void {
  const body: LivenessResponse = {
    status: 'alive',
    uptime_seconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  }

  reply.status(200).send(body)
}

async function handleReadiness(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<ReadinessResponse> {
  const dbStatus = await checkSupabase()
  const ready = dbStatus.status !== 'unhealthy'

  const body: ReadinessResponse = {
    status: ready ? 'ready' : 'not_ready',
    database: dbStatus.status,
    latencyMs: dbStatus.latencyMs,
    timestamp: new Date().toISOString(),
  }

  return reply.status(ready ? 200 : 503).send(body)
}

// ── Plugin registration ───────────────────────────────────────────────────────

export default async function monitoringRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /api/monitoring/health
   *
   * Runs all registered health checks concurrently and returns a full status
   * report. Returns HTTP 503 if any service is unhealthy. Rate-limited to
   * 60 req/min to guard against accidental polling storms.
   */
  fastify.get(
    '/health',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              overall: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
              services: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    service: { type: 'string' },
                    status: { type: 'string' },
                    latencyMs: { type: 'number' },
                    message: { type: 'string' },
                  },
                  required: ['service', 'status', 'latencyMs'],
                },
              },
              checked_at: { type: 'string' },
            },
            required: ['overall', 'services', 'checked_at'],
          },
        },
      },
    },
    handleFullHealth
  )

  /**
   * GET /api/monitoring/health/live
   *
   * Fast liveness probe — always returns 200 as long as the server process is
   * running. No external calls are made. Suitable for L7 health probes that
   * fire every few seconds.
   */
  fastify.get(
    '/health/live',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['alive'] },
              uptime_seconds: { type: 'number' },
              timestamp: { type: 'string' },
            },
            required: ['status', 'uptime_seconds', 'timestamp'],
          },
        },
      },
    },
    handleLiveness
  )

  /**
   * GET /api/monitoring/health/ready
   *
   * Readiness probe — checks that the database (Supabase) is reachable before
   * marking the service as ready to accept traffic. Returns 503 if the
   * database is unhealthy, signalling the orchestrator to hold traffic.
   */
  fastify.get(
    '/health/ready',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['ready', 'not_ready'] },
              database: { type: 'string' },
              latencyMs: { type: 'number' },
              timestamp: { type: 'string' },
            },
            required: ['status', 'database', 'latencyMs', 'timestamp'],
          },
        },
      },
    },
    handleReadiness
  )
}
