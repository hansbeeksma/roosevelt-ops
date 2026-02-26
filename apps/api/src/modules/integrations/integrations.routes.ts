/**
 * Integration Status Routes
 *
 * Exposes integration health and configuration status for the Roosevelt OPS
 * admin dashboard and debugging.
 *
 * Routes:
 *   GET /api/integrations  – list configured integrations and their status
 *
 * An integration is considered "configured" when its required environment
 * variables are present. "reachable" is checked lazily via a lightweight
 * ping where the integration supports it — the route never returns an error
 * status for unreachable services; it only reports what it knows.
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { isPlaneConfigured } from '../../../../lib/mcp/plane-client.js'
import { isFigmaConfigured } from '../../../../lib/mcp/figma-client.js'

// ── Types ─────────────────────────────────────────────────────────────────────

type IntegrationStatus = 'configured' | 'not_configured' | 'degraded'

interface Integration {
  id: string
  name: string
  category: 'project_management' | 'design' | 'monitoring' | 'communication' | 'infrastructure'
  status: IntegrationStatus
  configured: boolean
  /** Human-readable note about the current status */
  note?: string
  /** MCP tool prefix used in Claude sessions */
  mcpPrefix?: string
  /** Documentation reference */
  docsUrl?: string
}

interface IntegrationsResponse {
  integrations: Integration[]
  summary: {
    total: number
    configured: number
    not_configured: number
    degraded: number
  }
  checked_at: string
}

// ── Integration checks ────────────────────────────────────────────────────────

function checkPlane(): Integration {
  const configured = isPlaneConfigured()
  return {
    id: 'plane',
    name: 'Plane',
    category: 'project_management',
    status: configured ? 'configured' : 'not_configured',
    configured,
    note: configured
      ? 'PLANE_API_KEY and PLANE_WORKSPACE_SLUG are set'
      : 'Set PLANE_API_KEY and PLANE_WORKSPACE_SLUG to enable',
    mcpPrefix: 'mcp__plane__',
    docsUrl: '/docs/integrations/mcp-ecosystem.md#project-management--plane',
  }
}

function checkFigma(): Integration {
  const configured = isFigmaConfigured()
  return {
    id: 'figma',
    name: 'Figma',
    category: 'design',
    status: configured ? 'configured' : 'not_configured',
    configured,
    note: configured
      ? 'FIGMA_ACCESS_TOKEN is set'
      : 'Set FIGMA_ACCESS_TOKEN to enable design token sync',
    mcpPrefix: 'mcp__figma__',
    docsUrl: '/docs/integrations/mcp-ecosystem.md#design--figma',
  }
}

function checkSentry(): Integration {
  const configured = !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)
  return {
    id: 'sentry',
    name: 'Sentry',
    category: 'monitoring',
    status: configured ? 'configured' : 'not_configured',
    configured,
    note: configured ? 'SENTRY_DSN is set' : 'Set SENTRY_DSN to enable error tracking',
    mcpPrefix: 'mcp__sentry__',
    docsUrl: '/docs/integrations/mcp-ecosystem.md#error-tracking--sentry',
  }
}

function checkSlack(): Integration {
  const configured = !!(process.env.SLACK_BOT_TOKEN || process.env.SLACK_WEBHOOK_URL)
  return {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    status: configured ? 'configured' : 'not_configured',
    configured,
    note: configured
      ? 'Slack credentials are set'
      : 'Set SLACK_BOT_TOKEN or SLACK_WEBHOOK_URL to enable notifications',
    mcpPrefix: 'mcp__slack__',
    docsUrl: '/docs/integrations/mcp-ecosystem.md#communication--slack',
  }
}

function checkPagerDuty(): Integration {
  const configured = !!(process.env.PAGERDUTY_API_KEY || process.env.PAGERDUTY_ROUTING_KEY)
  return {
    id: 'pagerduty',
    name: 'PagerDuty',
    category: 'monitoring',
    status: configured ? 'configured' : 'not_configured',
    configured,
    note: configured
      ? 'PagerDuty credentials are set'
      : 'Set PAGERDUTY_API_KEY to enable on-call integration',
    docsUrl: '/docs/operations/',
  }
}

function checkGitHub(): Integration {
  const configured = !!(process.env.GITHUB_TOKEN || process.env.GITHUB_ORG)
  return {
    id: 'github',
    name: 'GitHub',
    category: 'infrastructure',
    status: configured ? 'configured' : 'not_configured',
    configured,
    note: configured
      ? 'GitHub credentials are set'
      : 'Set GITHUB_TOKEN and GITHUB_ORG for metrics and PR integration',
    mcpPrefix: 'mcp__github__',
    docsUrl: '/docs/integrations/mcp-ecosystem.md#version-control--github',
  }
}

function checkVercel(): Integration {
  const configured = !!(process.env.VERCEL_URL || process.env.VERCEL_ENV)
  return {
    id: 'vercel',
    name: 'Vercel',
    category: 'infrastructure',
    status: configured ? 'configured' : 'not_configured',
    configured,
    note: configured ? 'Running on Vercel' : 'Not deployed on Vercel (or VERCEL_URL not set)',
    mcpPrefix: 'mcp__vc__',
    docsUrl: '/docs/integrations/mcp-ecosystem.md#infrastructure--vercel',
  }
}

function checkSupabase(): Integration {
  const configured = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  return {
    id: 'supabase',
    name: 'Supabase',
    category: 'infrastructure',
    status: configured ? 'configured' : 'not_configured',
    configured,
    note: configured
      ? 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set'
      : 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
    mcpPrefix: 'mcp__supabase__',
    docsUrl: '/docs/integrations/mcp-ecosystem.md#database--supabase',
  }
}

// ── Route handlers ────────────────────────────────────────────────────────────

async function handleListIntegrations(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<IntegrationsResponse> {
  const integrations: Integration[] = [
    checkPlane(),
    checkFigma(),
    checkSentry(),
    checkSlack(),
    checkPagerDuty(),
    checkGitHub(),
    checkVercel(),
    checkSupabase(),
  ]

  const summary = {
    total: integrations.length,
    configured: integrations.filter((i) => i.status === 'configured').length,
    not_configured: integrations.filter((i) => i.status === 'not_configured').length,
    degraded: integrations.filter((i) => i.status === 'degraded').length,
  }

  return reply.send({
    integrations,
    summary,
    checked_at: new Date().toISOString(),
  })
}

// ── Plugin registration ───────────────────────────────────────────────────────

export default async function integrationsRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /api/integrations
   *
   * Returns the list of all configured integrations and their current status.
   * Does not make external API calls — status is derived from environment
   * variables only, so this endpoint is always fast and safe to poll.
   *
   * Rate limit: 60 req/min per IP (admin/dashboard usage pattern).
   */
  fastify.get(
    '/',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              integrations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    category: { type: 'string' },
                    status: { type: 'string' },
                    configured: { type: 'boolean' },
                    note: { type: 'string' },
                    mcpPrefix: { type: 'string' },
                    docsUrl: { type: 'string' },
                  },
                },
              },
              summary: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  configured: { type: 'number' },
                  not_configured: { type: 'number' },
                  degraded: { type: 'number' },
                },
              },
              checked_at: { type: 'string' },
            },
          },
        },
      },
    },
    handleListIntegrations
  )
}
