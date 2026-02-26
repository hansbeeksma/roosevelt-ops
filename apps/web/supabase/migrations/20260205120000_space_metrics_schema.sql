-- Roosevelt OPS SPACE Metrics Database Schema
-- Phase 2: SPACE Framework (Satisfaction, Performance, Activity, Collaboration, Efficiency)

-- ============================================================================
-- SATISFACTION METRICS
-- ============================================================================

-- Developer satisfaction surveys
CREATE TABLE developer_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Survey metadata
  survey_date DATE NOT NULL,
  developer_id TEXT NOT NULL,
  team TEXT,

  -- NPS Score (0-10)
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),

  -- Satisfaction dimensions (1-5 scale)
  work_satisfaction INTEGER CHECK (work_satisfaction >= 1 AND work_satisfaction <= 5),
  team_collaboration INTEGER CHECK (team_collaboration >= 1 AND team_collaboration <= 5),
  tools_quality INTEGER CHECK (tools_quality >= 1 AND tools_quality <= 5),
  work_life_balance INTEGER CHECK (work_life_balance >= 1 AND work_life_balance <= 5),
  learning_opportunities INTEGER CHECK (learning_opportunities >= 1 AND learning_opportunities <= 5),

  -- Feedback
  feedback_text TEXT,

  -- Anonymous flag
  anonymous BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_developer_surveys_date ON developer_surveys(survey_date DESC);
CREATE INDEX idx_developer_surveys_team ON developer_surveys(team);
CREATE INDEX idx_developer_surveys_developer ON developer_surveys(developer_id);

-- ============================================================================
-- PERFORMANCE METRICS
-- ============================================================================

-- Code quality metrics per PR
CREATE TABLE code_quality_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- PR metadata
  pr_number INTEGER NOT NULL,
  repository TEXT NOT NULL,
  author TEXT NOT NULL,
  merged_at TIMESTAMPTZ,

  -- Quality scores
  code_coverage_pct NUMERIC(5, 2),
  complexity_score INTEGER,
  test_count INTEGER DEFAULT 0,

  -- Review metrics
  review_comments INTEGER DEFAULT 0,
  change_requests INTEGER DEFAULT 0,
  approvals INTEGER DEFAULT 0,

  -- Size metrics
  lines_added INTEGER DEFAULT 0,
  lines_deleted INTEGER DEFAULT 0,
  files_changed INTEGER DEFAULT 0
);

CREATE INDEX idx_code_quality_pr ON code_quality_metrics(pr_number);
CREATE INDEX idx_code_quality_repo ON code_quality_metrics(repository);
CREATE INDEX idx_code_quality_author ON code_quality_metrics(author);
CREATE INDEX idx_code_quality_merged ON code_quality_metrics(merged_at DESC);

-- ============================================================================
-- ACTIVITY METRICS
-- ============================================================================

-- Daily developer activity
CREATE TABLE developer_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Activity metadata
  activity_date DATE NOT NULL,
  developer_id TEXT NOT NULL,
  repository TEXT NOT NULL,

  -- Activity counts
  commits INTEGER DEFAULT 0,
  prs_created INTEGER DEFAULT 0,
  prs_reviewed INTEGER DEFAULT 0,
  issues_created INTEGER DEFAULT 0,
  issues_closed INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,

  -- Code metrics
  lines_added INTEGER DEFAULT 0,
  lines_deleted INTEGER DEFAULT 0,

  UNIQUE(activity_date, developer_id, repository)
);

CREATE INDEX idx_developer_activity_date ON developer_activity(activity_date DESC);
CREATE INDEX idx_developer_activity_developer ON developer_activity(developer_id);
CREATE INDEX idx_developer_activity_repo ON developer_activity(repository);

-- ============================================================================
-- COLLABORATION METRICS
-- ============================================================================

-- Code review interactions
CREATE TABLE code_review_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Review metadata
  pr_number INTEGER NOT NULL,
  repository TEXT NOT NULL,
  pr_author TEXT NOT NULL,
  reviewer TEXT NOT NULL,

  -- Timing
  review_requested_at TIMESTAMPTZ NOT NULL,
  first_response_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,

  -- Response times (minutes)
  first_response_time_minutes INTEGER,
  approval_time_minutes INTEGER,

  -- Interaction counts
  comments_count INTEGER DEFAULT 0,
  change_requests_count INTEGER DEFAULT 0,

  -- Cross-team indicator
  cross_team BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_code_review_pr ON code_review_metrics(pr_number);
