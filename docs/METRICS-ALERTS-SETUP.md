# Metrics Alerting Configuration Guide

**Project:** Roosevelt OPS
**Epic:** ROOSE-29 - Engineering Metrics
**Purpose:** Configure intelligent alerts for DORA + SPACE metrics
**Last Updated:** 2026-02-06

---

## Overview

Dit document beschrijft de complete alert configuratie voor engineering metrics monitoring. Het doel is om proactief problemen te detecteren en teams tijdig te waarschuwen zonder alert fatigue te veroorzaken.

**Key Principles:**
- **Actionable Alerts Only:** Elke alert moet een concrete actie triggeren
- **Tiered Severity:** Kritische alerts → PagerDuty, Medium → Slack, Low → Dashboard
- **Smart Thresholds:** Dynamische grenzen gebaseerd op historische data
- **Correlation:** Groepeer gerelateerde alerts (binnen 5-min window)
- **Cooldown Periods:** Minimaal 1h tussen identieke alerts

---

## Alert Categories

### 1. DORA Metrics Alerts

#### 1.1 Deployment Frequency

**Alert:** Low Deployment Frequency

**Trigger:**
```typescript
// lib/alerts/deployment-frequency.ts
export async function checkDeploymentFrequency() {
  const thisWeek = await getDeploymentsThisWeek()
  const lastWeek = await getDeploymentsLastWeek()
  const baseline = await getAverageDeploymentsPerWeek(30) // 30-day baseline

  // Alert if >50% drop week-over-week
  if (thisWeek < lastWeek * 0.5) {
    return {
      severity: 'MEDIUM',
      message: `Deployment frequency dropped ${((1 - thisWeek/lastWeek) * 100).toFixed(0)}% this week`,
      action: 'Investigate blockers in deployment pipeline',
      data: { thisWeek, lastWeek, baseline }
    }
  }

  // Alert if below 50% of baseline
  if (thisWeek < baseline * 0.5) {
    return {
      severity: 'HIGH',
      message: `Deployment frequency at ${(thisWeek/baseline * 100).toFixed(0)}% of baseline`,
      action: 'Review sprint planning and capacity',
      data: { thisWeek, baseline }
    }
  }

  return null
}
```

**Notification:**
- **Severity:** MEDIUM → Slack `#engineering-metrics`
- **Severity:** HIGH → Slack + Email to engineering leads
- **Cooldown:** 24 hours
- **Dashboard:** Orange badge on metric card

**Example Message:**
```
⚠️ Deployment Frequency Alert

📉 Deployments dropped 65% this week (3 vs 8.5 avg)

Possible causes:
• Sprint planning gap
• CI/CD pipeline issues
• Team capacity constraints

Action: Review blockers in daily standup
```

---

#### 1.2 Lead Time Spike

**Alert:** Lead Time Exceeds Threshold

**Trigger:**
```typescript
export async function checkLeadTime() {
  const currentLeadTime = await getAverageLeadTime(7) // Last 7 days
  const baseline = await getAverageLeadTime(30)
  const p95Baseline = await getPercentileLeadTime(95, 30)

  // Alert if current avg > 2x baseline
  if (currentLeadTime > baseline * 2) {
    return {
      severity: 'HIGH',
      message: `Lead time ${(currentLeadTime/baseline).toFixed(1)}x baseline (${currentLeadTime.toFixed(1)}h vs ${baseline.toFixed(1)}h)`,
      action: 'Review PR queue and code review bandwidth',
      data: { current: currentLeadTime, baseline, p95: p95Baseline }
    }
  }

  // Alert if current avg > p95 baseline
  if (currentLeadTime > p95Baseline) {
    return {
      severity: 'MEDIUM',
      message: `Lead time above 95th percentile (${currentLeadTime.toFixed(1)}h)`,
      action: 'Consider pairing sessions to reduce review bottlenecks',
      data: { current: currentLeadTime, p95: p95Baseline }
    }
  }

  return null
}
```

