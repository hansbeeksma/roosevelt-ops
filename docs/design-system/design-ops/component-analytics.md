# Component Usage Analytics

> Track adoption, bundle impact, and performance per component

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Analytics Pipeline                     │
├─────────────┬──────────────┬──────────────┬─────────────┤
│  Collector  │  Aggregator  │   Storage    │  Dashboard  │
│             │              │              │             │
│ - AST scan  │ - Per-team   │ - JSON/DB    │ - Storybook │
│ - Import    │ - Per-file   │ - Time       │ - Grafana   │
│   analysis  │ - Trends     │   series     │ - CLI       │
└─────────────┴──────────────┴──────────────┴─────────────┘
```

## Component Tracking Schema

```typescript
interface ComponentUsage {
  componentName: string
  importPath: string
  usageCount: number
  fileLocations: string[]
  teams: string[]              // Inferred from CODEOWNERS
  variants: Record<string, number>  // Variant → count
  bundleImpact: {
    rawBytes: number
    gzipBytes: number
    treeShakeable: boolean
  }
  lastUsed: string            // ISO date
  firstSeen: string           // ISO date
}

interface AnalyticsReport {
  generatedAt: string
  totalComponents: number
  totalUsages: number
  adoptionRate: number        // Components used / available
  components: ComponentUsage[]
  unusedComponents: string[]
  deprecatedUsages: Array<{
    component: string
    replacement: string
    usageCount: number
    deadline: string
  }>
}
```

## Collection Methods

### 1. Static Analysis (AST Scanning)

Scan codebase for component imports using TypeScript AST:

```typescript
// scripts/design-ops/analyze-components.ts
import { Project } from 'ts-morph'

const DESIGN_SYSTEM_PATHS = [
  '@/components/ui',
  '@rooseveltops/design-system',
]

function analyzeComponentUsage(projectRoot: string): AnalyticsReport {
  const project = new Project({
    tsConfigFilePath: `${projectRoot}/tsconfig.json`,
  })

  const sourceFiles = project.getSourceFiles('**/*.{ts,tsx}')
  const usageMap = new Map<string, ComponentUsage>()

  for (const file of sourceFiles) {
    const imports = file.getImportDeclarations()

    for (const imp of imports) {
      const moduleSpecifier = imp.getModuleSpecifierValue()

      if (DESIGN_SYSTEM_PATHS.some(p => moduleSpecifier.startsWith(p))) {
        const namedImports = imp.getNamedImports()

        for (const named of namedImports) {
          const name = named.getName()
          const existing = usageMap.get(name) || createEmptyUsage(name)
          existing.usageCount++
          existing.fileLocations.push(file.getFilePath())
          usageMap.set(name, existing)
        }
      }
    }
  }

  return buildReport(usageMap)
}
```

### 2. Bundle Size Analysis

Track bundle impact per component using webpack stats:

```typescript
interface BundleAnalysis {
  component: string
  rawSize: number
  gzipSize: number
  dependencies: string[]
  treeShakeable: boolean
  cssSize: number
}

// Integration with webpack-bundle-analyzer
// Output: bundle-analysis.json per build
```

### 3. Storybook Usage Heatmaps

Track which Storybook stories are most viewed:

```typescript
// .storybook/analytics-addon.ts
const trackStoryView = (storyId: string) => {
  // Send to analytics endpoint
  fetch('/api/storybook-analytics', {
    method: 'POST',
    body: JSON.stringify({
      storyId,
      timestamp: new Date().toISOString(),
      viewer: process.env.USER || 'anonymous',
    }),
  })
}
```

## Performance Metrics Per Variant

| Component | Variant | Render Time | Bundle Size | CLS Impact |
|-----------|---------|-------------|-------------|------------|
| Button | primary | <2ms | 1.2KB | 0 |
| Button | secondary | <2ms | 1.2KB | 0 |
| Card | default | <5ms | 2.8KB | <0.01 |
| Hero | animated | <10ms | 8.5KB | <0.05 |

## Reporting Schedule

| Report | Frequency | Audience | Format |
|--------|-----------|----------|--------|
| Component adoption | Weekly | Design team | JSON + Dashboard |
| Bundle impact | Per PR | Engineering | CI comment |
| Usage trends | Monthly | Leadership | Slide deck |
| Deprecated usage | Daily | All teams | Slack alert |

## CI Integration

```yaml
# .github/workflows/component-analytics.yml
name: Component Analytics
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6am

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx ts-node scripts/design-ops/analyze-components.ts
      - uses: actions/upload-artifact@v4
        with:
          name: component-analytics
          path: reports/component-analytics.json
```
