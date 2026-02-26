# Changelog Generation & Release Notes

> Automated changelog from conventional commits with visual diff screenshots

## Conventional Commits Integration

### Commit Types to Changelog Sections

| Commit Type | Changelog Section | Breaking? |
|-------------|-------------------|-----------|
| `feat` | Features | No |
| `fix` | Bug Fixes | No |
| `perf` | Performance | No |
| `refactor` | Refactoring | No |
| `docs` | Documentation | No |
| `feat!` | BREAKING CHANGES | Yes |
| `fix!` | BREAKING CHANGES | Yes |
| `chore` | (hidden) | No |
| `test` | (hidden) | No |
| `ci` | (hidden) | No |

### Scope Mapping

```
feat(button): → Components > Button
feat(tokens): → Design Tokens
feat(a11y):   → Accessibility
feat(i18n):   → Internationalization
fix(docs):    → Documentation
```

## Tooling Setup

### release-please Configuration

```json
// release-please-config.json (design system specific)
{
  "$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json",
  "release-type": "node",
  "packages": {
    ".": {
      "changelog-path": "CHANGELOG.md",
      "release-type": "node",
      "bump-minor-pre-major": true,
      "bump-patch-for-minor-pre-major": true,
      "draft": false,
      "prerelease": false,
      "changelog-sections": [
        { "type": "feat", "section": "Features", "hidden": false },
        { "type": "fix", "section": "Bug Fixes", "hidden": false },
        { "type": "perf", "section": "Performance", "hidden": false },
        { "type": "refactor", "section": "Refactoring", "hidden": false },
        { "type": "docs", "section": "Documentation", "hidden": false },
        { "type": "chore", "section": "Maintenance", "hidden": true },
        { "type": "test", "section": "Tests", "hidden": true },
        { "type": "ci", "section": "CI/CD", "hidden": true }
      ]
    }
  }
}
```

### Changelog Template

```markdown
# Changelog

## [2.0.0](https://github.com/org/repo/compare/v1.0.0...v2.0.0) (2026-03-15)

### BREAKING CHANGES

* **tokens:** Renamed `color-primary` to `color-electric` ([#123](link))
  * Migration: Find/replace `color-primary` with `color-electric`
  * Code mod: `npx ds-migrate rename-token color-primary color-electric`

### Features

* **button:** Add `ghost` variant ([#124](link))
* **card:** Add `compact` size option ([#125](link))

### Bug Fixes

* **input:** Fix focus ring color in dark mode ([#126](link))

### Visual Changes

| Component | Before | After |
|-----------|--------|-------|
| Button ghost | ![before](screenshots/v1/button-ghost.png) | ![after](screenshots/v2/button-ghost.png) |
```

## Visual Diff Screenshots

### Automated Screenshot Generation

```typescript
// scripts/design-ops/generate-visual-changelog.ts
import { chromium } from 'playwright'

interface VisualChange {
  component: string
  story: string
  beforeScreenshot: string
  afterScreenshot: string
  changeType: 'added' | 'modified' | 'removed'
}

async function generateVisualChangelog(
  previousVersion: string,
  currentVersion: string
): Promise<VisualChange[]> {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Navigate to Storybook and capture screenshots
  // Compare with previous version screenshots
  // Generate side-by-side comparison images

  await browser.close()
  return []
}
```

## Release Notes Template

```markdown
# Roosevelt Design System v2.0.0

Release Date: 2026-03-15

## Highlights

- New ghost button variant for subtle actions
- Improved dark mode support across all components
- Performance improvements: 15% smaller bundle

## Breaking Changes

### Token Renames (1 change)

| Old Token | New Token | Migration |
|-----------|-----------|-----------|
| `color-primary` | `color-electric` | `npx ds-migrate rename-token` |

### Component API Changes (2 changes)

| Component | Change | Migration |
|-----------|--------|-----------|
| Button | `type` prop renamed to `variant` | Auto-fixable via code mod |
| Card | `size` now required | Add `size="default"` |

## Migration Guide

See [Migration from v1 to v2](./migration-v1-to-v2.md)

## Full Changelog

See [CHANGELOG.md](./CHANGELOG.md)
```

## CI/CD Integration

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          release-type: node

      - uses: actions/checkout@v4
        if: ${{ steps.release.outputs.release_created }}

      - name: Generate visual changelog
        if: ${{ steps.release.outputs.release_created }}
        run: npx ts-node scripts/design-ops/generate-visual-changelog.ts

      - name: Publish release notes
        if: ${{ steps.release.outputs.release_created }}
        run: |
          echo "Published v${{ steps.release.outputs.major }}.${{ steps.release.outputs.minor }}.${{ steps.release.outputs.patch }}"
```

## Changelog Accessibility

- Changelog is published as both Markdown and HTML
- HTML version includes proper heading hierarchy
- Visual diffs include alt text descriptions
- Release notes sent via email to subscribers
