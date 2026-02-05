# ROOSE-29: Engineering Metrics Implementation Plan

**Epic:** Engineering Metrics Dashboard - DORA + SPACE Framework
**Priority:** P0 (Critical)
**Status:** ✅ Phase 1-2 Complete | 🚧 Phase 3 In Progress
**Owner:** Roosevelt OPS Engineering Team
**Created:** 2026-02-05

---

## Executive Summary

Dit document beschrijft de volledige implementatie van engineering metrics dashboards voor Roosevelt OPS, gebaseerd op twee state-of-the-art frameworks:

- **DORA Metrics** - DevOps Research and Assessment (deployment frequency, lead time, change failure rate, MTTR)
- **SPACE Framework** - Satisfaction, Performance, Activity, Collaboration, Efficiency

**Doelstellingen:**
- Baseline engineering performance measurements
- Data-driven team improvements
- Objective performance tracking
- Burnout & bottleneck detection

**Resultaten:**
- ✅ Real-time metrics dashboard
- ✅ Automated data collection via GitHub Actions
- ✅ PostgreSQL + Supabase data pipeline
- 🚧 Alert configuration
- 📋 Phase 3: Advanced analytics (ML-powered predictions)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                             │
├─────────────────────────────────────────────────────────────────┤
│  GitHub Actions  │  Pull Requests  │  Deployments  │  Incidents │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COLLECTION LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  .github/workflows/dora-metrics.yml                             │
│  • Deployment frequency tracking                                │
│  • Lead time calculation                                        │
│  • Change failure rate monitoring                               │
│  • PR cycle time measurement                                    │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     STORAGE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL Database                                   │
│  • dora_metrics table (raw events)                              │
│  • incidents table (MTTR tracking)                              │
│  • space_metrics table (developer productivity)                 │
│  • dora_summary materialized view (aggregated metrics)          │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ANALYTICS LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Database Functions                                             │
│  • get_dora_performance_tier() - Elite/High/Medium/Low          │
│  • get_mttr_stats() - Incident recovery metrics                │
│  • get_space_scores() - Developer productivity scores           │
│  • refresh_dora_summary() - Daily aggregation job               │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Next.js Dashboard (app/page.tsx)                               │
│  • PerformanceTier component - Current tier badges              │
│  • DoraMetrics component - Trend charts (deployment freq,       │
│    lead time, failure rate, MTTR)                               │
│  • SpaceScores component - Satisfaction/Performance/Activity/   │
│    Collaboration/Efficiency scores                              │
│  • SpaceSummary component - Detailed breakdowns                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: DORA Baseline Collection ✅

**Status:** Complete
**Duration:** Week 1
**Completion Date:** 2026-02-05

### Deliverables

#### 1. GitHub Actions Workflow

**File:** `.github/workflows/dora-metrics.yml`

**Triggers:**
- Push to `main`/`production` branches
- Pull request closed (merged)
- Deployment events
- Workflow completion

**Metrics Collected:**

| Metric | Calculation | Storage |
|--------|-------------|---------|
| **Deployment Frequency** | Count per push/deployment event | `dora_metrics.deployment_frequency` |
| **Lead Time for Changes** | PR merge time - first commit time | `dora_metrics.lead_time_hours` |
| **Change Failure Rate** | Failed deployments / total deployments | `dora_metrics.deployment_failed` |
| **Mean Time to Recovery** | Incident close time - open time | `incidents.mttr_hours` |

**Implementation Details:**
```yaml
# Deployment frequency tracking
- name: Calculate Deployment Frequency
  run: |
    DEPLOY_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    ENVIRONMENT="${{ github.event.deployment.environment || 'production' }}"

# Lead time calculation
- name: Calculate Lead Time for Changes
  run: |
    FIRST_COMMIT=$(gh pr view $PR_NUMBER --json commits --jq '.commits[0].oid')
    FIRST_COMMIT_TIME=$(git show -s --format=%cI $FIRST_COMMIT)
    LEAD_TIME=$(( $(date -d "$MERGE_TIME" +%s) - $(date -d "$FIRST_COMMIT_TIME" +%s) ))
```

