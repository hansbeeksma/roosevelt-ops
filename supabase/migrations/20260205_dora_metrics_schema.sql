-- Roosevelt OPS DORA Metrics Database Schema
-- Phase 1: Baseline DORA Collection

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================================
-- DORA METRICS TABLE
-- ============================================================================

CREATE TABLE dora_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Event metadata
  event_type TEXT NOT NULL CHECK (event_type IN ('deployment', 'push', 'pull_request', 'workflow_run')),
  repository TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,

  -- Deployment Frequency
  deployment_frequency INTEGER DEFAULT 0,
  environment TEXT CHECK (environment IN ('production', 'staging', 'development', 'unknown')),

  -- Lead Time for Changes
  lead_time_hours NUMERIC(10, 2),
  pr_number INTEGER,

  -- Change Failure Rate
  deployment_failed BOOLEAN DEFAULT FALSE,

  -- Additional metadata
  commit_sha TEXT,
  actor TEXT,

  -- Indexes for common queries
  CONSTRAINT valid_deployment_freq CHECK (deployment_frequency >= 0),
  CONSTRAINT valid_lead_time CHECK (lead_time_hours IS NULL OR lead_time_hours >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_dora_metrics_timestamp ON dora_metrics(timestamp DESC);
CREATE INDEX idx_dora_metrics_repo ON dora_metrics(repository);
CREATE INDEX idx_dora_metrics_environment ON dora_metrics(environment);
CREATE INDEX idx_dora_metrics_event_type ON dora_metrics(event_type);
CREATE INDEX idx_dora_metrics_created_at ON dora_metrics(created_at DESC);

-- Row Level Security
ALTER TABLE dora_metrics ENABLE ROW LEVEL SECURITY;

-- Allow public read access (metrics dashboard)
CREATE POLICY "Allow public read access"
  ON dora_metrics
  FOR SELECT
  USING (true);

-- Allow service role to insert
CREATE POLICY "Allow service role to insert"
  ON dora_metrics
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- INCIDENTS TABLE (for MTTR)
-- ============================================================================

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- GitHub issue metadata
  issue_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  labels TEXT[] DEFAULT '{}',
  repository TEXT NOT NULL,

  -- Timing
  created_at_github TIMESTAMPTZ NOT NULL,
  closed_at_github TIMESTAMPTZ,
  mttr_hours NUMERIC(10, 2),

  -- Status
  status TEXT CHECK (status IN ('open', 'closed')) DEFAULT 'open',

  CONSTRAINT valid_mttr CHECK (mttr_hours IS NULL OR mttr_hours >= 0)
);

-- Create indexes
CREATE INDEX idx_incidents_created ON incidents(created_at_github DESC);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_issue_number ON incidents(issue_number);
CREATE INDEX idx_incidents_repository ON incidents(repository);

-- Row Level Security
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON incidents
  FOR SELECT
  USING (true);

CREATE POLICY "Allow service role to insert/update"
  ON incidents
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MATERIALIZED VIEW: DORA SUMMARY
-- ============================================================================

CREATE MATERIALIZED VIEW dora_summary AS
SELECT
  DATE_TRUNC('day', timestamp) AS date,
  repository,
  environment,

  -- Deployment Frequency (deployments per day)
  COUNT(*) FILTER (WHERE event_type IN ('deployment', 'push') AND deployment_frequency > 0) AS deployments,

  -- Lead Time (average hours)
  AVG(lead_time_hours) FILTER (WHERE lead_time_hours IS NOT NULL) AS avg_lead_time_hours,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY lead_time_hours) FILTER (WHERE lead_time_hours IS NOT NULL) AS median_lead_time_hours,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY lead_time_hours) FILTER (WHERE lead_time_hours IS NOT NULL) AS p95_lead_time_hours,

  -- Change Failure Rate (percentage)
  (COUNT(*) FILTER (WHERE deployment_failed = TRUE)::NUMERIC /
   NULLIF(COUNT(*) FILTER (WHERE event_type IN ('deployment', 'push')), 0) * 100) AS change_failure_rate_pct,

  -- Counts
  COUNT(*) FILTER (WHERE deployment_failed = TRUE) AS failed_deployments,
  COUNT(*) FILTER (WHERE event_type IN ('deployment', 'push')) AS total_deployments,
  COUNT(*) FILTER (WHERE lead_time_hours IS NOT NULL) AS prs_merged

