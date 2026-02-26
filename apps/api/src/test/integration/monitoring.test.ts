import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { createTestApp, TEST_HEADERS } from '../helpers/test-app.js'

describe('Monitoring endpoints', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /api/monitoring/health', () => {
    it('returns 200 with a health statuses object', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/monitoring/health',
        headers: TEST_HEADERS,
      })

      expect(response.statusCode).toBe(200)

      const body = response.json<{
        success: boolean
        data: Record<string, { status: string; latencyMs: number }>
      }>()

      expect(body.success).toBe(true)
      expect(body.data).toBeDefined()
      expect(typeof body.data).toBe('object')
    })

    it('contains at least one service entry', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/monitoring/health',
        headers: TEST_HEADERS,
      })

      const body = response.json<{
        data: Record<string, { status: string }>
      }>()

      const services = Object.keys(body.data)
      expect(services.length).toBeGreaterThan(0)
    })

    it('each service entry has a status field', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/monitoring/health',
        headers: TEST_HEADERS,
      })

      const body = response.json<{
        data: Record<string, { status: string; latencyMs: number }>
      }>()

      for (const service of Object.values(body.data)) {
        expect(service.status).toBeDefined()
        expect(typeof service.status).toBe('string')
        expect(typeof service.latencyMs).toBe('number')
      }
    })
  })

  describe('GET /api/monitoring/health/live', () => {
    it('always returns 200', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/monitoring/health/live',
      })

      expect(response.statusCode).toBe(200)
    })

    it('returns status ok without requiring auth', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/monitoring/health/live',
        // intentionally no auth headers — liveness probe must be public
      })

      expect(response.statusCode).toBe(200)

      const body = response.json<{ status: string }>()
      expect(body.status).toBe('ok')
    })
  })
})
