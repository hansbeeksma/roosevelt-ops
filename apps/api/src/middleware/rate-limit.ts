import type { FastifyRequest } from 'fastify'

export interface RateLimitConfig {
  max: number
  timeWindow: string | number
  keyGenerator?: (request: FastifyRequest) => string
}

/**
 * Default global rate limit: 100 req/min per IP.
 * Registered as the default via the security plugin.
 */
export const globalRateLimit: RateLimitConfig = {
  max: 100,
  timeWindow: '1 minute',
  keyGenerator: (request) => request.ip,
}

/**
 * Webhook routes (/webhooks/*): 20 req/min per IP.
 * Spread into route config: { config: { rateLimit: webhookRateLimit } }
 */
export const webhookRateLimit: RateLimitConfig = {
  max: 20,
  timeWindow: '1 minute',
  keyGenerator: (request) => request.ip,
}

/**
 * AI routes (/api/ai/*): 10 req/min per IP.
 * Spread into route config: { config: { rateLimit: aiRateLimit } }
 */
export const aiRateLimit: RateLimitConfig = {
  max: 10,
  timeWindow: '1 minute',
  keyGenerator: (request) => request.ip,
}
