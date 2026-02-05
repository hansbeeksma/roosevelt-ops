# Roosevelt OPS - Incident Management Deployment Guide

Complete end-to-end deployment guide voor het incident management systeem. Volg deze stappen in volgorde voor production deployment.

**Geschatte tijd**: 2-3 uur
**Difficulty**: Intermediate
**Prerequisites**: Admin access voor Slack, PagerDuty, Vercel, Supabase

---

## 📋 Overzicht

Dit systeem bestaat uit 5 geïntegreerde componenten:

| Component | Functie | Required | Setup Time |
|-----------|---------|----------|------------|
| **Slack Bot** | Incident commands & channels | ✅ Yes | 30 min |
| **Supabase** | Database & incident tracking | ✅ Yes | 15 min |
| **PagerDuty** | On-call paging (SEV-1/SEV-2) | ⚠️ Recommended | 30 min |
| **Status Page** | Public incident updates | ⚠️ Recommended | 20 min |
| **Plane** | Issue tracking & postmortems | ⚠️ Recommended | 15 min |

**Total setup time**: ~2 hours (all components)

---

## Phase 1: Prerequisites (15 minutes)

### 1.1 Accounts Verificatie

Controleer of je admin access hebt:

- [ ] **Slack Workspace**: Admin of Owner role
- [ ] **Vercel**: Team member met deployment rechten
- [ ] **Supabase**: Project owner of admin
- [ ] **PagerDuty** (optioneel): Account administrator
- [ ] **Statuspage.io** (optioneel): Page owner
- [ ] **Plane** (optioneel): Workspace admin (rooseveltdigital)

### 1.2 Local Setup

```bash
# Clone repository (als nog niet gedaan)
git clone https://github.com/hansbeeksma/roosevelt-ops.git
cd roosevelt-ops

# Installeer dependencies
npm install

# Copy environment variables template
cp .env.example .env.local
```

### 1.3 Vercel CLI Setup

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Link project
vercel link
# Select: roosevelt-d9f64ff6 team
# Select: roosevelt-ops project
```

---

## Phase 2: Database Setup (15 minutes)

### 2.1 Run Migration

**Option A: Supabase Cloud** (Recommended)

1. Go to https://supabase.com/dashboard
2. Select `Roosevelt OPS` project
3. Navigate to **Database** → **Migrations**
4. Click **"New migration"**
5. Upload: `supabase/migrations/20260206000001_create_incidents_table.sql`
6. Click **"Run migration"**

**Option B: Local Supabase**

```bash
# Start Supabase locally
npx supabase start

# Run migration
npx supabase migration up

# Check status
npx supabase status
```

### 2.2 Verify Migration

```sql
-- In Supabase SQL Editor
SELECT * FROM incidents LIMIT 1;
-- Should return empty result (table exists but no data)

-- Check columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'incidents';
-- Should show: id, title, severity, status, commander, channel_id,
--              plane_issue_id, pagerduty_incident_id, statuspage_incident_id,
--              started_at, resolved_at, mttr_minutes, created_at, updated_at
```

### 2.3 Get Supabase Credentials

In Supabase dashboard → **Settings** → **API**:

```bash
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

---

## Phase 3: Slack Bot Setup (30 minutes)

### 3.1 Create Slack App

1. Go to https://api.slack.com/apps
2. Click **"Create New App"** → **"From scratch"**
3. App Name: `Incident Manager`
4. Workspace: Select your workspace
5. Click **"Create App"**

### 3.2 Configure OAuth Scopes

Navigate to **OAuth & Permissions**:

**Bot Token Scopes** - Add these:
- `channels:manage` - Create incident channels
- `channels:read` - List channels
- `chat:write` - Post messages
- `chat:write.public` - Post to channels without joining
- `commands` - Respond to slash commands
- `users:read` - Read user info

Click **"Install to Workspace"** → **"Allow"**

**Copy Bot Token** (starts with `xoxb-...`)

### 3.3 Create Slash Command

Navigate to **Slash Commands** → **"Create New Command"**:

| Field | Value |
|-------|-------|
| Command | `/incident` |
| Request URL | `https://your-app.vercel.app/api/slack/incident` *(update after deployment)* |
| Short Description | `Manage incidents` |
| Usage Hint | `start <SEV-X> <title>` or `update <id> <message>` |
| Escape channels, users, links | ✅ Checked |