#### 2. Database Schema

**File:** `supabase/migrations/20260205_dora_metrics_schema.sql`

**Tables:**

```sql
-- Core metrics table
CREATE TABLE dora_metrics (
  id UUID PRIMARY KEY,
  event_type TEXT NOT NULL,
  repository TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  deployment_frequency INTEGER,
  lead_time_hours NUMERIC(10, 2),
  deployment_failed BOOLEAN,
  environment TEXT,
  pr_number INTEGER,
  commit_sha TEXT,
  actor TEXT
);

-- Incident tracking for MTTR
CREATE TABLE incidents (
  id UUID PRIMARY KEY,
  issue_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  severity TEXT,
  created_at_github TIMESTAMPTZ,
  closed_at_github TIMESTAMPTZ,
  mttr_hours NUMERIC(10, 2),
  status TEXT DEFAULT 'open'
);

-- Aggregated view (refreshed daily via pg_cron)
CREATE MATERIALIZED VIEW dora_summary AS
SELECT
  DATE_TRUNC('day', timestamp) AS date,
  COUNT(*) FILTER (WHERE deployment_frequency > 0) AS deployments,
  AVG(lead_time_hours) AS avg_lead_time_hours,
  (COUNT(*) FILTER (WHERE deployment_failed = TRUE)::NUMERIC /
   COUNT(*) FILTER (WHERE event_type IN ('deployment', 'push')) * 100)
   AS change_failure_rate_pct
FROM dora_metrics
WHERE timestamp >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', timestamp);
```

**Helper Functions:**
- `get_dora_performance_tier()` - Classify current performance (Elite/High/Medium/Low)
- `refresh_dora_summary()` - Refresh materialized view (scheduled daily 1 AM)

**Performance Tier Classification:**

| Metric | Elite | High | Medium | Low |
|--------|-------|------|--------|-----|
| Deployment Frequency | Multiple/day | Daily-Weekly | Weekly-Monthly | Monthly+ |
| Lead Time | <24h | <7d | <1mo | 1mo+ |
| Change Failure Rate | <15% | <30% | <45% | 45%+ |
| MTTR | <1h | <1d | <1wk | 1wk+ |

#### 3. Dashboard Components

**Files:**
- `app/components/PerformanceTier.tsx` - Performance tier badges
- `app/components/DoraMetrics.tsx` - Trend charts

**Features:**
- Real-time data fetching from Supabase
- Tremor charts (AreaChart, BarChart)
- Color-coded tier badges (Elite=green, High=blue, Medium=yellow, Low=red)
- 30-day rolling window
- Loading states with graceful degradation

**UI Preview:**
```
┌─────────────────────────────────────────────────────────────┐
│ DORA Performance Tier (Last 7 Days)                        │
├─────────────────────────────────────────────────────────────┤
│ Metric                    │ Value │ Tier   │ Target        │
│ Deployment Frequency      │ 2.3   │ High   │ Multiple/day  │
│ Lead Time                 │ 18.5h │ Elite  │ <24h          │
│ Change Failure Rate       │ 12%   │ Elite  │ <15%          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Deployment Frequency                                        │
│                                                             │
│ [Bar Chart: deployments per day over 30 days]              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Lead Time for Changes                                       │
│                                                             │
│ [Area Chart: average lead time in hours over 30 days]      │
└─────────────────────────────────────────────────────────────┘
```

### Configuration

**Required Secrets:**

```bash
# GitHub Actions secrets
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...  # For write access

# Environment variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Verification

**Test Metrics Collection:**
```bash
# Trigger workflow manually
gh workflow run dora-metrics.yml

# Verify data in Supabase
psql $DATABASE_URL -c "SELECT * FROM dora_metrics ORDER BY created_at DESC LIMIT 5;"

