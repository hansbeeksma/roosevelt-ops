import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { createTestApp, TEST_HEADERS } from '../helpers/test-app.js'

// Mock global fetch to prevent real GitHub API calls in tests
vi.stubGlobal('fetch', vi.fn())

describe('Metrics endpoints', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
    vi.unstubAllGlobals()
  })

  describe('GET /api/metrics/dora', () => {
    it('returns 200 with correct DORA shape', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/dora',
        headers: TEST_HEADERS,
      })

      expect(response.statusCode).toBe(200)

      const body = response.json<{
        success: boolean
        data: {
          deploymentFrequency: number
          leadTimeForChanges: number
          changeFailureRate: number
          timeToRestoreService: number
          period: { days: number; from: string; to: string }
        }
      }>()

      expect(body.success).toBe(true)
      expect(body.data).toBeDefined()
      expect(typeof body.data.deploymentFrequency).toBe('number')
      expect(typeof body.data.leadTimeForChanges).toBe('number')
      expect(typeof body.data.changeFailureRate).toBe('number')
      expect(typeof body.data.timeToRestoreService).toBe('number')
      expect(body.data.period).toBeDefined()
      expect(typeof body.data.period.days).toBe('number')
    })

    it('accepts a valid days query parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/dora?days=14',
        headers: TEST_HEADERS,
      })

      expect(response.statusCode).toBe(200)

      const body = response.json<{ data: { period: { days: number } } }>()
      expect(body.data.period.days).toBe(14)
    })

    it('returns 400 when days is not a positive integer', async () => {
      const invalidCases = ['-1', '0', 'abc', '-99']

      for (const days of invalidCases) {
        const response = await app.inject({
          method: 'GET',
          url: `/api/metrics/dora?days=${days}`,
          headers: TEST_HEADERS,
        })

        expect(response.statusCode).toBe(400)

        const body = response.json<{ status: string; message: string }>()
        expect(body.status).toBe('error')
        expect(body.message).toBeTruthy()
      }
    })
  })

  describe('GET /api/metrics/space', () => {
    it('returns 200 with correct SPACE shape', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/space',
        headers: TEST_HEADERS,
      })

      expect(response.statusCode).toBe(200)

      const body = response.json<{
        success: boolean
        data: {
          satisfaction: number
          performance: number
          activity: number
          communication: number
          efficiency: number
        }
      }>()

      expect(body.success).toBe(true)
      expect(body.data).toBeDefined()
      expect(typeof body.data.satisfaction).toBe('number')
      expect(typeof body.data.performance).toBe('number')
      expect(typeof body.data.activity).toBe('number')
      expect(typeof body.data.communication).toBe('number')
      expect(typeof body.data.efficiency).toBe('number')
    })

    it('accepts a valid days query parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/space?days=7',
        headers: TEST_HEADERS,
      })

      expect(response.statusCode).toBe(200)
    })

    it('returns 400 when days is invalid', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/space?days=-5',
        headers: TEST_HEADERS,
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('GET /api/metrics/summary', () => {
    it('returns 200 with a trend array', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/summary',
        headers: TEST_HEADERS,
      })

      expect(response.statusCode).toBe(200)

      const body = response.json<{
        success: boolean
        data: {
          trend: unknown[]
          summary: Record<string, unknown>
        }
      }>()

      expect(body.success).toBe(true)
      expect(Array.isArray(body.data.trend)).toBe(true)
      expect(body.data.summary).toBeDefined()
    })

    it('returns 400 when days is invalid', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/summary?days=0',
        headers: TEST_HEADERS,
      })

      expect(response.statusCode).toBe(400)
    })
  })
})
