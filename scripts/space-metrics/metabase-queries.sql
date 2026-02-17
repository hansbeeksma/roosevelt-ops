-- SPACE Metrics: Metabase Dashboard Queries
-- Import these as saved questions in Metabase to build the SPACE dashboard.
--
-- Prerequisites:
--   - Supabase database connected as data source in Metabase
--   - Tables: dora_metrics, incidents, space_performance, space_activity,
--     space_collaboration, space_efficiency, space_satisfaction
--
-- Usage: Copy each query block into Metabase as a "Native Query" saved question.

-- ============================================================================
-- 1. DORA: Deployment Frequency (Bar Chart - last 30 days)
-- ============================================================================
-- Visualization: Bar chart, X=date, Y=deployments
-- Refresh: Daily

SELECT
  DATE_TRUNC('day', timestamp)::date AS date,
  COUNT(*) AS deployments
FROM dora_metrics
WHERE event_type IN ('deployment', 'push')
  AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY date;

-- ============================================================================
-- 2. DORA: Lead Time for Changes (Line Chart - last 30 days)
-- ============================================================================
-- Visualization: Line chart, X=date, Y=avg_lead_time_hours
-- Refresh: Daily

SELECT
  DATE_TRUNC('day', timestamp)::date AS date,
  ROUND(AVG(lead_time_hours), 1) AS avg_lead_time_hours,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY lead_time_hours), 1) AS median_lead_time_hours,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY lead_time_hours), 1) AS p95_lead_time_hours
FROM dora_metrics
WHERE lead_time_hours IS NOT NULL
  AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY date;

-- ============================================================================
-- 3. DORA: Change Failure Rate (Gauge - last 30 days)
-- ============================================================================
-- Visualization: Gauge or Number, single value
-- Thresholds: Green <15%, Yellow 15-30%, Red >30%
-- Refresh: Daily

SELECT
  ROUND(
    COUNT(*) FILTER (WHERE deployment_failed = TRUE)::NUMERIC
    / NULLIF(COUNT(*) FILTER (WHERE event_type IN ('deployment', 'push')), 0)
    * 100,
    1
  ) AS change_failure_rate_pct,
  COUNT(*) FILTER (WHERE deployment_failed = TRUE) AS failed_deployments,
  COUNT(*) FILTER (WHERE event_type IN ('deployment', 'push')) AS total_deployments
FROM dora_metrics
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days';

-- ============================================================================
-- 4. DORA: Mean Time to Recovery (Number - last 90 days)
-- ============================================================================
-- Visualization: Number with trend
-- Thresholds: Green <1h, Yellow 1h-24h, Red >24h
-- Refresh: Daily

SELECT
  ROUND(AVG(mttr_hours), 1) AS avg_mttr_hours,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY mttr_hours), 1) AS median_mttr_hours,
  COUNT(*) AS total_incidents,
  COUNT(*) FILTER (WHERE severity = 'critical') AS critical_incidents
FROM incidents
WHERE status = 'closed'
  AND closed_at_github >= CURRENT_DATE - INTERVAL '90 days';

-- ============================================================================
-- 5. DORA: Performance Tier Summary (Table)
-- ============================================================================
-- Visualization: Table with colored tier badges
-- Refresh: Daily

WITH metrics AS (
  SELECT
    -- Deployment Frequency (per day, last 7 days)
    (SELECT COUNT(*)::NUMERIC / 7
     FROM dora_metrics
     WHERE event_type IN ('deployment', 'push')
       AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
    ) AS deploy_freq_per_day,

    -- Lead Time (median, last 7 days)
    (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY lead_time_hours)
     FROM dora_metrics
     WHERE lead_time_hours IS NOT NULL
       AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
    ) AS median_lead_time_hours,

    -- Change Failure Rate (last 30 days)
    (SELECT
       COUNT(*) FILTER (WHERE deployment_failed = TRUE)::NUMERIC
       / NULLIF(COUNT(*) FILTER (WHERE event_type IN ('deployment', 'push')), 0)
       * 100
     FROM dora_metrics
     WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
    ) AS change_failure_rate_pct,

    -- MTTR (median, last 90 days)
    (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY mttr_hours)
     FROM incidents
     WHERE status = 'closed'
       AND closed_at_github >= CURRENT_DATE - INTERVAL '90 days'
    ) AS median_mttr_hours
)
SELECT
  'Deployment Frequency' AS metric,
  ROUND(deploy_freq_per_day, 2) AS value,
  'deploys/day' AS unit,
  CASE
    WHEN deploy_freq_per_day >= 1 THEN 'Elite'
    WHEN deploy_freq_per_day >= 0.14 THEN 'High'
    WHEN deploy_freq_per_day >= 0.033 THEN 'Medium'
    ELSE 'Low'
  END AS tier