**Notification:**
- **Severity:** MEDIUM → Slack
- **Severity:** HIGH → Slack + Email
- **Cooldown:** 12 hours
- **Dashboard:** Trend arrow indicator

**Root Cause Analysis:**
Automatically check for correlating factors:
- Open PR count >10
- Reviewer availability <3 active reviewers
- PR size >500 LOC
- Holiday/PTO calendar

---

#### 1.3 Change Failure Rate

**Alert:** High Change Failure Rate

**Trigger:**
```typescript
export async function checkChangeFailureRate() {
  const cfr = await getChangeFailureRate(7)
  const deployments = await getDeploymentsThisWeek()

  // Alert if CFR >25% AND significant deployment volume
  if (cfr > 25 && deployments >= 5) {
    return {
      severity: 'CRITICAL',
      message: `Change failure rate at ${cfr.toFixed(1)}% (${deployments} deployments)`,
      action: 'IMMEDIATE: Review failed deployments and implement rollback',
      data: { cfr, deployments, failedCount: Math.round(deployments * cfr / 100) }
    }
  }

  // Alert if CFR >15% (exceeds Elite threshold)
  if (cfr > 15) {
    return {
      severity: 'MEDIUM',
      message: `Change failure rate ${cfr.toFixed(1)}% (target: <15%)`,
      action: 'Review testing coverage and deployment process',
      data: { cfr }
    }
  }

  return null
}
```

**Notification:**
- **Severity:** MEDIUM → Slack
- **Severity:** CRITICAL → Slack + PagerDuty + Email
- **Cooldown:** 6 hours
- **Dashboard:** Red badge + trend graph

**Automatic Actions:**
- Trigger incident postmortem workflow for CRITICAL
- Tag failed deployments in GitHub
- Generate deployment health report

---

#### 1.4 Mean Time to Recovery (MTTR)

**Alert:** Slow Incident Recovery

**Trigger:**
```typescript
export async function checkMTTR() {
  const openIncidents = await getOpenIncidents()
  const criticalIncidents = openIncidents.filter(i => i.severity === 'critical')

  for (const incident of criticalIncidents) {
    const openDuration = getMinutesSince(incident.created_at)

    // Critical incidents should resolve <1h
    if (openDuration > 60) {
      return {
        severity: 'CRITICAL',
        message: `Critical incident open ${(openDuration/60).toFixed(1)}h (target: <1h)`,
        action: `ESCALATE: Incident #${incident.issue_number} requires immediate attention`,
        data: { incident, openDuration }
      }
    }
  }

  // Check average MTTR for resolved incidents
  const avgMTTR = await getAverageMTTR(7)
  if (avgMTTR > 60) { // >1h average
    return {
      severity: 'HIGH',
      message: `Average MTTR ${(avgMTTR/60).toFixed(1)}h this week (target: <1h)`,
      action: 'Review incident response procedures and runbook coverage',
      data: { avgMTTR }
    }
  }

  return null
}
```

**Notification:**
- **Severity:** HIGH → Slack + Email
- **Severity:** CRITICAL → PagerDuty + Slack + Email
- **Cooldown:** None (per-incident tracking)
- **Dashboard:** Live incident counter

**Escalation:**
- 1h → Page incident commander
- 2h → Escalate to engineering director
- 4h → Involve CTO

---

### 2. SPACE Framework Alerts

#### 2.1 Developer Satisfaction

**Alert:** Low Developer Satisfaction

**Trigger:**
```typescript
export async function checkSatisfaction() {
  const currentNPS = await getAverageNPS(30) // Last survey
  const previousNPS = await getAverageNPS(90, offset: 30) // Previous survey

  // Alert if NPS drops >10 points
  if (currentNPS < previousNPS - 10) {
    return {
      severity: 'HIGH',
      message: `NPS dropped ${(previousNPS - currentNPS).toFixed(0)} points (${currentNPS} vs ${previousNPS})`,
      action: 'Schedule team retrospective and 1-on-1s',
      data: { current: currentNPS, previous: previousNPS }
    }
  }

  // Alert if NPS <30 (burnout risk)
  if (currentNPS < 30) {
    return {
      severity: 'CRITICAL',
      message: `NPS at ${currentNPS} indicates potential burnout risk`,
      action: 'URGENT: Review workload, meeting load, and team health',
      data: { nps: currentNPS }
    }
  }

  return null
}
```

**Notification:**
- **Severity:** HIGH → Engineering leads
- **Severity:** CRITICAL → Engineering leads + HR
- **Cooldown:** Survey cadence (quarterly)
- **Dashboard:** Satisfaction trend graph

**Follow-up Actions:**
- Anonymized feedback report to leadership
- Schedule team health check meetings
- Review recent organizational changes

---

#### 2.2 Efficiency Alerts

**Alert:** Low Focus Time

**Trigger:**
```typescript
export async function checkFocusTime() {
  const focusTime = await getAverageFocusTimePercentage(7)
  const meetingLoad = await getAverageMeetingHours(7)

  // Alert if focus time <50%
  if (focusTime < 50) {
    return {
      severity: 'MEDIUM',
      message: `Focus time at ${focusTime.toFixed(0)}% (target: >70%)`,
      action: 'Suggest no-meeting blocks or meeting reduction',
      data: { focusTime, meetingLoad }
    }
  }

  // Alert if meeting load >4h/day
  if (meetingLoad > 20) { // >4h/day for 5-day week
    return {
      severity: 'HIGH',
      message: `Meeting load ${(meetingLoad/5).toFixed(1)}h/day exceeds sustainable threshold`,
      action: 'Audit recurring meetings and suggest async alternatives',
      data: { meetingLoad, avgPerDay: meetingLoad/5 }
    }
  }

  return null
}
```

**Notification:**
- **Severity:** MEDIUM → Slack `#engineering-wellness`
- **Severity:** HIGH → Slack + Engineering leads
- **Cooldown:** Weekly
- **Dashboard:** Focus time breakdown chart

