import Fastify from 'fastify'
import { env } from './lib/env.js'
import { registerCors } from './plugins/cors.js'
import { registerRateLimit } from './plugins/rate-limiter.js'
import { registerErrorHandler } from './plugins/error-handler.js'
import { healthRoute } from './modules/health/health.route.js'

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      ...(env.NODE_ENV === 'development' && {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }),
    },
  })

  // Plugins
  app.register(registerCors)
  app.register(registerRateLimit)
  app.register(registerErrorHandler)

  // Routes
  app.register(healthRoute, { prefix: '/health' })

  return app
}
