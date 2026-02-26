/**
 * Exact Online OAuth Routes (ROOSE-326)
 *
 * Implements the OAuth 2.0 + PKCE flow for Exact Online (Dutch ERP):
 *
 *   GET  /api/auth/exact/connect     — Initiates OAuth (generates state + PKCE, redirects)
 *   GET  /api/auth/exact/callback    — Handles code exchange, stores tokens, redirects to dashboard
 *   GET  /api/auth/exact/status      — Returns connection status for the current org
 *   DELETE /api/auth/exact/disconnect — Revokes and removes tokens
 *
 * PKCE code verifiers are stored server-side in `exact_pkce_sessions` (Supabase),
 * keyed by the OAuth `state` parameter (random nonce). They expire after 10 minutes.
 *
 * The `org_id` is carried in the `state` parameter as a URL-safe Base64 JSON payload
 * so the callback can associate the token with the correct organisation.
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import {
  generateCodeVerifier,
  generateCodeChallenge,
  EXACT_AUTH_URL,
  exchangeCodeForTokens,
  storeTokens,
  getValidTokens,
  removeTokens,
} from '../../../../lib/integrations/exact-online/auth.js'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DASHBOARD_URL = process.env.DASHBOARD_URL ?? 'https://app.rooseveltops.nl'
const PKCE_SESSION_TTL_MS = 10 * 60 * 1000 // 10 minutes

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
  }
  return createClient(url, key)
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} environment variable is required.`)
  return value
}

/**
 * Encode `state` payload as URL-safe Base64.
 * Shape: { orgId, nonce }
 */
function encodeState(orgId: string): { state: string; nonce: string } {
  const nonce = randomBytes(16).toString('hex')
  const state = Buffer.from(JSON.stringify({ orgId, nonce })).toString('base64url')
  return { state, nonce }
}

/**
 * Decode `state` payload from URL-safe Base64.
 * Returns null when the payload is malformed.
 */
