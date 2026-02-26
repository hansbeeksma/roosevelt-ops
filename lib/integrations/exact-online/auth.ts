/**
 * Exact Online OAuth 2.0 with PKCE — Auth module (ROOSE-326)
 *
 * Handles the full OAuth lifecycle:
 *   - Authorization URL generation with PKCE code challenge
 *   - Authorization code exchange for tokens
 *   - Token refresh (auto-refresh when < 60s until expiry)
 *   - Encrypted token storage and retrieval via Supabase
 *
 * Token encryption: AES-256-GCM at the application layer.
 * The `exact_connections` table stores iv:authTag:ciphertext (hex).
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const EXACT_AUTH_URL = 'https://start.exactonline.nl/api/oauth2/auth'
export const EXACT_TOKEN_URL = 'https://start.exactonline.nl/api/oauth2/token'
export const EXACT_REVOKE_URL = 'https://start.exactonline.nl/api/oauth2/revoke'

const ENCRYPTION_ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

// Refresh if expiry is within this threshold
const REFRESH_THRESHOLD_MS = 60_000

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExactTokens {
  accessToken: string
  refreshToken: string
  /** Unix timestamp in milliseconds */
  expiresAt: number
  divisionId: number
}

// Raw shape returned by the Exact Online token endpoint
interface RawTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

// ---------------------------------------------------------------------------
// Encryption helpers
// ---------------------------------------------------------------------------

function getEncryptionKey(): Buffer {
  const raw = process.env.EXACT_ENCRYPTION_KEY
  if (!raw) {
    throw new Error(
      'EXACT_ENCRYPTION_KEY environment variable is not configured. ' +
        'Provide a 32-byte hex-encoded key (64 hex characters).'
    )
  }
  const key = Buffer.from(raw, 'hex')
  if (key.length !== 32) {
    throw new Error(
      `EXACT_ENCRYPTION_KEY must be 64 hex characters (32 bytes). Got ${raw.length} chars.`
    )
  }
  return key
}

function encryptToken(token: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':')
}

function decryptToken(encrypted: string): string {
  const key = getEncryptionKey()
  const parts = encrypted.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format. Expected iv:authTag:ciphertext.')
  }
  const [ivHex, authTagHex, ciphertextHex] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const ciphertext = Buffer.from(ciphertextHex, 'hex')

  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })
  decipher.setAuthTag(authTag)

  try {
    return decipher.update(ciphertext).toString('utf8') + decipher.final('utf8')
  } catch {
    throw new Error('Token decryption failed — token may be corrupted or tampered with.')
  }
}

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

/**
 * Generate a PKCE code verifier (43-128 chars, URL-safe Base64).
 */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * Derive a PKCE code challenge (S256) from the code verifier.
 */
export function generateCodeChallenge(codeVerifier: string): string {
  return createHash('sha256').update(codeVerifier).digest('base64url')
}

// ---------------------------------------------------------------------------
// Public OAuth API
// ---------------------------------------------------------------------------

/**
 * Build the authorization URL with PKCE code challenge.
 *
 * @param state - CSRF token (opaque string, caller is responsible for storage)
 * @returns Full Exact Online authorization URL
 */
export function getAuthorizationUrl(state: string): string {
  const clientId = process.env.EXACT_CLIENT_ID
  const redirectUri = process.env.EXACT_REDIRECT_URI

  if (!clientId || !redirectUri) {
    throw new Error('EXACT_CLIENT_ID and EXACT_REDIRECT_URI environment variables are required.')
  }

  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  return `${EXACT_AUTH_URL}?${params.toString()}`
}

/**
 * Exchange an authorization code for access and refresh tokens.
 *
 * @param code - Authorization code from the OAuth callback
 * @param codeVerifier - PKCE code verifier generated during authorization
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<ExactTokens> {
  const clientId = process.env.EXACT_CLIENT_ID
  const clientSecret = process.env.EXACT_CLIENT_SECRET
  const redirectUri = process.env.EXACT_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('EXACT_CLIENT_ID, EXACT_CLIENT_SECRET, and EXACT_REDIRECT_URI are required.')
  }

  const response = await fetch(EXACT_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
      code_verifier: codeVerifier,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Exact Online token exchange failed (${response.status}): ${body}`)
  }

  const data: RawTokenResponse = await response.json()
  return normalizeTokens(data)
}

/**
 * Refresh the access token using a stored refresh token.
 *
 * @param refreshToken - Plain-text refresh token (not encrypted)
 */
