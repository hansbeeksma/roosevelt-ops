/**
 * Integration tests for GET /api/monitoring/health{,/live,/ready}
 *
 * fetch is stubbed globally so that the health check functions make no real
 * network calls. The stub returns HTTP 200 for all URLs, which causes every
 * service to be classified as 'healthy'.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { createTestApp, TEST_HEADERS } from '../helpers/test-app.js'

// Stub fetch before any imports that might call it at module initialisation
vi.stubGlobal(
  'fetch',
  vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  )
)

describe('Monitoring endpoints', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    // Provide env vars required by health-checks.ts
    process.env.SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
    process.env.SLACK_BOT_TOKEN = 'xoxb-test-token'
    process.env.PLANE_API_KEY = 'test-plane-key'
    process.env.PLANE_WORKSPACE_SLUG = 'test-workspace'

    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
    vi.unstubAllGlobals()
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.SLACK_BOT_TOKEN
    delete process.env.PLANE_API_KEY
    delete process.env.PLANE_WORKSPACE_SLUG
  })

  // ── GET /api/monitoring/health ─────────────────────────────────────────────

  describe('GET /api/monitoring/health', () => {
    it('returns 200 with a health statuses object', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/monitoring/health',
        headers: TEST_HEADERS,
      })

      // 200 = healthy | degraded; 503 = unhealthy
      // With mocked fetch returning 200 the overall status is 'healthy' → 200
      expect(response.statusCode).toBe(200)

      const body = response.json<{
        overall: string
        services: Array<{ service: string; status: string; latencyMs: number }>
        checked_at: string
      }>()

      expect(body.overall).toBeDefined()
      expect(['healthy', 'degraded', 'unhealthy']).toContain(body.overall)
    })

    it('includes a services array with at least one entry', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/monitoring/health',
        headers: TEST_HEADERS,
      })

      const body = response.json<{
        services: Array<{ service: string; status: string; latencyMs: number }>
      }>()

      expect(Array.isArray(body.services)).toBe(true)
      expect(body.services.length).toBeGreaterThan(0)
    })

    it('each service entry has the required fields', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/monitoring/health',
        headers: TEST_HEADERS,
      })

      const body = response.json<{
        services: Array<{ service: string; status: string; latencyMs: number }>
      }>()

      for (const entry of body.services) {
        expect(typeof entry.service).toBe('string')
        expect(typeof entry.status).toBe('string')
        expect(['healthy', 'degraded', 'unhealthy']).toContain(entry.status)
        expect(typeof entry.latencyMs).toBe('number')
      }
    })

    it('includes a valid ISO 8601 checked_at timestamp', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/monitoring/health',
        headers: TEST_HEADERS,
      })

      const body = response.json<{ checked_at: string }>()
      expect(new Date(body.checked_at).toISOString()).toBe(body.checked_at)
    })
  })

  // ── GET /api/monitoring/health/live ───────────────────────────────────────

  describe('GET /api/monitoring/health/live', () => {
    it('always returns 200', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/monitoring/health/live',
      })

      expect(response.statusCode).toBe(200)
    })

    it('returns the alive status without requiring auth headers', async () => {
      // Liveness probes must work without authentication
      const response = await app.inject({
        method: 'GET',
        url: '/api/monitoring/health/live',
        // intentionally no TEST_HEADERS
      })

      expect(response.statusCode).toBe(200)

      const body = response.json<{
        status: string
        uptime_seconds: number
        timestamp: string
      }>()

      expect(body.status).toBe('alive')
      expect(typeof body.uptime_seconds).toBe('number')
      expect(body.uptime_seconds).toBeGreaterThanOrEqual(0)
    })

    it('includes a valid timestamp in the response', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/monitoring/health/live',
      })

      const body = response.json<{ timestamp: string }>()
      expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
    })
  })
})
