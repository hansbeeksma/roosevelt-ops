import Fastify from 'fastify'
import { registerTwentyWebhookRoutes } from './modules/webhooks/twenty-webhook.handler'
import { registerDesignCycleRoutes } from './modules/design-cycles'

const fastify = Fastify({ logger: true })

fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

await registerTwentyWebhookRoutes(fastify)
await registerDesignCycleRoutes(fastify)

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