function decodeState(state: string): { orgId: string; nonce: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'))
    if (typeof payload.orgId === 'string' && typeof payload.nonce === 'string') {
      return payload as { orgId: string; nonce: string }
    }
    return null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

interface ConnectQuery {
  org_id?: string
}

interface CallbackQuery {
  code?: string
  state?: string
  error?: string
  error_description?: string
}

interface StatusQuery {
  org_id?: string
}

interface DisconnectBody {
  org_id?: string
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/**
 * GET /api/auth/exact/connect
 *
 * Generates a PKCE code verifier, stores it server-side keyed to the OAuth
 * `state`, then redirects the user agent to Exact Online for authorisation.
 *
 * Query params:
 *   org_id (required) — the organisation being connected
 */
async function handleConnect(
  request: FastifyRequest<{ Querystring: ConnectQuery }>,
  reply: FastifyReply
): Promise<void> {
  const orgId = request.query.org_id
  if (!orgId) {
    return reply.status(400).send({ error: 'org_id query parameter is required.' })
  }

  const clientId = process.env.EXACT_CLIENT_ID
  const redirectUri = process.env.EXACT_REDIRECT_URI
  if (!clientId || !redirectUri) {
    return reply.status(500).send({ error: 'Exact Online OAuth is not configured on this server.' })
  }

  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  const { state } = encodeState(orgId)

  // Persist PKCE session server-side (TTL: 10 min)
  const supabase = getSupabase()
  const { error: pkceError } = await supabase.from('exact_pkce_sessions').insert({
    state,
    code_verifier: codeVerifier,
    org_id: orgId,
    expires_at: new Date(Date.now() + PKCE_SESSION_TTL_MS).toISOString(),
  })

  if (pkceError) {
    request.log.error({ err: pkceError }, 'Failed to store PKCE session')
    return reply.status(500).send({ error: 'Failed to initiate OAuth flow.' })
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  return reply.redirect(`${EXACT_AUTH_URL}?${params.toString()}`)
}

/**
 * GET /api/auth/exact/callback
 *
 * Handles the OAuth redirect from Exact Online.
 * Validates state, retrieves the PKCE code verifier, exchanges the
 * authorization code for tokens, stores them, then redirects to the dashboard.
 */
async function handleCallback(
  request: FastifyRequest<{ Querystring: CallbackQuery }>,
  reply: FastifyReply
): Promise<void> {
  const { code, state, error: oauthError, error_description } = request.query

  // Handle user denial or provider error
  if (oauthError) {
    request.log.warn({ oauthError, error_description }, 'Exact Online OAuth denied or failed')
    return reply.redirect(
      `${DASHBOARD_URL}/settings/integrations?error=${encodeURIComponent(oauthError)}`
    )
  }

  if (!code || !state) {
    return reply.status(400).send({ error: 'Missing code or state in OAuth callback.' })
  }

  // Decode state to retrieve orgId
  const decoded = decodeState(state)
  if (!decoded) {
    return reply.status(400).send({ error: 'Invalid state parameter.' })
  }

  const { orgId } = decoded
  const supabase = getSupabase()

  // Retrieve and validate PKCE session
  const { data: pkceSession, error: pkceError } = await supabase
    .from('exact_pkce_sessions')
    .select('code_verifier, expires_at')
    .eq('state', state)
    .eq('org_id', orgId)
    .single()

  if (pkceError || !pkceSession) {
    return reply.status(400).send({ error: 'Invalid or expired OAuth session.' })
  }

  if (new Date(pkceSession.expires_at).getTime() < Date.now()) {
    // Clean up expired session
    await supabase.from('exact_pkce_sessions').delete().eq('state', state)
    return reply.status(400).send({ error: 'OAuth session expired. Please try connecting again.' })
  }

  // Exchange code for tokens
  let tokens
  try {
    tokens = await exchangeCodeForTokens(code, pkceSession.code_verifier)
  } catch (err) {
    request.log.error({ err }, 'Exact Online token exchange failed')
    return reply.redirect(`${DASHBOARD_URL}/settings/integrations?error=token_exchange_failed`)
  }

  // Resolve division ID via /current/Me
  let divisionId = 0
  try {
    const meResponse = await fetch(
      'https://start.exactonline.nl/api/v1/current/Me?$select=CurrentDivision',
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    )
    if (meResponse.ok) {
      const meData: { d: { results: Array<{ CurrentDivision: number }> } } = await meResponse.json()
      divisionId = meData.d?.results?.[0]?.CurrentDivision ?? 0
    }
  } catch {
    // Non-fatal — divisionId remains 0; user can select division in UI
  }

  // Store tokens with resolved divisionId
  try {
    await storeTokens(orgId, { ...tokens, divisionId })
  } catch (err) {
    request.log.error({ err }, 'Failed to store Exact Online tokens')
    return reply.redirect(`${DASHBOARD_URL}/settings/integrations?error=storage_failed`)
  }

  // Clean up consumed PKCE session
  await supabase.from('exact_pkce_sessions').delete().eq('state', state)

  return reply.redirect(`${DASHBOARD_URL}/settings/integrations?connected=exact`)
}

/**
 * GET /api/auth/exact/status
 *
 * Returns the Exact Online connection status for an organisation.
 *
 * Query params:
 *   org_id (required) — the organisation to check
 */
async function handleStatus(
  request: FastifyRequest<{ Querystring: StatusQuery }>,
  reply: FastifyReply
): Promise<void> {
  const orgId = request.query.org_id
  if (!orgId) {
    return reply.status(400).send({ error: 'org_id query parameter is required.' })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('exact_connections')
    .select('division_id, connected_at, expires_at')
    .eq('org_id', orgId)
    .single()

  if (error || !data) {
    return reply.send({ connected: false, org_id: orgId })
  }

  const expiresAt = new Date(data.expires_at).getTime()
  const isExpired = expiresAt <= Date.now()

  return reply.send({
    connected: true,
    token_expired: isExpired,
    org_id: orgId,
    division_id: data.division_id,
    connected_at: data.connected_at,
    expires_at: data.expires_at,
  })
}

/**
 * DELETE /api/auth/exact/disconnect
 *
 * Revokes the Exact Online refresh token and removes stored credentials.
 *
 * Body (JSON):
 *   org_id (required) — the organisation to disconnect
 */
async function handleDisconnect(
  request: FastifyRequest<{ Body: DisconnectBody }>,
  reply: FastifyReply
): Promise<void> {
  const orgId = request.body?.org_id
  if (!orgId) {
    return reply.status(400).send({ error: 'org_id is required in the request body.' })
  }

  // Check existing connection before attempting removal
  const tokens = await getValidTokens(orgId)
  if (!tokens) {
    return reply
      .status(404)
      .send({ error: 'No Exact Online connection found for this organisation.' })
  }

  try {
    await removeTokens(orgId)
  } catch (err) {
    request.log.error({ err }, 'Failed to disconnect Exact Online')
    return reply.status(500).send({ error: 'Failed to disconnect Exact Online integration.' })
  }

  return reply.send({ disconnected: true, org_id: orgId })
}

// ---------------------------------------------------------------------------
// Plugin registration
// ---------------------------------------------------------------------------

export default async function exactRoutes(fastify: FastifyInstance): Promise<void> {
  const envCheck = (): boolean =>
    !!(
      process.env.EXACT_CLIENT_ID &&
      process.env.EXACT_CLIENT_SECRET &&
      process.env.EXACT_REDIRECT_URI
    )

  /**
   * GET /api/auth/exact/connect
   * Initiates the OAuth 2.0 + PKCE authorization flow.
   */
  fastify.get<{ Querystring: ConnectQuery }>(
    '/connect',
    {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
      schema: {
        querystring: {
          type: 'object',
          required: ['org_id'],
          properties: { org_id: { type: 'string' } },
        },
      },
    },
    async (request, reply) => {
      if (!envCheck()) {
        return reply
          .status(503)
          .send({ error: 'Exact Online integration is not configured on this server.' })
      }
      return handleConnect(request, reply)
    }
  )

  /**
   * GET /api/auth/exact/callback
   * Receives the OAuth redirect from Exact Online.
   */
  fastify.get<{ Querystring: CallbackQuery }>(
    '/callback',
    {
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
      schema: {
        querystring: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            state: { type: 'string' },
            error: { type: 'string' },
            error_description: { type: 'string' },
          },
        },
      },
    },
    handleCallback
  )

  /**
   * GET /api/auth/exact/status
   * Returns connection status for the specified organisation.
   */
  fastify.get<{ Querystring: StatusQuery }>(
    '/status',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: {
        querystring: {
          type: 'object',
          required: ['org_id'],
          properties: { org_id: { type: 'string' } },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              connected: { type: 'boolean' },
              token_expired: { type: 'boolean' },
              org_id: { type: 'string' },
              division_id: { type: 'number' },
              connected_at: { type: 'string' },
              expires_at: { type: 'string' },
            },
          },
        },
      },
    },
    handleStatus
  )

  /**
   * DELETE /api/auth/exact/disconnect
   * Revokes tokens and removes the Exact Online connection.
   */
  fastify.delete<{ Body: DisconnectBody }>(
    '/disconnect',
    {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
      schema: {
        body: {
          type: 'object',
          required: ['org_id'],
          properties: { org_id: { type: 'string' } },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              disconnected: { type: 'boolean' },
              org_id: { type: 'string' },
            },
          },
        },
      },
    },
    handleDisconnect
  )
}
