# Slack Incident Bot Setup

Complete guide voor het opzetten van de `/incident` Slack slash command bot.

## Prerequisites

- [ ] Slack workspace admin access
- [ ] Supabase project configured
- [ ] Roosevelt OPS Next.js app deployed (for webhook endpoint)
- [ ] ngrok (for local development testing)

---

## Step 1: Create Slack App

### 1.1 Create App

1. Go to https://api.slack.com/apps
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. App Name: `Incident Manager`
5. Workspace: Select your workspace
6. Click **"Create App"**

### 1.2 Configure OAuth Scopes

Navigate to **OAuth & Permissions**:

**Bot Token Scopes** (add these):
- `channels:manage` - Create incident channels
- `channels:read` - List channels
- `chat:write` - Post messages
- `chat:write.public` - Post to channels without joining
- `commands` - Respond to slash commands
- `users:read` - Read user info

Click **"Install to Workspace"** → **"Allow"**

**Save the Bot Token** (starts with `xoxb-...`)

### 1.3 Enable Event Subscriptions (Optional)

For real-time incident updates:

1. Navigate to **Event Subscriptions**
2. Enable Events: **ON**
3. Request URL: `https://your-app.vercel.app/api/slack/events`
4. Subscribe to bot events:
   - `message.channels` - Channel messages
   - `member_joined_channel` - User joins incident channel

---

## Step 2: Create Slash Command

Navigate to **Slash Commands** → **"Create New Command"**:

| Field | Value |
|-------|-------|
| **Command** | `/incident` |
| **Request URL** | `https://your-app.vercel.app/api/slack/incident` |
| **Short Description** | Manage incidents |
| **Usage Hint** | `start <SEV-X> <title>` or `update <id> <message>` |
| **Escape channels, users, and links** | ✅ Checked |

Click **"Save"**

---

## Step 3: Configure Environment Variables

### 3.1 Get Signing Secret

Navigate to **Basic Information** → **App Credentials**:

Copy **Signing Secret**

### 3.2 Update .env.local

```bash
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here

# Optional: PagerDuty Integration
PAGERDUTY_API_KEY=your-pagerduty-key
PAGERDUTY_ROUTING_KEY=your-routing-key

# Optional: Status Page Integration
STATUSPAGE_API_KEY=your-statuspage-key
STATUSPAGE_PAGE_ID=your-page-id

# Optional: Plane Integration (auto-create issues)
PLANE_API_KEY=your-plane-api-key
PLANE_WORKSPACE_SLUG=rooseveltdigital
PLANE_PROJECT_ID=c7d0b955-a97f-40b6-be03-7c05c2d0b1c3
```

### 3.3 Deploy Environment Variables

```bash
# Vercel
vercel env add SLACK_BOT_TOKEN production
vercel env add SLACK_SIGNING_SECRET production

# Or add via Vercel dashboard:
# https://vercel.com/roosevelt-d9f64ff6/roosevelt-ops/settings/environment-variables
```

---

## Step 4: Database Setup

### 4.1 Run Migration

```bash
# Local Supabase
npx supabase migration up

# OR Supabase Cloud (via dashboard)
# 1. Go to Database → Migrations
# 2. Upload migration file: supabase/migrations/20260206000001_create_incidents_table.sql
# 3. Run migration
```

### 4.2 Verify Table

```sql
-- Check incidents table exists
SELECT * FROM public.incidents LIMIT 1;
```

---

## Step 5: Local Development Testing

### 5.1 Install ngrok

```bash
brew install ngrok
```

### 5.2 Start Dev Server

```bash
npm run dev
# Runs on http://localhost:3000
```

### 5.3 Expose via ngrok

```bash
ngrok http 3000
# Output: https://abc123.ngrok.io
```

### 5.4 Update Slack App URLs

Temporarily update **Slash Commands** Request URL:
```
https://abc123.ngrok.io/api/slack/incident
```

**IMPORTANT**: Remember to change back to production URL after testing!

---

## Step 6: Test Commands

### 6.1 Test /incident start

In any Slack channel:
```
/incident start SEV-2 API timeout errors
```

**Expected Result**:
- ✅ New channel created: `#incident-1738867200000`
- ✅ Incident summary posted to channel
- ✅ Confirmation message in original channel
- ✅ Record in Supabase `incidents` table

### 6.2 Test /incident update

```
/incident update <incident-id> Identified root cause: connection pool exhaustion
```

**Expected Result**:
- ✅ Status update posted to incident channel
- ✅ Confirmation message (ephemeral)

### 6.3 Test /incident resolve

```
/incident resolve <incident-id>
```

**Expected Result**:
- ✅ Resolution message posted to incident channel
- ✅ `status` = `resolved` in database
- ✅ `resolved_at` timestamp set
- ✅ `mttr_minutes` auto-calculated

---