Click **"Save"**

### 3.4 Get Credentials

Navigate to **Basic Information** → **App Credentials**:

```bash
# Add to .env.local
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
```

### 3.5 Get Team ID

Navigate to **Workspace Settings** (in Slack desktop):
1. Click workspace name → **Settings & administration** → **Workspace settings**
2. Scroll to **Workspace ID** (e.g., `T01234567`)

```bash
# Add to .env.local
SLACK_TEAM_ID=T01234567
```

---

## Phase 4: Deploy to Vercel (10 minutes)

### 4.1 Set Environment Variables

```bash
# Core (required)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add SLACK_BOT_TOKEN production
vercel env add SLACK_SIGNING_SECRET production
vercel env add SLACK_TEAM_ID production

# Enter each value when prompted
```

**Verify**:
```bash
vercel env ls
# Should show all 6 variables
```

### 4.2 Deploy

```bash
# Deploy to production
vercel --prod

# Wait for deployment...
# Output: https://roosevelt-ops-xxx.vercel.app
```

### 4.3 Update Slack Command URL

1. Go back to https://api.slack.com/apps
2. Select `Incident Manager` app
3. Navigate to **Slash Commands**
4. Edit `/incident` command
5. Update Request URL: `https://roosevelt-ops-xxx.vercel.app/api/slack/incident`
6. Click **"Save"**

### 4.4 Test Basic Flow

In any Slack channel:
```
/incident start SEV-4 Test deployment
```

**Expected**:
- ✅ New channel created: `#incident-1234567890`
- ✅ Confirmation message in original channel
- ✅ Incident summary posted to new channel
- ✅ Database record created

**Verify in Supabase**:
```sql
SELECT * FROM incidents ORDER BY created_at DESC LIMIT 1;
-- Should show your test incident
```

---

## Phase 5: PagerDuty Integration (30 minutes) - Optional

**Skip if you don't need on-call paging.**

### 5.1 Create PagerDuty Service

1. Go to https://[your-subdomain].pagerduty.com/services
2. Click **"+ New Service"**
3. Name: `Roosevelt OPS Incidents`
4. Escalation Policy: Select or create (see 5.2)
5. Integration: **"Events API V2"**
6. Click **"Create Service"**

### 5.2 Configure Escalation Policy

1. Go to **People** → **Escalation Policies**
2. Click **"+ New Escalation Policy"**
3. Name: `Roosevelt OPS On-Call`
4. Level 1: Select on-call user, escalate after 5 min
5. Level 2: Select backup, escalate after 10 min
6. Click **"Save"**

### 5.3 Get Integration Key

After service creation:
1. Copy **Integration Key** (starts with `R03...`)

### 5.4 Get API Key (Optional - for status queries)

1. Go to **Integrations** → **API Access Keys**
2. Click **"+ Create New API Key"**
3. Description: `Roosevelt OPS Incident Bot`
4. Click **"Create Key"**
5. Copy key (starts with `u+...`)

### 5.5 Add to Vercel

```bash
vercel env add PAGERDUTY_ROUTING_KEY production
# Paste integration key (R03...)

vercel env add PAGERDUTY_API_KEY production
# Paste API key (u+...)
```

### 5.6 Redeploy

```bash
vercel --prod
```

### 5.7 Test PagerDuty

```
/incident start SEV-1 Test PagerDuty paging
```

**Expected**:
- ✅ Channel created
- ✅ "PagerDuty alert triggered" message
- ✅ On-call engineer receives page (push/SMS/call)
- ✅ Incident visible in PagerDuty dashboard

**Cleanup**:
```
/incident resolve <incident-id>
```

---

## Phase 6: Status Page Integration (20 minutes) - Optional

**Skip if you don't need public status page.**

### 6.1 Statuspage.io Setup

1. Go to https://statuspage.io
2. Create account or sign in
3. Create new page: `Roosevelt OPS Status`
4. Note your **Page ID** (from URL: `https://[page-id].statuspage.io`)

### 6.2 Get API Key

1. Go to **Account Settings** → **API Tokens**
2. Click **"Create Token"**
3. Name: `Incident Bot Integration`
4. Permissions: **"Full Access"**
5. Click **"Create"**
6. Copy OAuth token

