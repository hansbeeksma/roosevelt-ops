-- Exact Online integration tables (ROOSE-326)
--
-- exact_connections   : stores encrypted OAuth tokens per organisation
-- exact_pkce_sessions : short-lived PKCE code verifiers (10-minute TTL)
--
-- Token encryption is handled at the application layer (AES-256-GCM).
-- pgcrypto is used here only for UUID generation.

-- Enable pgcrypto for gen_random_uuid() where available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- exact_connections
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS exact_connections (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                  UUID        NOT NULL UNIQUE,

  -- AES-256-GCM encrypted at application layer.
  -- Stored format: iv:authTag:ciphertext (all hex-encoded).
  access_token_encrypted  TEXT        NOT NULL,
  refresh_token_encrypted TEXT        NOT NULL,

  expires_at              TIMESTAMPTZ NOT NULL,
  division_id             INTEGER,

  connected_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  exact_connections IS
  'Stores Exact Online OAuth tokens per organisation. '
  'Tokens are encrypted with AES-256-GCM at the application layer.';

COMMENT ON COLUMN exact_connections.access_token_encrypted IS
  'AES-256-GCM encrypted access token. Format: iv:authTag:ciphertext (hex).';

COMMENT ON COLUMN exact_connections.refresh_token_encrypted IS
  'AES-256-GCM encrypted refresh token. Format: iv:authTag:ciphertext (hex).';

COMMENT ON COLUMN exact_connections.division_id IS
  'Exact Online division (administration) code selected during connect.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exact_connections_org_id
  ON exact_connections (org_id);

CREATE INDEX IF NOT EXISTS idx_exact_connections_expires_at
  ON exact_connections (expires_at);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_exact_connections_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS exact_connections_updated_at ON exact_connections;

CREATE TRIGGER exact_connections_updated_at
  BEFORE UPDATE ON exact_connections
  FOR EACH ROW EXECUTE FUNCTION update_exact_connections_updated_at();

-- Row Level Security
ALTER TABLE exact_connections ENABLE ROW LEVEL SECURITY;

-- Org members can read their own connection status (read-only)
CREATE POLICY "org_members_read_own_connection"
  ON exact_connections
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND org_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- All writes (INSERT / UPDATE / DELETE) are performed by the service role,
-- which bypasses RLS. No additional write policies are needed here.

-- ---------------------------------------------------------------------------
-- exact_pkce_sessions
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS exact_pkce_sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  state         TEXT        NOT NULL UNIQUE,
  code_verifier TEXT        NOT NULL,
  org_id        UUID        NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE exact_pkce_sessions IS
  'Short-lived PKCE code verifiers for Exact Online OAuth. TTL: 10 minutes. '
  'Rows are deleted immediately after successful code exchange.';

COMMENT ON COLUMN exact_pkce_sessions.state IS
  'OAuth state parameter (base64url-encoded JSON: { orgId, nonce }).';

COMMENT ON COLUMN exact_pkce_sessions.code_verifier IS
  'Plain-text PKCE code verifier generated during /connect. '
  'Must be sent to the token endpoint during /callback.';

-- Index for fast lookup during callback
CREATE INDEX IF NOT EXISTS idx_exact_pkce_sessions_state
  ON exact_pkce_sessions (state);

CREATE INDEX IF NOT EXISTS idx_exact_pkce_sessions_expires_at
  ON exact_pkce_sessions (expires_at);

-- RLS: deny all direct client access; service role only
ALTER TABLE exact_pkce_sessions ENABLE ROW LEVEL SECURITY;

-- No client-facing policies — service role bypasses RLS.
-- Stale session cleanup can be done via pg_cron or application-side purge:
--   DELETE FROM exact_pkce_sessions WHERE expires_at < NOW();
