# Real User Monitoring (RUM) Dashboard - Core Web Vitals

## Overview

This document describes the RUM setup for tracking Core Web Vitals in production using Sentry Performance Monitoring.

## What is Tracked

### Core Web Vitals

**Current (2024+):**
- **LCP** (Largest Contentful Paint) - Target: ≤ 2.5s
- **INP** (Interaction to Next Paint) - Target: ≤ 200ms (replaces FID)
- **CLS** (Cumulative Layout Shift) - Target: ≤ 0.1

**Additional Metrics:**
- **FCP** (First Contentful Paint) - Target: ≤ 1.8s
- **TTFB** (Time to First Byte) - Target: ≤ 800ms

### Tracking Details

All metrics are:
- ✅ Reported to Sentry automatically
- ✅ Tracked at P75 (75th percentile)
- ✅ Segmented by device type, geography, connection
- ✅ Rated as "good", "needs-improvement", or "poor"

---

## Implementation

### 1. Code Integration

**Sentry Client Config** (`sentry.client.config.ts`):
```typescript
Sentry.browserTracingIntegration({
  enableLongTask: true,
  enableInp: true, // INP tracking (replaces FID)
})
```

**Web Vitals Reporter** (`lib/web-vitals.ts`):
- Reports metrics to Sentry as measurements
- Sends detailed context (rating, navigation type)
- Logs to console in development

**App Integration** (`app/layout.tsx`):
- WebVitals component auto-reports on every page load
- No manual intervention required

### 2. Environment Variables

Required in `.env.local` and Vercel/Production:

