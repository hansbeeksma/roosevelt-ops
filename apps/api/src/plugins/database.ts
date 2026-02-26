import type { FastifyInstance } from 'fastify'
import { createClient } from '@supabase/supabase-js'
import { env } from '../lib/env.js'

declare module 'fastify' {
  interface FastifyInstance {
    supabase: ReturnType<typeof createClient>
  }
}

export async function registerDatabase(app: FastifyInstance): Promise<void> {
  const supabase = createClient(env.DATABASE_URL, env.CLERK_SECRET_KEY)

  app.decorate('supabase', supabase)
  app.log.info('Supabase client initialized')
}
