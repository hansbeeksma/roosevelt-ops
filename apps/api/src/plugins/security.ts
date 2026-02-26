import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { globalRateLimit } from '../middleware/rate-limit.js'

async function securityPlugin(fastify: FastifyInstance): Promise<void> {
  // --- Helmet: security headers ---
  await fastify.register(helmet, {
    // Content-Security-Policy is disabled by default for API-only servers;
    // enable explicitly if serving HTML responses
    contentSecurityPolicy: false,
  })

  // --- CORS ---
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000']

  await fastify.register(cors, {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })

  // --- Global rate limiting: 100 req/min per IP ---
  await fastify.register(rateLimit, {
    global: true,
    max: globalRateLimit.max,
    timeWindow: globalRateLimit.timeWindow,
    keyGenerator: globalRateLimit.keyGenerator,
    errorResponseBuilder: (_request, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${context.after}.`,
      retryAfter: context.after,
    }),
  })
}

export default fp(securityPlugin, {
  name: 'security',
  fastify: '5.x',
})
