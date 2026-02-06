# Performance Budget Guide

## Overview

This document details the performance budget configuration for Roosevelt OPS, enforced automatically via Lighthouse CI in GitHub Actions.

## Table of Contents

1. [Configuration](#configuration)
2. [Core Web Vitals](#core-web-vitals)
3. [Resource Budgets](#resource-budgets)
4. [CI Integration](#ci-integration)
5. [Local Testing](#local-testing)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Configuration

Performance budgets are defined in `lighthouserc.json` at the project root.

### Lighthouse CI Config Structure

```json
{
  "ci": {
    "collect": { ... },      // How to collect Lighthouse data
    "assert": { ... },       // Performance assertions
    "upload": { ... }        // Where to upload results
  },
  "budgets": [ ... ]         // Resource and timing budgets
}
```

### Key Configuration Sections

#### 1. Collection
- Starts local server (`npm run build && npm run start`)
- Runs Lighthouse against `http://localhost:3000`
- Collects 3 runs and averages results

#### 2. Assertions
- Minimum scores for Lighthouse categories
- Core Web Vitals thresholds
- Uses `error` level to fail CI build on breach

#### 3. Upload
- Uploads to `temporary-public-storage`
- Results available for 7 days
- Can configure permanent storage later

---

## Core Web Vitals

### First Contentful Paint (FCP)
**Budget:** ≤ 2000ms

**What it measures:** Time until first text/image is painted.

**Why it matters:** First visual feedback to user that page is loading.

**Optimization tips:**
- Inline critical CSS
- Preload fonts
- Remove render-blocking resources
- Use resource hints (`preconnect`, `dns-prefetch`)

### Largest Contentful Paint (LCP)
**Budget:** ≤ 2500ms

**What it measures:** Time until largest content element is rendered.

**Why it matters:** Indicates when main content is visible.

**Optimization tips:**
- Optimize images (WebP, AVIF, responsive)
- Lazy load below-the-fold images
- Use CDN for static assets
- Implement server-side caching

### Cumulative Layout Shift (CLS)
**Budget:** ≤ 0.1

**What it measures:** Visual stability (unexpected layout shifts).

**Why it matters:** Prevents frustrating UX where content jumps around.

**Optimization tips:**
- Set width/height on images and videos
- Reserve space for ads/embeds
- Use `font-display: swap` with fallback fonts
- Avoid inserting content above existing content

### Total Blocking Time (TBT)
**Budget:** ≤ 300ms

**What it measures:** Total time main thread is blocked.

**Why it matters:** Indicates responsiveness during page load.

**Optimization tips:**
- Code splitting (dynamic imports)
- Defer non-critical JavaScript
- Reduce main thread work
- Use web workers for heavy computation

### Speed Index
**Budget:** ≤ 3000ms

**What it measures:** How quickly page content is visually populated.

**Why it matters:** User perception of load speed.

**Optimization tips:**
- Prioritize above-the-fold content
- Inline critical CSS
- Optimize font loading
- Remove unused CSS/JS

### Time to Interactive (TTI)
**Budget:** ≤ 5000ms

**What it measures:** Time until page is fully interactive.

**Why it matters:** When users can meaningfully interact with page.

**Optimization tips:**
- Minimize JavaScript execution time
- Split large bundles
- Tree-shake unused code
- Use progressive enhancement

---

## Resource Budgets

### JavaScript Budget: 500KB

**Current state:** Next.js app with standard dependencies.

**What's included:**
- React runtime (~130KB gzipped)
- Next.js framework code
- Application code
- Third-party libraries

**Breach prevention:**
- Audit bundle with `@next/bundle-analyzer`
- Code split routes and components
- Tree-shake unused dependencies
- Consider lighter alternatives (e.g., date-fns → day.js)

### CSS Budget: 100KB

**Current state:** Tailwind CSS with purging enabled.

**What's included:**
- Tailwind utilities (purged)
- Custom styles
- Component styles

**Breach prevention:**
- Ensure Tailwind purging is configured
- Remove unused CSS
- Use CSS modules for component isolation
- Avoid large CSS frameworks

### Image Budget: 300KB

**Current state:** Minimal images currently.

**What's included:**
- Logo
- Icons
- Hero images
- Background images

**Breach prevention:**
- Use WebP/AVIF formats
- Implement responsive images (`srcset`)
- Lazy load below-the-fold images
- Use Next.js Image component (`next/image`)

### Font Budget: 150KB

**Current state:** Using system fonts or minimal web fonts.

**What's included:**
- Custom fonts (if any)
- Icon fonts

**Breach prevention:**
- Use variable fonts (one file for all weights)
- Subset fonts (only needed characters)
- Use `font-display: swap`
- Preload critical fonts
- Consider system font stacks

### Total Page Weight: 1.5MB

**Philosophy:** Keep initial load under 1.5MB for reasonable 4G experience.

**Breakdown target:**
- JS: 500KB (33%)
- CSS: 100KB (7%)
- Images: 300KB (20%)
- Fonts: 150KB (10%)
- Other: 450KB (30%)

---

## CI Integration

### GitHub Actions Workflow

Location: `.github/workflows/ci.yml`

```yaml
performance-budget:
  name: Performance Budget
  runs-on: ubuntu-latest
  needs: build
  steps:
    - name: Run Lighthouse CI
      run: npm run lhci:autorun -- --collect.settings.chromeFlags="--no-sandbox"
```

### Workflow Behavior

1. **Trigger:** On every push to `main` and all PRs
2. **Execution:** Runs after `build` job completes
3. **Failure:** Fails if any budget is exceeded
4. **Artifacts:** Uploads Lighthouse HTML reports (7-day retention)

### Required Secrets

**Optional:**
- `LHCI_GITHUB_APP_TOKEN` - For GitHub status checks (can install Lighthouse CI GitHub App)

**Not required for basic setup.**

---

## Local Testing

### Full Automated Run

```bash
npm run perf
```

**What it does:**
1. Builds production app
2. Starts production server
3. Runs Lighthouse against localhost
4. Asserts against budgets
5. Generates HTML reports

**Output:**
- `.lighthouseci/` directory with reports
- Console output with assertion results

### Individual Commands

```bash
# Collect Lighthouse data only
npm run lhci:collect

# Assert against budgets only (requires prior collect)
npm run lhci:assert

# Full automated run (build + start + collect + assert)
npm run lhci:autorun
```

### Manual Chrome DevTools

**Alternative:** Use Chrome DevTools Lighthouse panel

1. Build production app: `npm run build`
2. Start production server: `npm run start`
3. Open Chrome DevTools → Lighthouse
4. Run audit with "Desktop" or "Mobile" preset
5. Review performance score and opportunities

---

## Troubleshooting

### Build Fails Due to Performance Budget

**Symptom:** CI job `performance-budget` fails with Lighthouse assertion errors.

**Diagnosis:**
1. Check CI artifacts for Lighthouse HTML report
2. Review specific failing metrics
3. Identify root cause (e.g., large JS bundle, slow images)

**Solutions:**

#### JavaScript Budget Exceeded

```bash
# Analyze bundle
npm install --save-dev @next/bundle-analyzer
# Configure in next.config.js
# Run: ANALYZE=true npm run build
```

**Common causes:**
- Large dependencies (Moment.js, Lodash)
- Duplicate dependencies in bundle
- Unused code not tree-shaken

**Fixes:**
- Replace heavy deps with lighter alternatives
- Code split routes: `dynamic(() => import('./Component'))`
- Tree-shake: Use named imports, not namespace imports

#### Image Budget Exceeded

**Common causes:**
- Unoptimized images (PNG instead of WebP)
- Large hero images
- Missing responsive images

**Fixes:**
- Use Next.js Image component
- Convert to WebP/AVIF
- Implement responsive images with `srcset`

#### Core Web Vitals Failing

**FCP/LCP slow:**
- Preload critical resources
- Inline critical CSS
- Optimize server response time

**CLS high:**
- Set image dimensions
- Reserve space for dynamic content
- Use `font-display: swap`

**TBT high:**
- Code split heavy components
- Defer non-critical JS
- Reduce main thread work

---

## Best Practices

### 1. Run Performance Audits Regularly

**Frequency:** Every major feature addition or dependency update.

```bash
npm run perf
```

### 2. Monitor Bundle Size

**Tool:** Next.js Bundle Analyzer

```bash
ANALYZE=true npm run build
```

**Action:** Review bundle map, identify large dependencies, split code.

### 3. Implement Lazy Loading

**Images:**
```jsx
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  loading="lazy"
/>
```

**Components:**
```jsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
})
```

### 4. Use Progressive Enhancement

**Philosophy:** Ship minimal viable experience first, enhance later.

**Example:**
- Load critical CSS inline
- Defer non-critical CSS
- Load heavy JS after interactive

### 5. Optimize Fonts

**Best practice:**
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap;
  font-weight: 100 900;
}
```

**Benefits:**
- Variable font (one file)
- WOFF2 (best compression)
- `font-display: swap` (no FOIT)

### 6. Set Up Performance Budgets Early

**When:** Before adding significant features or dependencies.

**Why:** Easier to maintain budget than to fix later.

---

## Updating Budgets

### When to Adjust

**Relax budgets:**
- Dashboard app with heavy interactivity
- B2B SaaS with complex workflows
- Internal tools (less critical UX)

**Tighten budgets:**
- Marketing/landing pages
- E-commerce checkout flows
- Mobile-first experiences

### How to Adjust

Edit `lighthouserc.json`:

```json
{
  "budgets": [
    {
      "path": "/*",
      "timings": [
        {
          "metric": "first-contentful-paint",
          "budget": 1500  // Tightened from 2000ms
        }
      ]
    }
  ]
}
```

**Test locally before committing:**
```bash
npm run perf
```

---

## Resources

- [Web.dev Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md)
- [Next.js Performance](https://nextjs.org/docs/pages/building-your-application/optimizing)
- [Chrome DevTools Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/)

---

*Last Updated: 2026-02-06*
*Related Issue: ROOSE-37.11*
