# Infrastructure Monitoring & Alerts

Complete monitoring stack voor Roosevelt OPS metrics dashboard.

## Overview

| Component | Purpose | Service | Status |
|-----------|---------|---------|--------|
| **Error Tracking** | Runtime errors, crashes | Sentry | ✅ Active |
| **Uptime Monitoring** | Availability checks | BetterStack | ⚙️ Setup Required |
| **Performance Monitoring** | Web vitals, response times | Vercel Analytics | ✅ Native |
| **Database Monitoring** | Connection health, queries | Supabase | ✅ Native |
| **Workflow Monitoring** | GitHub Actions failures | GitHub | ✅ Native |

---

## 1. Sentry Error Tracking

### Setup

1. **Create Sentry Account**
   - Go to https://sentry.io/signup/
   - Create organization (e.g., "roosevelt")

2. **Create Project**
   - Platform: **Next.js**
   - Project name: **roosevelt-ops-metrics**
   - Copy the **DSN** (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)

3. **Configure Environment Variables**

Add to `.env.local` (local development):
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=roosevelt
SENTRY_PROJECT=roosevelt-ops-metrics
```

Add to **Vercel** (production):
```bash
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add SENTRY_ORG production
vercel env add SENTRY_PROJECT production
```

Or via Vercel Dashboard:
- Go to Project → Settings → Environment Variables
- Add `NEXT_PUBLIC_SENTRY_DSN` (all environments)
- Add `SENTRY_ORG` (production only)
- Add `SENTRY_PROJECT` (production only)

4. **Optional: Source Maps Upload**

For better error debugging, generate Sentry Auth Token:
- Sentry → Settings → Auth Tokens → Create New Token
- Scopes: `project:releases`, `project:write`

Add to Vercel:
```bash
vercel env add SENTRY_AUTH_TOKEN production
```

5. **Redeploy**
```bash
git push
```

Vercel will automatically redeploy with Sentry integration.

### Features Enabled

- ✅ Automatic error capturing (client & server)
- ✅ Session Replay (10% sampling, 100% on errors)
- ✅ Performance monitoring
- ✅ Release tracking
- ✅ Source maps (if auth token configured)

### Alert Rules (Active)

Geconfigureerd via Sentry REST API op 2026-02-09.

| Rule | ID | Trigger | Rate Limit | Level Filter |
|------|----|---------|------------|--------------|
| **Send notification for high priority issues** | 402877 | Sentry markeert issue als high priority | 30 min | - |
| **First Seen Error in Production** | 406284 | Nieuw issue aangemaakt | 30 min | >= error |
| **Frequency Threshold (10+ events/hour)** | 406285 | >10 events in 1 uur | 60 min | >= error |
| **Regression Alert** | 406286 | Issue resolved → unresolved | 30 min | - |

**Notificatie routing:** IssueOwners → fallback ActiveMembers (email).

**CLI beheer:**
```bash
# Lijst alle alert rules
curl -s -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  "https://de.sentry.io/api/0/projects/roosevelt-ops/roosevelt-ops/rules/" \
  | python3 -m json.tool

# Verwijder rule (vervang RULE_ID)
curl -s -X DELETE -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  "https://de.sentry.io/api/0/projects/roosevelt-ops/roosevelt-ops/rules/RULE_ID/"

# Update rule (vervang RULE_ID)
curl -s -X PUT -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  "https://de.sentry.io/api/0/projects/roosevelt-ops/roosevelt-ops/rules/RULE_ID/" \
  -d '{"frequency": 60}'
```

### Testing

Trigger a test error:
```typescript
// Add to any page temporarily
throw new Error("Sentry test error!");
```

Check Sentry dashboard → Issues for the error.

---

## 2. BetterStack Uptime Monitoring

### Setup

1. **Create BetterStack Account**
   - Go to https://betterstack.com/uptime
   - Sign up (free tier: 10 monitors, 3-min checks)

2. **Create Monitor**
   - Click "Create Monitor"
   - URL: `https://roosevelt-5hkg3z0c4-roosevelt-d9f64ff6.vercel.app`
   - Name: `Roosevelt OPS Dashboard`
   - Check Frequency: **3 minutes** (free tier)
   - Regions: Select **multiple regions** (EU + US)

3. **Configure Alerts**
   - Add email notification (your email)
   - Optional: Slack integration
   - Alert on: **Down** (immediate)
   - Recovery notification: **Yes**

4. **Status Page** (Optional)
   - BetterStack → Status Pages → Create
   - Public URL: `status.rooseveltops.com` (if custom domain)
   - Add monitor to status page

### Alternative: UptimeRobot

Free tier with more monitors (50):
1. Go to https://uptimerobot.com
2. Add New Monitor
   - Type: HTTP(s)
   - URL: Dashboard URL
   - Interval: 5 minutes
3. Alert Contacts: Add email

---

## 3. Vercel Analytics

### Enable (If Not Already)

Vercel Analytics is automatically enabled for Pro accounts.