FROM metrics

UNION ALL

SELECT
  'Lead Time',
  ROUND(median_lead_time_hours, 1),
  'hours',
  CASE
    WHEN median_lead_time_hours <= 24 THEN 'Elite'
    WHEN median_lead_time_hours <= 168 THEN 'High'
    WHEN median_lead_time_hours <= 720 THEN 'Medium'
    ELSE 'Low'
  END
FROM metrics

UNION ALL

SELECT
  'Change Failure Rate',
  ROUND(change_failure_rate_pct, 1),
  '%',
  CASE
    WHEN change_failure_rate_pct <= 15 THEN 'Elite'
    WHEN change_failure_rate_pct <= 30 THEN 'High'
    WHEN change_failure_rate_pct <= 45 THEN 'Medium'
    ELSE 'Low'
  END
FROM metrics

UNION ALL

SELECT
  'MTTR',
  ROUND(median_mttr_hours, 1),
  'hours',
  CASE
    WHEN median_mttr_hours <= 1 THEN 'Elite'
    WHEN median_mttr_hours <= 24 THEN 'High'
    WHEN median_mttr_hours <= 168 THEN 'Medium'
    ELSE 'Low'
  END
FROM metrics;

-- ============================================================================
-- 6. SPACE: Satisfaction - Developer NPS Trend (Line Chart)
-- ============================================================================
-- Visualization: Line chart with NPS score over time
-- Refresh: Monthly (after survey)

SELECT
  DATE_TRUNC('month', survey_date)::date AS month,
  ROUND(
    (COUNT(*) FILTER (WHERE nps_score >= 9)::NUMERIC
     - COUNT(*) FILTER (WHERE nps_score <= 6)::NUMERIC)
    / NULLIF(COUNT(*), 0) * 100,
    0
  ) AS nps,
  ROUND(AVG(satisfaction_score), 1) AS avg_satisfaction,
  COUNT(*) AS responses
FROM space_satisfaction
WHERE survey_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', survey_date)
ORDER BY month;

-- ============================================================================
-- 7. SPACE: Performance - PR Throughput Trend (Area Chart)
-- ============================================================================
-- Visualization: Area chart, X=week, Y=prs_merged
-- Refresh: Weekly

SELECT
  DATE_TRUNC('week', date)::date AS week,
  SUM(prs_merged) AS prs_merged,
  ROUND(AVG(pr_review_depth), 1) AS avg_reviews_per_pr
FROM space_performance
WHERE date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE_TRUNC('week', date)
ORDER BY week;

-- ============================================================================
-- 8. SPACE: Activity - Code Volume (Stacked Bar Chart)
-- ============================================================================
-- Visualization: Stacked bar chart, green=additions, red=deletions
-- Note: High activity is a COUNTER-METRIC - may signal thrashing
-- Refresh: Weekly

SELECT
  DATE_TRUNC('week', date)::date AS week,
  SUM(commits_count) AS commits,
  SUM(prs_created) AS prs_created,
  SUM(code_additions) AS lines_added,
  SUM(code_deletions) AS lines_removed,
  SUM(code_additions) + SUM(code_deletions) AS total_churn
FROM space_activity
WHERE date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE_TRUNC('week', date)
ORDER BY week;

-- ============================================================================
-- 9. SPACE: Communication - PR Review Turnaround (Line Chart)
-- ============================================================================
-- Visualization: Line chart, X=week, Y=avg_review_turnaround_hours
-- Thresholds: Green <4h, Yellow 4-24h, Red >24h
-- Refresh: Weekly

SELECT
  week_start::date AS week,
  ROUND(AVG(avg_review_turnaround_hours), 1) AS avg_review_hours,
  SUM(code_reviews_given) AS reviews_given,
  SUM(pr_comments) AS total_comments
FROM space_collaboration
WHERE week_start >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY week_start
ORDER BY week;

-- ============================================================================
-- 10. SPACE: Efficiency - Focus Time vs Meeting Load (Dual Axis Chart)
-- ============================================================================
-- Visualization: Line chart, primary Y=focus_pct, secondary Y=meeting_hours
-- Thresholds: Green focus >70%, Yellow 50-70%, Red <50%
-- Refresh: Weekly

SELECT
  week_start::date AS week,
  ROUND(AVG(deep_work_pct), 1) AS avg_focus_pct,
  ROUND(AVG(focus_hours), 1) AS avg_focus_hours_per_week,
  ROUND(AVG(meeting_hours), 1) AS avg_meeting_hours_per_week,
  ROUND(AVG(context_switches), 0) AS avg_context_switches
FROM space_efficiency
WHERE week_start >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY week_start
ORDER BY week;

