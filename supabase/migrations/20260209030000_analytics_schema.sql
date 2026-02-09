-- Analytics Schema Migration
-- Package: @rooseveltops/analytics-layer
-- Description: Creates analytics_events, analytics_daily_metrics, and analytics_cohorts tables
--              with indexes, RLS policies, and rollup functions.
--
-- Usage: Copy this migration to your project's supabase/migrations/ directory
--        and rename with your project's timestamp prefix.

-- ============================================================================
-- 1. TABLES
-- ============================================================================

-- Events table: raw event storage (tracker.ts inserts here)
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  properties jsonb NOT NULL DEFAULT '{}',
  session_id text,
  user_id text,
  page_url text,
  referrer text,
  user_agent text,
  country text,
  consent_level text DEFAULT 'necessary',
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE analytics_events IS 'Raw analytics events tracked via @rooseveltops/analytics-layer';
COMMENT ON COLUMN analytics_events.event_name IS 'Event type: page_viewed, product_viewed, product_searched, added_to_cart, removed_from_cart, checkout_started, checkout_completed, signup_completed, subscription_started, referral_shared';
COMMENT ON COLUMN analytics_events.properties IS 'Event-specific properties as validated JSON (Zod schemas)';
COMMENT ON COLUMN analytics_events.consent_level IS 'GDPR consent level: all or necessary';

-- Daily metrics table: pre-aggregated metrics (metrics.ts reads here)
CREATE TABLE IF NOT EXISTS analytics_daily_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  date date NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (metric_name, date)
);

COMMENT ON TABLE analytics_daily_metrics IS 'Pre-aggregated daily metrics for dashboards and AARRR reporting';

-- Cohorts table: user cohort tracking
CREATE TABLE IF NOT EXISTS analytics_cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_name text NOT NULL,
  cohort_date date NOT NULL,
  user_count integer NOT NULL DEFAULT 0,
  returning_count integer NOT NULL DEFAULT 0,
  revenue_cents bigint NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cohort_name, cohort_date)
);

COMMENT ON TABLE analytics_cohorts IS 'User cohort tracking for retention analysis';

-- ============================================================================
-- 2. INDEXES
-- ============================================================================