**Check status:**
1. Go to Vercel Dashboard → Project → Analytics
2. Should show Web Vitals data

**If not enabled:**
```bash
# Install package (usually not needed for Vercel deployments)
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Metrics Tracked

- ✅ **Core Web Vitals** (LCP, FID, CLS, TTFB)
- ✅ **Pageviews**
- ✅ **Top Pages**
- ✅ **Devices & Browsers**

---

## 4. Supabase Monitoring

### Native Monitoring (Included)

Supabase Cloud includes monitoring:

1. **Database Dashboard**
   - Go to https://supabase.com/dashboard/project/hitygwkfpqdwuypyfglh
   - Navigate to "Reports"

2. **Metrics Available:**
   - ✅ API requests
   - ✅ Database size
   - ✅ Bandwidth usage
   - ✅ Active connections
   - ✅ Query performance

3. **Alerts**
   - Go to Project → Settings → Alerts
   - Configure email alerts for:
     - High API usage
     - Database size limits
     - Connection limits

---

## 5. GitHub Actions Monitoring

### Built-in Notifications

GitHub Actions sends email notifications on workflow failures by default.

**Configure:**
1. Go to https://github.com/hansbeeksma/roosevelt-ops/settings/notifications
2. Enable "Actions" notifications
3. Choose: **Email** or **Web** or **Both**

**Webhook to Slack** (Optional):
```yaml
# Add to .github/workflows/dora-metrics.yml
- name: Notify on Failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Alert Configuration Summary

| Alert Type | Service | Recipient | Condition | Status |
|------------|---------|-----------|-----------|--------|
| **First Seen Error** | Sentry | Email | New issue, level >= error | ✅ Active |
| **High Priority Issue** | Sentry | Email | Sentry flags as high priority | ✅ Active |
| **Frequency Spike** | Sentry | Email | >10 events/hour, level >= error | ✅ Active |
| **Regression** | Sentry | Email | Resolved → unresolved | ✅ Active |
| **Downtime** | BetterStack | Email | HTTP != 200 | ⚙️ Setup Required |
| **Performance Degradation** | Vercel Analytics | Dashboard only | CLS > 0.25 | ✅ Native |
| **Database Issues** | Supabase | Email | Connection > 80% | ✅ Native |
| **Workflow Failures** | GitHub | Email | Actions fail | ✅ Native |

---

## Incident Response Workflow

When an alert fires:

1. **Identify** - Check alert source and severity
2. **Assess** - Is it impacting users?
3. **Mitigate** - Immediate fix or rollback
4. **Communicate** - Update status page (if public)
5. **Resolve** - Fix root cause
6. **Document** - Record incident in ROOSE project (Plane)

**Incident Template:**
- Create issue in Plane: `[INCIDENT] <title>`
- Labels: `incident`, `p0` (or `p1`)
- Link to Sentry/BetterStack alert
- Add postmortem after resolution

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| Sentry | Developer (free) | $0/month (5K errors/month) |
| BetterStack | Free | $0/month (10 monitors) |
| Vercel Analytics | Pro (included) | $0 (included in Pro plan) |
| Supabase Monitoring | Free (included) | $0 (included in project) |
| **Total** | | **$0/month** |

**Upgrade paths:**
- Sentry Team: $29/month (50K errors)
- BetterStack Pro: $18/month (unlimited monitors)

---

## Dashboard Links

**Monitoring Dashboards:**
- Sentry: https://roosevelt-ops.sentry.io/projects/roosevelt-ops/
- Sentry Alerts: https://roosevelt-ops.sentry.io/alerts/rules/
- BetterStack: https://betterstack.com/uptime
- Vercel Analytics: https://vercel.com/roosevelt-d9f64ff6/roosevelt-ops/analytics
- Supabase: https://supabase.com/dashboard/project/hitygwkfpqdwuypyfglh/reports

**Production App:**
- Dashboard: https://roosevelt-5hkg3z0c4-roosevelt-d9f64ff6.vercel.app

---

## Testing the Stack

### 1. Test Sentry
```typescript
// In any component
throw new Error("Test error for Sentry");
```

### 2. Test BetterStack
- Stop Vercel deployment temporarily
- Wait 3 minutes
- Should receive downtime alert

### 3. Test GitHub Actions
- Push a commit that breaks tests
- Should receive workflow failure email

---

## Troubleshooting

### Sentry not capturing errors

**Check:**
1. DSN configured correctly? `echo $NEXT_PUBLIC_SENTRY_DSN`
2. Redeployed after adding DSN?
3. Check browser console for Sentry SDK logs

**Debug mode:**
```typescript
// In sentry.client.config.ts
Sentry.init({
  debug: true,  // Enable logging
  ...
});
```

### BetterStack false positives

**Solution:**
- Increase check interval (3 min → 5 min)
- Enable "Confirmation period" (wait for 2 failures)
- Check from multiple regions

### No Vercel Analytics data

**Check:**
1. Pro plan active?
2. Analytics enabled in project settings?
3. Wait 24h for data to populate

---

*Last Updated: 2026-02-09*