export async function refreshAccessToken(refreshToken: string): Promise<ExactTokens> {
  const clientId = process.env.EXACT_CLIENT_ID
  const clientSecret = process.env.EXACT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('EXACT_CLIENT_ID and EXACT_CLIENT_SECRET are required.')
  }

  const response = await fetch(EXACT_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Exact Online token refresh failed (${response.status}): ${body}`)
  }

  const data: RawTokenResponse = await response.json()
  return normalizeTokens(data)
}

// ---------------------------------------------------------------------------
// Supabase token storage
// ---------------------------------------------------------------------------

/**
 * Persist tokens for an organisation to the `exact_connections` table.
 * Encrypts access and refresh tokens before storage.
 * Upserts on `org_id`.
 */
export async function storeTokens(orgId: string, tokens: ExactTokens): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from('exact_connections').upsert(
    {
      org_id: orgId,
      access_token_encrypted: encryptToken(tokens.accessToken),
      refresh_token_encrypted: encryptToken(tokens.refreshToken),
      expires_at: new Date(tokens.expiresAt).toISOString(),
      division_id: tokens.divisionId,
      connected_at: new Date().toISOString(),
    },
    { onConflict: 'org_id' }
  )

  if (error) {
    throw new Error(`Failed to store Exact Online tokens: ${error.message}`)
  }
}

/**
 * Retrieve a valid token set for an organisation.
 * Auto-refreshes the access token when it is within `REFRESH_THRESHOLD_MS`
 * of expiry and persists the refreshed tokens.
 *
 * Returns `null` when no connection exists for the organisation.
 */
export async function getValidTokens(orgId: string): Promise<ExactTokens | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('exact_connections')
    .select('access_token_encrypted, refresh_token_encrypted, expires_at, division_id')
    .eq('org_id', orgId)
    .single()

  if (error || !data) {
    return null
  }

  const expiresAt = new Date(data.expires_at).getTime()
  const msUntilExpiry = expiresAt - Date.now()

  // Token is still fresh enough — return as-is
  if (msUntilExpiry > REFRESH_THRESHOLD_MS) {
    return {
      accessToken: decryptToken(data.access_token_encrypted),
      refreshToken: decryptToken(data.refresh_token_encrypted),
      expiresAt,
      divisionId: data.division_id ?? 0,
    }
  }

  // Token expired or within refresh threshold — refresh and persist
  const plainRefreshToken = decryptToken(data.refresh_token_encrypted)
  const refreshed = await refreshAccessToken(plainRefreshToken)

  const tokensToStore: ExactTokens = {
    ...refreshed,
    divisionId: data.division_id ?? refreshed.divisionId,
  }

  await storeTokens(orgId, tokensToStore)
  return tokensToStore
}

/**
 * Remove the Exact Online connection for an organisation.
 * Attempts to revoke the refresh token before deletion (best-effort).
 */
export async function removeTokens(orgId: string): Promise<void> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('exact_connections')
    .select('refresh_token_encrypted')
    .eq('org_id', orgId)
    .single()

  if (data) {
    try {
      const plainRefreshToken = decryptToken(data.refresh_token_encrypted)
      await fetch(EXACT_REVOKE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: plainRefreshToken }),
      })
    } catch {
      // Best-effort revocation — continue to DB deletion regardless
    }
  }

  const { error } = await supabase.from('exact_connections').delete().eq('org_id', orgId)

  if (error) {
    throw new Error(`Failed to remove Exact Online connection: ${error.message}`)
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function normalizeTokens(raw: RawTokenResponse): ExactTokens {
  return {
    accessToken: raw.access_token,
    refreshToken: raw.refresh_token,
    expiresAt: Date.now() + raw.expires_in * 1000,
    // divisionId is resolved post-connect via /current/Me — default 0 until set
    divisionId: 0,
  }
}
