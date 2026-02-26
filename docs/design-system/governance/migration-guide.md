# Automated Migration Guides

> Code mods, breaking change detection, and migration CLI tooling

## Migration CLI

```bash
# Run all migrations for a version upgrade
npx @rooseveltops/ds-migrate --from 1.x --to 2.x

# Dry run (show changes without applying)
npx @rooseveltops/ds-migrate --from 1.x --to 2.x --dry-run

# Run specific migration
npx @rooseveltops/ds-migrate --migration rename-tokens-v2

# List available migrations
npx @rooseveltops/ds-migrate --list

# Generate migration report
npx @rooseveltops/ds-migrate --from 1.x --to 2.x --report
```

## Code Mod Architecture

```typescript
// scripts/design-ops/migrations/types.ts

interface Migration {
  id: string
  name: string
  description: string
  fromVersion: string
  toVersion: string
  breaking: boolean
  automated: boolean      // Can be fully automated
  transform: (source: string, filePath: string) => string
  test: {
    input: string
    expected: string
  }
}

interface MigrationReport {
  totalFiles: number
  modifiedFiles: number
  migrations: Array<{
    id: string
    filesAffected: number
    changesApplied: number
    manualRequired: string[]  // Files needing manual review
  }>
}
```

## Migration Registry

```typescript
// scripts/design-ops/migrations/registry.ts

const migrations: Migration[] = [
  // Example: Token rename migration
  {
    id: 'rename-color-primary-to-electric',
    name: 'Rename color-primary to color-electric',
    description: 'The primary color token has been renamed for clarity',
    fromVersion: '1.x',
    toVersion: '2.0',
    breaking: true,
    automated: true,
    transform: (source) => {
      return source
        .replace(/tokens\.colors\.primary/g, 'tokens.colors.electric')
        .replace(/color-primary/g, 'color-electric')
        .replace(/--color-primary/g, '--color-electric')
    },
    test: {
      input: `import { tokens } from '@/lib/design-tokens'\nconst color = tokens.colors.primary`,
      expected: `import { tokens } from '@/lib/design-tokens'\nconst color = tokens.colors.electric`,
    },
  },

  // Example: Component API change
  {
    id: 'button-type-to-variant',
    name: 'Rename Button type prop to variant',
    description: 'The Button component type prop conflicts with HTML type attribute',
    fromVersion: '1.x',
    toVersion: '2.0',
    breaking: true,
    automated: true,
    transform: (source) => {
      // Use jscodeshift for AST-based transforms
      return source.replace(
        /<Button\s+([^>]*?)type=(["'])(primary|secondary|ghost)\2/g,
        '<Button $1variant=$2$3$2'
      )
    },
    test: {
      input: `<Button type="primary">Click</Button>`,
      expected: `<Button variant="primary">Click</Button>`,
    },
  },
]

export { migrations }
```

## Breaking Change Detection

```typescript
// scripts/design-ops/detect-breaking-changes.ts

interface BreakingChange {
  type: 'removed-component' | 'removed-prop' | 'renamed-token' | 'changed-api'
  component?: string
  prop?: string
  token?: string
  description: string
  migration: string   // Migration ID to apply
}

async function detectBreakingChanges(
  previousVersion: string,
  currentVersion: string
): Promise<BreakingChange[]> {
  const changes: BreakingChange[] = []

  // Compare TypeScript interfaces between versions
  // Compare design token files between versions
  // Compare component export lists between versions

  return changes
}
```

## Version Diff Comparison

### Generating Diffs

```bash
# Compare two versions of the design system
npx @rooseveltops/ds-migrate diff --from v1.0.0 --to v2.0.0

# Output:
# Token Changes:
#   + color-electric-light (new)
#   ~ color-primary → color-electric (renamed)
#   - color-accent (removed)
#
# Component Changes:
#   + GhostButton (new)
#   ~ Button: type prop → variant prop (API change)
#   - LegacyCard (removed)
#
# Breaking Changes: 3
# Auto-fixable: 2
# Manual review: 1
```

## Migration Guide Template

```markdown
# Migrating from v1.x to v2.x

## Overview

This guide covers all changes needed to upgrade from Roosevelt Design System
v1.x to v2.x. Most changes can be automated using the migration CLI.

## Automated Migration

Run the migration CLI to apply all automated changes:

```bash
npx @rooseveltops/ds-migrate --from 1.x --to 2.x
```

## Breaking Changes

### 1. Token Renames

| Old Token | New Token | Files Affected |
|-----------|-----------|---------------|
| `color-primary` | `color-electric` | ~15 files |

**Automated fix**: `npx @rooseveltops/ds-migrate --migration rename-tokens-v2`

### 2. Component API Changes

| Component | Change | Files Affected |
|-----------|--------|---------------|
| Button | `type` → `variant` | ~8 files |

**Automated fix**: `npx @rooseveltops/ds-migrate --migration button-type-to-variant`

### 3. Removed Components (Manual)

| Component | Replacement | Migration |
|-----------|-------------|-----------|
| LegacyCard | Card | Manual - different API |

**Manual steps**:
1. Replace `<LegacyCard>` with `<Card>`
2. Update props: `title` → `heading`
3. Move children to `<Card.Body>`

## Verification

After migration, verify:

```bash
# Run type check
npx tsc --noEmit

# Run tests
npm test

# Run visual regression
npm run chromatic

# Check for remaining deprecated usage
npx @rooseveltops/ds-migrate --check
```
```

## Testing Migrations

Each migration includes test cases:

```typescript
// scripts/design-ops/migrations/__tests__/rename-tokens.test.ts
import { describe, it, expect } from 'vitest'
import { migrations } from '../registry'

describe('rename-color-primary-to-electric', () => {
  const migration = migrations.find(m => m.id === 'rename-color-primary-to-electric')

  it('should rename token in TypeScript', () => {
    const result = migration!.transform(migration!.test.input, 'test.ts')
    expect(result).toBe(migration!.test.expected)
  })

  it('should rename token in CSS', () => {
    const input = 'color: var(--color-primary);'
    const expected = 'color: var(--color-electric);'
    expect(migration!.transform(input, 'test.css')).toBe(expected)
  })

  it('should not rename partial matches', () => {
    const input = 'color: var(--color-primary-dark);'
    expect(migration!.transform(input, 'test.css')).toBe(input)
  })
})
```
