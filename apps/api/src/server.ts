import Fastify from 'fastify'
import { createClient } from '@supabase/supabase-js'
import securityPlugin from './plugins/security.js'

declare module 'fastify' {
  interface FastifyInstance {
    supabase: ReturnType<typeof createClient>
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PORT = Number(process.env.PORT ?? 3001)
const NODE_ENV = process.env.NODE_ENV ?? 'development'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars are required')
}

export const fastify = Fastify({
  logger: {
    level: NODE_ENV === 'production' ? 'info' : 'debug',
    ...(NODE_ENV === 'development' && {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    }),
  },
  // Default body size limit: 1 MB
  bodyLimit: 1 * 1024 * 1024,
})

// Security plugin (helmet + CORS + global rate limit)
await fastify.register(securityPlugin)

// Decorate with Supabase client
fastify.decorate('supabase', createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY))

// Health check
fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
}))

// Webhook routes — stricter rate limit: 20 req/min per IP
// Route modules registered here should include config.rateLimit overrides
fastify.register(
  async (instance) => {
    // Placeholder: webhook route handlers go here or in a dedicated module
    instance.get('/', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async () => ({
      status: 'webhook endpoint',
    }))
  },
  { prefix: '/webhooks' }
)

// AI routes — strictest rate limit: 10 req/min per IP, 10 MB body limit
fastify.register(
  async (instance) => {
    // Placeholder: AI route handlers go here or in a dedicated module
    instance.get('/', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async () => ({
      status: 'ai endpoint',
    }))
  },
  {
    prefix: '/api/ai',
    // 10 MB body limit for AI routes (e.g. file uploads)
    bodyLimit: 10 * 1024 * 1024,
  }
)

const start = async (): Promise<void> => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

const shutdown = async (signal: string): Promise<void> => {
  fastify.log.info(`Received ${signal}, shutting down gracefully`)
  await fastify.close()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

start()
