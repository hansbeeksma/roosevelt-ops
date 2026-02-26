import type { FastifyInstance, FastifyRequest } from 'fastify'
import { verifyToken } from '@clerk/backend'
import { env } from '../lib/env.js'

export interface AuthUser {
  userId: string
  orgId: string
  sessionId: string
}

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthUser
  }
}

export async function registerAuth(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', async (request: FastifyRequest, reply) => {
    // Skip auth for health checks
    if (request.url.startsWith('/health')) {
      return
    }

    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({
        status: 'error',
        message: 'Missing or invalid Authorization header',
      })
    }

    const token = authHeader.slice(7)

    try {
      const payload = await verifyToken(token, {
        secretKey: env.CLERK_SECRET_KEY,
      })

      const orgId = payload.org_id
      if (!orgId) {
        return reply.status(403).send({
          status: 'error',
          message: 'No organization selected. Select an organization to continue.',
        })
      }

      request.user = {
        userId: payload.sub,
        orgId,
        sessionId: payload.sid ?? '',
      }
    } catch {
      return reply.status(401).send({
        status: 'error',
        message: 'Invalid or expired authentication token',
      })
    }
  })
}