FROM dora_metrics
WHERE timestamp >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', timestamp), repository, environment
ORDER BY date DESC, repository, environment;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_dora_summary_unique ON dora_summary(date, repository, COALESCE(environment, 'unknown'));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_dora_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dora_summary;
  RAISE NOTICE 'DORA summary refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate current DORA performance tier
CREATE OR REPLACE FUNCTION get_dora_performance_tier(
  p_repository TEXT DEFAULT NULL,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE(
  metric TEXT,
  value NUMERIC,
  tier TEXT,
  target TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH metrics AS (
    SELECT
      AVG(deployments) AS avg_deployment_freq,
      AVG(avg_lead_time_hours) AS avg_lead_time,
      AVG(change_failure_rate_pct) AS avg_cfr
    FROM dora_summary
    WHERE
      date >= CURRENT_DATE - p_days
      AND (p_repository IS NULL OR repository = p_repository)
  )
  SELECT
    'Deployment Frequency'::TEXT,
    COALESCE(m.avg_deployment_freq, 0),
    CASE
      WHEN m.avg_deployment_freq >= 1 THEN 'Elite'
      WHEN m.avg_deployment_freq >= 0.14 THEN 'High'
      WHEN m.avg_deployment_freq >= 0.03 THEN 'Medium'
      ELSE 'Low'
    END,
    'Multiple/day (Elite), Daily+ (High)'::TEXT
  FROM metrics m

  UNION ALL

  SELECT
    'Lead Time'::TEXT,
    COALESCE(m.avg_lead_time, 0),
    CASE
      WHEN m.avg_lead_time < 24 THEN 'Elite'
      WHEN m.avg_lead_time < 168 THEN 'High'
      WHEN m.avg_lead_time < 720 THEN 'Medium'
      ELSE 'Low'
    END,
    '<24h (Elite), <7d (High)'::TEXT
  FROM metrics m

  UNION ALL

  SELECT
    'Change Failure Rate'::TEXT,
    COALESCE(m.avg_cfr, 0),
    CASE
      WHEN m.avg_cfr < 15 THEN 'Elite'
      WHEN m.avg_cfr < 30 THEN 'High'
      WHEN m.avg_cfr < 45 THEN 'Medium'
      ELSE 'Low'
    END,
    '<15% (Elite), <30% (High)'::TEXT
  FROM metrics m;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate MTTR
CREATE OR REPLACE FUNCTION get_mttr_stats(
  p_repository TEXT DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  avg_mttr_hours NUMERIC,
  median_mttr_hours NUMERIC,
  p95_mttr_hours NUMERIC,
  incidents_count BIGINT,
  tier TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(i.mttr_hours),
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY i.mttr_hours),
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY i.mttr_hours),
    COUNT(*),
    CASE
      WHEN AVG(i.mttr_hours) < 1 THEN 'Elite'
      WHEN AVG(i.mttr_hours) < 24 THEN 'High'
      WHEN AVG(i.mttr_hours) < 168 THEN 'Medium'
      ELSE 'Low'
    END
  FROM incidents i
  WHERE
    i.status = 'closed'
    AND i.mttr_hours IS NOT NULL
    AND i.created_at_github >= CURRENT_DATE - p_days
    AND (p_repository IS NULL OR i.repository = p_repository);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SCHEDULED JOBS (pg_cron)
-- ============================================================================

-- Refresh materialized view daily at 1 AM
SELECT cron.schedule(
  'refresh-dora-summary',
  '0 1 * * *',
  'SELECT refresh_dora_summary();'
);

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Insert sample DORA metrics (7 days of fake data for testing)
DO $$
DECLARE
  day_offset INTEGER;
  deploy_count INTEGER;
BEGIN
  FOR day_offset IN 0..6 LOOP
    -- 2-5 deployments per day
    deploy_count := 2 + FLOOR(RANDOM() * 4)::INTEGER;

    FOR i IN 1..deploy_count LOOP
      INSERT INTO dora_metrics (
        event_type,
        repository,
        timestamp,
        deployment_frequency,
        environment,
        deployment_failed,
        commit_sha,
        actor
      ) VALUES (
        'deployment',
        'rooseveltops/main-app',
        NOW() - (day_offset || ' days')::INTERVAL + (i || ' hours')::INTERVAL,
        1,
        'production',
        RANDOM() < 0.15, -- 15% failure rate
        'abc' || i::TEXT,
        'github-actions'
      );
    END LOOP;

    -- 3-8 PRs merged per day
    FOR i IN 1..(3 + FLOOR(RANDOM() * 6)::INTEGER) LOOP
      INSERT INTO dora_metrics (
        event_type,
        repository,
        timestamp,
        lead_time_hours,
        pr_number,
        commit_sha,
        actor
      ) VALUES (
        'pull_request',
        'rooseveltops/main-app',
        NOW() - (day_offset || ' days')::INTERVAL + (i || ' hours')::INTERVAL,
        2 + RANDOM() * 48, -- 2-50 hours lead time
        1000 + day_offset * 10 + i,
        'def' || i::TEXT,
        'developer-' || (1 + FLOOR(RANDOM() * 5)::INTEGER)::TEXT
      );
    END LOOP;
  END LOOP;
END $$;

-- Insert sample incidents
INSERT INTO incidents (
  issue_number,
  title,
  severity,
  labels,
  repository,
  created_at_github,
  closed_at_github,
  mttr_hours,
  status
) VALUES
  (101, 'Production API down', 'critical', ARRAY['incident', 'p0'], 'rooseveltops/main-app', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '2 hours', 2.0, 'closed'),
  (102, 'Memory leak in worker', 'high', ARRAY['incident', 'p1'], 'rooseveltops/main-app', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '8 hours', 8.0, 'closed'),
  (103, 'Slow dashboard loading', 'medium', ARRAY['production-bug'], 'rooseveltops/main-app', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '4 hours', 4.0, 'closed'),
  (104, 'Database connection timeout', 'critical', ARRAY['incident', 'p0'], 'rooseveltops/main-app', NOW() - INTERVAL '6 hours', NULL, NULL, 'open');

-- Refresh materialized view with sample data (non-concurrent for initial load)
REFRESH MATERIALIZED VIEW dora_summary;

-- ============================================================================
-- GRANTS (for dashboard access)
-- ============================================================================

-- Grant read access to anon role (public dashboard)
GRANT SELECT ON dora_metrics TO anon;
GRANT SELECT ON incidents TO anon;
GRANT SELECT ON dora_summary TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_dora_performance_tier TO anon;
GRANT EXECUTE ON FUNCTION get_mttr_stats TO anon;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify setup
DO $$
BEGIN
  RAISE NOTICE 'DORA Metrics Schema Setup Complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - dora_metrics (% rows)', (SELECT COUNT(*) FROM dora_metrics);
  RAISE NOTICE '  - incidents (% rows)', (SELECT COUNT(*) FROM incidents);
  RAISE NOTICE '  - dora_summary (materialized view, % rows)', (SELECT COUNT(*) FROM dora_summary);
  RAISE NOTICE '';
  RAISE NOTICE 'Run these queries to verify:';
  RAISE NOTICE '  SELECT * FROM get_dora_performance_tier();';
  RAISE NOTICE '  SELECT * FROM get_mttr_stats();';
  RAISE NOTICE '  SELECT * FROM dora_summary ORDER BY date DESC LIMIT 7;';
END $$;
