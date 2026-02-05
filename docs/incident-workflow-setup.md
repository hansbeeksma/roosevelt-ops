# Incident Workflow Setup Guide

Phase 2 implementation van incident management process: Tool integraties voor geautomatiseerde incident response.

---

## Table of Contents

1. [Overview](#overview)
2. [PagerDuty Setup](#pagerduty-setup)
3. [Slack Incident Bot](#slack-incident-bot)
4. [Status Page Integration](#status-page-integration)
5. [Plane Incident Tracking](#plane-incident-tracking)
6. [Workflow Automation](#workflow-automation)

---

## Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Incident Detection Sources                  │
│  Sentry • Grafana Cloud • BetterStack • Vercel              │
└────────────────┬────────────────────────────────────────────┘
                 │ Webhooks / API
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Central Incident Orchestration                 │
│           Slack Incident Bot (hub)                          │
└────────┬────────────┬────────────┬────────────┬─────────────┘
         │            │            │            │
         ▼            ▼            ▼            ▼
    PagerDuty    Plane Issue   Status Page   Timeline
    (On-call)    (Tracking)    (External)    (History)
```

### Goals

- **Automated paging**: SEV-1 incidents trigger PagerDuty immediately
- **Unified communication**: All incident updates in Slack #incidents
- **External transparency**: Status page auto-updates for customer-facing issues
- **Complete audit trail**: Every incident tracked in Plane with timeline

---

## PagerDuty Setup

### Option 1: PagerDuty (Recommended for Teams)

**Pros**: Industry standard, rich features, integrations
**Cons**: $19/user/month (Free tier: 5 users for 14 days)
**Best for**: Teams > 2 engineers

#### Setup Steps

1. **Create PagerDuty Account**
   - Go to https://www.pagerduty.com/sign-up/
   - Choose "Free" plan (14-day trial, then $19/user/month)
   - Company name: "Roosevelt OPS"

2. **Configure Service**
   ```
   Services → Add Service
   - Name: "Roosevelt OPS Production"
   - Escalation policy: "Default" (create custom later)
   - Integration: "Events API v2"
   - Copy Integration Key (save for later)
   ```

3. **Set Up Escalation Policy**
   ```
   Escalation Policies → New Escalation Policy
   - Name: "Roosevelt Primary"
   - Level 1: On-call engineer (5 min timeout)
   - Level 2: Team lead (15 min timeout)
   - Level 3: CTO (30 min timeout)
   - Repeat: After 1 hour
   ```

4. **Create On-Call Schedule**
   ```
   Schedules → New Schedule
   - Name: "Roosevelt Weekly Rotation"
   - Type: Weekly
   - Rotation: Every Monday 9:00 AM
   - Users: [Add team members]
   - Time zone: Europe/Amsterdam
   ```

5. **Install PagerDuty Mobile App**
   - iOS: https://apps.apple.com/app/pagerduty/id594039512
   - Android: https://play.google.com/store/apps/details?id=com.pagerduty.android
   - Enable notifications (critical!)

#### Integration with Sentry

```javascript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  beforeSend(event, hint) {
    // Trigger PagerDuty for critical errors
    if (event.level === 'error' && shouldPageOnCall(event)) {
      triggerPagerDuty({
        routing_key: process.env.PAGERDUTY_INTEGRATION_KEY,
        event_action: 'trigger',
        payload: {
          summary: event.message,
          severity: 'critical',
          source: 'sentry',
          custom_details: {
            error_id: event.event_id,
            url: event.request?.url,
            user: event.user?.email,
          },
        },
      });
    }

    return event;
  },
});

function shouldPageOnCall(event: Sentry.Event): boolean {
  // Page only for SEV-1 incidents
  return (
    event.tags?.severity === 'sev-1' ||
    event.exception?.values?.[0]?.type === 'DatabaseError' ||
    event.level === 'fatal'
  );
}

async function triggerPagerDuty(payload: any) {
  await fetch('https://events.pagerduty.com/v2/enqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
```

#### Integration with Grafana Cloud

```yaml
# grafana-alerting.yml
alerting:
  contactpoints:
    - name: pagerduty
      pagerduty_configs:
        - routing_key: ${PAGERDUTY_INTEGRATION_KEY}
          severity: critical
          client: Roosevelt OPS
          client_url: https://grafana.com/

  routes:
    - receiver: pagerduty
      matchers:
        - severity = critical
      continue: true
```

---

### Option 2: Opsgenie (Alternative)

**Pros**: Free tier (5 users), Atlassian integration
**Cons**: Fewer integrations than PagerDuty
**Best for**: Tight budget, existing Atlassian users

#### Setup Steps

1. **Create Opsgenie Account**
   - Go to https://www.atlassian.com/software/opsgenie/try
   - Sign up with Atlassian account
   - Free tier: 5 users, unlimited alerts

2. **Configure Integration**
   ```
   Settings → Integrations → Add Integration
   - Choose "API" integration
   - Name: "Roosevelt OPS Alerts"
   - Copy API Key
   ```

3. **Create Escalation Policy** (similar to PagerDuty)

---

### Option 3: DIY Solution (Budget Option)

**Pros**: Free, full control
**Cons**: Manual setup, limited features
**Best for**: Solo developer or very tight budget

#### Components

1. **Slack App for Paging**: Use Slack notifications with urgent priority
2. **Phone Call Fallback**: Twilio API for voice calls
3. **SMS Backup**: Twilio SMS

```typescript
// lib/incident/page-oncall.ts
export async function pageOnCall(incident: {
  severity: 'sev-1' | 'sev-2';
  title: string;
  description: string;
}) {
  const onCallEngineer = await getOnCallEngineer();

  // 1. Slack notification (urgent)
  await sendSlackAlert({
    channel: onCallEngineer.slackId,
    text: `🚨 ${incident.severity.toUpperCase()}: ${incident.title}`,
    priority: 'urgent', // Red notification, bypasses DND
  });

  // 2. If SEV-1, also call phone after 2 minutes if not acknowledged
  if (incident.severity === 'sev-1') {
    setTimeout(async () => {
      const acked = await checkAcknowledged(incident.id);
      if (!acked) {
        await callPhone({
          to: onCallEngineer.phone,
          message: `Critical incident: ${incident.title}. Check Slack for details.`,
        });
      }
    }, 2 * 60 * 1000); // 2 minutes
  }
}

async function callPhone({ to, message }: { to: string; message: string }) {
  // Using Twilio
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: to,
      From: process.env.TWILIO_PHONE_NUMBER,
      Twiml: `<Response><Say>${message}</Say></Response>`,
    }),
  });
}
```

---

## Slack Incident Bot

### Architecture

```
User types: /incident start SEV-1 "Production down"
    ↓
Slack Command → API Endpoint → Create Incident
    ↓
1. Create Plane issue
2. Create #incident-[id] channel
3. Post initial message
4. Notify on-call via PagerDuty
5. Update status page (if SEV-1)
```

### Implementation

#### 1. Create Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. App name: "Incident Manager"
4. Workspace: Your workspace

#### 2. Configure Slash Command

```
Slash Commands → Create New Command
- Command: /incident
- Request URL: https://your-app.vercel.app/api/slack/incident
- Short Description: Declare and manage incidents
- Usage Hint: start SEV-1 "Description" or update [id] "Status"
```

#### 3. Set Permissions

```
OAuth & Permissions → Bot Token Scopes
Add scopes:
- chat:write (post messages)
- channels:manage (create channels)
- channels:read (list channels)
- groups:write (private channels)
- users:read (get user info)
```

#### 4. Install App

```
Install App → Install to Workspace
Copy "Bot User OAuth Token" (starts with xoxb-)
```

#### 5. Implement API Endpoint

```typescript
// app/api/slack/incident/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  // Verify Slack signature
  const body = await request.text();
  const signature = request.headers.get('x-slack-signature');
  const timestamp = request.headers.get('x-slack-request-timestamp');

  if (!verifySlackSignature(signature, timestamp, body)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const params = new URLSearchParams(body);
  const text = params.get('text') || '';
  const userId = params.get('user_id');
  const [command, ...args] = text.split(' ');

  switch (command) {
    case 'start':
      return handleIncidentStart(args, userId);
    case 'update':
      return handleIncidentUpdate(args, userId);
    case 'resolve':
      return handleIncidentResolve(args, userId);
    default:
      return NextResponse.json({
        response_type: 'ephemeral',
        text: 'Usage: /incident start SEV-X "Description"',
      });
  }
}

async function handleIncidentStart(args: string[], userId: string) {
  const [severity, ...descParts] = args;
  const description = descParts.join(' ').replace(/"/g, '');

  if (!['SEV-1', 'SEV-2', 'SEV-3', 'SEV-4'].includes(severity)) {
    return NextResponse.json({
      response_type: 'ephemeral',
      text: 'Invalid severity. Use: SEV-1, SEV-2, SEV-3, or SEV-4',
    });
  }

  // 1. Create Plane issue
  const planeIssue = await createPlaneIncident({
    severity,
    description,
    reporter: userId,
  });

  // 2. Create Slack channel
  const channel = await createSlackChannel({
    name: `incident-${planeIssue.sequence_id}`,
    topic: `${severity}: ${description}`,
  });

  // 3. Post initial message
  await postToChannel(channel.id, {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚨 ${severity}: ${description}`,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Incident ID:*\n${planeIssue.readable_id}` },
          { type: 'mrkdwn', text: `*Commander:*\n<@${userId}>` },
          { type: 'mrkdwn', text: `*Status:*\nInvestigating` },
          { type: 'mrkdwn', text: `*Started:*\n${new Date().toISOString()}` },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View in Plane' },
            url: `https://app.plane.so/rooseveltdigital/projects/${planeIssue.readable_id}`,
            style: 'primary',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Runbooks' },
            url: 'https://github.com/your-org/roosevelt-ops/tree/main/docs/runbooks',
          },
        ],
      },
    ],
  });

  // 4. Notify on-call (if SEV-1 or SEV-2)
  if (['SEV-1', 'SEV-2'].includes(severity)) {
    await notifyOnCall({
      severity,
      description,
      planeIssue: planeIssue.readable_id,
      slackChannel: channel.id,
    });
  }

  // 5. Update status page (if SEV-1)
  if (severity === 'SEV-1') {
    await updateStatusPage({
      status: 'investigating',
      message: `We're investigating reports of ${description}`,
    });
  }

  // 6. Post to #incidents channel
  await postToChannel(process.env.SLACK_INCIDENTS_CHANNEL_ID, {
    text: `New incident: ${severity} - ${description}\nChannel: <#${channel.id}>`,
  });

  return NextResponse.json({
    response_type: 'in_channel',
    text: `✅ Incident ${planeIssue.readable_id} created: <#${channel.id}>`,
  });
}

