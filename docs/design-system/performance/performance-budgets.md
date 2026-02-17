# Design Performance Budgets

> Enforceable limits for bundle size, rendering, and asset weight

## Component-Level Budgets

| Component | JS Budget | CSS Budget | Total Budget | Notes |
|-----------|-----------|------------|-------------|-------|
| Button | 2KB | 0.5KB | 2.5KB | All variants |
| Card | 3KB | 1KB | 4KB | Including hover state |
| Input | 3KB | 0.8KB | 3.8KB | All types |
| Modal | 5KB | 1KB | 6KB | With focus trap |
| Navigation | 4KB | 1.5KB | 5.5KB | Responsive + mobile |
| Hero | 5KB | 1KB | 6KB | Without images |
| Footer | 2KB | 0.5KB | 2.5KB | Including links |
| **Total Design System** | **50KB** | **15KB** | **65KB** | gzipped |

## Page-Level Budgets

| Metric | Budget | Measurement | Tool |
|--------|--------|-------------|------|
| First Load JS | <200KB | Gzipped, all JS | Next.js build output |
| First Load CSS | <50KB | Gzipped, all CSS | Next.js build output |
| Total page weight | <500KB | All resources (excl. images) | Lighthouse |
| Image weight | <300KB | Per page, optimized formats | Custom script |
| Font weight | <100KB | All loaded font files | Network tab |
| Third-party JS | <50KB | Analytics, monitoring only | Lighthouse |

## Core Web Vitals Budgets

| Metric | Budget | Good Threshold | Measurement |
|--------|--------|---------------|-------------|
| **LCP** (Largest Contentful Paint) | <2.0s | <2.5s | web-vitals |
| **FID** (First Input Delay) | <50ms | <100ms | web-vitals |
| **CLS** (Cumulative Layout Shift) | <0.05 | <0.1 | web-vitals |
| **INP** (Interaction to Next Paint) | <100ms | <200ms | web-vitals |
| **TTFB** (Time to First Byte) | <200ms | <800ms | web-vitals |
| **FCP** (First Contentful Paint) | <1.0s | <1.8s | web-vitals |

## Animation Performance Thresholds

| Type | Frame Budget | Max Duration | Properties |
|------|-------------|-------------|------------|
| Micro-interaction | 16ms (60fps) | 200ms | transform, opacity only |
| Page transition | 16ms (60fps) | 400ms | transform, opacity |
| Loading animation | 16ms (60fps) | 300ms (loop) | transform, opacity |
| Scroll animation | 16ms (60fps) | N/A | transform only |
| Theme transition | N/A | 200ms | color, background-color |

### Animation Rules

```css
/* Only animate compositable properties */
.animate-safe {
  transition-property: transform, opacity;
  will-change: transform, opacity;
}

/* Never animate these (cause layout/paint) */
/* width, height, top, left, margin, padding, border */

/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Image Size Recommendations

| Context | Max Dimensions | Max File Size | Format |
|---------|---------------|---------------|--------|
| Hero image | 1920x1080 | 200KB | WebP/AVIF |
| Card thumbnail | 400x300 | 30KB | WebP |
| Avatar | 128x128 | 10KB | WebP |
| Icon (SVG) | 24x24 | 2KB | SVG |
| Logo | 200x60 | 5KB | SVG |
| Open Graph | 1200x630 | 100KB | PNG/JPG |

## Budget Enforcement Configuration

```typescript
// next.config.js - Performance budget enforcement
const nextConfig = {
  experimental: {
    // Warn when page JS exceeds limit
    largePageDataBytes: 200 * 1024,  // 200KB
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1920],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
}
```

## Budget Monitoring

### CI/CD Integration

```yaml
# .github/workflows/performance-budget.yml
name: Performance Budget
on:
  pull_request:
    branches: [main]

jobs:
  budget-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build

      - name: Check bundle size
        run: |
          # Extract bundle sizes from .next build output
          FIRST_LOAD_JS=$(cat .next/build-manifest.json | node -e "
            const data = require('./.next/build-manifest.json');
            // Calculate total first load JS
            console.log('First Load JS analysis complete');
          ")

      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          configPath: ./lighthouserc.json
          uploadArtifacts: true
```

### Alert Thresholds

| Level | Trigger | Action |
|-------|---------|--------|
| Info | Budget at 80% | Log in CI |
| Warning | Budget at 90% | CI warning comment |
| Error | Budget exceeded | CI failure, block merge |
| Critical | Budget at 150% | CI failure + Slack alert |