**Recommendations:**
- Suggest "Focus Friday" (no meetings after 12 PM)
- Audit recurring meetings (>10 attendees, <30 min)
- Recommend async communication tools (Loom, Slack threads)

---

#### 2.3 Activity Anomalies

**Alert:** Unusual Activity Pattern

**Trigger:**
```typescript
export async function checkActivityAnomalies() {
  const commits = await getCommitsThisWeek()
  const baseline = await getAverageCommitsPerWeek(30)
  const stdDev = await getCommitsStdDev(30)

  // Alert if >2 standard deviations below baseline
  if (commits < baseline - (2 * stdDev)) {
    return {
      severity: 'LOW',
      message: `Commit activity unusually low (${commits} vs ${baseline.toFixed(0)} avg)`,
      action: 'Check for team blockers or capacity issues',
      data: { commits, baseline, stdDev }
    }
  }

  // Also check for excessive activity (burnout indicator)
  if (commits > baseline + (2 * stdDev)) {
    return {
      severity: 'MEDIUM',
      message: `Commit activity unusually high (${commits} vs ${baseline.toFixed(0)} avg)`,
      action: 'Monitor for burnout risk - consider workload distribution',
      data: { commits, baseline, stdDev }
    }
  }

  return null
}
```

**Notification:**
- **Severity:** LOW → Dashboard only
- **Severity:** MEDIUM → Slack
- **Cooldown:** Weekly
- **Dashboard:** Activity heatmap

---

## Alert Delivery Channels

### 1. Slack Integration

**Setup:**
```bash
# Create incoming webhook
# https://api.slack.com/messaging/webhooks
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/T00/B00/xxx"

# Channel routing
# CRITICAL/HIGH → #engineering-alerts
# MEDIUM → #engineering-metrics
# LOW → Dashboard only
```