async function handleIncidentUpdate(args: string[], userId: string) {
  const [incidentId, ...updateParts] = args;
  const update = updateParts.join(' ').replace(/"/g, '');

  // Post update to incident channel
  const channel = await getIncidentChannel(incidentId);
  await postToChannel(channel.id, {
    text: `📝 Update from <@${userId}>: ${update}`,
  });

  // Add comment to Plane
  await addPlaneComment(incidentId, update, userId);

  return NextResponse.json({
    response_type: 'ephemeral',
    text: '✅ Incident updated',
  });
}

async function handleIncidentResolve(args: string[], userId: string) {
  const [incidentId, ...resolutionParts] = args;
  const resolution = resolutionParts.join(' ').replace(/"/g, '');

  // Post resolution
  const channel = await getIncidentChannel(incidentId);
  await postToChannel(channel.id, {
    text: `✅ Incident resolved by <@${userId}>: ${resolution}`,
  });

  // Close Plane issue
  await closePlaneIssue(incidentId, resolution);

  // Update status page
  await updateStatusPage({
    status: 'resolved',
    message: `Issue resolved. ${resolution}`,
  });

  // Archive channel after 24 hours
  setTimeout(() => archiveChannel(channel.id), 24 * 60 * 60 * 1000);

  return NextResponse.json({
    response_type: 'in_channel',
    text: `✅ Incident ${incidentId} resolved`,
  });
}

function verifySlackSignature(
  signature: string,
  timestamp: string,
  body: string
): boolean {
  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature = `v0=${crypto
    .createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
    .update(sigBasestring)
    .digest('hex')}`;

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(signature)
  );
}
```

#### 6. Environment Variables

```env
# .env.local
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_INCIDENTS_CHANNEL_ID=C123456789
```

---

## Status Page Integration

### Option 1: Statuspage.io (Atlassian)

**Pros**: Professional, trusted, free tier available
**Cons**: $29/month after trial
**Best for**: Customer-facing products

#### Setup

1. **Create Account**: https://www.statuspage.io/
2. **Configure Page**:
   ```
   Page name: Roosevelt OPS
   URL: rooseveltops.statuspage.io
   Components:
   - Website (rooseveltops.com)
   - API (api.rooseveltops.com)
   - Dashboard (app.rooseveltops.com)
   ```

3. **API Integration**:
   ```typescript
   // lib/statuspage.ts
   export async function updateStatusPage({
     componentId,
     status,
     message,
   }: {
     componentId: string;
     status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';
     message: string;
   }) {
     await fetch(
       `https://api.statuspage.io/v1/pages/${process.env.STATUSPAGE_PAGE_ID}/incidents`,
       {
         method: 'POST',
         headers: {
           'Authorization': `OAuth ${process.env.STATUSPAGE_API_KEY}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           incident: {
             name: 'Service Disruption',
             status: 'investigating',
             impact_override: status,
             body: message,
             component_ids: [componentId],
             components: {
               [componentId]: status,
             },
           },
         }),
       }
     );
   }
   ```

---

### Option 2: Custom Status Page (Free)

**Pros**: Free, full control, no vendor lock-in
**Cons**: Requires development
**Best for**: Budget-conscious teams

#### Implementation

```typescript
// app/status/page.tsx
import { getIncidents } from '@/lib/db';

export default async function StatusPage() {
  const incidents = await getIncidents({ limit: 10 });
  const currentStatus = getCurrentStatus(incidents);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Roosevelt OPS Status</h1>
        <p className="text-gray-600">System status and uptime monitoring</p>
      </header>

      <StatusIndicator status={currentStatus} />

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Components</h2>
        <ComponentStatus name="Website" status="operational" uptime="99.9%" />
        <ComponentStatus name="API" status="operational" uptime="99.95%" />
        <ComponentStatus name="Dashboard" status="operational" uptime="99.8%" />
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Incidents</h2>
        {incidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </section>

      <footer className="mt-12 text-center text-sm text-gray-500">
        Last updated: {new Date().toISOString()}
      </footer>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const config = {
    operational: { color: 'green', text: 'All Systems Operational', icon: '✅' },
    degraded: { color: 'yellow', text: 'Degraded Performance', icon: '⚠️' },
    partial_outage: { color: 'orange', text: 'Partial Outage', icon: '🟠' },
    major_outage: { color: 'red', text: 'Major Outage', icon: '🔴' },
  }[status];

  return (
    <div className={`p-6 rounded-lg bg-${config.color}-50 border border-${config.color}-200`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{config.icon}</span>
        <span className="text-xl font-semibold">{config.text}</span>
      </div>
    </div>
  );
}
```

---

## Plane Incident Tracking

### Automated Incident Issue Creation

```typescript
// lib/plane/incident.ts
import { createIssue, updateIssue, addComment } from './client';

export async function createPlaneIncident({
  severity,
  description,
  reporter,
}: {
  severity: string;
  description: string;
  reporter: string;
}) {
  const priorityMap = {
    'SEV-1': 'urgent',
    'SEV-2': 'high',
    'SEV-3': 'medium',
    'SEV-4': 'low',
  };

  const issue = await createIssue({
    project_id: process.env.PLANE_PROJECT_ID,
    name: `[INCIDENT] ${severity}: ${description}`,
    description: `
# Incident Report

**Severity**: ${severity}
**Reporter**: ${reporter}
**Detected**: ${new Date().toISOString()}

## Description

${description}

## Timeline

- ${new Date().toISOString()}: Incident detected and reported

## Actions Taken

_(Will be updated as incident progresses)_

## Resolution

_(To be filled when incident is resolved)_
    `,
    priority: priorityMap[severity],
    labels: [
      await getLabelId('incident'),
      await getLabelId(severity.toLowerCase()),
      await getLabelId('incident-management'),
    ],
  });

  return issue;
}

export async function addIncidentTimeline(
  issueId: string,
  timestamp: Date,
  event: string,
  actor: string
) {
  await addComment(issueId, {
    comment_html: `**${timestamp.toISOString()}** - ${event} (_${actor}_)`,
  });
}

export async function resolveIncident(
  issueId: string,
  resolution: string,
  duration: number
) {
  await updateIssue(issueId, {
    state_id: await getStateId('done'),
    description: `
${await getCurrentDescription(issueId)}

## Resolution

**Resolved At**: ${new Date().toISOString()}
**Duration**: ${Math.floor(duration / 60)} minutes
**Resolution**: ${resolution}

## Postmortem

Postmortem scheduled for 48 hours from resolution.
Link: [To be added]
    `,
  });
}
```

---

## Workflow Automation

### Complete Incident Lifecycle

```typescript
// lib/incident/workflow.ts
export class IncidentWorkflow {
  async declare({
    severity,
    description,
    reporter,
  }: {
    severity: 'SEV-1' | 'SEV-2' | 'SEV-3' | 'SEV-4';
    description: string;
    reporter: string;
  }) {
    // 1. Create Plane issue
    const planeIssue = await createPlaneIncident({ severity, description, reporter });

    // 2. Create Slack channel
    const slackChannel = await createSlackIncidentChannel({
      incidentId: planeIssue.readable_id,
      severity,
      description,
    });

    // 3. Notify on-call (SEV-1/SEV-2)
    if (['SEV-1', 'SEV-2'].includes(severity)) {
      await notifyOnCall({
        severity,
        description,
        planeIssue: planeIssue.readable_id,
        slackChannel: slackChannel.id,
      });
    }

    // 4. Update status page (SEV-1)
    if (severity === 'SEV-1') {
      await updateStatusPage({
        status: 'major_outage',
        message: `We're investigating reports of ${description}`,
      });
    }

    // 5. Post to #incidents
    await postToIncidentsChannel({
      severity,
      description,
      planeIssue: planeIssue.readable_id,
      slackChannel: slackChannel.id,
    });

    return {
      planeIssue,
      slackChannel,
    };
  }

  async update(incidentId: string, update: string, actor: string) {
    // Add timeline entry
    await addIncidentTimeline(incidentId, new Date(), update, actor);

    // Post to Slack
    await postUpdateToSlack(incidentId, update, actor);

    // Update status page (if SEV-1)
    const incident = await getIncident(incidentId);
    if (incident.severity === 'SEV-1') {
      await updateStatusPage({
        status: 'investigating',
        message: update,
      });
    }
  }

  async resolve(incidentId: string, resolution: string, actor: string) {
    const incident = await getIncident(incidentId);
    const duration = Date.now() - new Date(incident.created_at).getTime();

    // 1. Resolve in Plane
    await resolveIncident(incidentId, resolution, duration);

    // 2. Update Slack
    await postResolutionToSlack(incidentId, resolution, duration);

    // 3. Update status page
    if (incident.severity === 'SEV-1') {
      await updateStatusPage({
        status: 'operational',
        message: `Issue resolved. ${resolution}`,
      });
    }

    // 4. Schedule postmortem (if SEV-1/SEV-2)
    if (['SEV-1', 'SEV-2'].includes(incident.severity)) {
      await schedulePostmortem(incidentId, Date.now() + 48 * 60 * 60 * 1000);
    }

    // 5. Archive Slack channel after 24h
    setTimeout(() => archiveSlackChannel(incident.slackChannelId), 24 * 60 * 60 * 1000);
  }
}
```

---

## Environment Variables

Complete list van benodigde environment variables:

```env
# PagerDuty
PAGERDUTY_INTEGRATION_KEY=your-integration-key

# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_INCIDENTS_CHANNEL_ID=C123456789

# Status Page (if using Statuspage.io)
STATUSPAGE_PAGE_ID=your-page-id
STATUSPAGE_API_KEY=your-api-key

# Twilio (for DIY paging)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Plane
PLANE_PROJECT_ID=your-project-id
PLANE_API_KEY=your-api-key
```

---

## Testing the Workflow

### End-to-End Test

```bash
# 1. Trigger test incident via Slack
/incident start SEV-3 "Test incident - please ignore"

# Expected:
# - Plane issue created
# - Slack channel #incident-XXX created
# - Initial message posted to channel
# - Post in #incidents channel

# 2. Update incident
/incident update ROOSE-XXX "Investigating root cause"

# Expected:
# - Update posted to incident channel
# - Comment added to Plane issue

# 3. Resolve incident
/incident resolve ROOSE-XXX "Test complete, all systems normal"

# Expected:
# - Resolution message in Slack
# - Plane issue closed
# - Channel archived after 24h
```

---

## Deployment Checklist

Phase 2 implementation checklist:

### PagerDuty/Opsgenie
- [ ] Account created
- [ ] Service configured
- [ ] Escalation policy set
- [ ] On-call schedule created
- [ ] Mobile app installed and tested
- [ ] Integration with Sentry configured
- [ ] Integration with Grafana configured

### Slack Incident Bot
- [ ] Slack app created
- [ ] Slash command configured
- [ ] Bot permissions set
- [ ] App installed to workspace
- [ ] API endpoint deployed (`/api/slack/incident`)
- [ ] Signature verification working
- [ ] Commands tested (start, update, resolve)

### Status Page
- [ ] Status page created (Statuspage.io or custom)
- [ ] Components configured
- [ ] API integration working
- [ ] Automatic updates tested
- [ ] Public URL shared with team

### Plane Integration
- [ ] Incident issue template created
- [ ] Labels configured (incident, sev-1, sev-2, etc.)
- [ ] Automation tested (create, update, close)
- [ ] Timeline tracking working

### Environment Variables
- [ ] All required env vars added to Vercel
- [ ] Secrets stored securely
- [ ] Local .env.local updated

### Documentation
- [ ] Runbooks updated with new workflows
- [ ] Team trained on Slack commands
- [ ] Escalation paths documented
- [ ] Testing procedure documented

---

## Success Criteria

Phase 2 is complete when:

- ✅ SEV-1 incident triggers PagerDuty page within 5 minutes
- ✅ Slack `/incident start` creates Plane issue + Slack channel
- ✅ Status page updates automatically for SEV-1 incidents
- ✅ Complete incident timeline captured in Plane
- ✅ End-to-end workflow tested successfully
- ✅ Team trained on new tools

---

## Next Steps (Phase 3)

After Phase 2 completion:

1. **Blameless Culture Training**
   - Workshop on blameless postmortems
   - Practice with hypothetical scenarios

2. **Action Item Automation**
   - Auto-create Plane issues from postmortem action items
   - Track completion in dashboards

3. **Quarterly Review Dashboard**
   - Aggregate incident metrics
   - Pattern analysis
   - Trend reporting

4. **Continuous Improvement**
   - Regular review of incident response times
   - Runbook updates based on learnings
   - Tool optimization

---

*Last Updated: 2026-02-05*
*Version: 1.0.0*
*Owner: DevOps Team*
