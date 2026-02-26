import Fastify from 'fastify'
import { env } from './lib/env.js'
import { registerAuth } from './plugins/auth.js'
import { registerCors } from './plugins/cors.js'
import { registerDatabase } from './plugins/database.js'
import { registerRateLimit } from './plugins/rate-limiter.js'
import { registerErrorHandler } from './plugins/error-handler.js'
import { healthRoute } from './modules/health/health.route.js'
import { crmRoute } from './modules/crm/crm.route.js'
import { pmRoute } from './modules/pm/pm.route.js'
import { timeRoute } from './modules/time/time.route.js'

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
  app.register(registerAuth)
  app.register(registerDatabase)
  app.register(registerRateLimit)
  app.register(registerErrorHandler)

  // Routes
  app.register(healthRoute, { prefix: '/health' })
  app.register(crmRoute, { prefix: '/api/crm' })
  app.register(pmRoute, { prefix: '/api/pm' })
  app.register(timeRoute, { prefix: '/api/time' })

  return app
}
