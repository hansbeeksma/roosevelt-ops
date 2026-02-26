# Tree-Shaking Optimization

> ES Modules, side-effect-free packages, and dead code elimination

## ES Modules Exports

### Correct Export Pattern

```typescript
// lib/design-system/index.ts

// Named exports (tree-shakeable)
export { Button } from './components/Button'
export { Card } from './components/Card'
export { Input } from './components/Input'
export { Modal } from './components/Modal'
export { Badge } from './components/Badge'

// Type exports (zero cost at runtime)
export type { ButtonProps } from './components/Button'
export type { CardProps } from './components/Card'
export type { InputProps } from './components/Input'

// Token exports
export { tokens } from './tokens'
export { ThemeProvider, useTheme } from './theme-provider'
export { LocaleProvider, useLocale } from './i18n/locale-context'
```

### Anti-Pattern: Barrel Exports

```typescript
// AVOID: Re-exporting everything defeats tree-shaking
// export * from './components'
// export * from './tokens'
// export * from './utils'

// PREFER: Explicit named exports (above)
// OR: Direct imports from component files
import { Button } from '@/components/ui/Button'  // Best for tree-shaking
```

## Side-Effect-Free Configuration

### package.json

```json
{
  "name": "@rooseveltops/design-system",
  "sideEffects": [
    "*.css",
    "lib/design-system/tokens/*.css"
  ]
}
```

### What Counts as Side Effects

| Side Effect | Example | Solution |
|-------------|---------|----------|
| Global CSS imports | `import './styles.css'` | Mark in `sideEffects` array |
| Global variable mutation | `window.DS_VERSION = '1.0'` | Remove or isolate |
| Prototype modification | `Array.prototype.unique = ...` | Never do this |
| Module-level API calls | `analytics.init()` | Move to component mount |
| Self-invoking functions | `(function() { ... })()` | Remove or guard with condition |

### Verifying Side-Effect-Free

```bash
# Check for side effects in bundle
npx webpack --stats-modules-space 50 | grep "side effects"

# Or use the tree-shaking verifier
npx agadoo lib/design-system/index.ts
```

## Unused Variant Elimination

### Component Variants as Separate Modules

```typescript
// Instead of one large Button component with all variants:
// components/ui/Button/index.ts
export { Button } from './Button'
export { ButtonPrimary } from './ButtonPrimary'      // Only imported if used
export { ButtonSecondary } from './ButtonSecondary'  // Only imported if used
export { ButtonGhost } from './ButtonGhost'          // Only imported if used

// Consumer only pays for what they use:
import { ButtonPrimary } from '@/components/ui/Button'
// ButtonSecondary and ButtonGhost are tree-shaken out
```

### Token Subsetting

```typescript
// Instead of importing all tokens:
// import { tokens } from '@/lib/design-tokens'  // Imports everything

// Import only needed token categories:
import { colors } from '@/lib/design-tokens/colors'
import { spacing } from '@/lib/design-tokens/spacing'
// Typography tokens are tree-shaken out
```

## Dead Code Detection

### CI/CD Dead Code Check

```typescript
// scripts/design-ops/detect-dead-code.ts

interface DeadCodeReport {
  unusedExports: Array<{
    file: string
    export: string
    lastUsed?: string    // Date of last usage (git blame)
  }>
  unusedFiles: string[]
  unusedDependencies: string[]
}

// Use ts-prune for dead export detection
// npx ts-prune | grep -v "used in module"
```

### Webpack Configuration

```typescript
// next.config.js - Optimize tree-shaking
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ensure tree-shaking is enabled
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: true,
      innerGraph: true,
    }

    // Minimize CSS (remove unused)
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          designSystem: {
            test: /[\\/]lib[\\/]design-system[\\/]/,
            name: 'design-system',
            chunks: 'all',
            priority: 20,
          },
        },
      }
    }

    return config
  },
}
```

## Tree-Shaking Effectiveness Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Unused exports | 0 | ts-prune scan |
| Tree-shaking ratio | >90% | (available - imported) / available |
| Dead dependencies | 0 | depcheck scan |
| Bundle overhead | <5% | Actual vs optimal bundle |

## Verification

```bash
# 1. Check bundle composition
ANALYZE=true npm run build

# 2. Verify tree-shaking works
# In bundle analyzer: design system should only show used components

# 3. Run dead code detection
npx ts-prune --project tsconfig.json

# 4. Check for unused dependencies
npx depcheck

# 5. Verify no barrel import regressions
# Grep for: import { ... } from '@/lib/design-system'
# Should NOT import from barrel file
```
