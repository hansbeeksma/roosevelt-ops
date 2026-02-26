/**
 * Integration tests for GET /api/metrics/{dora,space,summary}
 *
 * fetch is stubbed globally so no real GitHub API calls are made.
 * GITHUB_ORG and GITHUB_REPO environment variables are set inline to satisfy
 * getRepoConfig() inside the route handler.
 */

import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { createTestApp, TEST_HEADERS } from '../helpers/test-app.js'

// ── GitHub API mock data ──────────────────────────────────────────────────────

const MOCK_DORA_RESPONSES: Record<string, unknown> = {
  // Deployments endpoint — one successful production deployment
  '/deployments': [
    {
      id: 1,
      sha: 'abc123',
      environment: 'production',
      created_at: new Date(Date.now() - 2 * 86_400_000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    },
  ],
  // Deployment statuses — latest status is 'success'
  '/deployments/1/statuses': [{ state: 'success', created_at: new Date().toISOString() }],
  // PRs endpoint — one merged PR
  '/pulls': [
    {
      number: 42,
      merged_at: new Date(Date.now() - 1 * 86_400_000).toISOString(),
      head: { sha: 'abc123' },
      base: { sha: 'def456' },
    },
  ],
  // PR commits
  '/pulls/42/commits': [
    {
      sha: 'abc123',
      commit: { author: { date: new Date(Date.now() - 2 * 86_400_000).toISOString() } },
    },
  ],
  // Incident issues — none in window
  '/issues': [],
}

/**
 * Builds a mock fetch Response for a given GitHub API URL.
 * Matches on URL path fragment → returns the corresponding fixture.
 */
function mockFetch(url: string): Response {
  const matchedKey = Object.keys(MOCK_DORA_RESPONSES).find((key) => url.includes(key))
  const body = matchedKey !== undefined ? MOCK_DORA_RESPONSES[matchedKey] : []

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('Metrics endpoints', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    // Set required env vars so getRepoConfig() does not throw
    process.env.GITHUB_ORG = 'test-org'
    process.env.GITHUB_REPO = 'test-repo'

    // Stub fetch before the test app (and route modules) are loaded
    vi.stubGlobal('fetch', vi.fn(mockFetch))

    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
    vi.unstubAllGlobals()
    delete process.env.GITHUB_ORG
    delete process.env.GITHUB_REPO
  })

  beforeEach(() => {
    // Reset call history between tests while keeping the implementation
    vi.mocked(fetch).mockImplementation(mockFetch)
  })

  // ── GET /api/metrics/dora ──────────────────────────────────────────────────

  describe('GET /api/metrics/dora', () => {
    it('returns 200 with correct DORA shape', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/dora',
        headers: TEST_HEADERS,
      })

      expect(response.statusCode).toBe(200)

      const body = response.json<{
        metrics: {
          deploymentFrequency: number
          leadTimeForChanges: number
          meanTimeToRecovery: number
          changeFailureRate: number
        }
        window_days: number
        calculated_at: string
      }>()

      expect(body.metrics).toBeDefined()
      expect(typeof body.metrics.deploymentFrequency).toBe('number')
      expect(typeof body.metrics.leadTimeForChanges).toBe('number')
      expect(typeof body.metrics.meanTimeToRecovery).toBe('number')
      expect(typeof body.metrics.changeFailureRate).toBe('number')
      expect(typeof body.window_days).toBe('number')
      expect(body.window_days).toBeGreaterThan(0)
      expect(new Date(body.calculated_at).toISOString()).toBe(body.calculated_at)
    })

    it('accepts a valid days query parameter and reflects it in the response', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/dora?days=14',
        headers: TEST_HEADERS,
      })

      expect(response.statusCode).toBe(200)

      const body = response.json<{ window_days: number }>()
      expect(body.window_days).toBe(14)
    })

    it('returns 400 when days does not match the positive-integer pattern', async () => {
      const invalidCases = ['-1', '0', 'abc', 'NaN', '-30']

      for (const days of invalidCases) {
        const response = await app.inject({
          method: 'GET',
          url: `/api/metrics/dora?days=${days}`,
          headers: TEST_HEADERS,
        })

        // Fastify schema validation rejects the request before the handler runs
        expect(response.statusCode).toBe(400)
      }
    })
  })

  // ── GET /api/metrics/space ─────────────────────────────────────────────────

  describe('GET /api/metrics/space', () => {
    it('returns 200 with correct SPACE shape', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/space',
        headers: TEST_HEADERS,
      })

      expect(response.statusCode).toBe(200)

      const body = response.json<{
        metrics: {
          satisfaction: number
          performance: number
          activity: number
          communication: number
          efficiency: number
        }
        window_days: number
        calculated_at: string
      }>()

      expect(body.metrics).toBeDefined()
      expect(typeof body.metrics.satisfaction).toBe('number')
      expect(typeof body.metrics.performance).toBe('number')
      expect(typeof body.metrics.activity).toBe('number')
      expect(typeof body.metrics.communication).toBe('number')
      expect(typeof body.metrics.efficiency).toBe('number')
      expect(typeof body.window_days).toBe('number')
    })

    it('accepts a valid days query parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/space?days=7',
        headers: TEST_HEADERS,
      })

      expect(response.statusCode).toBe(200)
    })

    it('returns 400 for an invalid days value', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/space?days=-5',
        headers: TEST_HEADERS,
      })

      expect(response.statusCode).toBe(400)
    })
  })

  // ── GET /api/metrics/summary ───────────────────────────────────────────────

  describe('GET /api/metrics/summary', () => {
    it('returns 200 with a trend array', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/summary',
        headers: TEST_HEADERS,
      })

      expect(response.statusCode).toBe(200)

      const body = response.json<{
        current: { dora: unknown; space: unknown }
        trend: unknown[]
        window_days: number
        calculated_at: string
      }>()

      expect(body.current).toBeDefined()
      expect(body.current.dora).toBeDefined()
      expect(body.current.space).toBeDefined()
      expect(Array.isArray(body.trend)).toBe(true)
      expect(typeof body.window_days).toBe('number')
    })

    it('returns 400 for an invalid days value', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/summary?days=0',
        headers: TEST_HEADERS,
      })

      expect(response.statusCode).toBe(400)
    })
  })
})
