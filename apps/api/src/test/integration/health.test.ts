import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { createTestApp } from '../helpers/test-app.js'

describe('Health endpoint', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      })

      expect(response.statusCode).toBe(200)

      const body = response.json<{ status: string }>()
      expect(body.status).toBe('ok')
    })

    it('includes a valid ISO 8601 timestamp', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      })

      const body = response.json<{ timestamp: string }>()
      expect(body.timestamp).toBeDefined()
      // Round-trip through Date to confirm it is a valid ISO string
      expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
    })

    it('includes uptime as a non-negative number', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      })

      const body = response.json<{ uptime: number }>()
      expect(typeof body.uptime).toBe('number')
      expect(body.uptime).toBeGreaterThanOrEqual(0)
    })
  })
})
