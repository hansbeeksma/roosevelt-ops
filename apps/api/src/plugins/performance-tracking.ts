/**
 * Performance Tracking — Fastify Plugin
 *
 * Hooks into every request/response lifecycle to capture timing data and
 * persist it to Supabase via the shared performance metrics library.
 *
 * Design decisions:
 *  - `decorateRequest('startTime', null)` is the idiomatic Fastify pattern for
 *    per-request state; the value is set in `onRequest` and read in `onResponse`.
 *  - Metric writes are intentionally fire-and-forget (void async) so a slow or
 *    failing Supabase write never blocks the HTTP response.
 *  - Health checks and Next.js static paths are excluded to avoid noise.
 */

import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { recordMetric } from '../../../../lib/metrics/performance.js'

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Route prefixes/exact paths that should not be tracked.
 * Keep this list minimal and well-documented.
 */
const EXCLUDED_PATHS: readonly string[] = ['/health', '/favicon.ico', '/_next', '/static']

// ── Module augmentation ───────────────────────────────────────────────────────

declare module 'fastify' {
  interface FastifyRequest {
    /** High-resolution start time set in the `onRequest` hook. */
    startTime: [number, number] | null
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isExcluded(path: string): boolean {
  return EXCLUDED_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

/**
 * Normalise dynamic route segments to prevent unbounded cardinality.
 *
 * Examples:
 *   /api/users/abc-123        → /api/users/:id
 *   /api/projects/42/tasks    → /api/projects/:id/tasks
 *
 * Fastify's `request.routeOptions.url` already provides the matched route
 * pattern (e.g. `/api/projects/:id/tasks`), so this is a safety fallback for
 * paths that fall outside registered routes.
 */
function normalisePath(request: FastifyRequest): string {
  // Prefer the matched route pattern (e.g. '/api/metrics/:type')
  const routePattern = request.routeOptions?.url
  if (routePattern && routePattern !== '/*') return routePattern

  // Fallback: replace UUID/numeric segments with ':id'
  return request.url.replace(/\/[0-9a-f-]{8,}(?=\/|$)/gi, '/:id').replace(/\/\d+(?=\/|$)/g, '/:id')
}

function extractUserId(request: FastifyRequest): string | undefined {
  // Fastify-jwt sets request.user if JWT was verified; fall back gracefully.
  const user = (request as FastifyRequest & { user?: { id?: string; sub?: string } }).user
  return user?.id ?? user?.sub ?? undefined
}

// ── Plugin ────────────────────────────────────────────────────────────────────

async function performanceTrackingPlugin(fastify: FastifyInstance): Promise<void> {
  // Initialise the per-request slot once at the instance level
  fastify.decorateRequest('startTime', null)

  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    request.startTime = process.hrtime()
  })

  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const path = request.url.split('?')[0]

    if (isExcluded(path) || request.startTime === null) return

    const [sec, ns] = process.hrtime(request.startTime)
    const durationMs = Math.round(sec * 1_000 + ns / 1_000_000)

    const metric = {
      endpoint: normalisePath(request),
      method: request.method,
      durationMs,
      statusCode: reply.statusCode,
      timestamp: new Date().toISOString(),
      userId: extractUserId(request),
    }

    // Fire-and-forget: never block the response on a metrics write
    void recordMetric(metric).catch((err: unknown) => {
      fastify.log.warn({ err }, '[performance-tracking] failed to record metric')
    })
  })
}

export default fp(performanceTrackingPlugin, {
  fastify: '5.x',
  name: 'performance-tracking',
})