CREATE INDEX idx_code_review_repo ON code_review_metrics(repository);
CREATE INDEX idx_code_review_reviewer ON code_review_metrics(reviewer);
CREATE INDEX idx_code_review_requested ON code_review_metrics(review_requested_at DESC);

-- ============================================================================
-- EFFICIENCY METRICS
-- ============================================================================

-- Daily efficiency tracking
CREATE TABLE efficiency_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Efficiency metadata
  efficiency_date DATE NOT NULL,
  developer_id TEXT NOT NULL,

  -- Focus time (minutes)
  focus_time_minutes INTEGER DEFAULT 0,
  fragmented_time_minutes INTEGER DEFAULT 0,

  -- Meeting load
  meeting_count INTEGER DEFAULT 0,
  meeting_time_minutes INTEGER DEFAULT 0,

  -- Context switches
  context_switches INTEGER DEFAULT 0,

  -- CI/CD efficiency
  build_time_minutes INTEGER,
  test_time_minutes INTEGER,
  deployment_time_minutes INTEGER,

  UNIQUE(efficiency_date, developer_id)
);

CREATE INDEX idx_efficiency_date ON efficiency_metrics(efficiency_date DESC);
CREATE INDEX idx_efficiency_developer ON efficiency_metrics(developer_id);

-- ============================================================================
-- MATERIALIZED VIEW: SPACE SUMMARY
-- ============================================================================

CREATE MATERIALIZED VIEW space_summary AS
WITH weekly_activity AS (
  SELECT
    DATE_TRUNC('week', activity_date) AS week_start,
    SUM(commits) AS total_commits,
    SUM(prs_created) AS total_prs_created,
    SUM(prs_reviewed) AS total_prs_reviewed
  FROM developer_activity
  WHERE activity_date >= NOW() - INTERVAL '90 days'
  GROUP BY DATE_TRUNC('week', activity_date)
),
weekly_surveys AS (
  SELECT
    DATE_TRUNC('week', survey_date) AS week_start,
    AVG(nps_score) AS avg_nps,
    AVG(work_satisfaction) AS avg_work_satisfaction
  FROM developer_surveys
  WHERE survey_date >= NOW() - INTERVAL '90 days'
  GROUP BY DATE_TRUNC('week', survey_date)
),
weekly_quality AS (
  SELECT
    DATE_TRUNC('week', merged_at) AS week_start,
    AVG(code_coverage_pct) AS avg_coverage
  FROM code_quality_metrics
  WHERE merged_at >= NOW() - INTERVAL '90 days'
  GROUP BY DATE_TRUNC('week', merged_at)
),
weekly_reviews AS (
  SELECT
    DATE_TRUNC('week', review_requested_at) AS week_start,
    AVG(first_response_time_minutes) AS avg_review_response_minutes,
    COUNT(*) FILTER (WHERE cross_team = TRUE)::NUMERIC / NULLIF(COUNT(*), 0) * 100 AS cross_team_collaboration_pct
  FROM code_review_metrics
  WHERE review_requested_at >= NOW() - INTERVAL '90 days'
  GROUP BY DATE_TRUNC('week', review_requested_at)
),
weekly_efficiency AS (
  SELECT
    DATE_TRUNC('week', efficiency_date::TIMESTAMPTZ) AS week_start,
    AVG(focus_time_minutes) AS avg_focus_time_minutes,
    AVG(meeting_time_minutes) AS avg_meeting_time_minutes,
    AVG(context_switches) AS avg_context_switches
  FROM efficiency_metrics
  WHERE efficiency_date >= NOW() - INTERVAL '90 days'
  GROUP BY DATE_TRUNC('week', efficiency_date::TIMESTAMPTZ)
)
SELECT
  COALESCE(wa.week_start, ws.week_start, wq.week_start, wr.week_start, we.week_start) AS week_start,
  ws.avg_nps,
  ws.avg_work_satisfaction,
  wq.avg_coverage,
  wa.total_commits,
  wa.total_prs_created,
  wa.total_prs_reviewed,
  wr.avg_review_response_minutes,
  wr.cross_team_collaboration_pct,
  we.avg_focus_time_minutes,
  we.avg_meeting_time_minutes,
  we.avg_context_switches
