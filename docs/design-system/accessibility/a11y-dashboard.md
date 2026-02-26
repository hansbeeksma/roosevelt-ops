# Accessibility Compliance Dashboard

> WCAG 2.2 tracking, automated audits, and compliance reporting

## WCAG 2.2 Coverage Matrix

### Level A Requirements

| Criterion | Description | Status | Automated |
|-----------|-------------|--------|-----------|
| 1.1.1 | Non-text Content (alt text) | Planned | Yes (axe-core) |
| 1.2.1 | Audio-only and Video-only | N/A | No |
| 1.3.1 | Info and Relationships | Planned | Partial |
| 1.3.2 | Meaningful Sequence | Planned | No |
| 1.3.3 | Sensory Characteristics | Planned | No |
| 1.4.1 | Use of Color | Planned | Partial |
| 2.1.1 | Keyboard | Planned | Partial |
| 2.1.2 | No Keyboard Trap | Planned | No |
| 2.4.1 | Bypass Blocks (skip nav) | Planned | Yes |
| 2.4.2 | Page Titled | Planned | Yes |
| 2.4.3 | Focus Order | Planned | No |
| 2.4.4 | Link Purpose | Planned | Partial |
| 3.1.1 | Language of Page | Planned | Yes |
| 3.2.1 | On Focus | Planned | No |
| 3.2.2 | On Input | Planned | No |
| 3.3.1 | Error Identification | Planned | Partial |
| 3.3.2 | Labels or Instructions | Planned | Yes |
| 4.1.1 | Parsing | Planned | Yes |
| 4.1.2 | Name, Role, Value | Planned | Yes |

### Level AA Requirements (Target)

| Criterion | Description | Status | Automated |
|-----------|-------------|--------|-----------|
| 1.3.4 | Orientation | Planned | No |
| 1.3.5 | Identify Input Purpose | Planned | Partial |
| 1.4.3 | Contrast (Minimum) 4.5:1 | Planned | Yes |
| 1.4.4 | Resize Text | Planned | No |
| 1.4.5 | Images of Text | Planned | No |
| 1.4.10 | Reflow | Planned | No |
| 1.4.11 | Non-text Contrast 3:1 | Planned | Partial |
| 1.4.12 | Text Spacing | Planned | No |
| 1.4.13 | Content on Hover/Focus | Planned | No |
| 2.4.5 | Multiple Ways | Planned | No |
| 2.4.6 | Headings and Labels | Planned | Yes |
| 2.4.7 | Focus Visible | Planned | Partial |
| 2.4.11 | Focus Not Obscured (new 2.2) | Planned | No |
| 2.5.7 | Dragging Movements (new 2.2) | Planned | No |
| 2.5.8 | Target Size (new 2.2) | Planned | Partial |
| 3.2.6 | Consistent Help (new 2.2) | Planned | No |
| 3.3.7 | Redundant Entry (new 2.2) | Planned | No |
| 3.3.8 | Accessible Authentication (new 2.2) | Planned | No |

## axe-core CI/CD Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/a11y.yml
name: Accessibility
on:
  pull_request:
    paths:
      - 'components/**'
      - 'app/**/*.tsx'

jobs:
  axe-core:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - name: Start server
        run: npm start &
        env:
          PORT: 3000
      - name: Wait for server
        run: npx wait-on http://localhost:3000
      - name: Run axe-core
        run: npx @axe-core/cli http://localhost:3000 --exit --tags wcag2a,wcag2aa,wcag22aa
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: a11y-report
          path: axe-results.json
```

### Playwright axe Integration

```typescript
// tests/a11y/axe-audit.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGES_TO_AUDIT = [
  { name: 'Homepage', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
]

for (const page of PAGES_TO_AUDIT) {
  test(`a11y: ${page.name}`, async ({ page: browserPage }) => {
    await browserPage.goto(page.path)

    const results = await new AxeBuilder({ page: browserPage })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
}
```

## Manual Audit Workflow

### Audit Checklist Template

```markdown
# Manual Accessibility Audit: [Page/Component Name]

**Auditor:** [Name]
**Date:** YYYY-MM-DD
**WCAG Version:** 2.2 Level AA

## Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Focus order matches visual order
- [ ] No keyboard traps
- [ ] Skip navigation link works
- [ ] Focus indicator visible (2px minimum)
- [ ] Escape closes modals/popups

## Screen Reader (VoiceOver)
- [ ] All images have meaningful alt text
- [ ] Headings create logical outline
- [ ] Links describe their destination
- [ ] Form inputs have labels
- [ ] Error messages announced
- [ ] Dynamic content changes announced

## Visual
- [ ] Text contrast >= 4.5:1 (normal text)
- [ ] Text contrast >= 3:1 (large text)
- [ ] UI component contrast >= 3:1
- [ ] Content readable at 200% zoom
- [ ] No content lost at 320px viewport
- [ ] Color is not sole indicator of meaning

## Motion
- [ ] Animations respect prefers-reduced-motion
- [ ] No auto-playing content > 5 seconds
- [ ] Pause/stop controls for moving content

## Findings
| # | Criterion | Severity | Description | Recommendation |
|---|-----------|----------|-------------|----------------|
| 1 | | | | |
```

## Compliance Dashboard Specification

### Dashboard Panels

```typescript
interface A11yDashboard {
  summary: {
    overallScore: number        // 0-100%
    wcagLevel: 'A' | 'AA' | 'AAA'
    lastAudit: string
    violationsOpen: number
    violationsFixed: number
  }
  automated: {
    axeCoreResults: {
      passes: number
      violations: number
      incomplete: number
      inapplicable: number
    }
    trend: Array<{
      date: string
      violations: number
    }>
  }
  manual: {
    lastAuditDate: string
    auditor: string
    findings: number
    criticalFindings: number
  }
  coverage: {
    criteriaTotal: number
    criteriaMet: number
    criteriaPartial: number
    criteriaNotMet: number
  }
}
```

### Visualization

The dashboard will be implemented as a page within Roosevelt OPS at `/dashboard/a11y`, using Tremor chart components for:

1. **Score gauge** - Overall WCAG compliance percentage
2. **Trend line** - Violations over time (should trend down)
3. **Coverage heatmap** - WCAG criteria coverage (A, AA, AAA)
4. **Component table** - Per-component compliance status
5. **Issue tracker** - Open a11y issues from Plane

## Automated Fixes (Audit Only)

The design system provides automated detection but requires human review for fixes:

| Check | Detection | Auto-Fix |
|-------|-----------|----------|
| Color contrast | axe-core | Suggest alternative colors |
| Missing alt text | axe-core | Flag in CI, no auto-fill |
| Missing labels | axe-core | Flag in CI |
| Focus indicators | CSS lint | Enforce via design tokens |
| Heading order | axe-core | Flag in CI |
| ARIA attributes | axe-core | Suggest corrections |
| Target size | Custom check | Enforce min 24x24px |

## Integration with Design Principles

| Design Principle | A11y Connection |
|-----------------|-----------------|
| Architecture First | Semantic HTML structure, logical heading hierarchy |
| Quality over Speed | No shipping without a11y audit pass |
| Transparent Communication | Clear, readable content for all users |
| Direct Access | Keyboard navigation, screen reader support |
