import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import rateLimit from '@fastify/rate-limit'
import cors from '@fastify/cors'

/**
 * Mock Clerk JWT bypass header used in integration tests.
 * The test app validates this header and injects a synthetic auth context.
 */
export const TEST_HEADERS = {
  'x-test-auth': 'bypass',
  'x-test-user-id': 'test-user-123',
  'x-test-org-id': 'test-org-456',
} as const

declare module 'fastify' {
  interface FastifyRequest {
    auth?: {
      userId: string
      orgId: string
    }
  }
}

/**
 * Builds a Fastify instance configured for integration testing.
 *
 * Differences from the production app:
 * - Logger disabled to keep test output clean
 * - Rate limiting disabled (skip on test requests)
 * - CORS allows all origins
 * - Auth bypass: x-test-auth header injects a synthetic auth context
 * - Env vars are not required (no env.ts parsing)
 */
export async function createTestApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false })

  // CORS - allow all in tests
  await app.register(cors, { origin: true })

  // Rate limiting - disabled for test requests via allowList
  await app.register(rateLimit, {
    max: 1000,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1', '::1', '::ffff:127.0.0.1'],
  })

  // Auth bypass hook: inject synthetic auth from test headers
  app.addHook('onRequest', async (request) => {
    if (request.headers['x-test-auth'] === 'bypass') {
      request.auth = {
        userId: (request.headers['x-test-user-id'] as string) ?? 'test-user-123',
        orgId: (request.headers['x-test-org-id'] as string) ?? 'test-org-456',
      }
    }
  })

  // Error handler consistent with production
  app.setErrorHandler((error, _request, reply) => {
    const statusCode = error.statusCode ?? 500
    const message = statusCode < 500 ? error.message : 'An unexpected error occurred'

    return reply.status(statusCode).send({
      status: 'error',
      message,
    })
  })

  // Health route
  app.register(async (fastify) => {
    fastify.get('/health', async (_request, reply) => {
      return reply.send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV ?? 'test',
      })
    })

    fastify.get('/health/ready', async (_request, reply) => {
      return reply.send({ status: 'ok' })
    })
  })

  // Metrics routes (stub — full implementation lands in ROOSE-29)
  app.register(async (fastify) => {
    fastify.get<{ Querystring: { days?: string } }>('/api/metrics/dora', async (request, reply) => {
      const { days } = request.query
      const daysNum = days !== undefined ? Number(days) : undefined

      if (daysNum !== undefined && (Number.isNaN(daysNum) || daysNum <= 0)) {
        return reply.status(400).send({
          status: 'error',
          message: 'days must be a positive integer',
        })
      }

      return reply.send({
        success: true,
        data: {
          deploymentFrequency: 0,
          leadTimeForChanges: 0,
          changeFailureRate: 0,
          timeToRestoreService: 0,
          period: {
            days: daysNum ?? 30,
            from: new Date(Date.now() - (daysNum ?? 30) * 86_400_000).toISOString(),
            to: new Date().toISOString(),
          },
        },
      })
    })

    fastify.get<{ Querystring: { days?: string } }>(
      '/api/metrics/space',
      async (request, reply) => {
        const { days } = request.query
        const daysNum = days !== undefined ? Number(days) : undefined

        if (daysNum !== undefined && (Number.isNaN(daysNum) || daysNum <= 0)) {
          return reply.status(400).send({
            status: 'error',
            message: 'days must be a positive integer',
          })
        }

        return reply.send({
          success: true,
          data: {
            satisfaction: 0,
            performance: 0,
            activity: 0,
            communication: 0,
            efficiency: 0,
            period: {
              days: daysNum ?? 30,
            },
          },
        })
      }
    )

    fastify.get<{ Querystring: { days?: string } }>(
      '/api/metrics/summary',
      async (request, reply) => {
        const { days } = request.query
        const daysNum = days !== undefined ? Number(days) : undefined

        if (daysNum !== undefined && (Number.isNaN(daysNum) || daysNum <= 0)) {
          return reply.status(400).send({
            status: 'error',
            message: 'days must be a positive integer',
          })
        }

        return reply.send({
          success: true,
          data: {
            trend: [],
            summary: {
              totalDeployments: 0,
              avgLeadTime: 0,
            },
          },
        })
      }
    )
  })

  // Monitoring routes (stub — full implementation lands in ROOSE-30)
  app.register(async (fastify) => {
    fastify.get('/api/monitoring/health', async (_request, reply) => {
      return reply.send({
        success: true,
        data: {
          database: { status: 'healthy', latencyMs: 0 },
          github: { status: 'healthy', latencyMs: 0 },
          clerk: { status: 'healthy', latencyMs: 0 },
        },
      })
    })

    fastify.get('/api/monitoring/health/live', async (_request, reply) => {
      return reply.status(200).send({ status: 'ok' })
    })
  })

  await app.ready()

  return app
}
