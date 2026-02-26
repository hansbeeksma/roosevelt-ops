# Deprecation Policy

> Structured component and token deprecation with automated enforcement

## Deprecation Lifecycle

```
Active ──> Deprecated ──> Sunset Warning ──> Removed
           (3 months)     (1 month)          (next major)
```

## Timeline Requirements

| Phase | Duration | Actions |
|-------|----------|---------|
| **Announcement** | Day 0 | Deprecation notice published |
| **Deprecated** | 3 months | Runtime warnings active, docs updated |
| **Sunset Warning** | 1 month | Critical warnings, blocking lint rules |
| **Removal** | Next major release | Component/token removed from codebase |

**Minimum total time: 4 months from announcement to removal.**

## Runtime Console Warnings

```typescript
// lib/design-system/deprecation.ts

type DeprecationSeverity = 'info' | 'warning' | 'critical'

interface DeprecationEntry {
  component: string
  version: string           // Version when deprecated
  replacement?: string      // Suggested replacement
  removalVersion: string    // Version when removed
  migrationGuide?: string   // URL to migration guide
  severity: DeprecationSeverity
}

const deprecations: DeprecationEntry[] = [
  // Example entry
  // {
  //   component: 'OldButton',
  //   version: '1.2.0',
  //   replacement: 'Button',
  //   removalVersion: '2.0.0',
  //   migrationGuide: '/docs/migration/old-button-to-button',
  //   severity: 'warning',
  // },
]

function warnDeprecation(componentName: string): void {
  if (process.env.NODE_ENV === 'production') return

  const entry = deprecations.find(d => d.component === componentName)
  if (!entry) return

  const message = [
    `[Roosevelt Design System] "${entry.component}" is deprecated since v${entry.version}.`,
    entry.replacement ? `Use "${entry.replacement}" instead.` : '',
    `Will be removed in v${entry.removalVersion}.`,
    entry.migrationGuide ? `Migration guide: ${entry.migrationGuide}` : '',
  ].filter(Boolean).join(' ')

  if (entry.severity === 'critical') {
    console.error(message)
  } else {
    console.warn(message)
  }
}

export { warnDeprecation, deprecations }
export type { DeprecationEntry, DeprecationSeverity }
```

## ESLint Plugin for Deprecated Components

```typescript
// lib/design-system/eslint-rules/no-deprecated-components.ts

import type { Rule } from 'eslint'
import { deprecations } from '../deprecation'

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow usage of deprecated design system components',
      recommended: true,
    },
    messages: {
      deprecated: '{{component}} is deprecated since v{{version}}. {{replacement}}Will be removed in v{{removalVersion}}.',
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (!node.source.value?.toString().includes('design-system')) return

        for (const specifier of node.specifiers) {
          if (specifier.type !== 'ImportSpecifier') continue

          const name = specifier.imported.type === 'Identifier'
            ? specifier.imported.name
            : ''

          const entry = deprecations.find(d => d.component === name)
          if (!entry) continue

          context.report({
            node: specifier,
            messageId: 'deprecated',
            data: {
              component: entry.component,
              version: entry.version,
              replacement: entry.replacement
                ? `Use "${entry.replacement}" instead. `
                : '',
              removalVersion: entry.removalVersion,
            },
          })
        }
      },
    }
  },
}

export default rule
```

## Figma Deprecation Warnings

For Figma library components, deprecation is communicated via:

1. **Component description**: Add "[DEPRECATED] Use ComponentName instead"
2. **Component thumbnail**: Add red "DEPRECATED" overlay
3. **Figma plugin notifications**: Custom plugin shows deprecation warnings
4. **Figma file changelog**: Document deprecations in library changelog

## Deprecation Registry

All deprecations are tracked in a central registry:

```typescript
// lib/design-system/deprecation-registry.ts

interface DeprecationRegistry {
  version: string
  lastUpdated: string
  entries: DeprecationEntry[]
  stats: {
    totalDeprecated: number
    totalRemoved: number
    activeDeprecations: number
    upcomingSunsets: number
  }
}
```

## Compliance Monitoring

### Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Deprecated usage count | Decreasing trend | Weekly AST scan |
| Sunset compliance | Zero usage by deadline | CI lint check |
| Migration velocity | <2 weeks per team | Plane issue tracking |
| New deprecation ratio | <5% per release | Release notes |

### Enforcement Levels

| Phase | ESLint | CI | Runtime |
|-------|--------|-----|---------|
| Deprecated | `warn` | Pass with warning | `console.warn` |
| Sunset Warning | `error` | Fail (override available) | `console.error` |
| Removed | N/A (code gone) | N/A | N/A |

## Communication Channels

| Audience | Channel | Frequency |
|----------|---------|-----------|
| All developers | Slack #design-system | On deprecation |
| Team leads | Email digest | Monthly |
| Design team | Figma library changelog | On deprecation |
| External consumers | CHANGELOG.md | Per release |
