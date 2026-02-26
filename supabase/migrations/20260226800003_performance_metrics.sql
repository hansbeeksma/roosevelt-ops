-- API Performance Metrics — Request-level latency tracking
-- ROOSE-25: Performance Metrics Collection
--
-- Stores one row per HTTP request processed by the Fastify API layer.
-- A partial index on slow requests (>500 ms) accelerates alerting queries.
-- The aggregation view computes percentile statistics without touching
-- application code, keeping analytical queries simple and consistent.
-- Rows older than 90 days are pruned by the scheduled function defined below.

-- ============================================================================
-- TABLE: api_performance_metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_performance_metrics (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint    text        NOT NULL,
  method      text        NOT NULL CHECK (method IN ('GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS')),
  duration_ms integer     NOT NULL CHECK (duration_ms >= 0),
  status_code smallint    NOT NULL CHECK (status_code BETWEEN 100 AND 599),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Primary query pattern: filter by endpoint + time window
CREATE INDEX IF NOT EXISTS idx_apm_endpoint_time
  ON api_performance_metrics (endpoint, created_at DESC);

-- Support queries that filter by method as well
CREATE INDEX IF NOT EXISTS idx_apm_method_time
  ON api_performance_metrics (method, created_at DESC);

-- Partial index: only index slow requests (>500 ms) for alerting queries.
-- Kept intentionally narrow so the index stays small and scans stay fast.
CREATE INDEX IF NOT EXISTS idx_apm_slow_requests
  ON api_performance_metrics (endpoint, duration_ms DESC, created_at DESC)
  WHERE duration_ms > 500;

-- Support user-scoped queries (e.g. "slowest requests for user X")
CREATE INDEX IF NOT EXISTS idx_apm_user_time
  ON api_performance_metrics (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE api_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Service role (API worker writing metrics) gets full access
CREATE POLICY "Service role full access on api_performance_metrics"
  ON api_performance_metrics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated operators can read all metrics (ops dashboard use case)
CREATE POLICY "Authenticated read api_performance_metrics"
  ON api_performance_metrics
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- VIEW: api_performance_summary
--
-- Pre-aggregated P50/P90/P99 latencies per endpoint for the ops dashboard.
-- Covers the rolling 24-hour window by default; callers that need a different
-- window should query api_performance_metrics directly with a WHERE clause.
-- ============================================================================

CREATE OR REPLACE VIEW api_performance_summary AS
SELECT
  endpoint,
  method,
  count(*)                                                         AS request_count,
  percentile_cont(0.50) WITHIN GROUP (ORDER BY duration_ms)::int  AS p50_ms,
  percentile_cont(0.90) WITHIN GROUP (ORDER BY duration_ms)::int  AS p90_ms,
  percentile_cont(0.99) WITHIN GROUP (ORDER BY duration_ms)::int  AS p99_ms,
  round(avg(duration_ms))::int                                     AS avg_ms,
  round(
    100.0 * count(*) FILTER (WHERE status_code >= 500) / count(*),
    2
  )                                                                AS error_rate_pct,
  max(created_at)                                                  AS last_seen_at
FROM api_performance_metrics
WHERE created_at > now() - interval '24 hours'
GROUP BY endpoint, method
ORDER BY p99_ms DESC NULLS LAST;

-- ============================================================================
-- FUNCTION: prune_old_performance_metrics()
--
-- Deletes rows older than 90 days. Intended to be called by pg_cron or a
-- Supabase scheduled function on a daily schedule to control table size.
--
-- Example pg_cron schedule (run once per day at 03:00 UTC):
--   SELECT cron.schedule(
--     'prune-api-metrics',
--     '0 3 * * *',
--     'SELECT prune_old_performance_metrics()'
--   );
-- ============================================================================

CREATE OR REPLACE FUNCTION prune_old_performance_metrics(
  retention_days integer DEFAULT 90
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM api_performance_metrics
  WHERE created_at < now() - (retention_days || ' days')::interval;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$;

-- ── Verification ──────────────────────────────────────────────────────────────

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260226800003_performance_metrics: complete';
  RAISE NOTICE '  Table   : api_performance_metrics';
  RAISE NOTICE '  Indexes : 4 (endpoint_time, method_time, slow_requests partial, user_time partial)';
  RAISE NOTICE '  RLS     : enabled (service_role full + authenticated read)';
  RAISE NOTICE '  View    : api_performance_summary (24h rolling percentiles)';
  RAISE NOTICE '  Pruning : prune_old_performance_metrics(retention_days=90)';
END $$;
