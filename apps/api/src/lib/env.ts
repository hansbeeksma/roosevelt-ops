import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3002'),
})

export const env = envSchema.parse(process.env)
export type Env = z.infer<typeof envSchema>
