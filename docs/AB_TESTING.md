# A/B Testing for Performance Optimization

**Version:** 1.0.0
**Last Updated:** 2026-02-06
**Related Issue:** ROOSE-37.13

---

## Overview

Lightweight A/B testing implementation to measure the business impact of performance optimizations.

**Current Experiment:** Performance Optimization V1
- **Hypothesis:** Improving Core Web Vitals (LCP 4.1s → 2.1s) will increase conversion rate by 15%
- **Variants:** Control (baseline) vs Treatment (optimized)
- **Tracking:** Sentry custom events for analytics

---

## Quick Start

### 1. Enable Experiments

```bash
# .env.local
NEXT_PUBLIC_AB_TEST_ENABLED=true
```

### 2. Add Tracker to Layout

```typescript
// app/layout.tsx
import { ExperimentTracker } from '@/components/ExperimentTracker'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ExperimentTracker />
        {children}
      </body>
    </html>
  )
}
```

### 3. Track Conversions

```typescript
// Mark conversion points in your UI
<button data-conversion="cta-click">
  Sign Up
</button>

<form data-conversion="form-submit">
  {/* ... */}
</form>
```

---

## How It Works

### Variant Assignment

Users are deterministically assigned to control or treatment based on their user ID:

```typescript
import { assignVariant, PERFORMANCE_EXPERIMENT } from '@/lib/ab-testing'

const variant = assignVariant(userId, PERFORMANCE_EXPERIMENT)
// Returns: 'control' or 'treatment'
```

**Assignment Logic:**
- **Deterministic:** Same user always gets same variant
- **50/50 split:** Traffic allocation = 0.5
- **Stored in localStorage:** Consistent across sessions

### Automatic Tracking

The `ExperimentTracker` component automatically tracks:

| Event | When | Metric |
|-------|------|--------|
| **Exposure** | User sees page | `AB Test Exposure` |
| **Page View** | Every navigation | `pageview` conversion |
| **Bounce** | Exit <5 seconds | `bounce` conversion |
| **CTA Click** | `data-conversion` clicked | Custom conversion name |

### Manual Tracking

```typescript
import { trackCustomConversion } from '@/components/ExperimentTracker'

// Track any custom event
function handleCheckout() {
  trackCustomConversion('checkout-complete', 149.99)
}

// Track engagement
function handleScroll() {
  if (scrollDepth > 75) {
    trackCustomConversion('scroll-75', 1)
  }
}
```

---

## Experiment Configuration

### Performance Optimization V1

**Experiment Config:**
```typescript
// lib/ab-testing.ts
export const PERFORMANCE_EXPERIMENT: ExperimentConfig = {
  name: 'performance-optimization-v1',
  description: 'Test impact of performance optimizations',
  trafficAllocation: 0.5, // 50/50 split
  enabled: process.env.NEXT_PUBLIC_AB_TEST_ENABLED === 'true',
}
```

**Hypothesis:**
> "By improving LCP from 4.1s to 2.1s (-49%), we expect:
> - **10% decrease** in bounce rate
> - **15% increase** in conversion rate
> - **20% increase** in pages per session"

**Variants:**

| Variant | Description | Performance |
|---------|-------------|-------------|
| **Control** | Pre-optimization baseline | LCP: 4.1s, FCP: 3.2s |
| **Treatment** | All ROOSE-37.1-37.12 optimizations | LCP: 2.1s, FCP: 1.6s |

---

## Viewing Results

### Sentry Dashboard

**Location:** Sentry → Discover → Custom Queries

**Query 1: Exposure Count**
```sql
SELECT
  experiment,
  variant,
  count() AS exposures
WHERE
  message = "AB Test Exposure"
  AND experiment = "performance-optimization-v1"
GROUP BY variant
```

**Query 2: Conversion Rate**
```sql
SELECT
  variant,
  countIf(metric = 'cta-click') AS conversions,
  count() AS exposures,
  conversions / exposures AS conversion_rate
WHERE
  message IN ("AB Test Exposure", "AB Test Conversion")
  AND experiment = "performance-optimization-v1"
GROUP BY variant
```

**Query 3: Bounce Rate**
```sql
SELECT
  variant,
  countIf(metric = 'bounce') AS bounces,
  countIf(metric = 'pageview') AS pageviews,
  bounces / pageviews AS bounce_rate
WHERE
  message = "AB Test Conversion"
  AND experiment = "performance-optimization-v1"
GROUP BY variant
```

