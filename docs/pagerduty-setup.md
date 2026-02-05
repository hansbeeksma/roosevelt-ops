# PagerDuty Integration Setup

Complete guide voor PagerDuty integratie met de Slack incident bot. Automatische paging bij SEV-1 en SEV-2 incidents.

---

## Prerequisites

- [ ] PagerDuty account (free or paid)
- [ ] Admin access to create services and integrations
- [ ] Slack incident bot configured (see `incident-bot-setup.md`)

---

## Step 1: Create PagerDuty Service

### 1.1 Create Service

1. Go to https://[your-subdomain].pagerduty.com/services
2. Click **"+ New Service"**
3. Service Name: `Roosevelt OPS Incidents`
4. Description: `Critical incidents from Slack incident bot`
5. Escalation Policy: Select or create policy (see Step 2)
6. Click **"Next"**

### 1.2 Configure Integration

1. Integration Type: **"Events API V2"**
2. Integration Name: `Slack Incident Bot`
3. Click **"Create Service"**

### 1.3 Copy Integration Key

After creation, you'll see the **Integration Key** (aka Routing Key):
```
Sample: R03XXXXXXXXXXXXXXXXXXXXXXX
```

**SAVE THIS** - you'll need it for environment variables.

---

## Step 2: Configure Escalation Policy

### 2.1 Create Policy (if needed)

1. Go to **People** → **Escalation Policies**
2. Click **"+ New Escalation Policy"**
3. Name: `Roosevelt OPS On-Call`
4. Add Level 1:
   - **Notify**: Select on-call user(s)
   - **Escalates after**: 5 minutes
5. Add Level 2 (optional):
   - **Notify**: Backup engineer or team lead
   - **Escalates after**: 10 minutes
6. Click **"Save"**

### 2.2 Best Practices

**Level 1 (Primary On-Call)**:
- Response time: 5 minutes
- Notification: Push + SMS + Call (after 1 min)

**Level 2 (Escalation)**:
- Response time: 10 minutes
- Notify: Team lead or backup

**Level 3 (Final Escalation)**:
- Notify: Director or CTO
- For critical issues only

---

## Step 3: Configure Environment Variables

### 3.1 Get API Key (for status queries)

1. Go to **Integrations** → **API Access Keys**
2. Click **"+ Create New API Key"**
3. Description: `Roosevelt OPS Incident Bot (Read-Only)`
4. Click **"Create Key"**
5. Copy the key (starts with `u+`)

### 3.2 Update .env.local

```bash
# PagerDuty Configuration
PAGERDUTY_ROUTING_KEY=R03XXXXXXXXXXXXXXXXXXXXXXX  # From Step 1.3
PAGERDUTY_API_KEY=u+XXXXXXXXXXXXXXXXXXXXXXXX      # From Step 3.1 (optional)
```

### 3.3 Deploy to Vercel

```bash
# Add routing key (REQUIRED)
vercel env add PAGERDUTY_ROUTING_KEY production
# Enter value: R03XXXXXXXXXXXXXXXXXXXXXXX

# Add API key (OPTIONAL - for status queries)
vercel env add PAGERDUTY_API_KEY production
# Enter value: u+XXXXXXXXXXXXXXXXXXXXXXXX
```

**Verification**:
```bash
vercel env ls
# Should show both PAGERDUTY_* variables
```

---

## Step 4: Configure Notification Rules

### 4.1 User Notification Rules

Each on-call engineer should configure:

1. Go to **My Profile** → **Notification Rules**
2. Add rule for **High-Urgency Incidents**:
   - Immediately: Push notification
   - After 1 minute: Phone call
   - After 2 minutes: SMS
3. Add rule for **Low-Urgency Incidents**:
   - Immediately: Push notification only

### 4.2 Test Notifications

1. Go to **Services** → `Roosevelt OPS Incidents`
2. Click **"Test Integration"**
3. Send test event
4. Verify: Push notification received within 30 seconds

---

## Step 5: Test Integration

### 5.1 Trigger Test Incident