-- Events: query patterns from metrics.ts
CREATE INDEX IF NOT EXISTS idx_events_name_created
  ON analytics_events (event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_session
  ON analytics_events (session_id)
  WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_user
  ON analytics_events (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_created
  ON analytics_events (created_at DESC);

-- Daily metrics: time-series queries
CREATE INDEX IF NOT EXISTS idx_daily_metrics_name_date
  ON analytics_daily_metrics (metric_name, date DESC);

-- Cohorts: lookup by name and date
CREATE INDEX IF NOT EXISTS idx_cohorts_name_date
  ON analytics_cohorts (cohort_name, cohort_date DESC);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cohorts ENABLE ROW LEVEL SECURITY;

-- Events: insert from anon/authenticated (client-side tracking), read from service role only
CREATE POLICY "anon_insert_events"
  ON analytics_events FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "authenticated_insert_events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "service_read_events"
  ON analytics_events FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "service_all_events"
  ON analytics_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Daily metrics: service role only (written by rollup functions)
CREATE POLICY "service_all_daily_metrics"
  ON analytics_daily_metrics FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Cohorts: service role only
CREATE POLICY "service_all_cohorts"
  ON analytics_cohorts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 4. ROLLUP FUNCTIONS
-- ============================================================================

-- Daily event count rollup: aggregates events into daily_metrics
CREATE OR REPLACE FUNCTION analytics_rollup_daily_events(target_date date DEFAULT CURRENT_DATE - 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO analytics_daily_metrics (metric_name, metric_value, date)
  SELECT
    'events_' || event_name,
    COUNT(*),
    target_date
  FROM analytics_events
  WHERE created_at >= target_date::timestamptz
    AND created_at < (target_date + 1)::timestamptz
  GROUP BY event_name
  ON CONFLICT (metric_name, date)
  DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    created_at = now();

  -- Total events
  INSERT INTO analytics_daily_metrics (metric_name, metric_value, date)
  SELECT
    'total_events',
    COUNT(*),
    target_date
  FROM analytics_events
  WHERE created_at >= target_date::timestamptz
    AND created_at < (target_date + 1)::timestamptz
  ON CONFLICT (metric_name, date)
  DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    created_at = now();

  -- Unique sessions
  INSERT INTO analytics_daily_metrics (metric_name, metric_value, date)
  SELECT
    'unique_sessions',
    COUNT(DISTINCT session_id),
    target_date
  FROM analytics_events
  WHERE created_at >= target_date::timestamptz
    AND created_at < (target_date + 1)::timestamptz
    AND session_id IS NOT NULL
  ON CONFLICT (metric_name, date)
  DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    created_at = now();

  -- Unique users
  INSERT INTO analytics_daily_metrics (metric_name, metric_value, date)
  SELECT
    'unique_users',
    COUNT(DISTINCT user_id),
    target_date
  FROM analytics_events
  WHERE created_at >= target_date::timestamptz
    AND created_at < (target_date + 1)::timestamptz
    AND user_id IS NOT NULL
  ON CONFLICT (metric_name, date)
  DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    created_at = now();

  -- Daily revenue (from checkout_completed events)
  INSERT INTO analytics_daily_metrics (metric_name, metric_value, date)
  SELECT
    'daily_revenue_cents',
    COALESCE(SUM((properties->>'totalCents')::numeric), 0),
    target_date
  FROM analytics_events
  WHERE created_at >= target_date::timestamptz
    AND created_at < (target_date + 1)::timestamptz
    AND event_name = 'checkout_completed'
  ON CONFLICT (metric_name, date)
  DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    created_at = now();
END;
$$;

COMMENT ON FUNCTION analytics_rollup_daily_events IS 'Aggregates raw events into daily metrics. Run daily via pg_cron or edge function.';

-- Cohort builder: groups users by first activity date
CREATE OR REPLACE FUNCTION analytics_build_cohorts(target_date date DEFAULT CURRENT_DATE - 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Weekly signup cohort
  INSERT INTO analytics_cohorts (cohort_name, cohort_date, user_count, returning_count, revenue_cents)
  SELECT
    'weekly_signup',
    date_trunc('week', target_date)::date,
    COUNT(DISTINCT user_id),
    COUNT(DISTINCT CASE
      WHEN user_id IN (
        SELECT e2.user_id FROM analytics_events e2
        WHERE e2.event_name = 'checkout_completed'
          AND e2.user_id IS NOT NULL
          AND e2.created_at >= target_date::timestamptz
          AND e2.created_at < (target_date + 1)::timestamptz
      ) THEN user_id
    END),
    COALESCE(SUM(
      CASE WHEN event_name = 'checkout_completed'
        THEN (properties->>'totalCents')::bigint
        ELSE 0
      END
    ), 0)
  FROM analytics_events
  WHERE created_at >= date_trunc('week', target_date)::timestamptz
    AND created_at < (date_trunc('week', target_date) + interval '7 days')::timestamptz
    AND user_id IS NOT NULL
  ON CONFLICT (cohort_name, cohort_date)
  DO UPDATE SET
    user_count = EXCLUDED.user_count,
    returning_count = EXCLUDED.returning_count,
    revenue_cents = EXCLUDED.revenue_cents,
    created_at = now();
END;
$$;

COMMENT ON FUNCTION analytics_build_cohorts IS 'Builds weekly cohort data for retention analysis. Run weekly via pg_cron or edge function.';

-- Convenience view: AARRR metrics (last 30 days)
CREATE OR REPLACE VIEW analytics_aarrr_30d AS
SELECT
  (SELECT COUNT(*) FROM analytics_events
   WHERE event_name = 'page_viewed'
     AND created_at >= now() - interval '30 days') AS acquisition,
  (SELECT COUNT(*) FROM analytics_events
   WHERE event_name = 'checkout_completed'
     AND created_at >= now() - interval '30 days') AS activation,
  (SELECT COUNT(DISTINCT sub.user_id) FROM (
    SELECT user_id, COUNT(*) as purchases
    FROM analytics_events
    WHERE event_name = 'checkout_completed'
      AND created_at >= now() - interval '30 days'
      AND user_id IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) sub) AS retention,
  (SELECT COUNT(*) FROM analytics_events
   WHERE event_name = 'referral_shared'
     AND created_at >= now() - interval '30 days') AS referral,
  (SELECT COALESCE(SUM((properties->>'totalCents')::numeric), 0) FROM analytics_events
   WHERE event_name = 'checkout_completed'
     AND created_at >= now() - interval '30 days') AS revenue_cents;

COMMENT ON VIEW analytics_aarrr_30d IS 'Pre-computed AARRR pirate metrics for the last 30 days';

-- ============================================================================
-- 5. DATA RETENTION (optional, enable via pg_cron)
-- ============================================================================

-- Purge events older than retention period (default 365 days)
CREATE OR REPLACE FUNCTION analytics_purge_old_events(retention_days integer DEFAULT 365)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM analytics_events
  WHERE created_at < now() - (retention_days || ' days')::interval;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION analytics_purge_old_events IS 'Removes events older than retention_days. Schedule via pg_cron for data hygiene.';