# Check performance tier
psql $DATABASE_URL -c "SELECT * FROM get_dora_performance_tier();"
```

**Expected Output:**
```
Deployment Frequency      | 2.3  | High   | Multiple/day (Elite)
Lead Time                 | 18.5 | Elite  | <24h (Elite)
Change Failure Rate       | 12   | Elite  | <15% (Elite)
```

---

## Phase 2: SPACE Framework ✅

**Status:** Complete
**Duration:** Week 2
**Completion Date:** 2026-02-05

### Overview

SPACE Framework measures developer productivity holistically across 5 dimensions:

| Dimension | What It Measures | Data Sources |
|-----------|------------------|--------------|
| **Satisfaction** | Developer happiness, NPS scores | Quarterly surveys |
| **Performance** | Code quality, review thoroughness | Code coverage, PR reviews |
| **Activity** | Work volume, commits | GitHub activity API |
| **Collaboration** | Cross-team work, PR reviews | PR comments, cross-team PRs |
| **Efficiency** | Focus time, context switches | Calendar API, meeting data |

### Deliverables

#### 1. Database Schema

**File:** `supabase/migrations/20260205120000_space_metrics_schema.sql`

**Tables:**

```sql
-- Developer satisfaction surveys
CREATE TABLE space_satisfaction (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  survey_date TIMESTAMPTZ NOT NULL,
  nps_score INTEGER CHECK (nps_score BETWEEN 0 AND 10),
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
  feedback TEXT
);

-- Performance metrics
CREATE TABLE space_performance (
  id UUID PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL,
  code_coverage_pct NUMERIC(5, 2),
  pr_review_depth NUMERIC(5, 2),  -- Comments per PR
  defect_density NUMERIC(10, 4)   -- Bugs per 1000 LOC
);

-- Activity metrics
CREATE TABLE space_activity (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  commits_count INTEGER,
  prs_created INTEGER,
  prs_reviewed INTEGER,
  code_additions INTEGER,
  code_deletions INTEGER
);

-- Collaboration metrics
CREATE TABLE space_collaboration (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  week_start TIMESTAMPTZ NOT NULL,
  cross_team_prs INTEGER,
  pr_comments INTEGER,
  code_reviews_given INTEGER,
  async_communication_score NUMERIC(5, 2)
);

