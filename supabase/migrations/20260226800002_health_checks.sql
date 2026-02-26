-- Health Check Results Table
-- Persists historical health check data for trend analysis and SLA reporting.
--
-- Retention: records older than 30 days are pruned automatically.
-- See the pg_cron scheduled function note at the bottom of this file.

CREATE TABLE IF NOT EXISTS health_check_results (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  service     TEXT        NOT NULL,
  status      TEXT        NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
  latency_ms  INTEGER     NOT NULL DEFAULT 0,
  message     TEXT,
  checked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Efficient queries by service over time (latest N results, trend windows)
CREATE INDEX IF NOT EXISTS idx_health_check_results_service_time
  ON health_check_results (service, checked_at DESC);

-- Efficient cleanup queries (retention policy)
CREATE INDEX IF NOT EXISTS idx_health_check_results_checked_at
  ON health_check_results (checked_at DESC);

-- Row-level security: service-role can write, authenticated users can read
ALTER TABLE health_check_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON health_check_results
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_read" ON health_check_results
  FOR SELECT
  TO authenticated
  USING (true);

-- Table and column documentation
COMMENT ON TABLE health_check_results IS
  'Historical health check results for all monitored services. Retains 30 days of data.';

COMMENT ON COLUMN health_check_results.service IS
  'Service identifier: supabase | slack | plane | github';

COMMENT ON COLUMN health_check_results.status IS
  'Health status at the time of the check: healthy | degraded | unhealthy';

COMMENT ON COLUMN health_check_results.latency_ms IS
  'Round-trip latency in milliseconds for the health check ping';

COMMENT ON COLUMN health_check_results.message IS
  'Optional human-readable message describing the status or failure reason';

COMMENT ON COLUMN health_check_results.checked_at IS
  'UTC timestamp when this health check result was recorded';

-- ── 30-day retention policy ───────────────────────────────────────────────────
--
-- Supabase does not ship pg_cron by default on all plans. Enable it via:
--   Dashboard → Database → Extensions → pg_cron
--
-- Once enabled, register the cleanup job with:
--
--   SELECT cron.schedule(
--     'health-check-retention-cleanup',   -- job name (unique)
--     '0 3 * * *',                        -- daily at 03:00 UTC
--     $$
--       DELETE FROM health_check_results
--       WHERE checked_at < NOW() - INTERVAL '30 days';
--     $$
--   );
--
-- Verify the job is registered:
--   SELECT * FROM cron.job WHERE jobname = 'health-check-retention-cleanup';
--
-- To remove the job if needed:
--   SELECT cron.unschedule('health-check-retention-cleanup');
