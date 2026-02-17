# Brand Compliance Automation

> Token validation, automated audits, and brand deviation alerts

## Compliance Checks

### 1. Token Usage Validation Per Brand

```typescript
// scripts/design-ops/validate-brand-compliance.ts

interface ComplianceCheck {
  id: string
  name: string
  severity: 'error' | 'warning' | 'info'
  check: (brandConfig: BrandConfig) => ComplianceResult
}

interface ComplianceResult {
  passed: boolean
  message: string
  details?: string[]
}

const complianceChecks: ComplianceCheck[] = [
  {
    id: 'contrast-aa',
    name: 'WCAG AA Contrast',
    severity: 'error',
    check: (config) => {
      const issues: string[] = []
      const primaryContrast = getContrastRatio(
        config.tokens.colors.primary,
        '#FFFFFF'
      )
      if (primaryContrast < 4.5) {
        issues.push(`Primary (#${config.tokens.colors.primary}) on white: ${primaryContrast.toFixed(1)}:1 (needs 4.5:1)`)
      }

      const textContrast = getContrastRatio(
        config.tokens.colors.text,
        config.tokens.colors.bg
      )
      if (textContrast < 4.5) {
        issues.push(`Text on background: ${textContrast.toFixed(1)}:1 (needs 4.5:1)`)
      }

      return {
        passed: issues.length === 0,
        message: issues.length === 0
          ? 'All contrast ratios meet WCAG AA'
          : `${issues.length} contrast violations`,
        details: issues,
      }
    },
  },
  {
    id: 'required-tokens',
    name: 'Required Token Coverage',
    severity: 'error',
    check: (config) => {
      const required = ['primary', 'text', 'bg', 'success', 'error', 'warning']
      const missing = required.filter(token => !config.tokens.colors[token])

      return {
        passed: missing.length === 0,
        message: missing.length === 0
          ? 'All required tokens defined'
          : `Missing tokens: ${missing.join(', ')}`,
        details: missing,
      }
    },
  },
  {
    id: 'font-availability',
    name: 'Font Availability',
    severity: 'warning',
    check: (config) => {
      // Check if fonts are available in the project
      const fonts = [
        config.tokens.typography.fontHeading,
        config.tokens.typography.fontBody,
      ]

      return {
        passed: true,
        message: `Fonts declared: ${fonts.join(', ')}`,
        details: ['Verify fonts are loaded via next/font or CDN'],
      }
    },
  },
  {
    id: 'spacing-consistency',
    name: 'Spacing Scale Consistency',
    severity: 'warning',
    check: (config) => {
      // Verify spacing follows 4/8px grid
      return {
        passed: true,
        message: 'Spacing uses 8px grid system',
      }
    },
  },
]
```

### 2. Brand-Specific Component Variants

```typescript
// Define which components need brand-specific treatment
interface BrandComponentConfig {
  component: string
  brandOverrides: Record<string, {
    additionalVariants?: string[]
    disabledVariants?: string[]
    customStyles?: Record<string, string>
  }>
}

const brandComponents: BrandComponentConfig[] = [
  {
    component: 'Button',
    brandOverrides: {
      vino12: {
        additionalVariants: ['wine'],
        customStyles: {
          'font-weight': '500',
          'letter-spacing': '0.05em',
          'text-transform': 'uppercase',
        },
      },
    },
  },
]
```

### 3. Automated Brand Audit

```typescript
// scripts/design-ops/audit-brand.ts

interface BrandAuditReport {
  brandId: string
  auditDate: string
  score: number           // 0-100
  checks: Array<{
    id: string
    name: string
    passed: boolean
    severity: string
    message: string
    details?: string[]
  }>
  deviations: Array<{
    component: string
    file: string
    issue: string
    expectedToken: string
    actualValue: string
  }>
}

async function auditBrand(brandId: string): Promise<BrandAuditReport> {
  const config = loadBrandConfig(brandId)
  const checks = complianceChecks.map(check => ({
    id: check.id,
    name: check.name,
    severity: check.severity,
    ...check.check(config),
  }))

  const passedCount = checks.filter(c => c.passed).length
  const score = Math.round((passedCount / checks.length) * 100)

  // Scan codebase for hardcoded values that should use brand tokens
  const deviations = await scanForDeviations(brandId)

  return {
    brandId,
    auditDate: new Date().toISOString(),
    score,
    checks,
    deviations,
  }
}
```

### 4. Brand Deviation Alerts

```typescript
// Alert configuration
interface DeviationAlert {
  channel: 'slack' | 'email' | 'plane'
  threshold: number     // Minimum severity to trigger
  recipients: string[]
  frequency: 'realtime' | 'daily' | 'weekly'
}

const alertConfig: DeviationAlert[] = [
  {
    channel: 'slack',
    threshold: 0,        // All errors
    recipients: ['#design-system'],
    frequency: 'realtime',
  },
  {
    channel: 'plane',
    threshold: 0,
    recipients: [],       // Auto-create Plane issues
    frequency: 'daily',
  },
]
```

## CI/CD Integration

```yaml
# .github/workflows/brand-compliance.yml
name: Brand Compliance
on:
  pull_request:
    paths:
      - 'lib/design-system/**'
      - 'components/**'
      - 'app/**/*.tsx'

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - name: Audit all brands
        run: |
          npx ts-node scripts/design-ops/audit-brand.ts --brand roosevelt
          npx ts-node scripts/design-ops/audit-brand.ts --brand default
      - name: Comment PR with results
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const report = require('./reports/brand-audit.json')
            const body = `## Brand Compliance Report\n\nScore: ${report.score}/100\n\n${report.checks.map(c => `- ${c.passed ? 'PASS' : 'FAIL'} ${c.name}: ${c.message}`).join('\n')}`
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body
            })
```

## Compliance Dashboard

| Metric | Target | Measurement |
|--------|--------|-------------|
| Brand audit score | >95% | Automated checks |
| Contrast violations | 0 | axe-core + custom checks |
| Token compliance | >98% | AST scanner |
| Deviation count trend | Decreasing | Weekly scan |
| Brand switch correctness | 100% | Visual regression per brand |
