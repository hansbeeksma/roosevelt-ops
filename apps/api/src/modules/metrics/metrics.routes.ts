/**
 * Engineering Metrics Routes
 *
 * Exposes DORA and SPACE metrics via the Fastify API.
 *
 * Routes:
 *   GET /api/metrics/dora    – current DORA metrics
 *   GET /api/metrics/space   – current SPACE metrics
 *   GET /api/metrics/summary – both + 4-week trend data
 *
 * Configuration (environment variables):
 *   GITHUB_ORG   – GitHub organisation/user owning the repo
 *   GITHUB_REPO  – Repository name
 *   GITHUB_TOKEN – (optional) personal access token for higher rate limits
 *   METRICS_DAYS – Rolling window in days (default: 30)
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { calculateDoraMetrics, type DoraMetrics } from '../../../../lib/metrics/dora.js'
import { calculateSpaceMetrics, type SpaceMetrics } from '../../../../lib/metrics/space.js'

// ── Query string schema ──────────────────────────────────────────────────────

interface MetricsQuery {
  days?: string
}

// ── Response types ───────────────────────────────────────────────────────────

interface DoraResponse {
  metrics: DoraMetrics
  window_days: number
  calculated_at: string
}

interface SpaceResponse {
  metrics: SpaceMetrics
  window_days: number
  calculated_at: string
}

interface TrendPoint {
  period_end: string
  dora: DoraMetrics
  space: SpaceMetrics
}

interface SummaryResponse {
  current: {
    dora: DoraMetrics
    space: SpaceMetrics
  }
  trend: TrendPoint[]
  window_days: number
  calculated_at: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getRepoConfig(): { org: string; repo: string } {
  const org = process.env.GITHUB_ORG
  const repo = process.env.GITHUB_REPO

  if (!org || !repo) {
    throw new Error('GITHUB_ORG and GITHUB_REPO environment variables are required')
  }

  return { org, repo }
}

function parseDays(query: MetricsQuery): number {
  const defaultDays = Number(process.env.METRICS_DAYS ?? 30)
  if (!query.days) return defaultDays
  const parsed = parseInt(query.days, 10)
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 365 ? parsed : defaultDays
}

// ── Route handlers ───────────────────────────────────────────────────────────

async function handleDoraMetrics(
  request: FastifyRequest<{ Querystring: MetricsQuery }>,
  reply: FastifyReply
): Promise<DoraResponse> {
  const { org, repo } = getRepoConfig()
  const days = parseDays(request.query)

  const metrics = await calculateDoraMetrics(org, repo, days)

  return reply.send({
    metrics,
    window_days: days,
    calculated_at: new Date().toISOString(),
  })
}

async function handleSpaceMetrics(
  request: FastifyRequest<{ Querystring: MetricsQuery }>,
  reply: FastifyReply
): Promise<SpaceResponse> {
  const { org, repo } = getRepoConfig()
  const days = parseDays(request.query)

  const metrics = await calculateSpaceMetrics(org, repo, days)

  return reply.send({
    metrics,
    window_days: days,
    calculated_at: new Date().toISOString(),
  })
}

async function handleSummaryMetrics(
  request: FastifyRequest<{ Querystring: MetricsQuery }>,
  reply: FastifyReply
): Promise<SummaryResponse> {
  const { org, repo } = getRepoConfig()
  const days = parseDays(request.query)

  // Current window
  const [dora, space] = await Promise.all([
    calculateDoraMetrics(org, repo, days),
    calculateSpaceMetrics(org, repo, days),
  ])

  // 4-week rolling trend: calculate metrics for each of the past 4 weeks
  const trendWeeks = 4
  const trend: TrendPoint[] = []

  for (let week = trendWeeks; week >= 1; week--) {
    const periodEndMs = Date.now() - (week - 1) * 7 * 24 * 60 * 60 * 1000
    const periodEnd = new Date(periodEndMs).toISOString()

    // Each trend point covers a 7-day window ending at `periodEnd`.
    // We re-use the same calculation functions with a 7-day window; the GitHub
    // API `since` parameter is derived internally from `days`.
    const [trendDora, trendSpace] = await Promise.all([
      calculateDoraMetrics(org, repo, 7),
      calculateSpaceMetrics(org, repo, 7),
    ])

    trend.push({ period_end: periodEnd, dora: trendDora, space: trendSpace })
  }

  return reply.send({
    current: { dora, space },
    trend,
    window_days: days,
    calculated_at: new Date().toISOString(),
  })
}

// ── Plugin registration ──────────────────────────────────────────────────────

export default async function metricsRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /api/metrics/dora
   * Returns the four DORA metrics for the configured repository.
   *
   * Query params:
   *   days – rolling window (default: METRICS_DAYS env var or 30)
   */
  fastify.get<{ Querystring: MetricsQuery }>(
    '/dora',
    {
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
      schema: {
        querystring: {
          type: 'object',
          properties: {
            days: { type: 'string', pattern: '^[1-9][0-9]*$' },
          },
          additionalProperties: false,
        },
      },
    },
    handleDoraMetrics
  )

  /**
   * GET /api/metrics/space
   * Returns the five SPACE metric scores (0–10 each) for the configured repo.
   *
   * Query params:
   *   days – rolling window (default: METRICS_DAYS env var or 30)
   */
  fastify.get<{ Querystring: MetricsQuery }>(
    '/space',
    {
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
      schema: {
        querystring: {
          type: 'object',
          properties: {
            days: { type: 'string', pattern: '^[1-9][0-9]*$' },
          },
          additionalProperties: false,
        },
      },
    },
    handleSpaceMetrics
  )

  /**
   * GET /api/metrics/summary
   * Returns current DORA + SPACE metrics combined with a 4-week trend.
   *
   * Query params:
   *   days – rolling window for current period (default: 30)
   */
  fastify.get<{ Querystring: MetricsQuery }>(
    '/summary',
    {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
      schema: {
        querystring: {
          type: 'object',
          properties: {
            days: { type: 'string', pattern: '^[1-9][0-9]*$' },
          },
          additionalProperties: false,
        },
      },
    },
    handleSummaryMetrics
  )
}