### Statistical Significance

Use the built-in calculator:

```typescript
import { calculateSignificance } from '@/lib/ab-testing'

const result = calculateSignificance(
  controlConversions: 230,    // 230 conversions
  controlSample: 10000,        // out of 10,000 users
  treatmentConversions: 276,   // 276 conversions
  treatmentSample: 10000       // out of 10,000 users
)

console.log(result)
// {
//   pValue: 0.023,
//   significant: true,    // p < 0.05
//   confidence: 97.7%
// }
```

**Interpretation:**
- **p < 0.05**: Statistically significant (95% confidence)
- **p < 0.01**: Highly significant (99% confidence)
- **p ≥ 0.05**: Not significant, need more data or no effect

---

## Sample Size Calculator

**Formula:**
```
n = (Z_α/2 + Z_β)² × (p₁(1-p₁) + p₂(1-p₂)) / (p₂ - p₁)²
```

**Simplified:**

| Baseline CR | Target CR | Min Sample Size per Variant |
|-------------|-----------|----------------------------|
| 2.0% | 2.3% (+15%) | 31,500 |
| 2.5% | 2.9% (+15%) | 26,800 |
| 3.0% | 3.5% (+15%) | 22,400 |
| 5.0% | 5.8% (+15%) | 13,500 |

**Assumptions:**
- 95% confidence (α = 0.05)
- 80% power (β = 0.20)
- Two-tailed test

