import Fastify from 'fastify'
import { createClient } from '@supabase/supabase-js'
import { crmRoutes } from './modules/crm/crm.routes.js'
import { pmRoutes } from './modules/pm/pm.routes.js'
import { timeRoutes } from './modules/time/time.routes.js'

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
})

// Decorate with Supabase client
fastify.decorate('supabase', createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY))

// Health check
fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
}))

// Route modules
fastify.register(crmRoutes, { prefix: '/api/crm' })
fastify.register(pmRoutes, { prefix: '/api/pm' })
fastify.register(timeRoutes, { prefix: '/api/time' })

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