### 6.3 Configure Components (Optional)

1. Go to **Components**
2. Add components:
   - API
   - Database
   - Website
   - Authentication
   - Payments (if applicable)

### 6.4 Add to Vercel

```bash
vercel env add STATUSPAGE_API_KEY production
# Paste OAuth token

vercel env add STATUSPAGE_PAGE_ID production
# Paste page ID
```

### 6.5 Redeploy

```bash
vercel --prod
```

### 6.6 Test Status Page

```
/incident start SEV-2 Test status page integration
```

**Expected**:
- ✅ Channel created
- ✅ "Public status page updated" message
- ✅ Incident visible at `https://[page-id].statuspage.io`
- ✅ Components auto-detected and status updated

**Verify**:
Open `https://[page-id].statuspage.io` in browser

**Cleanup**:
```
/incident resolve <incident-id>
```

---

## Phase 7: Plane Integration (15 minutes) - Optional

**Skip if you don't use Plane for project management.**

### 7.1 Get Plane API Key

1. Go to https://app.plane.so/profile/api-tokens
2. Click **"Generate New Token"**
3. Name: `Incident Bot Integration`
4. Click **"Generate"**
5. Copy API key

### 7.2 Verify Project ID

Default: `c7d0b955-a97f-40b6-be03-7c05c2d0b1c3` (ROOSE project)

**To verify**:
1. Go to https://app.plane.so/rooseveltdigital/projects
2. Click ROOSE project
3. Check URL: `.../projects/[this-is-project-id]/...`

### 7.3 Add to Vercel

```bash
vercel env add PLANE_API_KEY production
# Paste API key

vercel env add PLANE_WORKSPACE_SLUG production
# Enter: rooseveltdigital

vercel env add PLANE_PROJECT_ID production
# Enter: c7d0b955-a97f-40b6-be03-7c05c2d0b1c3
```

### 7.4 Redeploy

```bash
vercel --prod
```

### 7.5 Test Plane Integration

```
/incident start SEV-3 Test Plane integration
```

**Expected**:
- ✅ Channel created
- ✅ "Plane issue created" message with link
- ✅ Issue visible in Plane with [INCIDENT] prefix
- ✅ Labels: incident, sev-3, p2

**Verify**:
Go to https://app.plane.so/rooseveltdigital/projects/ROOSE/issues

**Cleanup**:
```
/incident resolve <incident-id>
```

---

## Phase 8: Verification & Testing (20 minutes)

### 8.1 Complete Integration Test

Run full workflow test:

```
/incident start SEV-2 Complete integration test
```

**Checklist**:
- [ ] Slack channel created
- [ ] Database record created (check Supabase)
- [ ] PagerDuty alert triggered (if configured)
- [ ] Status Page updated (if configured)
- [ ] Plane issue created (if configured)
- [ ] All confirmations posted to Slack

### 8.2 Update Test

```
/incident update <incident-id> Testing status update sync
```

**Checklist**:
- [ ] Update posted to Slack channel
- [ ] Status Page updated to "Identified" (if configured)
- [ ] Comment added to Plane issue (if configured)

### 8.3 Resolve Test

```
/incident resolve <incident-id>
```

**Checklist**:
- [ ] Resolution posted to Slack
- [ ] MTTR calculated in database
- [ ] PagerDuty auto-resolved (if configured)
- [ ] Status Page marked resolved (if configured)
- [ ] Plane issue moved to Done (if configured)

### 8.4 Verify All Systems

**Slack**:
```
/incident start SEV-4 Final verification
/incident update <id> All systems operational
/incident resolve <id>
```

**Database**:
```sql
SELECT
  id,
  title,
  severity,
  status,
  mttr_minutes,
  pagerduty_incident_id,
  statuspage_incident_id,
  plane_issue_id
FROM incidents
ORDER BY created_at DESC
LIMIT 5;
```

**Expected**: All test incidents with calculated MTTR

---

## Phase 9: Team Onboarding (30 minutes)

### 9.1 Share Documentation

Send to team:
- [ ] `docs/INCIDENT-MANAGEMENT.md` - Framework overview
- [ ] `docs/runbooks/TEMPLATE.md` - Runbook template
- [ ] `docs/postmortems/TEMPLATE.md` - Postmortem template
- [ ] `docs/blameless-culture-training.md` - Training workshop