FROM weekly_activity wa
FULL OUTER JOIN weekly_surveys ws ON wa.week_start = ws.week_start
FULL OUTER JOIN weekly_quality wq ON wa.week_start = wq.week_start
FULL OUTER JOIN weekly_reviews wr ON wa.week_start = wr.week_start
FULL OUTER JOIN weekly_efficiency we ON wa.week_start = we.week_start
ORDER BY week_start DESC;

-- Create index on materialized view (non-unique since FULL OUTER JOIN may produce duplicates)
CREATE INDEX idx_space_summary_week ON space_summary(week_start DESC);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get SPACE framework scores
CREATE OR REPLACE FUNCTION get_space_scores(
  p_weeks INTEGER DEFAULT 4
)
RETURNS TABLE(
  dimension TEXT,
  current_score NUMERIC,
  trend TEXT,
  benchmark TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH recent_data AS (
    SELECT
      avg_nps,
      avg_work_satisfaction,
      avg_coverage,
      total_commits,
      avg_review_response_minutes,
      avg_focus_time_minutes,
      avg_meeting_time_minutes
    FROM space_summary
    WHERE week_start >= NOW() - (p_weeks || ' weeks')::INTERVAL
    ORDER BY week_start DESC
    LIMIT 1
  )
  SELECT
    'Satisfaction (NPS)'::TEXT,
    COALESCE(rd.avg_nps, 0),
    CASE
      WHEN rd.avg_nps >= 50 THEN 'Excellent'
      WHEN rd.avg_nps >= 20 THEN 'Good'
      WHEN rd.avg_nps >= 0 THEN 'Fair'
      ELSE 'Poor'
    END::TEXT,
    'Target: >50 (Promoters)'::TEXT
  FROM recent_data rd

  UNION ALL

  SELECT
    'Performance (Coverage)'::TEXT,
    COALESCE(rd.avg_coverage, 0),
    CASE
      WHEN rd.avg_coverage >= 80 THEN 'Excellent'
      WHEN rd.avg_coverage >= 60 THEN 'Good'
      WHEN rd.avg_coverage >= 40 THEN 'Fair'
      ELSE 'Poor'
    END::TEXT,
    'Target: >80%'::TEXT
  FROM recent_data rd

  UNION ALL

  SELECT
    'Activity (Commits/Week)'::TEXT,
    COALESCE(rd.total_commits::NUMERIC, 0),
    CASE
      WHEN rd.total_commits >= 50 THEN 'High'
      WHEN rd.total_commits >= 20 THEN 'Moderate'
      ELSE 'Low'
    END::TEXT,
    'Context-dependent'::TEXT
  FROM recent_data rd

  UNION ALL

  SELECT
    'Collaboration (Review Time)'::TEXT,
    COALESCE(rd.avg_review_response_minutes, 0),
    CASE
      WHEN rd.avg_review_response_minutes <= 60 THEN 'Excellent'
      WHEN rd.avg_review_response_minutes <= 240 THEN 'Good'
      WHEN rd.avg_review_response_minutes <= 480 THEN 'Fair'
      ELSE 'Poor'
    END::TEXT,
    'Target: <1 hour'::TEXT
  FROM recent_data rd

  UNION ALL

  SELECT
    'Efficiency (Focus Time)'::TEXT,
    COALESCE(rd.avg_focus_time_minutes, 0),
    CASE
      WHEN rd.avg_focus_time_minutes >= 240 THEN 'Excellent'
      WHEN rd.avg_focus_time_minutes >= 180 THEN 'Good'
      WHEN rd.avg_focus_time_minutes >= 120 THEN 'Fair'
      ELSE 'Poor'
    END::TEXT,
    'Target: >4 hours/day'::TEXT
  FROM recent_data rd;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE developer_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_review_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE efficiency_metrics ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users"
  ON developer_surveys FOR SELECT USING (true);

CREATE POLICY "Allow read access to authenticated users"
  ON code_quality_metrics FOR SELECT USING (true);

CREATE POLICY "Allow read access to authenticated users"
  ON developer_activity FOR SELECT USING (true);

CREATE POLICY "Allow read access to authenticated users"
  ON code_review_metrics FOR SELECT USING (true);

CREATE POLICY "Allow read access to authenticated users"
  ON efficiency_metrics FOR SELECT USING (true);

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Sample developer surveys
INSERT INTO developer_surveys (survey_date, developer_id, team, nps_score, work_satisfaction, team_collaboration, tools_quality, work_life_balance, learning_opportunities) VALUES
  (CURRENT_DATE - INTERVAL '1 day', 'dev_001', 'backend', 8, 4, 5, 4, 4, 5),
  (CURRENT_DATE - INTERVAL '1 day', 'dev_002', 'frontend', 9, 5, 5, 5, 4, 5),
  (CURRENT_DATE - INTERVAL '1 day', 'dev_003', 'backend', 7, 4, 4, 3, 3, 4),
  (CURRENT_DATE - INTERVAL '8 days', 'dev_001', 'backend', 7, 4, 4, 4, 3, 4),
  (CURRENT_DATE - INTERVAL '8 days', 'dev_002', 'frontend', 8, 5, 5, 4, 4, 5);

-- Sample code quality metrics
INSERT INTO code_quality_metrics (pr_number, repository, author, merged_at, code_coverage_pct, complexity_score, test_count, review_comments, approvals, lines_added, lines_deleted, files_changed) VALUES
  (101, 'rooseveltops/main-app', 'dev_001', NOW() - INTERVAL '1 day', 85.5, 12, 15, 3, 2, 120, 45, 5),
  (102, 'rooseveltops/main-app', 'dev_002', NOW() - INTERVAL '2 days', 78.2, 15, 12, 5, 2, 200, 80, 8),
  (103, 'rooseveltops/main-app', 'dev_003', NOW() - INTERVAL '3 days', 92.1, 8, 20, 2, 2, 150, 30, 4);

-- Sample developer activity
INSERT INTO developer_activity (activity_date, developer_id, repository, commits, prs_created, prs_reviewed, lines_added, lines_deleted) VALUES
  (CURRENT_DATE - INTERVAL '1 day', 'dev_001', 'rooseveltops/main-app', 5, 1, 2, 120, 45),
  (CURRENT_DATE - INTERVAL '1 day', 'dev_002', 'rooseveltops/main-app', 8, 2, 3, 200, 80),
  (CURRENT_DATE - INTERVAL '1 day', 'dev_003', 'rooseveltops/main-app', 3, 1, 1, 150, 30),
  (CURRENT_DATE - INTERVAL '2 days', 'dev_001', 'rooseveltops/main-app', 4, 0, 1, 80, 20),
  (CURRENT_DATE - INTERVAL '2 days', 'dev_002', 'rooseveltops/main-app', 6, 1, 2, 150, 50);

-- Sample code review metrics
INSERT INTO code_review_metrics (pr_number, repository, pr_author, reviewer, review_requested_at, first_response_at, first_response_time_minutes, comments_count, cross_team) VALUES
  (101, 'rooseveltops/main-app', 'dev_001', 'dev_002', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '45 minutes', 45, 3, FALSE),
  (102, 'rooseveltops/main-app', 'dev_002', 'dev_001', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '120 minutes', 120, 5, FALSE),
  (103, 'rooseveltops/main-app', 'dev_003', 'dev_002', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '30 minutes', 30, 2, TRUE);

-- Sample efficiency metrics
INSERT INTO efficiency_metrics (efficiency_date, developer_id, focus_time_minutes, meeting_count, meeting_time_minutes, context_switches) VALUES
  (CURRENT_DATE - INTERVAL '1 day', 'dev_001', 280, 2, 90, 8),
  (CURRENT_DATE - INTERVAL '1 day', 'dev_002', 320, 3, 120, 12),
  (CURRENT_DATE - INTERVAL '1 day', 'dev_003', 240, 4, 150, 15),
  (CURRENT_DATE - INTERVAL '2 days', 'dev_001', 300, 1, 60, 6),
  (CURRENT_DATE - INTERVAL '2 days', 'dev_002', 290, 2, 90, 10);

-- Refresh materialized view with sample data
REFRESH MATERIALIZED VIEW space_summary;

-- ============================================================================
-- COMPLETION NOTICE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'SPACE Metrics Schema Setup Complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - developer_surveys (5 rows)';
  RAISE NOTICE '  - code_quality_metrics (3 rows)';
  RAISE NOTICE '  - developer_activity (5 rows)';
  RAISE NOTICE '  - code_review_metrics (3 rows)';
  RAISE NOTICE '  - efficiency_metrics (5 rows)';
  RAISE NOTICE '  - space_summary (materialized view)';
  RAISE NOTICE '';
  RAISE NOTICE 'Run these queries to verify:';
  RAISE NOTICE '  SELECT * FROM get_space_scores();';
  RAISE NOTICE '  SELECT * FROM space_summary ORDER BY week_start DESC LIMIT 4;';
END $$;