In Slack:
```bash
/incident start SEV-1 Test PagerDuty Integration
```

**Expected Flow**:
1. ✅ Incident created in Slack
2. ✅ PagerDuty alert triggered (check PagerDuty dashboard)
3. ✅ On-call engineer receives notification
4. ✅ Slack shows "PagerDuty alert triggered" message

### 5.2 Verify PagerDuty Dashboard

1. Go to https://[your-subdomain].pagerduty.com/incidents
2. You should see new incident:
   - Title: `SEV-1: Test PagerDuty Integration`
   - Service: `Roosevelt OPS Incidents`
   - Status: `Triggered`

### 5.3 Resolve Test Incident

In Slack:
```bash
/incident resolve <incident-id>
```

**Expected Flow**:
1. ✅ Incident marked resolved in Slack
2. ✅ PagerDuty incident auto-resolved
3. ✅ Slack shows "PagerDuty incident resolved" message

### 5.4 Verify Resolution

Check PagerDuty dashboard:
- Incident status should be `Resolved`
- Resolution time auto-recorded

---

## Step 6: Configure Severity Mapping

### When PagerDuty Pages

| Slack Severity | PagerDuty Alert | Urgency | Pages On-Call |
|----------------|-----------------|---------|---------------|
| **SEV-1** | ✅ Triggered | Critical | ✅ Yes (immediately) |
| **SEV-2** | ✅ Triggered | Error | ✅ Yes (immediately) |
| **SEV-3** | ❌ Not triggered | Warning | ❌ No |
| **SEV-4** | ❌ Not triggered | Info | ❌ No |

**Rationale**:
- SEV-1/SEV-2: Critical issues requiring immediate attention
- SEV-3/SEV-4: Tracked in Slack but don't warrant paging

### Customize Thresholds (Optional)

To change which severities trigger pages:

Edit `lib/integrations/pagerduty.ts`:
```typescript
export function shouldTriggerPagerDuty(severity: IncidentSeverity): boolean {
  // Current: SEV-1 and SEV-2 only
  return severity === 'SEV-1' || severity === 'SEV-2';

  // Option 1: SEV-1 only (very strict)
  // return severity === 'SEV-1';

  // Option 2: All severities (noisy)
  // return true;
}
```

---

## Step 7: Mobile App Configuration

### 7.1 Install PagerDuty Mobile App

**iOS**: https://apps.apple.com/app/pagerduty/id594039512
**Android**: https://play.google.com/store/apps/details?id=com.pagerduty.android

### 7.2 Enable Push Notifications

1. Open PagerDuty app
2. Sign in with account
3. Go to **Settings** → **Notifications**
4. Enable:
   - ✅ Push Notifications
   - ✅ Critical Alerts (iOS 12+)
   - ✅ Notification Sounds

### 7.3 Test Mobile Alerts

1. Trigger test SEV-1 incident from Slack
2. Verify:
   - Push notification received
   - Can acknowledge from mobile app
   - Can add notes from mobile app

---

## Step 8: Acknowledge Workflow

### Auto-Acknowledge (Future Enhancement)

Currently: Manual acknowledgment in PagerDuty app

**Planned**: Auto-acknowledge when incident commander posts first update

```typescript
// Future implementation in handleIncidentUpdate()
if (isFirstUpdate && incident.pagerduty_incident_id) {
  await acknowledgePagerDutyIncident(incident.pagerduty_incident_id);
}
```

### Manual Acknowledgment

**Via PagerDuty App**:
1. Open alert
2. Tap **"Acknowledge"**
3. Stops escalation timer

**Via PagerDuty Dashboard**:
1. Go to Incidents
2. Click incident
3. Click **"Acknowledge"**

---

## Monitoring & Troubleshooting

### Check Integration Status

**PagerDuty Dashboard**:
1. Go to **Services** → `Roosevelt OPS Incidents`
2. Click **"Integrations"** tab
3. Verify: `Slack Incident Bot` shows green status

### Test Event Delivery

