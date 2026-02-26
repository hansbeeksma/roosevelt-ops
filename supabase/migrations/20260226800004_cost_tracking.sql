-- Cost Tracking Schema
-- ROOSE-26: Service cost monitoring with budget alerting
--
-- Stores per-service cost records and budget definitions.
-- Costs accumulate as insert rows; totals are derived at query time.

-- ============================================================================
-- TABLE: service_costs
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_costs (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The service being billed
  service      text        NOT NULL CHECK (
    service IN ('vercel', 'supabase', 'github', 'sentry', 'clerk', 'slack', 'resend', 'anthropic')
  ),

  -- EUR amount for this record
  amount       numeric(10, 4) NOT NULL CHECK (amount >= 0),

  -- Always EUR for this agency
  currency     text        NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),

  -- Calendar month in 'YYYY-MM' format
  period       text        NOT NULL CHECK (period ~ '^\d{4}-\d{2}$'),

  -- Cost grouping
  category     text        NOT NULL CHECK (category IN ('infrastructure', 'api', 'tooling')),

  -- Audit timestamp
  recorded_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_service_costs_service_period
  ON service_costs (service, period);

CREATE INDEX IF NOT EXISTS idx_service_costs_period
  ON service_costs (period DESC);

CREATE INDEX IF NOT EXISTS idx_service_costs_recorded_at
  ON service_costs (recorded_at DESC);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE service_costs ENABLE ROW LEVEL SECURITY;

-- Service role has full access (used by API workers / scheduled jobs)
CREATE POLICY "Service role full access on service_costs"
  ON service_costs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users may read all cost records (internal ops dashboard)
CREATE POLICY "Authenticated read service_costs"
  ON service_costs
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- TABLE: cost_budgets
-- ============================================================================

CREATE TABLE IF NOT EXISTS cost_budgets (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Service this budget applies to
  service          text        NOT NULL UNIQUE CHECK (
    service IN ('vercel', 'supabase', 'github', 'sentry', 'clerk', 'slack', 'resend', 'anthropic')
  ),

  -- Maximum monthly spend in EUR
  monthly_limit    numeric(10, 4) NOT NULL CHECK (monthly_limit > 0),

  -- 0–1 fraction at which to trigger an alert (e.g. 0.80)
  alert_threshold  numeric(5, 4)  NOT NULL CHECK (alert_threshold > 0 AND alert_threshold <= 1),

  -- Last modification timestamp
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE cost_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on cost_budgets"
  ON cost_budgets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated read cost_budgets"
  ON cost_budgets
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- SEED: pre-populated budget records
-- ============================================================================
-- Uses INSERT … ON CONFLICT DO UPDATE so this migration is idempotent.

INSERT INTO cost_budgets (service, monthly_limit, alert_threshold) VALUES
  ('vercel',    50.0000, 0.8000),
  ('supabase',  25.0000, 0.8000),
  ('anthropic', 100.0000, 0.7000),
  ('github',    20.0000, 0.9000),
  ('sentry',    26.0000, 0.8000),
  ('clerk',     25.0000, 0.8000),
  ('slack',     15.0000, 0.9000),
  ('resend',    20.0000, 0.8000)
ON CONFLICT (service) DO UPDATE SET
  monthly_limit   = EXCLUDED.monthly_limit,
  alert_threshold = EXCLUDED.alert_threshold,
  updated_at      = now();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260226800004_cost_tracking: complete';
  RAISE NOTICE '  Table  : service_costs';
  RAISE NOTICE '  Table  : cost_budgets';
  RAISE NOTICE '  Index  : idx_service_costs_service_period';
  RAISE NOTICE '  Index  : idx_service_costs_period';
  RAISE NOTICE '  Seed   : 8 default budgets inserted';
  RAISE NOTICE '  RLS    : enabled on both tables';
END $$;