```env
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@o<org>.ingest.sentry.io/<project>
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

### 3. Sentry Configuration

**In Sentry Dashboard:**
1. Go to Settings → Projects → roosevelt-ops
2. Enable Performance Monitoring
3. Set sample rate (currently: 100% for development, adjust for production)
4. Enable Session Replay for debugging

---

## Sentry Dashboard Setup

### Navigate to Performance

1. Go to **Performance** in left sidebar
2. Select **Web Vitals** tab
3. View real-time P75 scores for all metrics

### Create Custom Dashboard

**Steps:**
1. Go to **Dashboards** → Create Dashboard
2. Add widgets for each Core Web Vital:
   - LCP (target: ≤ 2.5s)
   - INP (target: ≤ 200ms)
   - CLS (target: ≤ 0.1)
   - FCP (target: ≤ 1.8s)
   - TTFB (target: ≤ 800ms)

**Widget Configuration:**
- **Visualization:** Time series chart
- **Y-Axis:** P75 value
- **Group by:** Page, device type, geography

### Example Widget Query (LCP)

```
p75(measurements.lcp)
WHERE transaction.op:pageload
GROUP BY transaction
```

### Create Alerts

**Alert Rules:**
1. Go to **Alerts** → Create Alert Rule
2. Select **Metric Alert**
3. Configure:
   - Metric: `p75(measurements.lcp)`
   - Threshold: `> 2500` (2.5s)
   - Condition: When metric exceeds threshold for 5 minutes
   - Actions: Send email, Slack notification

**Recommended Alerts:**
| Metric | Threshold | Severity |
|--------|-----------|----------|
| LCP | > 2500ms | High |
| INP | > 200ms | High |
| CLS | > 0.1 | Medium |
| FCP | > 1800ms | Medium |
| TTFB | > 800ms | Low |

---

## Viewing Data

### Performance Tab

**Real-time overview:**
1. Navigate to **Performance** → **Web Vitals**
2. View P75 scores for all pages
3. Filter by:
   - Time range (24h, 7d, 30d, custom)
   - Page/route
   - Device type (desktop, mobile, tablet)
   - Browser
   - Geography (country, region)
   - Connection type (4G, 5G, wifi)

### Individual Transactions

**Drill down into specific page loads:**
1. Click on any transaction in Performance
2. View:
   - Full waterfall timeline
   - Web Vitals breakdown
   - Resource loading details
   - Long tasks (blocking main thread)
   - Session replay (if available)

### Trends Over Time

**Track improvements/regressions:**
1. Go to **Performance** → **Trends**
2. Select time range (7d, 30d, 90d)
3. Identify:
   - Pages with degrading performance
   - Impact of recent deployments
   - Seasonal patterns

---

## Interpreting Metrics

### LCP (Largest Contentful Paint)

**What it measures:** Time until largest content element is visible.

**Thresholds:**
- **Good:** ≤ 2.5s
- **Needs Improvement:** 2.5s - 4.0s
- **Poor:** > 4.0s

**Common issues:**
- Large unoptimized images
- Slow server response time
- Render-blocking resources
- Client-side rendering delays

**Fix strategies:**
- Optimize images (WebP, AVIF, responsive)
- Use CDN for static assets
- Implement server-side caching
- Preload critical resources

### INP (Interaction to Next Paint)

**What it measures:** Responsiveness to user interactions.

**Thresholds:**
- **Good:** ≤ 200ms
- **Needs Improvement:** 200ms - 500ms
- **Poor:** > 500ms

**Common issues:**
- Heavy JavaScript execution
- Long tasks blocking main thread
- Expensive event handlers
- Inefficient React re-renders

**Fix strategies:**
- Code splitting (dynamic imports)
- Debounce expensive operations
- Use web workers for heavy computation
- Optimize React components (memo, useCallback)

### CLS (Cumulative Layout Shift)

**What it measures:** Visual stability (unexpected layout shifts).

**Thresholds:**
- **Good:** ≤ 0.1
- **Needs Improvement:** 0.1 - 0.25
- **Poor:** > 0.25

**Common issues:**
- Images without dimensions
- Ads/embeds without reserved space
- Web fonts causing FOIT/FOUT
- Dynamic content insertion

**Fix strategies:**
- Set width/height on images and videos
- Reserve space for ads/embeds
- Use `font-display: swap` with fallback fonts
- Avoid inserting content above existing content

### FCP (First Contentful Paint)

**What it measures:** Time until first text/image appears.

**Thresholds:**
- **Good:** ≤ 1.8s
- **Needs Improvement:** 1.8s - 3.0s
- **Poor:** > 3.0s

**Common issues:**
- Render-blocking CSS/JS
- Slow server response
- No resource hints
- Large HTML document

**Fix strategies:**
- Inline critical CSS
- Defer non-critical JS
- Use resource hints (preconnect, dns-prefetch)
- Optimize server response time

### TTFB (Time to First Byte)

**What it measures:** Server responsiveness.

**Thresholds:**
- **Good:** ≤ 800ms
- **Needs Improvement:** 800ms - 1800ms
- **Poor:** > 1800ms

**Common issues:**
- Slow server processing
- Database query inefficiency
- No caching
- Network latency

**Fix strategies:**
- Implement server-side caching (Redis)
- Optimize database queries
- Use CDN
- Enable HTTP/2 or HTTP/3

---

## Segmentation & Filtering

### By Device Type

**Why:** Mobile vs desktop performance differs significantly.

**How:**
1. Go to **Performance** → **Web Vitals**
2. Filter by `device.class`
3. Compare metrics across device types

**Insights:**
- Mobile typically 2-3x slower LCP
- Mobile INP often worse (slower processors)
- Optimize mobile-specific issues first

### By Geography

**Why:** Performance varies by region (CDN coverage, network quality).

**How:**
1. Filter by `geo.country_code`
2. Identify regions with poor performance
3. Consider regional CDN improvements

### By Connection Type

**Why:** 4G vs 5G vs WiFi impacts load times.

**How:**
1. Filter by `effectiveConnectionType`
2. Optimize for slowest common connection (4G)

### By Browser

**Why:** Different browsers have different performance characteristics.

**How:**
1. Filter by `browser.name` and `browser.version`
2. Identify browser-specific regressions

---

## Alerting Strategy

### Critical Alerts (Immediate Action)

**LCP > 4.0s:**
- Severity: Critical
- Impact: Direct SEO penalty, user churn
- Action: Investigate immediately, rollback if deployment-related

**INP > 500ms:**
- Severity: Critical
- Impact: User frustration, interaction lag
- Action: Check for JS errors, long tasks

### Warning Alerts (Monitor)

**LCP 2.5s - 4.0s:**
- Severity: Warning
- Impact: Degraded UX, potential SEO impact
- Action: Schedule optimization work

**CLS > 0.1:**
- Severity: Warning
- Impact: Annoying UX, layout jumps
- Action: Review recent CSS/layout changes

### Info Alerts (Track Trends)

**FCP > 1.8s:**
- Severity: Info
- Impact: Perceived slowness
- Action: Monitor trends, optimize if worsening

---

## Integration with CI/CD

### Pre-Deployment Checks

**Lighthouse CI** (already configured):
- Runs on every PR
- Checks against performance budgets
- Fails build if budgets exceeded

**Synthetic Monitoring:**
- Consider adding Checkly or Speedcurve for pre-prod checks

### Post-Deployment Monitoring

**Sentry Release Tracking:**
1. Tag deployments with release version
2. Compare metrics before/after deployment
3. Rollback if significant regression detected

**Setup:**
```bash
# In CI/CD pipeline
sentry-cli releases new <version>
sentry-cli releases set-commits <version> --auto
sentry-cli releases finalize <version>
```

---

## Optimization Workflow

### 1. Identify Issues

**Daily:**
- Check Sentry dashboard for alert
- Review P75 trends
- Identify pages with poor metrics

### 2. Diagnose

**Tools:**
- Sentry transaction details (waterfall)
- Chrome DevTools Lighthouse
- Session Replay (if available)

### 3. Fix

**Prioritize:**
1. Quick wins (image optimization, caching)
2. Medium effort (code splitting, lazy loading)
3. Long-term (architectural changes)

### 4. Verify

**After deploying fix:**
1. Monitor Sentry dashboard for 24-48h
2. Compare P75 before/after
3. Ensure no regressions

### 5. Document

**Record learnings:**
- What was the issue?
- What was the fix?
- What was the impact?

---

## Advanced Features

### Session Replay

**What it does:**
- Records user sessions (video-like)
- Shows exactly what user saw when metrics were poor

**Setup:**
Already enabled in `sentry.client.config.ts`:
```typescript
replaysOnErrorSampleRate: 1.0,
replaysSessionSampleRate: 0.1, // 10% of sessions
```

**Usage:**
1. Find poor-performing transaction
2. Click **Replay** tab
3. Watch session recording
4. Identify UX issues visually

### Profiling

**What it does:**
- Shows JavaScript execution flame graph
- Identifies expensive functions

**Setup:**
Already enabled:
```typescript
profilesSampleRate: 1.0 // 100% of transactions
```

**Usage:**
1. Click on slow transaction
2. View **Profiles** tab
3. Identify hot spots in code

---

## Cost Optimization

### Sentry Free Tier

**Limits:**
- 5k errors/month
- 10k transactions/month
- 50 replays/month

**Recommendations:**
- Use tracesSampleRate: 0.1 (10%) in production
- Use replaysSessionSampleRate: 0.01 (1%) in production

### Production Configuration

**Update in production environment:**
```typescript
// sentry.client.config.ts
Sentry.init({
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
})
```

---

## Troubleshooting

### No Data Showing Up

**Check:**
1. `NEXT_PUBLIC_SENTRY_DSN` is set correctly
2. Sentry client config is loading (check browser console)
3. Performance monitoring is enabled in Sentry project settings

### Metrics Look Wrong

**Common causes:**
- Bots/crawlers inflating metrics
- Staging environment mixed with production
- Sampling rate too low

**Solutions:**
- Filter by `user.segment` to exclude bots
- Use separate Sentry projects for staging/prod
- Increase sample rate (costs more)

### Alerts Not Firing

**Check:**
1. Alert rule is enabled
2. Threshold is correct (ms, not s)
3. Notification channel is configured

---

## Resources

- [Sentry Performance Docs](https://docs.sentry.io/product/performance/)
- [Web Vitals](https://web.dev/vitals/)
- [Core Web Vitals Guide](https://web.dev/vitals-guides/)
- [Sentry Web Vitals](https://docs.sentry.io/product/performance/web-vitals/)

---

*Last Updated: 2026-02-06*
*Related Issue: ROOSE-37.12*
