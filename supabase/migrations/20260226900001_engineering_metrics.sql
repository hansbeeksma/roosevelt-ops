-- Engineering Metrics — Persistent snapshot store
-- ROOSE-29: DORA + SPACE metrics infrastructure
--
-- Stores pre-calculated metric snapshots per organisation, metric type, and
-- period. A unique constraint prevents duplicate snapshots for the same window.
-- Metrics are stored as JSONB so the shape can evolve without schema migrations.

-- ============================================================================
-- TABLE: engineering_metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS engineering_metrics (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Discriminator: 'dora' | 'space'
  metric_type      text        NOT NULL CHECK (metric_type IN ('dora', 'space')),

  -- The calendar period this snapshot covers
  period_start     date        NOT NULL,
  period_end       date        NOT NULL,

  -- Serialised DoraMetrics or SpaceMetrics object
  metrics          jsonb       NOT NULL,

  -- Audit timestamp (set automatically on insert)
  calculated_at    timestamptz NOT NULL DEFAULT now(),

  -- One snapshot per org × type × period
  UNIQUE (organization_id, metric_type, period_start),

  -- Basic sanity: period must be a valid range
  CONSTRAINT engineering_metrics_valid_period CHECK (period_end >= period_start)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_engineering_metrics_org_type
  ON engineering_metrics (organization_id, metric_type);

CREATE INDEX IF NOT EXISTS idx_engineering_metrics_period
  ON engineering_metrics (period_start DESC, period_end DESC);

CREATE INDEX IF NOT EXISTS idx_engineering_metrics_calculated_at
  ON engineering_metrics (calculated_at DESC);

-- GIN index enables efficient `metrics @> '{"key": value}'` queries
CREATE INDEX IF NOT EXISTS idx_engineering_metrics_jsonb
  ON engineering_metrics USING GIN (metrics);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE engineering_metrics ENABLE ROW LEVEL SECURITY;

-- Service role has full access (used by the API worker when writing snapshots)
CREATE POLICY "Service role full access"
  ON engineering_metrics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users may read snapshots for their own organisation.
-- This assumes an `auth.jwt() -> organization_id` claim is present;
-- adjust the claim path to match your JWT structure if needed.
CREATE POLICY "Authenticated read own org metrics"
  ON engineering_metrics
  FOR SELECT
  TO authenticated
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

-- ── Helper: upsert a metric snapshot ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION upsert_engineering_metrics(
  p_organization_id  uuid,
  p_metric_type      text,
  p_period_start     date,
  p_period_end       date,
  p_metrics          jsonb
)
RETURNS engineering_metrics
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result engineering_metrics;
BEGIN
  INSERT INTO engineering_metrics (
    organization_id,
    metric_type,
    period_start,
    period_end,
    metrics,
    calculated_at
  )
  VALUES (
    p_organization_id,
    p_metric_type,
    p_period_start,
    p_period_end,
    p_metrics,
    now()
  )
  ON CONFLICT (organization_id, metric_type, period_start)
  DO UPDATE SET
    period_end    = EXCLUDED.period_end,
    metrics       = EXCLUDED.metrics,
    calculated_at = now()
  RETURNING * INTO result;

  RETURN result;
END;
$$;

-- ── Verification ──────────────────────────────────────────────────────────────

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260226900001_engineering_metrics: complete';
  RAISE NOTICE '  Table  : engineering_metrics';
  RAISE NOTICE '  Indexes: 4 (org_type, period, calculated_at, jsonb GIN)';
  RAISE NOTICE '  RLS    : enabled (service_role + authenticated)';
  RAISE NOTICE '  Helper : upsert_engineering_metrics()';
END $$;
