/**
 * Fastify Security Plugin (ROOSE-38)
 *
 * Comprehensive security layer for the Roosevelt OPS API:
 * - CORS with strict origin allowlist
 * - Global rate limiting via @fastify/rate-limit
 * - HTTP security headers (HSTS, CSP, X-Frame-Options, etc.)
 * - Permissions-Policy header
 *
 * OWASP Top 10 2025 coverage:
 * - A02: Security Misconfiguration — CORS, rate limiting
 * - A05: Security Misconfiguration — security headers
 */

import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

// ── Allowed CORS origins ─────────────────────────────────────────────────────

const PRODUCTION_ORIGINS = ['https://roosevelt-ops.vercel.app', 'https://rooseveltops.com']

const DEV_ORIGINS =
  process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : []

const ALLOWED_ORIGINS = new Set([...PRODUCTION_ORIGINS, ...DEV_ORIGINS])

// ── Security headers ─────────────────────────────────────────────────────────

/**
 * Generate a cryptographically random nonce for CSP inline scripts.
 * In production each response should carry a unique nonce; here we
 * generate one per request in the onSend hook.
 */
function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}

/**
 * Build the Content-Security-Policy header value.
 * Adjust the directive list to match your actual asset sources.
 */
function buildCsp(nonce: string): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'", // inline styles common in Tailwind builds
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ]
  return directives.join('; ')
}

/**
 * Apply security response headers.
 * Called in an onSend hook so the nonce can be request-scoped.
 */
function applySecurityHeaders(reply: FastifyReply, nonce: string): void {
  // HSTS: force HTTPS for 2 years, include subdomains
  reply.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

  // Prevent framing (clickjacking)
  reply.header('X-Frame-Options', 'DENY')

  // Prevent MIME-type sniffing
  reply.header('X-Content-Type-Options', 'nosniff')

  // Content Security Policy
  reply.header('Content-Security-Policy', buildCsp(nonce))

  // Limit referrer information leakage
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Restrict browser feature access
  reply.header(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  )

  // Remove X-Powered-By (hides server technology)
  reply.removeHeader('X-Powered-By')

  // Cross-Origin policies
  reply.header('Cross-Origin-Opener-Policy', 'same-origin')
  reply.header('Cross-Origin-Resource-Policy', 'same-origin')
}

// ── Plugin ────────────────────────────────────────────────────────────────────

async function securityPlugin(fastify: FastifyInstance): Promise<void> {
  // ── CORS ────────────────────────────────────────────────────────────────
  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (server-to-server, CLI tools)
      if (!origin) {
        cb(null, true)
        return
      }
      if (ALLOWED_ORIGINS.has(origin)) {
        cb(null, true)
      } else {
        cb(new Error('Not allowed by CORS'), false)
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    credentials: false,
    maxAge: 86400,
  })

  // ── Global rate limit ───────────────────────────────────────────────────
  // Individual routes may override via config.rateLimit
  await fastify.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (request: FastifyRequest) => {
      // Prefer real IP behind proxy, fall back to socket address
      const forwarded = request.headers['x-forwarded-for']
      if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim()
      }
      return request.ip
    },
    errorResponseBuilder: (_request, context) => ({
      error: {
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.round(context.ttl / 1000),
      },
    }),
  })

  // ── Security headers (per-request) ─────────────────────────────────────
  // onSend runs after the handler so the reply object is fully populated
  fastify.addHook('onSend', async (_request, reply) => {
    const nonce = generateNonce()
    applySecurityHeaders(reply, nonce)
    // Expose nonce for use in HTML templates via reply decoration (optional)
    reply.header('X-CSP-Nonce', nonce)
  })
}

export default securityPlugin