Send test event via API:
```bash
curl -X POST https://events.pagerduty.com/v2/enqueue \
  -H 'Content-Type: application/json' \
  -d '{
    "routing_key": "YOUR_ROUTING_KEY",
    "event_action": "trigger",
    "payload": {
      "summary": "Test Event from CLI",
      "severity": "critical",
      "source": "curl"
    }
  }'
```

**Expected Response**:
```json
{
  "status": "success",
  "message": "Event processed",
  "dedup_key": "..."
}
```

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| No PagerDuty alert | Wrong routing key | Verify `PAGERDUTY_ROUTING_KEY` |
| Alert not resolving | Missing incident ID | Check incident has `pagerduty_incident_id` |
| Double alerts | Multiple integrations | Remove duplicate integrations |
| No mobile notification | App not configured | Enable push in PagerDuty app |
| Escalation not working | Policy misconfigured | Check escalation levels |

### Check Logs

**Vercel Logs**:
```bash
vercel logs --follow | grep -i pagerduty
```

**Expected Output**:
```
PagerDuty incident triggered: abc-123
PagerDuty incident resolved: abc-123
```

---

## Advanced Features

### Custom Incident Details

Add more context to PagerDuty alerts:

Edit `lib/integrations/pagerduty.ts`:
```typescript
custom_details: {
  incident_id: incident.id,
  commander: incident.commander,
  started_at: incident.started_at,
  description: incident.description,
  slack_channel_id: incident.channel_id,
  // Add custom fields:
  affected_services: ['API', 'Database'],
  customer_impact: 'High',
  estimated_users_affected: 1000,
}
```

### Incident Priority

Set priority based on severity:

```typescript
priority: {
  id: severity === 'SEV-1' ? 'P1' : 'P2',
  type: 'priority_reference',
}
```

### Conference Bridge

Auto-create conference bridge for SEV-1:

```typescript
conference_bridge: {
  conference_number: '+1-555-123-4567',
  conference_url: 'https://zoom.us/j/123456789',
}
```

---

## SLA Tracking

### PagerDuty SLA Metrics

Track incident response metrics:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Time to Acknowledge** | < 5 min | Track | - |
| **Time to Resolve (SEV-1)** | < 1 hour | Track | - |
| **Time to Resolve (SEV-2)** | < 4 hours | Track | - |

### Export Metrics

1. Go to **Analytics** → **Incidents**
2. Filter: Service = `Roosevelt OPS Incidents`
3. Export: CSV or PDF
4. Review monthly in retrospective

---

## Production Checklist

Before going live:

- [ ] PagerDuty service created
- [ ] Escalation policy configured
- [ ] Routing key added to Vercel
- [ ] Test incident triggered and resolved
- [ ] On-call engineer receives notifications
- [ ] Mobile app installed and tested
- [ ] Notification rules configured
- [ ] Team trained on PagerDuty workflow
- [ ] Escalation ladder documented
- [ ] Weekly on-call rotation scheduled

---

## On-Call Best Practices

### On-Call Rotation

**Recommended Schedule**:
- Week-long rotations (Monday 9am - Monday 9am)
- Backup assigned for each rotation
- Handoff meeting at start of rotation

**Handoff Checklist**:
- Review open incidents
- Check upcoming deployments
- Note any ongoing investigations
- Share contact info with team

### During On-Call

**Response Protocol**:
1. Acknowledge within 5 minutes
2. Post initial update within 10 minutes
3. Escalate if unable to resolve within SLA

**After Hours**:
- Keep laptop nearby
- Phone volume on high
- PagerDuty app in foreground
- WiFi and mobile data enabled

---

## References

- [PagerDuty Events API V2](https://developer.pagerduty.com/docs/ZG9jOjExMDI5NTgw-events-api-v2)
- [PagerDuty Integration Guide](https://support.pagerduty.com/docs/services-and-integrations)
- [Escalation Policies](https://support.pagerduty.com/docs/escalation-policies)
- [Mobile App Guide](https://support.pagerduty.com/docs/mobile-app)

---

**Last Updated**: 2026-02-06
**Version**: 1.0.0