### 9.2 Quick Reference Card

Share in Slack `#incidents` channel:

```markdown
## 🚨 Incident Management Quick Reference

**Start Incident**
/incident start <SEV-X> <brief title>
Example: /incident start SEV-1 Production API completely down

**Update Status**
/incident update <incident-id> <status message>
Example: /incident update abc-123 Root cause identified - deploying fix

**Resolve Incident**
/incident resolve <incident-id>
Example: /incident resolve abc-123

**Severity Levels**
• SEV-1 (🔴): Critical - total outage, pages on-call
• SEV-2 (🟠): High - major functionality broken, pages on-call
• SEV-3 (🟡): Medium - degraded performance, no page
• SEV-4 (🟢): Low - minor issue, no page

**After Resolution**
• Complete postmortem within 48 hours
• Create action items in Plane
• Update runbooks if applicable

**Questions?** See #incident-management or docs/INCIDENT-MANAGEMENT.md
```

### 9.3 Walkthrough Session

Schedule 30-minute team walkthrough:
1. Demo incident creation
2. Show Slack channel workflow
3. Explain severity levels
4. Practice resolve flow
5. Q&A

### 9.4 On-Call Rotation (if using PagerDuty)

Set up rotation:
1. Go to PagerDuty → **People** → **Schedules**
2. Create weekly rotation
3. Add team members
4. Set handoff time (e.g., Monday 9am)
5. Configure mobile app notifications

---

## Phase 10: Production Readiness (15 minutes)

### 10.1 Security Checklist

- [ ] All API keys stored in Vercel environment variables (not in code)
- [ ] `.env.local` in `.gitignore` (verify)
- [ ] Slack signature verification enabled (automatic)
- [ ] Supabase RLS policies active (check migration)
- [ ] No secrets in git history

### 10.2 Monitoring Setup

**Create Slack Channel**:
```
#incident-management
Purpose: Incident coordination and postmortems
```

**Pin Important Links**:
- Runbook directory
- Postmortem template
- PagerDuty dashboard
- Status page
- Plane project

### 10.3 Backup & Recovery

**Export Critical Data**:
```sql
-- Backup incidents table
COPY (
  SELECT * FROM incidents
  WHERE created_at > NOW() - INTERVAL '90 days'
) TO '/tmp/incidents_backup.csv' CSV HEADER;
```

**Schedule Weekly Backups**: (via Supabase dashboard)
1. Go to **Database** → **Backups**
2. Enable **Daily backups**
3. Retention: 7 days (free tier) or 30 days (pro)

### 10.4 Final Configuration Review

```bash
# Check all environment variables
vercel env ls

# Should see (production):
# ✅ NEXT_PUBLIC_SUPABASE_URL
# ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
# ✅ SUPABASE_SERVICE_ROLE_KEY
# ✅ SLACK_BOT_TOKEN
# ✅ SLACK_SIGNING_SECRET
# ✅ SLACK_TEAM_ID
# ⚠️ PAGERDUTY_ROUTING_KEY (optional)
# ⚠️ PAGERDUTY_API_KEY (optional)
# ⚠️ STATUSPAGE_API_KEY (optional)
# ⚠️ STATUSPAGE_PAGE_ID (optional)
# ⚠️ PLANE_API_KEY (optional)
# ⚠️ PLANE_WORKSPACE_SLUG (optional)
# ⚠️ PLANE_PROJECT_ID (optional)
```

---

## Troubleshooting

### Issue: `/incident` command not responding

**Symptoms**: No response when typing `/incident start ...`

**Solutions**:
1. Check Slack app is installed: Workspace settings → Apps
2. Verify Request URL in Slash Command settings
3. Check Vercel deployment logs: `vercel logs --follow`
4. Test endpoint: `curl https://your-app.vercel.app/api/slack/incident`

### Issue: "Invalid signature" error

**Symptoms**: Error message in Slack: "Invalid signature"

**Solutions**:
1. Verify `SLACK_SIGNING_SECRET` matches Slack dashboard
2. Check environment variable deployed: `vercel env ls`
3. Redeploy: `vercel --prod`
4. Wait 5 minutes for propagation

### Issue: Database connection errors

