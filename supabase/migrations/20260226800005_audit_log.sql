-- Migration: audit_log table
-- ROOSE-38: Security Audit & Remediation (OWASP 2025)
--
-- Stores security-relevant events for compliance and incident response.
-- OWASP A09: Security Logging & Monitoring Failures.

-- ── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT        NOT NULL,
  action      TEXT        NOT NULL,
  resource    TEXT        NOT NULL,
  resource_id TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  outcome     TEXT        NOT NULL CHECK (outcome IN ('success', 'failure')),
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE audit_log IS 'Security audit trail for auth and data access events (ROOSE-38)';
COMMENT ON COLUMN audit_log.user_id     IS 'Clerk user ID or service account identifier';
COMMENT ON COLUMN audit_log.action      IS 'Event type: login, logout, token_refresh, data_access, ...';
COMMENT ON COLUMN audit_log.resource    IS 'Affected resource type: auth, contact, metric, ...';
COMMENT ON COLUMN audit_log.resource_id IS 'Affected resource primary key (if applicable)';
COMMENT ON COLUMN audit_log.ip_address  IS 'Client IP address from X-Forwarded-For or socket';
COMMENT ON COLUMN audit_log.user_agent  IS 'HTTP User-Agent header value';
COMMENT ON COLUMN audit_log.outcome     IS 'Result of the action: success | failure';
COMMENT ON COLUMN audit_log.metadata    IS 'Arbitrary structured context (no PII/secrets)';
COMMENT ON COLUMN audit_log.created_at  IS 'UTC timestamp when the event occurred';

-- ── Indexes ──────────────────────────────────────────────────────────────────

-- Fast per-user audit trail lookups (primary access pattern)
CREATE INDEX IF NOT EXISTS audit_log_user_id_created_at_idx
  ON audit_log (user_id, created_at DESC);

-- Compliance/forensic queries by resource type and action
CREATE INDEX IF NOT EXISTS audit_log_resource_action_idx
  ON audit_log (resource, action);

-- Time-range queries for monitoring dashboards
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx
  ON audit_log (created_at DESC);

-- ── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users may read only their own audit entries
CREATE POLICY "users_read_own_audit_log"
  ON audit_log
  FOR SELECT
  USING (user_id = auth.uid()::text);

-- Service role has unrestricted access (bypasses RLS automatically)
-- No explicit service-role policy needed — service key bypasses RLS by default.

-- Prevent users from inserting or modifying audit records directly;
-- all writes go through the server-side service role client.
-- (No INSERT/UPDATE/DELETE policies for authenticated role)