**Online Calculators:**
- [Evan Miller Sample Size Calculator](https://www.evanmiller.org/ab-testing/sample-size.html)
- [Optimizely Sample Size Calculator](https://www.optimizely.com/sample-size-calculator/)

---

## Test Duration

**Minimum Duration:** 2 weeks (14 days)

**Why 2 weeks?**
- Captures weekday/weekend variation
- Smooths out day-of-week effects
- Allows sufficient sample size accumulation

**Formula:**
```
Days = (Sample Size per Variant × 2) / Daily Traffic
```

**Example:**
- Sample size needed: 26,800 per variant
- Daily traffic: 2,000 users
- Duration: (26,800 × 2) / 2,000 = **27 days**

**Best Practices:**
- Run full weeks (7, 14, 21 days) to avoid weekly seasonality
- Avoid holidays or special events
- Monitor daily for major anomalies

---

## Results Template

### Experiment Report

```markdown
# Performance Optimization V1 - Results

**Duration:** Feb 6 - Feb 20, 2026 (14 days)
**Sample Size:** 28,000 users (14,000 per variant)
**Confidence:** 95%

## Hypothesis
Improving Core Web Vitals will increase conversion rate by 15%

## Results

| Metric | Control | Treatment | Change | p-value | Significant? |
|--------|---------|-----------|--------|---------|--------------|
| **Conversion Rate** | 2.3% | 2.7% | **+17.4%** | 0.012 | ✅ Yes |
| **Bounce Rate** | 42% | 36% | **-14.3%** | 0.008 | ✅ Yes |
| **Pages/Session** | 2.1 | 2.5 | **+19.0%** | 0.034 | ✅ Yes |
| **Avg Session** | 3.2min | 4.1min | **+28.1%** | 0.019 | ✅ Yes |

## Performance Metrics (RUM)

| Metric | Control | Treatment | Improvement |
|--------|---------|-----------|-------------|
| **LCP** | 4.1s | 2.1s | -49% |
| **FCP** | 3.2s | 1.6s | -50% |
| **CLS** | 0.15 | 0.05 | -67% |

## Business Impact

**If rolled out to 100% of traffic:**
- **+17.4% conversion rate** → ~$X additional revenue/month
- **-14.3% bounce rate** → Better user retention
- **+19% pages/session** → Higher engagement

## Recommendation

✅ **Launch to 100%** - Strong positive results with high confidence.

## Next Steps
1. Deploy optimized version to all users
2. Monitor RUM dashboard for 7 days
3. Set up performance regression alerts
4. Document learnings in performance playbook
```

---

## Troubleshooting

### Issue: No exposure events in Sentry

**Check:**
1. `NEXT_PUBLIC_AB_TEST_ENABLED=true` in `.env.local`
2. ExperimentTracker component added to layout
3. Sentry DSN configured correctly
4. Browser console for errors

**Solution:**
```bash
# Verify Sentry is working
npm run dev
# Open browser console, check for Sentry init message
```

---

### Issue: Uneven variant distribution

**Expected:** 50/50 split (±2% with large samples)

**Check:**
```typescript
// lib/ab-testing.ts
trafficAllocation: 0.5, // Should be 0.5 for 50/50
```

**Verify:**
Query Sentry for exposure counts:
```sql
SELECT variant, count() FROM events
WHERE message = "AB Test Exposure"
GROUP BY variant
```

---

### Issue: Low sample size

**Solutions:**
1. **Run longer** - Extend test duration
2. **Increase traffic** - Promote landing page
3. **Lower MDE** - Accept smaller effect size (requires more samples)

---

## Best Practices

### DO ✅

- **Run for full weeks** (7, 14, 21 days) to capture weekly patterns
- **Wait for significance** before making decisions (p < 0.05)
- **Document results** even if negative (learnings are valuable)
- **Monitor daily** for anomalies (server errors, bot traffic)
- **Use guardrail metrics** (page load time, error rate)

### DON'T ❌

- **Stop early** when winning (regression to mean is real)
- **Peek repeatedly** (increases false positive rate)
- **Change experiment mid-test** (invalidates results)
- **Run multiple tests simultaneously** (interaction effects)
- **Trust small samples** (need statistical power)

---

## Guardrail Metrics

Monitor these to ensure no negative side effects:

| Metric | Threshold | Alert If |
|--------|-----------|----------|
| **Error Rate** | <1% | Spike >2% |
| **Page Load Time (P95)** | <5s | Exceeds 6s |
| **Sentry Errors** | <10/day | Spike >20/day |
| **RUM LCP (P75)** | <2.5s | Exceeds 3s |

**Setup Alerts:**
Sentry → Alerts → Metric Alert → Configure thresholds

---

## Advanced: Creating New Experiments

### 1. Define Experiment

```typescript
// lib/ab-testing.ts
export const MY_NEW_EXPERIMENT: ExperimentConfig = {
  name: 'new-feature-test',
  description: 'Test impact of new feature X',
  trafficAllocation: 0.5,
  enabled: process.env.NEXT_PUBLIC_AB_TEST_MY_EXPERIMENT === 'true',
}
```

### 2. Use in Component

```typescript
import { useExperiment, MY_NEW_EXPERIMENT } from '@/lib/ab-testing'

export function MyComponent() {
  const { variant } = useExperiment(MY_NEW_EXPERIMENT)

  return (
    <div>
      {variant === 'control' ? (
        <OldFeature />
      ) : (
        <NewFeature />
      )}
    </div>
  )
}
```

### 3. Track Conversions

```typescript
<button
  data-conversion="new-feature-click"
  onClick={() => trackCustomConversion('new-feature-engagement', 1)}
>
  Try New Feature
</button>
```

---

## Limitations & Future Improvements

### Current Limitations

1. **No built-in dashboard** - Results require Sentry custom queries
2. **Basic statistical analysis** - No advanced methods (Bayesian, CUSUM)
3. **No multivariate testing** - Only A/B (two variants)
4. **No automatic winner selection** - Manual decision required
5. **localStorage-based** - User ID not persistent across devices

### Recommended Full-Featured Platforms

For production-scale A/B testing, consider:

| Platform | Pricing | Best For |
|----------|---------|----------|
| **PostHog** | Free (self-hosted), $0-450/mo (cloud) | Feature flags + analytics + session replay |
| **GrowthBook** | Free (open source) | Developer-friendly, SQL-based analysis |
| **Optimizely** | Enterprise ($50k+/year) | Large orgs, advanced targeting |
| **VWO** | $199-999/mo | Visual editor, no-code experiments |

### Future Enhancements

**Recommended Follow-Up (see Plane):**
- [ ] PostHog integration for full-featured A/B testing
- [ ] Automated statistical significance monitoring
- [ ] Visual experiment dashboard
- [ ] Multi-armed bandit optimization
- [ ] Server-side experimentation (Edge middleware)

---

## Resources

- [Evan Miller: A/B Testing Guide](https://www.evanmiller.org/ab-testing/)
- [Google Analytics: Experiment Planning](https://support.google.com/analytics/answer/1745147)
- [Optimizely Stats Engine](https://www.optimizely.com/optimization-resources/stats-engine/)
- [VWO Statistical Significance Calculator](https://vwo.com/tools/ab-test-significance-calculator/)

---

**Document Version:** 1.0.0
**Last Updated:** 2026-02-06
**Maintained by:** Frontend Team
**Questions?** See Performance Playbook or #performance Slack channel

