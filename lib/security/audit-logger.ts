/**
 * Security Audit Logger (ROOSE-38)
 *
 * Structured event logging for security-relevant actions.
 *
 * OWASP Top 10 2025 coverage:
 * - A09: Security Logging & Monitoring Failures
 *
 * Events are persisted to Supabase `audit_log` table.
 * Uses service-role client to bypass RLS on writes.
 */

import { createClient } from '@supabase/supabase-js'

// ── Types ────────────────────────────────────────────────────────────────────

export interface AuditEvent {
  userId: string
  action: string
  resource: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  outcome: 'success' | 'failure'
  metadata?: Record<string, unknown>
  timestamp: string
}

/** Shape stored in Supabase (snake_case columns) */
interface AuditRow {
  user_id: string
  action: string
  resource: string
  resource_id: string | null
  ip_address: string | null
  user_agent: string | null
  outcome: 'success' | 'failure'
  metadata: Record<string, unknown> | null
  created_at: string
}

// ── Supabase client (lazy-initialised) ──────────────────────────────────────

let _client: ReturnType<typeof createClient> | null = null

function getClient(): ReturnType<typeof createClient> {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase URL and service role key are required for audit logging')
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
  })

  return _client
}

// ── Core logging ─────────────────────────────────────────────────────────────

/**
 * Persist a security audit event to Supabase.
 *
 * Never throws — failures are logged to stderr so audit logging
 * never disrupts the main request flow.
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  const row: AuditRow = {
    user_id: event.userId,
    action: event.action,
    resource: event.resource,
    resource_id: event.resourceId ?? null,
    ip_address: event.ipAddress ?? null,
    user_agent: event.userAgent ?? null,
    outcome: event.outcome,
    metadata: event.metadata ?? null,
    created_at: event.timestamp,
  }

  try {
    const { error } = await getClient().from('audit_log').insert(row)

    if (error) {
      // Structured stderr — never expose sensitive data
      process.stderr.write(
        JSON.stringify({
          level: 'error',
          context: 'audit-logger',
          message: 'Failed to persist audit event',
          supabaseError: error.message,
          action: event.action,
          resource: event.resource,
          outcome: event.outcome,
          timestamp: event.timestamp,
        }) + '\n'
      )
    }
  } catch (err) {
    process.stderr.write(
      JSON.stringify({
        level: 'error',
        context: 'audit-logger',
        message: 'Unexpected error persisting audit event',
        error: err instanceof Error ? err.message : 'unknown',
        action: event.action,
        resource: event.resource,
        timestamp: event.timestamp,
      }) + '\n'
    )
  }
}

// ── Convenience helpers ──────────────────────────────────────────────────────

/**
 * Log an authentication lifecycle event (login, logout, token refresh).
 */
export async function logAuthEvent(
  type: 'login' | 'logout' | 'token_refresh',
  userId: string,
  ip?: string
): Promise<void> {
  return logAuditEvent({
    userId,
    action: type,
    resource: 'auth',
    ipAddress: ip,
    outcome: 'success',
    timestamp: new Date().toISOString(),
  })
}

/**
 * Log a data access event (read of sensitive resource).
 */
export async function logDataAccess(
  userId: string,
  resource: string,
  id: string,
  ip?: string
): Promise<void> {
  return logAuditEvent({
    userId,
    action: 'data_access',
    resource,
    resourceId: id,
    ipAddress: ip,
    outcome: 'success',
    timestamp: new Date().toISOString(),
  })
}

// ── Query ────────────────────────────────────────────────────────────────────

/**
 * Retrieve audit log entries for a specific user.
 *
 * @param userId - The user whose audit trail to fetch
 * @param limit  - Maximum number of entries to return (default 50, max 500)
 */
export async function getAuditLog(userId: string, limit = 50): Promise<AuditEvent[]> {
  const safeLimit = Math.min(Math.max(1, limit), 500)

  const { data, error } = await getClient()
    .from('audit_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(safeLimit)

  if (error) {
    throw new Error(`Failed to retrieve audit log: ${error.message}`)
  }

  return (data as AuditRow[]).map((row) => ({
    userId: row.user_id,
    action: row.action,
    resource: row.resource,
    resourceId: row.resource_id ?? undefined,
    ipAddress: row.ip_address ?? undefined,
    userAgent: row.user_agent ?? undefined,
    outcome: row.outcome,
    metadata: row.metadata ?? undefined,
    timestamp: row.created_at,
  }))
}