-- Efficiency metrics
CREATE TABLE space_efficiency (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  week_start TIMESTAMPTZ NOT NULL,
  focus_hours NUMERIC(5, 2),
  meeting_hours NUMERIC(5, 2),
  context_switches INTEGER,
  deep_work_pct NUMERIC(5, 2)
);
```

**Aggregation Function:**
```sql
CREATE OR REPLACE FUNCTION get_space_scores(p_weeks INTEGER DEFAULT 4)
RETURNS TABLE(
  dimension TEXT,
  current_score NUMERIC,
  trend TEXT,
  benchmark TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'Satisfaction'::TEXT,
    AVG(satisfaction_score),
    CASE
      WHEN AVG(satisfaction_score) >= 4.5 THEN 'Excellent'
      WHEN AVG(satisfaction_score) >= 3.5 THEN 'Good'
      WHEN AVG(satisfaction_score) >= 2.5 THEN 'Fair'
      ELSE 'Poor'
    END,
    '4.5+ (Excellent)'::TEXT
  FROM space_satisfaction
  WHERE survey_date >= CURRENT_DATE - (p_weeks || ' weeks')::INTERVAL

  UNION ALL

  -- Performance, Activity, Collaboration, Efficiency calculations...
  -- (Full implementation in migration file)
END;
$$ LANGUAGE plpgsql;
```

#### 2. Dashboard Components

**Files:**
- `app/components/SpaceScores.tsx` - Overall dimension scores
- `app/components/SpaceSummary.tsx` - Detailed breakdowns

**Features:**
- 5-dimension scoring (Satisfaction, Performance, Activity, Collaboration, Efficiency)
- Trend indicators (Excellent/Good/Fair/Poor)
- Benchmarking against industry standards
- Weekly/monthly aggregation

**UI Preview:**
```
┌─────────────────────────────────────────────────────────────┐
│ SPACE Framework Scores (Last 4 Weeks)                      │
├─────────────────────────────────────────────────────────────┤
│ Dimension       │ Score │ Trend      │ Benchmark            │
│ Satisfaction    │ 4.2   │ Excellent  │ 4.5+ (Excellent)     │
│ Performance     │ 78.5  │ Good       │ 80%+ coverage        │
│ Activity        │ 142   │ High       │ 100-150 commits/wk   │
│ Collaboration   │ 8.3   │ Excellent  │ 5+ cross-team PRs    │
│ Efficiency      │ 68%   │ Good       │ 70%+ focus time      │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Data Collection Scripts

**Developer Satisfaction Survey:**
```typescript
// lib/space/satisfaction-survey.ts
export async function conductQuarterlySurvey() {
  // Send survey to all developers
  // Collect NPS score (0-10)
  // Collect satisfaction rating (1-5)
  // Store in space_satisfaction table
}
```

**GitHub Activity Tracking:**
```typescript
// lib/space/activity-tracker.ts
export async function collectWeeklyActivity() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

  // For each developer:
  // - Fetch commits (octokit.rest.repos.listCommits)
  // - Fetch PRs created (octokit.rest.pulls.list)
  // - Fetch PRs reviewed (octokit.rest.pulls.listReviews)
  // - Store in space_activity table
}
```

**Efficiency Tracking (Calendar Integration):**
```typescript
// lib/space/efficiency-tracker.ts
export async function analyzeWeeklySchedule() {
  // Connect to Google Calendar API
  // Calculate focus time (contiguous blocks >= 2h)
  // Calculate meeting load
  // Detect context switches (meetings < 30min apart)
  // Store in space_efficiency table
}
```

### Configuration

**Additional Secrets:**

```bash
# GitHub token for activity tracking
GITHUB_TOKEN=ghp_xxx  # Fine-grained PAT with repo:read

# Google Calendar API (for efficiency metrics)
GOOGLE_CALENDAR_CLIENT_ID=xxx
GOOGLE_CALENDAR_CLIENT_SECRET=xxx
GOOGLE_CALENDAR_REFRESH_TOKEN=xxx
```

**Scheduled Jobs (pg_cron):**

```sql
-- Weekly SPACE metrics aggregation
SELECT cron.schedule(
  'aggregate-space-metrics',
  '0 2 * * 1',  -- Every Monday 2 AM
  'SELECT aggregate_space_metrics();'
);
```

### Verification

```bash
# Check SPACE scores
psql $DATABASE_URL -c "SELECT * FROM get_space_scores(4);"

# Verify data freshness
psql $DATABASE_URL -c "
  SELECT
    'Satisfaction' AS metric,
    COUNT(*) AS records,
    MAX(survey_date) AS last_updated
  FROM space_satisfaction
  UNION ALL
  SELECT 'Activity', COUNT(*), MAX(date) FROM space_activity;
"
```

---

## Phase 3: Advanced Analytics 🚧

**Status:** In Progress
**Duration:** Weeks 3-4
**Target Completion:** 2026-02-12

### Deliverables

#### 1. Predictive Alerts

**ML-Powered Anomaly Detection:**

```typescript
// lib/analytics/anomaly-detection.ts
import * as tf from '@tensorflow/tfjs-node'

export async function detectAnomalies(metric: string, days: number = 30) {
  // Fetch historical data
  const data = await fetchMetricHistory(metric, days)

  // Train LSTM model on historical patterns
  const model = await trainLSTM(data)

  // Predict next values
  const predictions = model.predict(data.recent)

  // Flag deviations > 2 standard deviations
  const anomalies = detectDeviations(data.current, predictions, threshold: 2)

  return anomalies
}
```

**Alert Triggers:**

| Condition | Alert | Action |
|-----------|-------|--------|
| Deployment frequency drops >50% week-over-week | ⚠️ Low Activity | Investigate blockers |
| Lead time >3x baseline | 🔴 Bottleneck Detected | Review PR queue |
| Change failure rate >25% | 🚨 Quality Issue | Trigger incident review |
| Developer satisfaction <3.0 | ⚠️ Burnout Risk | Schedule 1-on-1s |
| Focus time <50% | ⚠️ Meeting Overload | Suggest no-meeting blocks |

**Notification Channels:**
- Slack (#engineering-metrics)
- Email to engineering leads
- Dashboard alert banner
- PagerDuty for critical alerts

#### 2. Team Comparison Dashboard

**Anonymized Benchmarking:**

```typescript
// app/components/TeamComparison.tsx
export function TeamComparison() {
  // Fetch aggregated team metrics (anonymized)
  const teams = [
    { name: 'Team A', deploymentFreq: 2.5, leadTime: 18, cfr: 12 },
    { name: 'Team B', deploymentFreq: 1.8, leadTime: 24, cfr: 15 },
    // ...
  ]

  return (
    <Card>
      <Title>Team Performance Comparison</Title>
      <BarChart
        data={teams}
        index="name"
        categories={["deploymentFreq", "leadTime", "cfr"]}
        colors={["blue", "indigo", "rose"]}
      />
    </Card>
  )
}
```

**Privacy Considerations:**
- Team-level aggregation only (no individual metrics)
- Minimum 3 members per team to prevent de-anonymization
- Opt-in participation for SPACE metrics
- Encrypted sensitive survey feedback

#### 3. Trend Analysis & Forecasting

**Time Series Forecasting:**

```typescript
// lib/analytics/forecasting.ts
export async function forecastNextQuarter(metric: string) {
  const historical = await fetchMetricHistory(metric, 180)  // 6 months

  // Prophet-style decomposition
  const trend = extractTrend(historical)
  const seasonality = extractSeasonality(historical)
  const holidays = detectHolidays(historical)

  // Forecast next 90 days
  const forecast = project(trend, seasonality, holidays, days: 90)

  return {
    forecast,
    confidence: { lower: forecast.p10, upper: forecast.p90 }
  }
}
```

**Insights Generated:**
- "At current pace, you'll achieve Elite tier in deployment frequency by Q2"
- "Lead time trending upward - consider pairing sessions to reduce bottlenecks"
- "Friday deployments have 2x failure rate vs weekday average"

#### 4. Root Cause Analysis

**Correlation Engine:**

```typescript
// lib/analytics/correlations.ts
export async function analyzeMetricCorrelations() {
  const correlations = await calculatePearsonCorrelation([
    ['deploymentFreq', 'leadTime'],
    ['leadTime', 'cfr'],
    ['focusTime', 'defectDensity'],
    ['meetingLoad', 'satisfaction'],
    // ...
  ])

  // Flag strong correlations (|r| > 0.7)
  const insights = correlations
    .filter(c => Math.abs(c.r) > 0.7)
    .map(c => generateInsight(c))

  return insights
}
```

**Example Insights:**
- "70% correlation between low focus time and increased defect density"
- "Teams with >4h meeting load show 15% lower satisfaction scores"
- "Cross-team collaboration positively correlated with deployment frequency (r=0.68)"

---

## Implementation Timeline

```
┌──────────────────────────────────────────────────────────────┐
│ Week 1 (Complete ✅)                                         │
│ • GitHub Actions workflow                                    │
│ • DORA database schema                                       │
│ • Basic dashboard components                                 │
│ • Performance tier calculation                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Week 2 (Complete ✅)                                         │
│ • SPACE database schema                                      │
│ • Satisfaction survey system                                 │
│ • Activity/collaboration tracking                            │
│ • Efficiency metrics (calendar integration)                  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Week 3 (In Progress 🚧)                                      │
│ • Anomaly detection ML model                                 │
│ • Alert configuration (Slack, Email, PagerDuty)              │
│ • Team comparison dashboard                                  │
│ • Correlation analysis engine                                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Week 4 (Planned 📋)                                          │
│ • Time series forecasting                                    │
│ • Automated insights generation                              │
│ • Performance optimization                                   │
│ • Documentation & training                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## Success Metrics

### Business Outcomes

| Metric | Baseline | Target (3mo) | Measurement |
|--------|----------|--------------|-------------|
| **Deployment Frequency** | Unknown | Daily | DORA dashboard |
| **Lead Time** | Unknown | <24h (Elite) | DORA dashboard |
| **Change Failure Rate** | Unknown | <15% (Elite) | DORA dashboard |
| **Developer Satisfaction** | N/A | >4.0/5.0 | Quarterly survey |
| **Dashboard Adoption** | 0% | 80% team | Weekly active users |

### Technical Metrics

- **Data Collection Reliability:** >99.5% uptime
- **Dashboard Load Time:** <2s (p95)
- **Alert Accuracy:** >80% actionable (not false positives)
- **Database Query Performance:** <100ms (p95)

---

## Deployment Guide

### Prerequisites

```bash
# 1. Supabase project setup
supabase login
supabase projects create roosevelt-ops

# 2. Run database migrations
supabase db push

# 3. Configure GitHub secrets
gh secret set SUPABASE_URL --body "https://xxx.supabase.co"
gh secret set SUPABASE_ANON_KEY --body "eyJhbGc..."
gh secret set SUPABASE_SERVICE_KEY --body "eyJhbGc..."

# 4. Deploy Next.js dashboard
vercel --prod

# 5. Verify workflows
gh workflow run dora-metrics.yml
```

### Smoke Tests

```bash
# Test DORA metrics collection
curl -X POST "$SUPABASE_URL/rest/v1/dora_metrics" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"event_type": "deployment", "repository": "test", "timestamp": "2026-02-05T10:00:00Z", "deployment_frequency": 1}'

# Verify dashboard rendering
curl https://roosevelt-ops.vercel.app/

# Check performance tier calculation
psql $DATABASE_URL -c "SELECT * FROM get_dora_performance_tier();"
```

---

## Troubleshooting

### Common Issues

#### 1. GitHub Actions Not Triggering

**Symptom:** No data appearing in `dora_metrics` table after deployments.

**Diagnosis:**
```bash
# Check workflow runs
gh run list --workflow=dora-metrics.yml

# View logs
gh run view <run-id> --log
```

**Solutions:**
- Verify `SUPABASE_SERVICE_KEY` has write permissions (not anon key)
- Check RLS policies allow service role inserts
- Ensure deployment events are properly tagged

#### 2. Performance Tier Showing "Unknown"

**Symptom:** Dashboard shows "Unknown" tier for all metrics.

**Diagnosis:**
```sql
-- Check if data exists
SELECT COUNT(*) FROM dora_metrics WHERE timestamp >= NOW() - INTERVAL '7 days';

-- Verify function returns data
SELECT * FROM get_dora_performance_tier(NULL, 7);
```

**Solutions:**
- Ensure minimum 7 days of data collection
- Refresh materialized view: `SELECT refresh_dora_summary();`
- Check function grants: `GRANT EXECUTE ON FUNCTION get_dora_performance_tier TO anon;`

#### 3. SPACE Metrics Missing

**Symptom:** SpaceScores component shows "No data available".

**Diagnosis:**
```sql
SELECT COUNT(*) FROM space_satisfaction;
SELECT COUNT(*) FROM space_activity;
```

**Solutions:**
- Run initial satisfaction survey: `npm run survey:send`
- Manually trigger activity tracking: `npm run space:collect`
- Verify GitHub token has `repo:read` scope

#### 4. Slow Dashboard Loading

**Symptom:** Dashboard takes >5s to load.

**Diagnosis:**
```sql
EXPLAIN ANALYZE
SELECT * FROM dora_summary ORDER BY date DESC LIMIT 30;
```

**Solutions:**
- Refresh materialized view during low-traffic hours
- Add indexes: `CREATE INDEX idx_dora_summary_date ON dora_summary(date DESC);`
- Implement dashboard caching (Next.js ISR with 60s revalidation)

---

## Security & Compliance

### Data Privacy

- **PII Handling:** No personally identifiable information stored (user IDs anonymized)
- **Survey Data:** Encrypted at rest, only aggregated scores exposed
- **Access Control:** RLS policies restrict write access to service role only
- **Retention:** Raw metrics retained 90 days, aggregates retained indefinitely

### Secrets Management

```bash
# Never commit secrets to git
echo ".env.local" >> .gitignore

# Use Vercel/GitHub Secrets for production
# Rotate API keys quarterly
```

### Compliance

- **GDPR:** Right to access (provide raw survey responses), right to deletion (anonymize user IDs)
- **SOC 2:** Audit trails via Supabase logs, encrypted connections (TLS 1.3)

---

## Maintenance Schedule

### Daily

- ✅ Automated: Materialized view refresh (1 AM UTC)
- ✅ Automated: Backup database snapshots (Supabase auto-backup)

### Weekly

- 🔄 Review alert accuracy (false positive rate)
- 🔄 Check data collection health (missing events)

### Monthly

- 📊 Review performance tier trends with team
- 🔄 Rotate API keys (GitHub, Supabase)
- 📈 Generate executive summary report

### Quarterly

- 📋 Conduct developer satisfaction survey
- 🔄 Review and update performance tier thresholds
- 📚 Update documentation with lessons learned

---

## Future Enhancements

### Phase 4: AI-Powered Recommendations (Q2 2026)

- **Automated Code Review Suggestions:** "PRs with >10 comments have 30% longer lead time. Consider pairing sessions."
- **Optimal Deployment Windows:** "Deploy Tuesday-Thursday 2-4 PM for lowest failure rate"
- **Team Balancing:** "Team A has 2x deployment frequency vs Team B - consider knowledge sharing"

### Phase 5: Integration Expansions (Q3 2026)

- **Jira Integration:** Link DORA metrics to sprint velocity
- **CircleCI/GitLab CI:** Support non-GitHub Actions pipelines
- **Linear/Asana:** Alternative project management integrations
- **Datadog/New Relic:** Combine with APM metrics

### Phase 6: Custom Metrics (Q4 2026)

- **Team-Specific KPIs:** Allow teams to define custom productivity metrics
- **Goal Tracking:** OKR integration with metrics dashboard
- **Cost Efficiency:** CI/CD cost per deployment, cloud spend per feature

---

## References

### DORA Research

- [State of DevOps Report 2023](https://cloud.google.com/devops/state-of-devops)
- [Accelerate: The Science of Lean Software and DevOps](https://itrevolution.com/product/accelerate/) (Forsgren, Humble, Kim)

### SPACE Framework

- [The SPACE of Developer Productivity](https://queue.acm.org/detail.cfm?id=3454124) (ACM Queue, 2021)
- [GitHub & Microsoft Research Paper](https://www.microsoft.com/en-us/research/publication/the-space-of-developer-productivity/)

### Implementation Guides

- [Supabase Materialized Views](https://supabase.com/docs/guides/database/postgres/materialized-views)
- [pg_cron for Scheduled Jobs](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [Tremor Charts Documentation](https://www.tremor.so/docs/visualizations/area-chart)
- [TensorFlow.js Time Series](https://www.tensorflow.org/js/tutorials/time-series)

---

## Appendix

### A. Database Schema ERD

```
┌───────────────────┐         ┌──────────────────┐
│  dora_metrics     │         │  incidents       │
├───────────────────┤         ├──────────────────┤
│ id (PK)           │         │ id (PK)          │
│ event_type        │         │ issue_number     │
│ repository        │         │ severity         │
│ timestamp         │         │ mttr_hours       │
│ deployment_freq   │         │ status           │
│ lead_time_hours   │         └──────────────────┘
│ deployment_failed │
└───────────────────┘
        │
        │ (aggregated into)
        ▼
┌───────────────────┐
│  dora_summary     │
│  (materialized)   │
├───────────────────┤
│ date              │
│ deployments       │
│ avg_lead_time     │
│ change_failure_   │
│ rate_pct          │
└───────────────────┘

┌──────────────────────┐    ┌──────────────────────┐
│ space_satisfaction   │    │ space_performance    │
├──────────────────────┤    ├──────────────────────┤
│ id (PK)              │    │ id (PK)              │
│ user_id (anon)       │    │ code_coverage_pct    │
│ nps_score            │    │ pr_review_depth      │
│ satisfaction_score   │    │ defect_density       │
└──────────────────────┘    └──────────────────────┘

┌──────────────────────┐    ┌──────────────────────┐
│ space_activity       │    │ space_collaboration  │
├──────────────────────┤    ├──────────────────────┤
│ id (PK)              │    │ id (PK)              │
│ user_id (anon)       │    │ user_id (anon)       │
│ commits_count        │    │ cross_team_prs       │
│ prs_created          │    │ pr_comments          │
└──────────────────────┘    └──────────────────────┘

┌──────────────────────┐
│ space_efficiency     │
├──────────────────────┤
│ id (PK)              │
│ user_id (anon)       │
│ focus_hours          │
│ meeting_hours        │
│ context_switches     │
└──────────────────────┘
```

### B. Sample Queries

```sql
-- Get last 30 days DORA summary
SELECT * FROM dora_summary
WHERE date >= CURRENT_DATE - 30
ORDER BY date DESC;

-- Calculate average MTTR for critical incidents
SELECT AVG(mttr_hours)
FROM incidents
WHERE severity = 'critical'
AND status = 'closed';

-- Top performers (anonymized)
SELECT user_id, AVG(commits_count) AS avg_commits
FROM space_activity
WHERE date >= CURRENT_DATE - 30
GROUP BY user_id
ORDER BY avg_commits DESC
LIMIT 10;

-- Correlation: Focus time vs defect density
SELECT
  CORR(focus_hours, defect_density) AS correlation
FROM space_efficiency e
JOIN space_performance p ON DATE_TRUNC('week', e.week_start) = DATE_TRUNC('week', p.date);
```

### C. Alert Configuration Templates

```yaml
# .github/workflows/metrics-alerts.yml
name: Metrics Alerts

on:
  schedule:
    - cron: '0 9 * * 1-5'  # Weekdays 9 AM

jobs:
  check-metrics:
    runs-on: ubuntu-latest
    steps:
      - name: Fetch DORA Metrics
        id: dora
        run: |
          curl "$SUPABASE_URL/rest/v1/rpc/get_dora_performance_tier" \
            -H "apikey: $SUPABASE_ANON_KEY" \
            -H "Content-Type: application/json" \
            -d '{"p_days": 7}' \
            > dora.json

      - name: Check Thresholds
        run: |
          LEAD_TIME=$(jq -r '.[] | select(.metric == "Lead Time") | .value' dora.json)
          if (( $(echo "$LEAD_TIME > 48" | bc -l) )); then
            echo "::warning::Lead time exceeds 48h: $LEAD_TIME"
            # Send Slack notification
            curl -X POST $SLACK_WEBHOOK \
              -d '{"text": "⚠️ Lead time alert: '"$LEAD_TIME"'h (threshold: 48h)"}'
          fi
```

---

**Document Version:** 1.0.0
**Last Updated:** 2026-02-05
**Next Review:** 2026-03-05
**Maintained By:** Roosevelt OPS Engineering Team
