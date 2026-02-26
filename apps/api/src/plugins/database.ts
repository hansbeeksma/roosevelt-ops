import type { FastifyInstance } from 'fastify'
import { type SupabaseClient, createClient } from '@supabase/supabase-js'
import { env } from '../lib/env.js'

declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient
  }
}

export async function registerDatabase(app: FastifyInstance): Promise<void> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  app.decorate('supabase', supabase as unknown as SupabaseClient)
  app.log.info('Supabase client initialized')
}
