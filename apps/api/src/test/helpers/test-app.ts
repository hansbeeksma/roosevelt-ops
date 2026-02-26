/**
 * Integration Test Application Factory
 *
 * Builds a self-contained Fastify instance for integration tests.
 * Key differences from the production server:
 *  - Logger disabled (clean test output)
 *  - Rate limiting permissive (high ceiling, loopback allowlisted)
 *  - CORS allows all origins
 *  - No top-level env validation — test env vars set inline
 *  - Auth bypass via x-test-auth header (injects synthetic auth context)
 *  - All route modules registered with the same prefix structure as production
 */

import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import rateLimit from '@fastify/rate-limit'
import cors from '@fastify/cors'
import fp from 'fastify-plugin'

// ── Auth type augmentation ────────────────────────────────────────────────────

declare module 'fastify' {
  interface FastifyRequest {
    auth?: {
      userId: string
      orgId: string
    }
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Mock Clerk JWT bypass header set.
 * Pass as `headers` in app.inject() calls to simulate an authenticated request.
 */
export const TEST_HEADERS = {
  'x-test-auth': 'bypass',
  'x-test-user-id': 'test-user-123',
  'x-test-org-id': 'test-org-456',
} as const

// ── Test-mode auth plugin ────────────────────────────────────────────────────

/**
 * Fastify plugin that replaces Clerk JWT verification in test mode.
 * When the x-test-auth: bypass header is present, a synthetic auth context
 * is injected into the request so that route handlers see req.auth.
 */
const authBypassPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.addHook('onRequest', async (request) => {
    if (request.headers['x-test-auth'] === 'bypass') {
      request.auth = {
        userId: (request.headers['x-test-user-id'] as string) ?? 'test-user-123',
        orgId: (request.headers['x-test-org-id'] as string) ?? 'test-org-456',
      }
    }
  })
})

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Creates and readies a Fastify test instance.
 *
 * Call `await app.close()` in afterAll() to release handles.
 *
 * @example
 * ```ts
 * let app: FastifyInstance
 * beforeAll(async () => { app = await createTestApp() })
 * afterAll(async () => { await app.close() })
 * ```
 */
export async function createTestApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false })

  // CORS — allow all origins in tests
  await app.register(cors, { origin: true })

  // Rate limiting — high ceiling; loopback addresses are never throttled
  await app.register(rateLimit, {
    max: 10_000,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1', '::1', '::ffff:127.0.0.1'],
  })

  // Auth bypass (replaces Clerk JWT verification)
  await app.register(authBypassPlugin)

  // Error handler identical to production
  app.setErrorHandler((error, _request, reply) => {
    const statusCode = error.statusCode ?? 500
    const message = statusCode < 500 ? error.message : 'An unexpected error occurred'

    return reply.status(statusCode).send({
      status: 'error',
      message,
    })
  })

  // ── Health route (mirrors server.ts) ──────────────────────────────────────
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }))

  // ── Metrics routes ────────────────────────────────────────────────────────
  // Imported dynamically so that the module graph is resolved at test time.
  // fetch is mocked by the test file before the routes execute.
  const { default: metricsRoutes } = await import('../../modules/metrics/metrics.routes.js')
  app.register(metricsRoutes, { prefix: '/api/metrics' })

  // ── Monitoring routes ─────────────────────────────────────────────────────
  const { default: monitoringRoutes } =
    await import('../../modules/monitoring/monitoring.routes.js')
  app.register(monitoringRoutes, { prefix: '/api/monitoring' })

  await app.ready()

  return app
}
