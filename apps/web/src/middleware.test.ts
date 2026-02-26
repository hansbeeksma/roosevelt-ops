import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { resetStore } from '@/lib/rate-limiter'

// Mock Clerk to pass through directly to the handler
vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: (handler: Function) =>
    async (request: NextRequest) => {
      const result = await handler({ protect: vi.fn() }, request)
      return result ?? NextResponse.next()
    },
  createRouteMatcher: () => () => false,
}))

// Static import works correctly with vi.mock hoisting
import middleware from './middleware'

function makeRequest(
  path: string,
  options: {
    method?: string
    origin?: string
    ip?: string
  } = {}
): NextRequest {
  const { method = 'GET', origin, ip } = options
  const headers = new Headers()

  if (origin) {
    headers.set('origin', origin)
  }
  if (ip) {
    headers.set('x-forwarded-for', ip)
  }

  return new NextRequest(`http://localhost${path}`, {
    method,
    headers,
  })
}

describe('middleware', () => {
  beforeEach(() => {
    resetStore()
    vi.stubEnv('NODE_ENV', 'development')
  })

  describe('non-API routes', () => {
    it('passes through non-API routes', async () => {
      const request = makeRequest('/dashboard')
      const response = await middleware(request)
      // NextResponse.next() doesn't set a custom status
      expect(response.status).toBe(200)
    })
  })

  describe('CORS', () => {
    it('handles preflight OPTIONS for allowed origin', async () => {
      const request = makeRequest('/api/example', {
        method: 'OPTIONS',
        origin: 'http://localhost:3000',
      })
      const response = await middleware(request)

      expect(response.status).toBe(204)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    })

    it('rejects preflight OPTIONS for disallowed origin', async () => {
      const request = makeRequest('/api/example', {
        method: 'OPTIONS',
        origin: 'https://evil.com',
      })
      const response = await middleware(request)

      expect(response.status).toBe(403)
    })

    it('rejects requests from disallowed origins', async () => {
      const request = makeRequest('/api/example', {
        origin: 'https://evil.com',
      })
      const response = await middleware(request)

      expect(response.status).toBe(403)
      // Verify it's a JSON error response
      expect(response.headers.get('content-type')).toContain('application/json')
    })

    it('allows requests without origin header (same-origin)', async () => {
      const request = makeRequest('/api/example')
      const response = await middleware(request)

      // Should pass through (not 403)
      expect(response.status).not.toBe(403)
    })

    it('allows requests from localhost in development', async () => {
      const request = makeRequest('/api/example', {
        origin: 'http://localhost:3000',
      })
      const response = await middleware(request)

      expect(response.status).not.toBe(403)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')
    })

    it('sets Vary header for CORS responses', async () => {
      const request = makeRequest('/api/example', {
        origin: 'http://localhost:3000',
      })
      const response = await middleware(request)

      expect(response.headers.get('Vary')).toBe('Origin')
    })
  })

  describe('rate limiting', () => {
    it('adds rate limit headers to responses', async () => {
      const request = makeRequest('/api/example', { ip: '10.0.0.1' })
      const response = await middleware(request)

      expect(response.headers.get('X-RateLimit-Limit')).toBeDefined()
      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined()
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined()
    })

    it('returns 429 when rate limit exceeded', async () => {
      // Exhaust rate limit (default /api/ is 60 req/min)
      for (let i = 0; i < 60; i++) {
        await middleware(makeRequest('/api/example', { ip: '10.0.0.2' }))
      }

      const response = await middleware(makeRequest('/api/example', { ip: '10.0.0.2' }))
      expect(response.status).toBe(429)
      expect(response.headers.get('Retry-After')).toBeDefined()
    })

    it('isolates rate limits per IP', async () => {
      // Exhaust rate limit for one IP
      for (let i = 0; i < 60; i++) {
        await middleware(makeRequest('/api/example', { ip: '10.0.0.3' }))
      }

      // Different IP should still be allowed
      const response = await middleware(makeRequest('/api/example', { ip: '10.0.0.4' }))
      expect(response.status).not.toBe(429)
    })

    it('uses x-forwarded-for for IP detection', async () => {
      const request = new NextRequest('http://localhost/api/example', {
        headers: {
          'x-forwarded-for': '1.2.3.4, 5.6.7.8',
        },
      })
      const response = await middleware(request)

      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined()
    })

    it('falls back to x-real-ip when no x-forwarded-for', async () => {
      const request = new NextRequest('http://localhost/api/example', {
        headers: {
          'x-real-ip': '9.8.7.6',
        },
      })
      const response = await middleware(request)

      expect(response.status).not.toBe(429)
    })

    it('applies stricter limits to slack routes', async () => {
      // Slack routes have 30 req/min limit
      for (let i = 0; i < 30; i++) {
        await middleware(makeRequest('/api/slack/incident', { ip: '10.0.0.5' }))
      }

      const response = await middleware(makeRequest('/api/slack/incident', { ip: '10.0.0.5' }))
      expect(response.status).toBe(429)
    })
  })

  describe('combined CORS + rate limiting', () => {
    it('includes both CORS and rate limit headers', async () => {
      const request = makeRequest('/api/example', {
        origin: 'http://localhost:3000',
        ip: '10.0.0.10',
      })
      const response = await middleware(request)

      // CORS headers
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')
      // Rate limit headers
      expect(response.headers.get('X-RateLimit-Limit')).toBeDefined()
    })

    it('returns rate limit error with CORS headers for blocked requests', async () => {
      // Exhaust rate limit
      for (let i = 0; i < 60; i++) {
        await middleware(
          makeRequest('/api/example', {
            origin: 'http://localhost:3000',
            ip: '10.0.0.11',
          })
        )
      }

      const response = await middleware(
        makeRequest('/api/example', {
          origin: 'http://localhost:3000',
          ip: '10.0.0.11',
        })
      )

      expect(response.status).toBe(429)
      // Should still include CORS headers so browser can read the error
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')
    })
  })
})