**Message Format:**
```typescript
export async function sendSlackAlert(alert: Alert) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${alert.severity === 'CRITICAL' ? '🚨' : '⚠️'} ${alert.message}`
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Severity:* ${alert.severity}` },
            { type: 'mrkdwn', text: `*Category:* ${alert.category}` }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Recommended Action:*\n${alert.action}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View Dashboard' },
              url: 'https://roosevelt-ops.vercel.app'
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Acknowledge' },
              value: alert.id
            }
          ]
        }
      ]
    })
  })
}
```

---

### 2. Email Notifications

**Setup:**
```typescript
// lib/alerts/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmailAlert(alert: Alert, recipients: string[]) {
  await resend.emails.send({
    from: 'Engineering Metrics <alerts@rooseveltops.com>',
    to: recipients,
    subject: `[${alert.severity}] ${alert.category}: ${alert.message}`,
    html: `
      <h2>${alert.severity} Alert</h2>
      <p><strong>${alert.message}</strong></p>

      <h3>Recommended Action</h3>
      <p>${alert.action}</p>

      <h3>Details</h3>
      <pre>${JSON.stringify(alert.data, null, 2)}</pre>

      <a href="https://roosevelt-ops.vercel.app">View Dashboard</a>
    `
  })
}
```

**Recipients:**
- **CRITICAL:** Engineering Director + On-call engineer
- **HIGH:** Engineering leads
- **MEDIUM:** Team leads
- **LOW:** None (Slack only)

---

### 3. PagerDuty Integration

**Setup:**
```bash
# Create PagerDuty service
# Get integration key from PagerDuty UI
export PAGERDUTY_INTEGRATION_KEY="R0xxxxx"
```

**Triggering:**
```typescript
export async function triggerPagerDutyAlert(alert: Alert) {
  await fetch('https://events.pagerduty.com/v2/enqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      routing_key: process.env.PAGERDUTY_INTEGRATION_KEY,
      event_action: 'trigger',
      dedup_key: `metrics-${alert.category}-${alert.id}`,
      payload: {
        summary: alert.message,
        severity: alert.severity.toLowerCase(),
        source: 'roosevelt-ops-metrics',
        custom_details: alert.data
      }
    })
  })
}
```

**Policy:** Only trigger for CRITICAL alerts
- High change failure rate (>25%)
- Critical incident open >1h
- Developer satisfaction NPS <30

---

## Alert Aggregation & Correlation

### Smart Grouping

**Problem:** Avoid alert fatigue from cascading failures.

**Solution:** Group related alerts within 5-minute window.

```typescript
export class AlertAggregator {
  private alertWindow: Map<string, Alert[]> = new Map()

  async processAlert(alert: Alert) {
    const windowKey = `${alert.category}-${Math.floor(Date.now() / 300000)}` // 5-min window

    if (!this.alertWindow.has(windowKey)) {
      this.alertWindow.set(windowKey, [])
    }

    const windowAlerts = this.alertWindow.get(windowKey)!
    windowAlerts.push(alert)

    // If 3+ related alerts in window, send single aggregated alert
    if (windowAlerts.length >= 3) {
      await this.sendAggregatedAlert(windowKey, windowAlerts)
      this.alertWindow.delete(windowKey)
    }
  }

  private async sendAggregatedAlert(window: string, alerts: Alert[]) {
    const summary = `${alerts.length} related alerts detected in ${alerts[0].category}`
    const combinedSeverity = this.getMaxSeverity(alerts)

    await sendSlackAlert({
      severity: combinedSeverity,
      category: alerts[0].category,
      message: summary,
      action: 'Multiple issues detected - prioritize investigation',
      data: { alerts: alerts.map(a => a.message) }
    })
  }
}
```

---

## Cooldown Management

**Prevent spam:** Don't send duplicate alerts within cooldown period.

