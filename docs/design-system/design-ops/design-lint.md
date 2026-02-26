# Design Lint Automation

> Automated design quality enforcement across Figma and code

## Lint Rule Categories

### 1. Naming Conventions

| Rule | Pattern | Example |
|------|---------|---------|
| Component names | PascalCase | `ButtonPrimary`, `CardProduct` |
| Token names | camelCase | `colorPrimary`, `spacingLg` |
| Layer names (Figma) | kebab-case | `hero-section`, `nav-primary` |
| File names | kebab-case | `button-primary.tsx` |
| CSS classes | kebab-case (BEM) | `card__header--active` |

### 2. Token Usage Validation

```typescript
// scripts/design-ops/lint-design-tokens.ts
interface TokenLintRule {
  id: string
  severity: 'error' | 'warning' | 'info'
  message: string
  check: (value: string) => boolean
}

const rules: TokenLintRule[] = [
  {
    id: 'no-hardcoded-colors',
    severity: 'error',
    message: 'Use design tokens instead of hardcoded hex values',
    check: (value) => !/(?<!token\()#[0-9a-fA-F]{3,8}/.test(value),
  },
  {
    id: 'no-hardcoded-spacing',
    severity: 'error',
    message: 'Use spacing tokens instead of arbitrary pixel values',
    check: (value) => !/(?<!token\()(?:margin|padding|gap):\s*\d+px/.test(value),
  },
  {
    id: 'no-hardcoded-fonts',
    severity: 'warning',
    message: 'Use typography tokens for font-family declarations',
    check: (value) => !/font-family:\s*['"][^'"]+['"]/.test(value),
  },
  {
    id: 'use-semantic-colors',
    severity: 'warning',
    message: 'Prefer semantic color tokens (success, error) over raw palette tokens',
    check: (value) => true, // Custom logic per context
  },
]
```

### 3. Component Variant Completeness

Required variants for each component type:

| Component Type | Required Variants | Required States |
|---------------|-------------------|-----------------|
| Button | primary, secondary, ghost | default, hover, active, disabled, focus |
| Input | text, email, password | default, focus, error, disabled |
| Card | default, compact, featured | default, hover, selected |
| Badge | info, success, warning, error | default |

### 4. Accessibility Checks (axe-core)

```typescript
// scripts/design-ops/lint-accessibility.ts
import { AxeResults, run as axeRun } from 'axe-core'

interface A11yLintConfig {
  rules: {
    'color-contrast': 'error'
    'aria-roles': 'error'
    'image-alt': 'error'
    'label': 'error'
    'landmark-one-main': 'warning'
    'region': 'warning'
    'heading-order': 'warning'
    'link-name': 'error'
    'button-name': 'error'
    'document-title': 'error'
    'html-has-lang': 'error'
  }
  wcagLevel: 'AA'
  wcagVersion: '2.2'
}

const config: A11yLintConfig = {
  rules: {
    'color-contrast': 'error',
    'aria-roles': 'error',
    'image-alt': 'error',
    'label': 'error',
    'landmark-one-main': 'warning',
    'region': 'warning',
    'heading-order': 'warning',
    'link-name': 'error',
    'button-name': 'error',
    'document-title': 'error',
    'html-has-lang': 'error',
  },
  wcagLevel: 'AA',
  wcagVersion: '2.2',
}
```

## CI/CD Integration

```yaml
# .github/workflows/design-lint.yml
name: Design Lint
on:
  pull_request:
    paths:
      - 'components/**'
      - 'lib/design-tokens.ts'
      - 'app/**/*.tsx'
      - 'tailwind.config.ts'

jobs:
  lint-tokens:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - name: Lint design tokens
        run: npx ts-node scripts/design-ops/lint-design-tokens.ts
      - name: Check accessibility
        run: npx ts-node scripts/design-ops/lint-accessibility.ts

  lint-naming:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check naming conventions
        run: |
          # Component files must be PascalCase
          find components -name "*.tsx" | while read f; do
            basename=$(basename "$f" .tsx)
            if [[ ! "$basename" =~ ^[A-Z] ]]; then
              echo "ERROR: $f should use PascalCase"
              exit 1
            fi
          done
```

## Figma Lint Rules

For Figma file linting, use the Figma plugin API or MCP integration:

| Rule | Check | Severity |
|------|-------|----------|
| Layer naming | All layers follow kebab-case | Warning |
| Auto-layout usage | All frames use auto-layout | Warning |
| Style references | All colors use library styles | Error |
| Text styles | All text uses library text styles | Error |
| Component usage | No detached instances | Error |
| Frame structure | Maximum 5 nesting levels | Warning |

## Reporting

Lint results are reported as:

1. **CI Comments**: Inline PR comments for violations
2. **Dashboard**: Aggregated lint health in Grafana
3. **Slack Alerts**: Critical violations trigger Slack notifications
4. **Plane Issues**: Recurring violations auto-create Plane issues
