# Performance Monitoring

> CI/CD bundle checks, Lighthouse CI, and Core Web Vitals dashboard

## CI/CD Bundle Size Checks

### GitHub Actions Workflow

```yaml
# .github/workflows/performance.yml
name: Performance
on:
  pull_request:
    branches: [main]

jobs:
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build

      - name: Analyze bundle
        run: |
          # Extract .next build stats
          node -e "
            const fs = require('fs');
            const path = require('path');

            // Read build manifest
            const manifest = JSON.parse(
              fs.readFileSync('.next/build-manifest.json', 'utf8')
            );

            // Calculate total sizes
            const stats = {
              pages: Object.keys(manifest.pages).length,
              totalChunks: new Set(Object.values(manifest.pages).flat()).size,
            };

            fs.writeFileSync('reports/build-stats.json', JSON.stringify(stats, null, 2));
            console.log('Build stats:', JSON.stringify(stats));
          "

      - name: Size limit check
        uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          build_script: build
          skip_step: build

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build

      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          configPath: ./lighthouserc.json
          uploadArtifacts: true
          temporaryPublicStorage: true
```

## Lighthouse CI Configuration

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/about"
      ],
      "numberOfRuns": 3,
      "startServerCommand": "npm start",
      "startServerReadyPattern": "ready on"
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }],
        "interactive": ["error", { "maxNumericValue": 3000 }],
        "total-byte-weight": ["warn", { "maxNumericValue": 500000 }],
        "unused-javascript": ["warn", { "maxNumericValue": 100000 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

## Core Web Vitals Dashboard

### Real User Monitoring (RUM)

```typescript
// lib/web-vitals.ts (existing file enhancement)
import { onCLS, onFID, onLCP, onINP, onTTFB, onFCP } from 'web-vitals'

interface VitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
}

function reportWebVitals(metric: VitalsMetric): void {
  // Send to analytics endpoint
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
  })

  // Use sendBeacon for reliability
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', body)
  } else {
    fetch('/api/vitals', {
      method: 'POST',
      body,
      keepalive: true,
    })
  }
}

// Register all Web Vitals
export function initWebVitals(): void {
  onCLS(reportWebVitals)
  onFID(reportWebVitals)
  onLCP(reportWebVitals)
  onINP(reportWebVitals)
  onTTFB(reportWebVitals)
  onFCP(reportWebVitals)
}
```

### Dashboard Specification

The CWV dashboard at `/dashboard/performance` displays:

| Panel | Visualization | Data Source |
|-------|--------------|-------------|
| CWV Overview | 3 gauge charts (LCP, CLS, INP) | RUM data |
| Performance Trend | Line chart (30-day) | RUM aggregated |
| Page Performance | Table (per-page scores) | Lighthouse CI |
| Bundle Size Trend | Area chart | CI build artifacts |
| Budget Compliance | Status indicators | CI assertions |
| Top Issues | Table (performance regressions) | Automated alerts |

## Performance Budget Enforcement

### size-limit Configuration

```json
{
  "size-limit": [
    {
      "name": "Design System (all)",
      "path": "lib/design-system/index.ts",
      "limit": "65 KB",
      "import": "{ Button, Card, Input, ThemeProvider }"
    },
    {
      "name": "Button only",
      "path": "components/ui/Button.tsx",
      "limit": "2.5 KB"
    },
    {
      "name": "ThemeProvider",
      "path": "lib/design-system/theme-provider.tsx",
      "limit": "3 KB"
    },
    {
      "name": "First Load JS",
      "path": "app/page.tsx",
      "limit": "200 KB"
    }
  ]
}
```

## Alert System

| Condition | Severity | Channel | Action |
|-----------|----------|---------|--------|
| LCP > 2.5s (p75) | Warning | CI comment | Review LCP element |
| CLS > 0.1 (p75) | Warning | CI comment | Check layout shifts |
| Bundle +10% | Warning | CI comment | Review new imports |
| Bundle +25% | Error | CI fail + Slack | Block merge |
| Lighthouse < 90 | Error | CI fail | Fix before merge |
| Dead code detected | Info | Weekly report | Clean up |