```typescript
export class AlertCooldownManager {
  private lastAlerts: Map<string, number> = new Map()

  canSendAlert(alertType: string, cooldownMinutes: number): boolean {
    const lastSent = this.lastAlerts.get(alertType)
    if (!lastSent) return true

    const minutesSinceLastAlert = (Date.now() - lastSent) / 60000
    return minutesSinceLastAlert >= cooldownMinutes
  }

  recordAlert(alertType: string) {
    this.lastAlerts.set(alertType, Date.now())
  }
}

// Usage
const cooldown = new AlertCooldownManager()

if (cooldown.canSendAlert('deployment-frequency-low', 24 * 60)) {
  await sendAlert(alert)
  cooldown.recordAlert('deployment-frequency-low')
}
```

---

## Scheduled Alert Checks

**GitHub Actions Workflow:**

```yaml
# .github/workflows/metrics-alerts.yml
name: Metrics Alert Checks

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes

jobs:
  check-alerts:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Dependencies
        run: npm ci

      - name: Run Alert Checks
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          PAGERDUTY_INTEGRATION_KEY: ${{ secrets.PAGERDUTY_INTEGRATION_KEY }}
        run: |
          npm run alerts:check

      - name: Summary
        run: |
          echo "### Alert Check Summary 📊" >> $GITHUB_STEP_SUMMARY
          echo "Last checked: $(date)" >> $GITHUB_STEP_SUMMARY
```

**Alert Check Script:**

```typescript
// scripts/check-alerts.ts
import { checkDeploymentFrequency } from '../lib/alerts/deployment-frequency'
import { checkLeadTime } from '../lib/alerts/lead-time'
import { checkChangeFailureRate } from '../lib/alerts/change-failure-rate'
// ...

async function main() {
  const checks = [
    checkDeploymentFrequency(),
    checkLeadTime(),
    checkChangeFailureRate(),
    checkMTTR(),
    checkSatisfaction(),
    checkFocusTime(),
    checkActivityAnomalies()
  ]

  const results = await Promise.all(checks)
  const alerts = results.filter(r => r !== null)

  for (const alert of alerts) {
    await processAlert(alert)
  }

  console.log(`Checked ${checks.length} conditions, triggered ${alerts.length} alerts`)
}

main()
```

---

## Dashboard Alert Indicators

**Visual Alerts:**

```typescript
// app/components/AlertBanner.tsx
export function AlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    fetchActiveAlerts().then(setAlerts)
  }, [])

  if (alerts.length === 0) return null

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL')
  const highAlerts = alerts.filter(a => a.severity === 'HIGH')

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {criticalAlerts.map(alert => (
        <div key={alert.id} className="bg-red-600 text-white p-4">
          <strong>🚨 CRITICAL:</strong> {alert.message}
          <button onClick={() => acknowledgeAlert(alert.id)}>Acknowledge</button>
        </div>
      ))}
      {highAlerts.map(alert => (
        <div key={alert.id} className="bg-orange-500 text-white p-3">
          <strong>⚠️ HIGH:</strong> {alert.message}
        </div>
      ))}
    </div>
  )
}
```

---

## Testing Alerts

**Synthetic Alert Generation:**

```bash
# Test deployment frequency alert
npm run test:alerts:deployment-frequency

# Test all alert types
npm run test:alerts:all
```

**Script:**
```typescript
// scripts/test-alerts.ts
async function testDeploymentFrequencyAlert() {
  // Insert fake data: 3 deployments this week vs 10 last week
  await insertFakeDeployments({ thisWeek: 3, lastWeek: 10 })

  // Trigger alert check
  const alert = await checkDeploymentFrequency()

  // Verify alert generated
  assert(alert !== null, 'Alert should trigger')
  assert(alert.severity === 'HIGH', 'Should be HIGH severity')

  // Cleanup
  await deleteFakeDeployments()
}
```

---

## Maintenance

**Weekly:**
- Review alert accuracy (false positive rate target: <20%)
- Adjust thresholds if needed

**Monthly:**
- Analyze alert response times
- Update cooldown periods based on feedback

**Quarterly:**
- Review and update alert criteria
- Add new alert types based on lessons learned

---

**Document Version:** 1.0.0
**Last Updated:** 2026-02-06
**Maintained By:** Roosevelt OPS DevOps Team
