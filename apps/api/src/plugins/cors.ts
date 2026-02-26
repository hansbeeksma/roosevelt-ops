import type { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { env } from '../lib/env.js'

export async function registerCors(app: FastifyInstance): Promise<void> {
  await app.register(cors, {
    origin: env.ALLOWED_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
}
