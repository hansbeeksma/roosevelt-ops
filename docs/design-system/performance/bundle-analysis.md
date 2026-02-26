# Bundle Impact Analysis

> Per-component cost reporting and dependency visualization

## Webpack Bundle Analyzer Setup

```typescript
// next.config.js - Bundle analysis configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
})

module.exports = withBundleAnalyzer({
  // ... existing config
})
```

### Running Analysis

```bash
# Generate bundle analysis
ANALYZE=true npm run build

# Output: .next/analyze/client.html and .next/analyze/server.html
```

## Per-Component Cost Report

```typescript
// scripts/design-ops/analyze-bundle-impact.ts

interface ComponentBundleCost {
  name: string
  path: string
  rawSize: number           // Bytes (uncompressed)
  gzipSize: number          // Bytes (gzipped)
  brotliSize: number        // Bytes (brotli)
  dependencies: string[]    // External deps pulled in
  treeShakeable: boolean    // Can be tree-shaken
  sideEffects: boolean      // Has side effects
  cssSize: number           // Associated CSS bytes
}

interface BundleReport {
  generatedAt: string
  totalSize: {
    raw: number
    gzip: number
    brotli: number
  }
  components: ComponentBundleCost[]
  heaviestComponents: ComponentBundleCost[]   // Top 5 by gzip size
  sharedDependencies: Array<{
    dependency: string
    size: number
    usedBy: string[]
  }>
}

// Example output:
// {
//   "components": [
//     {
//       "name": "Button",
//       "path": "components/ui/Button.tsx",
//       "rawSize": 3200,
//       "gzipSize": 1200,
//       "dependencies": [],
//       "treeShakeable": true,
//       "sideEffects": false,
//       "cssSize": 500
//     }
//   ]
// }
```

## Dependency Tree Visualization

```typescript
// scripts/design-ops/visualize-deps.ts

interface DependencyNode {
  name: string
  size: number
  children: DependencyNode[]
}

// Generate D3-compatible tree structure
function buildDependencyTree(entryPoint: string): DependencyNode {
  // Parse webpack stats.json
  // Build hierarchical dependency tree
  // Output: dependency-tree.json for visualization

  return {
    name: 'design-system',
    size: 0,
    children: [],
  }
}
```

### Visualization Output

```
design-system (65KB gzip)
├── components/ (40KB)
│   ├── Button (1.2KB)
│   ├── Card (2.8KB)
│   ├── Input (2.1KB)
│   ├── Modal (4.2KB) ← Largest
│   │   └── focus-trap (1.5KB)
│   ├── Navigation (3.1KB)
│   └── ...
├── tokens/ (5KB)
│   ├── colors (2KB)
│   ├── typography (1.5KB)
│   └── spacing (1.5KB)
└── utilities/ (20KB)
    ├── theme-provider (3KB)
    ├── locale-context (2KB)
    └── ...
```

## Import Cost Integration

### VS Code Extension Config

```json
// .vscode/settings.json
{
  "importCost.typescriptExtensions": [".ts", ".tsx"],
  "importCost.bundleSizeDecoration": "both",
  "importCost.showCalculatingDecoration": true,
  "importCost.largeBundleSize": 50000,
  "importCost.mediumBundleSize": 20000,
  "importCost.smallBundleSize": 5000
}
```

### CI Import Cost Check

```typescript
// scripts/design-ops/check-import-costs.ts

interface ImportCostResult {
  file: string
  imports: Array<{
    name: string
    size: number      // Bytes (gzipped)
    budget: number    // Max allowed bytes
    overBudget: boolean
  }>
}

const IMPORT_BUDGETS: Record<string, number> = {
  // Design system components should be small
  '@/components/ui/Button': 2500,
  '@/components/ui/Card': 4000,
  '@/components/ui/Modal': 6000,
  '@/lib/design-system/theme-provider': 3000,

  // Third-party limits
  'date-fns': 5000,       // Tree-shakeable
  '@tremor/react': 50000, // Heavy but needed for dashboards
}
```

## CI/CD Bundle Size Comment

```yaml
# Part of performance-budget.yml
- name: Comment bundle sizes
  uses: actions/github-script@v7
  with:
    script: |
      const sizes = require('./reports/bundle-report.json')
      const body = `## Bundle Size Report

      | Component | Gzip Size | Budget | Status |
      |-----------|-----------|--------|--------|
      ${sizes.components.map(c =>
        `| ${c.name} | ${(c.gzipSize/1024).toFixed(1)}KB | ${(c.budget/1024).toFixed(1)}KB | ${c.gzipSize <= c.budget ? 'PASS' : 'FAIL'} |`
      ).join('\n')}

      **Total: ${(sizes.totalSize.gzip/1024).toFixed(1)}KB gzip**
      `

      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body
      })
```

## Baseline Tracking

Bundle sizes are tracked over time to detect regressions:

| Date | Total (gzip) | First Load JS | CSS | Trend |
|------|-------------|---------------|-----|-------|
| Baseline | TBD | TBD | TBD | - |
| +1 month | - | - | - | - |
| +3 months | - | - | - | - |

Updates will be automated via CI/CD pipeline tracking.
