# Postmortem Template

**Copy this template for all SEV-1 and SEV-2 incidents**

---

# Postmortem: [Incident Title]

**Date**: YYYY-MM-DD
**Severity**: SEV-X
**Duration**: X hours Y minutes
**Incident Commander**: [Name]
**Responders**: [Names]
**Status**: Draft / Final

---

## Executive Summary

[2-3 sentences describing:
- What happened
- Customer impact
- How it was resolved]

**Example**:
> On February 5, 2026, the production website experienced complete downtime for 37 minutes affecting all users. The root cause was database connection pool exhaustion triggered by an unoptimized query introduced in the morning deployment. The issue was resolved by restarting database connections and rolling back the problematic deployment.

---

## Impact Assessment

### Users Affected
- **Count**: X users (Y% of active users)
- **Geographic distribution**: [Regions affected]
- **User segments**: [Which customer tiers/types]

### Service Impact
- **Availability**: X% downtime
- **Degradation**: [Which features affected]
- **Data integrity**: [Any data loss or corruption]

### Business Impact
- **Revenue**: $Z lost or N/A
- **Customer support tickets**: X tickets filed
- **SLA breach**: Yes/No (detail if yes)
- **Reputation**: [Social media mentions, press coverage]

### Duration
- **Detection**: YYYY-MM-DD HH:MM UTC
- **Resolution**: YYYY-MM-DD HH:MM UTC
- **Total duration**: X hours Y minutes

---

## Incident Timeline

**All times in UTC. Use precise timestamps.**

| Time | Event | Actor |
|------|-------|-------|
| 14:23:12 | Alert fired: High error rate detected | Sentry |
| 14:23:45 | On-call engineer paged | PagerDuty |
| 14:25:30 | @engineer acknowledged alert, began investigation | Sam |
| 14:26:15 | Incident declared in #incidents (SEV-2) | Sam |
| 14:28:00 | Root cause identified: Database connection pool exhausted | Sam |
| 14:28:45 | Mitigation started: Restart database connections | Sam |
| 14:30:12 | Service partially restored (error rate 50% → 10%) | System |
| 14:32:30 | Decision made to rollback deployment | Sam |
| 14:35:00 | Rollback deployed | Vercel |
| 14:36:20 | Service fully restored (error rate < 1%) | System |
| 14:45:00 | Monitoring confirms stability for 10 minutes | Sam |
| 15:00:00 | Incident closed, postmortem scheduled | Sam |

**Key Milestones**:
- **Detection to acknowledgment**: 33 seconds ✅ (target < 5 min)
- **Acknowledgment to mitigation start**: 3 minutes 15 seconds ✅
- **Total incident duration**: 37 minutes (target < 30 min for SEV-2) ❌

---

## Root Cause Analysis

### The 5 Whys Method

**Start with the problem statement**:
[e.g., "Production website became unresponsive at 14:23 UTC"]

1. **Why did the website become unresponsive?**
   - Database queries were timing out.

2. **Why were database queries timing out?**
   - The connection pool was exhausted (all 20 connections in use).

3. **Why was the connection pool exhausted?**
   - A new feature introduced a long-running query without pagination.

4. **Why did the long-running query reach production?**
   - Performance testing was not part of the deployment checklist.

5. **Why is performance testing not part of the checklist?**
   - No formal process exists for load testing new features.

**Root Cause**: **Lack of mandatory performance testing** allowed an inefficient query to reach production, exhausting database connections under load.

---

### Contributing Factors

Additional factors that worsened or enabled the incident:

1. **Staging environment gap**: Connection pool size in staging (5) did not match production (20), so issue wasn't caught
2. **Missing monitoring**: No alert for connection pool saturation
3. **Deployment timing**: Deployed during peak traffic (2 PM local time)
4. **Code review gap**: Reviewer approved PR without testing query performance

---

## What Went Well ✅

**Things that worked as intended during this incident**:

1. **Alert fired quickly**: Sentry detected error spike within 90 seconds of issue start
2. **Fast response**: On-call engineer acknowledged within 5-minute SLA
3. **Clear runbooks**: Database connection restart procedure was documented
4. **Effective communication**: Incident commander kept #incidents updated every 5 minutes
5. **No data loss**: All transactions were properly rolled back or completed
6. **Quick rollback**: Vercel rollback procedure worked smoothly

---

## What Didn't Go Well ❌

**Things that failed or could have been better**:

1. **Issue reached production**: Unoptimized query bypassed all quality gates
2. **Staging environment mismatch**: Connection pool size difference hid the issue
3. **No automatic rollback**: Error spike did not trigger automatic rollback (feature doesn't exist)
4. **Delayed status page update**: External communication took 15 minutes (manual process)
5. **Code review gap**: PR approved without performance considerations
6. **Missing alerts**: No proactive alert for connection pool saturation

---

## Action Items

**All action items must have owner, due date, and tracked in Plane.**

| Priority | Action Item | Owner | Due Date | Plane Issue | Status |
|----------|-------------|-------|----------|-------------|--------|
| 🔴 P0 | Add query performance testing to CI/CD pipeline | @backend-lead | 2026-02-12 | ROOSE-XXX | Open |
| 🔴 P0 | Implement automatic rollback on error rate spike > 10% | @devops | 2026-02-15 | ROOSE-XXX | Open |
| 🟠 P1 | Add connection pool saturation alert (> 80% usage) | @devops | 2026-02-10 | ROOSE-XXX | Open |
| 🟠 P1 | Align staging connection pool size with production | @devops | 2026-02-08 | ROOSE-XXX | Open |
| 🟡 P2 | Automate status page updates from Sentry alerts | @backend | 2026-02-20 | ROOSE-XXX | Open |
| 🟡 P2 | Document query optimization best practices | @backend | 2026-02-10 | ROOSE-XXX | Open |
| 🟢 P3 | Add "Performance Impact" section to PR template | @pm | 2026-02-28 | ROOSE-XXX | Open |

**Completion tracking**: Review action items weekly in standup until all are complete.

---

## Lessons Learned

### Process Improvements

1. **Performance testing is critical**
   - Learning: Unoptimized queries can cause catastrophic failures under load
   - Action: Make load testing mandatory for database-heavy features

2. **Staging must mirror production**
   - Learning: Configuration mismatches hide real-world issues
   - Action: Audit all staging vs production configuration differences

3. **Automation reduces MTTR**
   - Learning: Manual status page updates added 15 minutes to response time
   - Action: Integrate Sentry with status page for automatic updates

### Technical Improvements

1. **Query optimization checklist**
   - Always paginate large result sets
   - Use EXPLAIN ANALYZE for complex queries
   - Add database indexes for common filters
   - Test with production-scale data

2. **Database monitoring enhancements**
   - Alert on connection pool > 80% usage
   - Track slow query log and alert on queries > 1s
   - Monitor connection lifetime and leak detection

### Cultural Improvements

1. **Blameless approach worked**
   - Team felt safe sharing mistakes in postmortem
   - Focus on systems led to actionable improvements

2. **Documentation value**
   - Having runbooks available saved 5-10 minutes of diagnostic time
   - Clear escalation paths prevented confusion

---

## Follow-Up Plan

### Immediate (Week 1)
- [ ] Complete P0 action items
- [ ] Share postmortem with entire engineering team
- [ ] Present learnings in Friday all-hands

### Short-term (Month 1)
- [ ] Complete all P1 action items
- [ ] Review similar past incidents for patterns
- [ ] Update deployment checklist with new requirements

### Long-term (Quarter)
- [ ] Complete all P2 action items
- [ ] Include case study in onboarding materials
- [ ] Measure effectiveness of improvements (has incident recurred?)

### Quarterly Review
- **Date**: 2026-05-05
- **Agenda**: Review action item effectiveness, measure impact on MTTR

---

## Related Incidents

**Similar past incidents** (for pattern analysis):

| Date | Incident | Relation | Outcome |
|------|----------|----------|---------|
| 2026-01-20 | Database timeout | Same root cause | Similar action items |
| 2025-12-10 | Staging mismatch | Contributing factor | Staging audit |

**Pattern identified**: Database performance issues are recurring theme → prioritize P0 action items.

---

## Appendix

### Useful Links
- Incident Plane issue: [ROOSE-XXX](link)
- Sentry error group: [Link](link)
- Grafana dashboard: [Link](link)
- GitHub PR that introduced issue: [#123](link)
- Slack thread: [#incidents link](link)

### Metrics Snapshot
- Error rate before: 0.2%
- Error rate during: 47%
- Error rate after: 0.1%
- Response time P95 before: 250ms
- Response time P95 during: Timeout (30s)
- Response time P95 after: 230ms

### Code Changes
```diff
# The problematic query (before)
- const users = await db.users.findMany()
+ const users = await db.users.findMany({ take: 100 })

# Added pagination
```

---

## Sign-Off

**Postmortem Owner**: [Name]
**Reviewed By**: [Names of reviewers]
**Published Date**: YYYY-MM-DD
**Next Review**: YYYY-MM-DD (1 month after incident)

---

**Visibility**: Internal / Public
**Distribution**: Engineering team / All company / Customers

---

## Feedback

**How can we improve our postmortem process?**

[Space for team feedback after postmortem review meeting]

---

*Template Version: 1.0.0*
*Last Updated: 2026-02-05*