-- ============================================================================
-- 11. SPACE: Combined Dashboard Summary (Scorecard Table)
-- ============================================================================
-- Visualization: Table with dimension scores and trend indicators
-- Refresh: Weekly

SELECT
  'Satisfaction' AS dimension,
  COALESCE(
    (SELECT ROUND(AVG(satisfaction_score), 1)
     FROM space_satisfaction
     WHERE survey_date >= CURRENT_DATE - INTERVAL '90 days'),
    0
  ) AS score,
  '/ 5.0' AS scale,
  CASE
    WHEN (SELECT AVG(satisfaction_score) FROM space_satisfaction WHERE survey_date >= CURRENT_DATE - INTERVAL '90 days') >= 4.5 THEN 'Excellent'
    WHEN (SELECT AVG(satisfaction_score) FROM space_satisfaction WHERE survey_date >= CURRENT_DATE - INTERVAL '90 days') >= 3.5 THEN 'Good'
    WHEN (SELECT AVG(satisfaction_score) FROM space_satisfaction WHERE survey_date >= CURRENT_DATE - INTERVAL '90 days') >= 2.5 THEN 'Fair'
    ELSE 'Poor'
  END AS rating

UNION ALL

SELECT
  'Performance',
  COALESCE(
    (SELECT SUM(prs_merged)
     FROM space_performance
     WHERE date >= CURRENT_DATE - INTERVAL '7 days'),
    0
  ),
  'PRs/week',
  CASE
    WHEN (SELECT SUM(prs_merged) FROM space_performance WHERE date >= CURRENT_DATE - INTERVAL '7 days') >= 10 THEN 'Excellent'
    WHEN (SELECT SUM(prs_merged) FROM space_performance WHERE date >= CURRENT_DATE - INTERVAL '7 days') >= 5 THEN 'Good'
    WHEN (SELECT SUM(prs_merged) FROM space_performance WHERE date >= CURRENT_DATE - INTERVAL '7 days') >= 2 THEN 'Fair'
    ELSE 'Low'
  END

UNION ALL

SELECT
  'Activity',
  COALESCE(
    (SELECT SUM(commits_count)
     FROM space_activity
     WHERE date >= CURRENT_DATE - INTERVAL '7 days'),
    0
  ),
  'commits/week',
  'Counter-metric'

UNION ALL

SELECT
  'Communication',
  COALESCE(
    (SELECT ROUND(AVG(avg_review_turnaround_hours), 1)
     FROM space_collaboration
     WHERE week_start >= CURRENT_DATE - INTERVAL '28 days'),
    0
  ),
  'hours avg review',
  CASE
    WHEN (SELECT AVG(avg_review_turnaround_hours) FROM space_collaboration WHERE week_start >= CURRENT_DATE - INTERVAL '28 days') <= 4 THEN 'Excellent'
    WHEN (SELECT AVG(avg_review_turnaround_hours) FROM space_collaboration WHERE week_start >= CURRENT_DATE - INTERVAL '28 days') <= 24 THEN 'Good'
    ELSE 'Slow'
  END

UNION ALL

SELECT
  'Efficiency',
  COALESCE(
    (SELECT ROUND(AVG(deep_work_pct), 1)
     FROM space_efficiency
     WHERE week_start >= CURRENT_DATE - INTERVAL '28 days'),
    0
  ),
  '% focus time',
  CASE
    WHEN (SELECT AVG(deep_work_pct) FROM space_efficiency WHERE week_start >= CURRENT_DATE - INTERVAL '28 days') >= 70 THEN 'Excellent'
    WHEN (SELECT AVG(deep_work_pct) FROM space_efficiency WHERE week_start >= CURRENT_DATE - INTERVAL '28 days') >= 50 THEN 'Good'
    ELSE 'Low'
  END;

-- ============================================================================
-- 12. DORA + SPACE: Cross-Metric Correlation (Scatter Plot)
-- ============================================================================
-- Visualization: Scatter plot to detect relationships
-- Purpose: Find if more focus time correlates with fewer failures
-- Refresh: Monthly

SELECT
  e.week_start::date AS week,
  ROUND(AVG(e.deep_work_pct), 1) AS focus_pct,
  ROUND(
    COUNT(*) FILTER (WHERE dm.deployment_failed = TRUE)::NUMERIC
    / NULLIF(COUNT(*) FILTER (WHERE dm.event_type IN ('deployment', 'push')), 0)
    * 100,
    1
  ) AS failure_rate_pct,
  SUM(a.commits_count) AS commits
FROM space_efficiency e
LEFT JOIN dora_metrics dm ON DATE_TRUNC('week', dm.timestamp) = e.week_start
LEFT JOIN space_activity a ON DATE_TRUNC('week', a.date) = e.week_start
WHERE e.week_start >= CURRENT_DATE - INTERVAL '180 days'
GROUP BY e.week_start
ORDER BY week;