**Symptoms**: "Failed to create incident" errors

**Solutions**:
1. Verify Supabase credentials: Check `.env.local` vs Vercel env
2. Check migration status: Supabase dashboard → Migrations
3. Test connection: Supabase SQL Editor → `SELECT 1;`
4. Verify RLS policies: Should allow authenticated access

### Issue: PagerDuty not triggering

**Symptoms**: No page received for SEV-1/SEV-2

**Solutions**:
1. Check `PAGERDUTY_ROUTING_KEY` is correct
2. Verify integration in PagerDuty: Services → Integrations
3. Check Vercel logs for PagerDuty API errors
4. Test manually: PagerDuty → Send test event
5. Verify escalation policy has active users

### Issue: Status Page not updating

**Symptoms**: No incident on status page

**Solutions**:
1. Verify `STATUSPAGE_API_KEY` has full access
2. Check `STATUSPAGE_PAGE_ID` matches your page
3. Verify components exist: Statuspage.io → Components
4. Check Vercel logs for API errors
5. Test API manually with curl

### Issue: Plane issue not created

**Symptoms**: No "Plane issue created" message

**Solutions**:
1. Verify `PLANE_API_KEY` is valid: Test in Plane API docs
2. Check `PLANE_PROJECT_ID` is correct
3. Verify labels can be created (needs write access)
4. Check Vercel logs for Plane API errors
5. Test with minimal permissions first

---

## Rollback Procedure

If deployment causes issues:

### 1. Immediate Rollback

```bash
# List recent deployments
vercel ls roosevelt-ops --prod

# Rollback to previous
vercel rollback
# Select previous working deployment
```

### 2. Disable Integrations

If specific integration failing:

```bash
# Remove problematic env var
vercel env rm PAGERDUTY_ROUTING_KEY production

# Redeploy
vercel --prod
```

### 3. Emergency: Disable Slash Command

In Slack:
1. Go to https://api.slack.com/apps
2. Select `Incident Manager`
3. **Slash Commands** → Delete `/incident`
4. (Prevents new incidents while fixing)

---

## Post-Deployment Checklist

- [ ] All integrations tested end-to-end
- [ ] Team trained on workflow
- [ ] Documentation shared (#incident-management channel)
- [ ] On-call rotation configured (if using PagerDuty)
- [ ] Monitoring dashboard created
- [ ] Backup strategy implemented
- [ ] Security audit completed
- [ ] Rollback procedure documented
- [ ] First real incident handled successfully
- [ ] Postmortem template tested

---

## Maintenance

### Weekly

- [ ] Review incident metrics (MTTR trends)
- [ ] Check PagerDuty rotation handoffs
- [ ] Verify Supabase backups running

### Monthly

- [ ] Review runbooks for updates
- [ ] Analyze incident patterns (Plane queries)
- [ ] Update team training if needed
- [ ] Review and rotate API keys

### Quarterly

- [ ] Full system audit
- [ ] Blameless culture retrospective
- [ ] Update documentation
- [ ] Review SLA compliance

---

## Support & Documentation

| Resource | Link |
|----------|------|
| **Incident Framework** | `docs/INCIDENT-MANAGEMENT.md` |
| **Slack Bot Setup** | `docs/incident-bot-setup.md` |
| **PagerDuty Setup** | `docs/pagerduty-setup.md` |
| **Runbook Template** | `docs/runbooks/TEMPLATE.md` |
| **Postmortem Template** | `docs/postmortems/TEMPLATE.md` |
| **Blameless Training** | `docs/blameless-culture-training.md` |
| **Vercel Dashboard** | https://vercel.com/roosevelt-d9f64ff6/roosevelt-ops |
| **Supabase Dashboard** | https://supabase.com/dashboard |
| **Plane Project** | https://app.plane.so/rooseveltdigital/projects/ROOSE |

---

## Next Steps

After successful deployment:

1. **Run First Drill**: Schedule practice incident within 1 week
2. **Gather Feedback**: Team retro after first real incident
3. **Iterate**: Update runbooks based on real usage
4. **Scale**: Add more components to Status Page
5. **Optimize**: Review MTTR metrics monthly

---

**Deployment Guide Version**: 1.0.0
**Last Updated**: 2026-02-06
**Maintainer**: DevOps Team
