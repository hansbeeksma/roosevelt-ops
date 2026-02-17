# SPACE Metrics Definitions

> **Status**: Active
> **Version**: 1.0.0
> **Last Updated**: 2026-02-17
> **Related Issues**: ROOSE-62, ROOSE-29
> **Framework**: [The SPACE of Developer Productivity](https://queue.acm.org/detail.cfm?id=3454124)

---

## Overview

SPACE is a framework for measuring developer productivity across five dimensions:
**S**atisfaction, **P**erformance, **A**ctivity, **C**ommunication, **E**fficiency.

This document defines the concrete metrics collected for Roosevelt OPS, their data sources, collection frequency, and how to interpret them.

---

## Metric Definitions

### S - Satisfaction

| Metric | Definition | Data Source | Collection | Target |
|--------|-----------|-------------|------------|--------|
| **Developer NPS** | Net Promoter Score: % promoters (9-10) minus % detractors (0-6) | Quarterly survey | Quarterly | > +30 |
| **Satisfaction Score** | Average rating on 1-5 Likert scale | Quarterly survey | Quarterly | >= 4.0 |
| **Tool Satisfaction** | "Our development tools enable me to be productive" | Quarterly survey | Quarterly | >= 4.0 |
| **Work-Life Balance** | "I can maintain healthy work-life balance" | Quarterly survey | Quarterly | >= 3.5 |

**Survey tool**: Google Forms -> Supabase `space_satisfaction` table
**How to interpret**: Negative NPS or satisfaction < 3.0 indicates burnout risk. Schedule 1-on-1s.

### P - Performance

| Metric | Definition | Data Source | Collection | Target |
|--------|-----------|-------------|------------|--------|
| **PR Throughput** | Number of PRs merged per week across all repos | GitHub API | Weekly (Monday 3AM) | >= 5/week |
| **PR Review Depth** | Average number of review comments per PR | GitHub API | Weekly | >= 2 comments |
| **Code Coverage** | Percentage of code covered by tests | CI pipeline | Per PR | >= 80% |

**Data pipeline**: GitHub Actions workflow -> Supabase `space_performance` table
**How to interpret**: Low throughput with high activity signals blockers. Low review depth may indicate rubber-stamping.

### A - Activity (Counter-Metric)

| Metric | Definition | Data Source | Collection | Target |
|--------|-----------|-------------|------------|--------|
| **Commit Count** | Total commits across all repos | GitHub API | Weekly | 50-150/week |
| **PRs Created** | New pull requests opened | GitHub API | Weekly | Informational |
| **Code Churn** | Lines added + lines deleted | GitHub API | Weekly | Informational |

**WARNING**: Activity is a **counter-metric**. High activity does NOT mean high productivity. Extreme values (very high or very low) warrant investigation.

**Data pipeline**: GitHub Actions workflow -> Supabase `space_activity` table
**How to interpret**:
- Very high commits + low merged PRs = thrashing or WIP overload
- Very low activity = blockers, context switching, or meeting overload
- High churn (add/delete ratio near 1:1) = rework

### C - Communication & Collaboration

| Metric | Definition | Data Source | Collection | Target |
|--------|-----------|-------------|------------|--------|
| **PR Review Turnaround** | Time from PR creation to first review | GitHub API | Weekly | < 4 hours |
| **Reviews Given** | Number of code reviews completed | GitHub API | Weekly | Informational |
| **Cross-Repo PRs** | PRs that reference or affect multiple repos | GitHub API | Weekly | Informational |

**Data pipeline**: GitHub Actions workflow -> Supabase `space_collaboration` table
**How to interpret**: Review turnaround > 24h indicates bottleneck. Consider pairing sessions or reviewer rotation.

### E - Efficiency & Flow

| Metric | Definition | Data Source | Collection | Target |
|--------|-----------|-------------|------------|--------|
| **Focus Time %** | Percentage of work hours in uninterrupted blocks (>= 2h) | Google Calendar API | Weekly | >= 70% |
| **Meeting Load** | Average meeting hours per week | Google Calendar API | Weekly | < 8h/week |
| **Context Switches** | Number of task/context switches per day | Calendar + Activity | Weekly | < 5/day |
| **CI Build Time** | P95 CI pipeline duration | GitHub Actions API | Per build | < 10 min |

**Data pipeline**: Google Calendar API + GitHub Actions -> Supabase `space_efficiency` table
**How to interpret**: Focus time < 50% strongly correlates with lower code quality and higher defect density.

---

## Data Collection Architecture

```
                     Weekly (Monday 3AM UTC)
                            |
                            v
+-----------+    +---------------------+    +-----------+
| GitHub    | -> | space-metrics.yml   | -> | Supabase  |
| API       |    | (GitHub Actions)    |    | PostgreSQL|
+-----------+    +---------------------+    +-----------+
                            |                     |
+-----------+    +---------------------+    +-----------+
| Google    | -> | Manual / Cron       | -> | Metabase  |
| Calendar  |    | (collect-*.sh)      |    | Dashboard |
+-----------+    +---------------------+    +-----------+
                            |
+-----------+    +---------------------+
| Survey    | -> | Quarterly manual    |
| (Forms)   |    | import              |
+-----------+    +---------------------+
```

### Collection Schedule

| Frequency | Metrics | Trigger |
|-----------|---------|---------|
| **Per event** | DORA deployment, lead time, failure rate | `dora-metrics.yml` (on push/PR merge) |
| **Weekly** | Performance, Activity, Communication | `space-metrics.yml` (Monday 3AM) |
| **Weekly** | Efficiency (focus time, meetings) | Manual or cron (Google Calendar API) |
| **Quarterly** | Satisfaction (NPS, survey) | Manual survey distribution |

---

## Supabase Tables

| Table | Dimension | Key Columns |
|-------|-----------|-------------|
| `space_satisfaction` | Satisfaction | nps_score, satisfaction_score, survey_date |
| `space_performance` | Performance | prs_merged, pr_review_depth, code_coverage_pct |
| `space_activity` | Activity | commits_count, prs_created, code_additions, code_deletions |
| `space_collaboration` | Communication | avg_review_turnaround_hours, code_reviews_given, pr_comments |
| `space_efficiency` | Efficiency | focus_hours, meeting_hours, context_switches, deep_work_pct |

---

## Metabase Dashboard Layout

Import queries from `metabase-queries.sql` as saved questions, then arrange:

### Row 1: DORA Metrics (4 panels)
1. Deployment Frequency (bar chart, 30 days)
2. Lead Time for Changes (line chart, 30 days)
3. Change Failure Rate (gauge, 30 days)
4. MTTR (number with trend, 90 days)

### Row 2: SPACE Scorecard
5. Combined SPACE summary table (all 5 dimensions)

### Row 3: SPACE Details (3 panels)
6. PR Throughput trend (area chart, 90 days)
7. Code Activity volume (stacked bar, 90 days)
8. PR Review Turnaround (line chart, 90 days)

### Row 4: Insights
9. Focus Time vs Meeting Load (dual axis, 90 days)
10. Cross-metric correlation (scatter plot, 180 days)

---

## Repositories Tracked

| Repository | Type | Active |
|------------|------|--------|
| `hansbeeksma/roosevelt-ops` | Platform | Yes |
| `hansbeeksma/vino12` | Product | Yes |
| `hansbeeksma/h2ww-platform` | Product | Yes |
| `hansbeeksma/vetteshirts` | Product | Yes |

To add a repository: Update the `REPOS` variable in `space-metrics.yml` and `collect-github-metrics.sh`.

---

## Thresholds & Alerts

| Metric | Green | Yellow | Red | Alert Channel |
|--------|-------|--------|-----|---------------|
| NPS | >= +30 | 0 to +30 | < 0 | Slack #leadership |
| PR Throughput | >= 10/week | 5-10/week | < 5/week | Slack #engineering |
| Review Turnaround | < 4h | 4-24h | > 24h | Slack #engineering |
| Focus Time | >= 70% | 50-70% | < 50% | Slack #engineering |
| CI Build Time | < 5 min | 5-15 min | > 15 min | Slack #platform |

---

## Files Reference

| File | Purpose |
|------|---------|
| `scripts/space-metrics/collect-github-metrics.sh` | Local data collection script |
| `scripts/space-metrics/metabase-queries.sql` | Metabase dashboard SQL queries |
| `.github/workflows/space-metrics.yml` | Automated weekly collection |
| `.github/workflows/dora-metrics.yml` | DORA event-based collection |
| `docs/DORA-SPACE-METRICS.md` | Full framework documentation |
| `docs/METRICS-IMPLEMENTATION-PLAN.md` | Implementation roadmap |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-17 | Initial metrics definitions (ROOSE-62) |