## Step 7: Slack Signature Verification

**CRITICAL FOR SECURITY**: The bot verifies all requests come from Slack.

### How It Works

1. Slack sends `X-Slack-Signature` header with each request
2. Signature is HMAC SHA256 hash of request body + timestamp + signing secret
3. Bot computes expected signature and compares (timing-safe)
4. Rejects requests with invalid signature or >5 minutes old (replay protection)

### Troubleshooting

**Error: Invalid signature**

Causes:
- Wrong `SLACK_SIGNING_SECRET` in environment variables
- Request not from Slack (e.g., direct browser access)
- Clock skew >5 minutes

**Fix**:
1. Verify signing secret matches Slack dashboard
2. Ensure environment variable is deployed
3. Test with actual Slack command, not curl/browser

---

## Step 8: Optional Integrations

### PagerDuty Integration

When SEV-1/SEV-2 incident starts:
- Automatically triggers PagerDuty alert
- Pages on-call engineer
- Links PagerDuty incident to Slack channel

**Setup**: Add PagerDuty API key to environment variables (see Step 3.2)

### Plane Integration

When incident starts:
- Creates Plane issue in ROOSE project
- Links issue to incident channel
- Auto-updates issue status when resolved

**Setup**: Add Plane credentials to environment variables (see Step 3.2)

### Status Page Integration

When incident starts:
- Updates status page with incident info
- Posts updates automatically
- Marks resolved when incident closes

**Setup**: Add Status Page API key to environment variables (see Step 3.2)

---

## Monitoring & Troubleshooting

### Check Logs

**Vercel**:
```bash
vercel logs --follow
```

**Supabase**:
```sql
-- Recent incidents
SELECT * FROM incidents
ORDER BY started_at DESC
LIMIT 10;

-- Active incidents
SELECT * FROM incidents
WHERE status = 'active'
ORDER BY started_at DESC;

-- SLA violations
SELECT
  id,
  title,
  severity,
  mttr_minutes,
  CASE
    WHEN severity = 'SEV-1' AND mttr_minutes > 5 THEN 'VIOLATED'
    WHEN severity = 'SEV-2' AND mttr_minutes > 15 THEN 'VIOLATED'
    ELSE 'OK'
  END AS sla_status
FROM incidents
WHERE status = 'resolved'
ORDER BY started_at DESC;
```

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid signature` | Wrong signing secret | Check environment variable |
| `HTTP 404 Not Found` | Wrong endpoint URL | Verify Slash Command URL |
| `Database error` | Migration not run | Run `npx supabase migration up` |
| `Channel creation failed` | Missing scope | Add `channels:manage` scope |
| `Incident not found` | Wrong incident ID | Check ID format (UUID) |

---

## Production Checklist

Before going live:

- [ ] Signing secret configured in Vercel
- [ ] Bot token configured in Vercel
- [ ] Database migration applied to production
- [ ] Slash command URL points to production (not ngrok!)
- [ ] Bot scopes granted in workspace
- [ ] Test all 3 commands (start, update, resolve)
- [ ] Verify signature validation works
- [ ] Monitor logs for errors
- [ ] Document incident workflow for team

---

## Usage Examples

### SEV-1: Production Outage

```bash
# Start critical incident
/incident start SEV-1 Production API completely down

# Post updates
/incident update abc-123 Database connection pool exhausted - restarting pooler
/incident update abc-123 Traffic restored - monitoring for stability
/incident update abc-123 All systems normal for 10 minutes

# Resolve
/incident resolve abc-123
```

### SEV-2: Performance Degradation

```bash
# Start high-severity incident
/incident start SEV-2 API response times 10x slower than normal

# Investigation updates
/incident update xyz-456 Identified slow query in payments endpoint
/incident update xyz-456 Added index to transactions table
/incident update xyz-456 Performance back to normal

# Resolve
/incident resolve xyz-456
```

### SEV-3: Minor Bug

```bash
# Start medium-severity incident
/incident start SEV-3 Profile page shows stale data

# Quick fix
/incident update def-789 Cache invalidation issue - deploying fix
/incident update def-789 Fix deployed and verified

# Resolve
/incident resolve def-789
```

---

## Next Steps

After setup:
1. Train team on incident workflow (see `docs/blameless-culture-training.md`)
2. Create runbooks for common incidents (see `docs/runbooks/`)
3. Schedule incident response drills
4. Set up postmortem process (see `docs/postmortems/TEMPLATE.md`)

---

## References

- [Slack API Documentation](https://api.slack.com/)
- [Slash Commands Guide](https://api.slack.com/interactivity/slash-commands)
- [Signature Verification](https://api.slack.com/authentication/verifying-requests-from-slack)
- [Incident Management Framework](./INCIDENT-MANAGEMENT.md)

---

**Last Updated**: 2026-02-06
**Version**: 1.0.0
