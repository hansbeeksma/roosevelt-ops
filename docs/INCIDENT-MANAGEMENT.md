# Incident Management Process

Complete incident management workflow voor Roosevelt OPS met runbooks, postmortems, en blameless culture gebaseerd op Google SRE best practices.

---

## Table of Contents

1. [Overview](#overview)
2. [Incident Severity Levels](#incident-severity-levels)
3. [Incident Response Workflow](#incident-response-workflow)
4. [Runbooks](#runbooks)
5. [Escalation Paths](#escalation-paths)
6. [Postmortem Process](#postmortem-process)
7. [Blameless Culture](#blameless-culture)
8. [Tools & Integrations](#tools--integrations)

---

## Overview

### Philosophy

**Incidents are learning opportunities, not blame opportunities.**

Our incident management process focuses on:
- **Rapid detection** via observability stack (Sentry, Grafana Cloud)
- **Swift response** through clear runbooks and escalation paths
- **Continuous improvement** via blameless postmortems
- **Knowledge sharing** to prevent recurrence

### Key Principles

| Principle | Description |
|-----------|-------------|
| **Blameless** | Focus on systems, not individuals |
| **Transparent** | Share incidents and learnings openly |
| **Actionable** | Every postmortem has concrete action items |
| **Timely** | Postmortems within 48 hours of resolution |
| **Collaborative** | Cross-functional involvement |

---

## Incident Severity Levels

Classification system voor prioritering en response.

### SEV-1: Critical 🔴

**Definition**: Complete service outage or data loss.

**Examples**:
- Production website completely down
- Database corruption or data loss
- Security breach with data exposure
- Payment processing failure

**Response**:
- **Response Time**: Immediate (< 5 minutes)
- **Escalation**: Automatic page to on-call engineer
- **Communication**: Post to #incidents channel immediately
- **Postmortem**: Required within 24 hours

**SLA Impact**: Direct breach of customer SLA

---

### SEV-2: High Impact 🟠

**Definition**: Major functionality broken, workaround exists.

**Examples**:
- Core feature unavailable but site accessible
- Significant performance degradation (> 5s load time)
- Authentication issues affecting subset of users
- Critical API endpoint returning errors

**Response**:
- **Response Time**: < 15 minutes
- **Escalation**: Notify on-call engineer via Slack
- **Communication**: Update #incidents within 30 minutes
- **Postmortem**: Required within 48 hours

**SLA Impact**: Potential SLA breach if not resolved quickly

---

### SEV-3: Medium Impact 🟡

**Definition**: Degraded functionality, workaround available.

**Examples**:
- Non-critical feature broken
- Minor performance issues
- Logging/monitoring gaps
- Internal tool malfunction

**Response**:
- **Response Time**: < 2 hours
- **Escalation**: Create Plane issue, notify team lead
- **Communication**: Log in #dev-team channel
- **Postmortem**: Optional (recommended for recurring issues)

**SLA Impact**: No immediate SLA risk

---

### SEV-4: Low Impact 🟢

**Definition**: Cosmetic issue or minor bug.

**Examples**:
- UI styling issues
- Typos in documentation
- Minor logging improvements
- Non-urgent feature requests

**Response**:
- **Response Time**: Best effort (< 1 week)
- **Escalation**: Add to backlog
- **Communication**: Normal workflow
- **Postmortem**: Not required

**SLA Impact**: None

---

## Incident Response Workflow

### Phase 1: Detection

**Automated Alerts** (via Observability Stack):
- Sentry error alerts → #alerts channel
- Grafana Cloud threshold breaches → PagerDuty
- Vercel deployment failures → Slack integration
- Uptime monitoring → BetterStack

**Manual Reports**:
- Customer support tickets
- Internal team observations
- Social media mentions

**Action**: When alert fires or report received → Triage severity

---

### Phase 2: Triage

**Decision Tree**:

```
Alert received
    ↓
Is service down or data at risk?
    ├─ YES → SEV-1 (Page on-call immediately)
    └─ NO → Assess functionality impact
              ↓
        Core feature broken?
            ├─ YES → SEV-2 (Notify on-call via Slack)
            └─ NO → Degraded but usable?
                      ├─ YES → SEV-3 (Create issue)
                      └─ NO → SEV-4 (Add to backlog)
```

**Triage Checklist**:
- [ ] Confirm incident is real (not false positive)
- [ ] Assess customer impact (how many affected?)
- [ ] Check recent deployments (was there a change?)
- [ ] Assign severity level
- [ ] Notify appropriate channels

---

### Phase 3: Response

**Incident Commander Role** (for SEV-1/SEV-2):
- **Primary**: On-call engineer who received alert
- **Backup**: Team lead if primary unavailable
- **Responsibilities**:
  - Coordinate response efforts
  - Make rollback/hotfix decisions
  - Communicate status updates
  - Declare incident resolved

**Response Actions** (by severity):

**SEV-1**:
1. **Immediate** (< 5 min):
   - Declare incident in #incidents: `/incident start SEV-1 [description]`
   - Page on-call engineer via PagerDuty
   - Start incident timeline in Plane
2. **Within 15 min**:
   - Identify root cause (check logs, metrics, recent deploys)
   - Attempt mitigation (rollback, kill switch, failover)
   - Post status update to #incidents
3. **Within 30 min**:
   - Update status page (if customer-facing)
   - Escalate if not making progress
4. **Resolution**:
   - Verify fix with monitoring
   - Announce resolution in #incidents
   - Schedule postmortem meeting

**SEV-2**:
1. Create Plane incident issue
2. Notify team in #incidents
3. Investigate and mitigate within 2 hours
4. Update stakeholders on progress

**SEV-3/4**:
1. Create Plane issue with appropriate labels
2. Prioritize in backlog
3. Assign to next sprint

---

### Phase 4: Communication

**Internal Communication** (Slack):

**#incidents channel** (for SEV-1/SEV-2):
```
🔴 SEV-1: Production website down
Detected: 2026-02-05 14:23 UTC
Commander: @sam
Status: Investigating
Impact: All users unable to access site
Timeline: Started Plane issue ROOSE-XXX

Updates:
14:25 - Identified: Database connection pool exhausted
14:28 - Mitigation: Restarted database connections
14:30 - Resolution: Service restored, monitoring for stability
```

**External Communication** (Status Page):

For customer-facing incidents (SEV-1/SEV-2):
1. **Initial**: "We're investigating reports of [issue]"
2. **Update** (every 30 min): Progress report
3. **Resolution**: "Issue resolved. Root cause: [brief]. We apologize for the disruption."
4. **Postmortem**: Link to full postmortem (if public)

---

### Phase 5: Resolution

**Verification Checklist**:
- [ ] Root cause identified and documented
- [ ] Fix deployed and verified in monitoring
- [ ] No recurring errors for 30 minutes
- [ ] Customer impact resolved
- [ ] Status page updated to "Resolved"
- [ ] Incident timeline complete in Plane

**Close Incident**:
1. Post resolution message to #incidents
2. Update Plane issue to "Done"
3. Thank responders
4. Schedule postmortem (if required)

---

## Runbooks

Runbooks zijn stap-voor-stap procedures voor veelvoorkomende incidents.

### Runbook Structure

**Template**: `docs/runbooks/[service]-[scenario].md`

```markdown
# Runbook: [Service] - [Scenario]

**Last Updated**: YYYY-MM-DD
**Owner**: [Team/Person]
**Severity**: SEV-X

## Symptoms
- [Observable symptoms]
- [Monitoring alerts]

## Diagnosis
1. Check [logs/metrics]
2. Verify [dependencies]
3. Identify [root cause]

## Mitigation
1. [Step 1 with exact commands]
2. [Step 2 with verification]
3. [Rollback if needed]

## Prevention
- [Long-term fixes]
- [Monitoring improvements]
```

### Example Runbooks (To Be Created)

| Runbook | Scenario | Priority |
|---------|----------|----------|
| `vercel-deployment-failed.md` | Deployment rollback | High |
| `supabase-connection-pool.md` | Database connection exhaustion | High |
| `rate-limit-exceeded.md` | API rate limiting | Medium |
| `sentry-alert-storm.md` | Error alert fatigue | Medium |
| `disk-space-full.md` | Storage capacity issues | Low |

**Location**: `/docs/runbooks/`

---

## Escalation Paths

### Primary On-Call Rotation

**Schedule**: 1-week rotations, 24/7 coverage

| Week | Primary | Backup |
|------|---------|--------|
| Current | Sam Swaab | TBD |

**Responsibilities**:
- Monitor #alerts channel
- Respond to PagerDuty pages within 5 minutes
- Lead incident response for SEV-1/SEV-2
- Update #incidents with progress

---

### Escalation Ladder

**Level 1: On-Call Engineer** (0-15 min)
- First responder to all incidents
- Authority to rollback deployments
- Declares incident severity

**Level 2: Team Lead** (15-30 min)
- Escalate if on-call unavailable or no progress
- Provides technical guidance
- Coordinates additional resources

**Level 3: CTO / Founder** (30-60 min)
- Escalate for customer-facing SEV-1 incidents
- Makes business decisions (e.g., public statements)
- Engages external vendors if needed

**Level 4: External Vendors** (60+ min)
- Vercel support (for platform issues)
- Supabase support (for database issues)
- Third-party service providers

---

### Contact Information

**Internal**:
| Role | Name | Slack | Phone | Email |
|------|------|-------|-------|-------|
| Primary On-Call | Sam Swaab | @sam | +31 X XXX XXXX | sam@rooseveltops.com |
| Team Lead | TBD | TBD | TBD | TBD |

**External**:
| Vendor | Support Channel | SLA | Priority |
|--------|----------------|-----|----------|
| Vercel | [Support Portal](https://vercel.com/support) | 1-hour response (Pro) | High |
| Supabase | [Support](https://supabase.com/support) | Email | High |
| Sentry | [Status](https://status.sentry.io/) | Self-service | Medium |

---

## Postmortem Process

### Purpose

**NOT** to assign blame, but to:
- Understand what happened and why
- Identify systemic improvements
- Share learnings across the team
- Prevent similar incidents

---

### Blameless Culture Principles

| ❌ Blame-Focused | ✅ System-Focused |
|------------------|-------------------|
| "Who caused this?" | "Why did the system allow this?" |
| "You deployed the bug" | "How can we improve testing?" |
| "You should have known" | "What context was missing?" |

**Key Tenets**:
1. **Assume good intentions** - Everyone was doing their best with available information
2. **Focus on systems** - Bugs are inevitable, gaps in process/tooling are fixable
3. **No punishment** - Psychological safety encourages honest discussion
4. **Learn and iterate** - Every incident makes us stronger

---

### Postmortem Timeline

| Event | Timing | Owner |
|-------|--------|-------|
| **Incident Resolved** | T+0 | Incident Commander |
| **Postmortem Draft** | T+24h | Incident Commander |
| **Review Meeting** | T+48h | All responders + stakeholders |
| **Action Items Assigned** | During meeting | Team Lead |
| **Postmortem Published** | T+72h | Incident Commander |
| **Action Item Follow-Up** | Weekly | Project Manager |

---

### Postmortem Template

**Location**: `docs/postmortems/YYYY-MM-DD-[incident-title].md`

```markdown
# Postmortem: [Incident Title]

**Date**: YYYY-MM-DD
**Severity**: SEV-X
**Duration**: X hours Y minutes
**Incident Commander**: [Name]
**Responders**: [Names]

---

## Executive Summary

[2-3 sentences: What happened, impact, resolution]

---

## Impact

**Users Affected**: X users / Y% of user base
**Revenue Impact**: $Z or N/A
**Duration**: From HH:MM to HH:MM UTC
**Data Loss**: Yes/No (details)

---

## Timeline

All times in UTC.

| Time | Event |
|------|-------|
| 14:23 | Alert fired: High error rate detected |
| 14:25 | On-call engineer paged |
| 14:28 | Root cause identified: Database connection pool exhausted |
| 14:30 | Mitigation applied: Restarted connections |
| 14:32 | Service restored |
| 14:45 | Confirmed stable for 15 minutes |
| 15:00 | Incident closed |

---

## Root Cause Analysis (5 Whys)

**Problem**: Production website became unresponsive.

1. **Why?** Database queries were timing out.
2. **Why?** Connection pool was exhausted.
3. **Why?** New feature introduced long-running query without pagination.
4. **Why?** No query performance testing in staging.
5. **Why?** Lack of load testing in CI/CD pipeline.

**Root Cause**: Missing load testing allowed inefficient query to reach production.

---

## What Went Well

- ✅ Alert fired within 2 minutes of issue start
- ✅ On-call responded within 5 minutes (met SLA)
- ✅ Root cause identified quickly via Grafana query logs
- ✅ Mitigation was straightforward (connection restart)
- ✅ No data loss

---

## What Didn't Go Well

- ❌ Issue was introduced despite code review
- ❌ Staging environment didn't catch performance issue
- ❌ No automated rollback triggered
- ❌ Status page update delayed (no automation)

---

## Action Items

| # | Action | Owner | Due Date | Plane Issue |
|---|--------|-------|----------|-------------|
| 1 | Add query performance testing to CI | @sam | 2026-02-12 | ROOSE-XXX |
| 2 | Implement automatic rollback on error spike | @devops | 2026-02-15 | ROOSE-XXX |
| 3 | Automate status page updates from Sentry | @sam | 2026-02-20 | ROOSE-XXX |
| 4 | Document query optimization best practices | @backend | 2026-02-10 | ROOSE-XXX |

---

## Lessons Learned

1. **Performance testing is critical**: Load testing must be mandatory before production.
2. **Staging should mirror production**: Connection pool limits should match.
3. **Automation reduces MTTR**: Status page updates should be automatic.

---

## Follow-Up

- **Weekly check-ins**: Track action item progress in standup
- **Review in 1 month**: Verify improvements are effective
- **Share with team**: Present learnings in next all-hands

---

**Postmortem Owner**: [Name]
**Published**: YYYY-MM-DD
**Related Incidents**: [Links to similar past incidents]
```

---

## Postmortem Meeting Format

**Duration**: 1 hour maximum

**Attendees**:
- Incident commander (facilitator)
- All responders
- Product/business stakeholders
- Optional: Broader engineering team

**Agenda**:

1. **Review draft** (20 min)
   - Incident commander presents timeline
   - Confirm accuracy of events

2. **Discussion** (30 min)
   - What went well / didn't go well
   - Root cause analysis
   - Brainstorm improvements

3. **Action items** (10 min)
   - Assign owners and due dates
   - Create Plane issues for each action
   - Commit to follow-up cadence

**Ground Rules**:
- No blame or finger-pointing
- Focus on systems and processes
- All ideas welcome (no judgment)
- Actionable outcomes required

---

## Quarterly Incident Review

**Purpose**: Identify patterns and prioritize systemic improvements.

**Cadence**: Last week of each quarter

**Agenda**:

1. **Incident Statistics** (15 min)
   - Total incidents by severity
   - MTTR trends
   - Most common root causes

2. **Pattern Analysis** (30 min)
   - Recurring failure modes
   - Teams/services with most incidents
   - Effectiveness of previous action items

3. **Strategic Improvements** (30 min)
   - Infrastructure investments needed
   - Process improvements
   - Team training priorities

4. **Retrospective** (15 min)
   - What's working in incident process
   - What needs improvement

**Output**: Quarterly OKRs for reliability improvements

---

## Tools & Integrations

### Current Stack

| Tool | Purpose | Integration |
|------|---------|-------------|
| **Sentry** | Error tracking | Slack alerts → #alerts |
| **Grafana Cloud** | Metrics & traces | PagerDuty integration |
| **BetterStack** | Uptime monitoring | Slack notifications |
| **Vercel** | Deployment alerts | Native Slack app |
| **Slack** | Communication hub | #incidents, #alerts channels |
| **Plane** | Incident tracking | Manual issue creation |

### Planned Integrations (Phase 2)

| Tool | Purpose | Status |
|------|---------|--------|
| **PagerDuty** | On-call rotation & paging | To implement |
| **Status Page** | Customer communication | To implement |
| **Incident Bot** | Slack `/incident` commands | To implement |

---

## Metrics & KPIs

Track incident management effectiveness:

| Metric | Target | Measurement |
|--------|--------|-------------|
| **MTTR (Mean Time To Recover)** | < 30 min (SEV-1) | Incident timeline |
| **MTTD (Mean Time To Detect)** | < 5 min | Alert timestamp |
| **Postmortem Completion Rate** | 100% (SEV-1/2) | Postmortems published / incidents |
| **Action Item Completion** | > 80% within due date | Plane issue tracking |
| **Incident Recurrence** | < 10% | Same root cause count |

**Dashboard**: Track in Plane custom view (to be created)

---

## References

- [Google SRE Book - Incident Response](https://sre.google/sre-book/managing-incidents/)
- [Atlassian Incident Management Handbook](https://www.atlassian.com/incident-management)
- [PagerDuty Incident Response Guide](https://response.pagerduty.com/)
- [Blameless Postmortems (Etsy)](https://www.etsy.com/codeascraft/blameless-postmortems/)

**Related Documentation**:
- `docs/MONITORING.md` - Sentry error tracking setup
- `docs/OBSERVABILITY.md` - Grafana Cloud observability stack
- `docs/runbooks/` - Service-specific runbooks

---

*Last Updated: 2026-02-05*
*Version: 1.0.0*
*Owner: DevOps Team*
