# Automated Visual Regression Testing

> Catch visual changes before they reach production

## Strategy

Use Chromatic (Storybook-native) for visual regression testing with fallback to Percy for full-page screenshots.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   PR Push    │────>│  CI Pipeline │────>│  Chromatic   │
│              │     │              │     │              │
│ - Component  │     │ - Build      │     │ - Snapshot   │
│   changes    │     │   Storybook  │     │ - Diff       │
│ - Style      │     │ - Upload     │     │ - Review     │
│   changes    │     │   snapshots  │     │ - Approve    │
└─────────────┘     └──────────────┘     └─────────────┘
```

## Chromatic Configuration

```javascript
// chromatic.config.json
{
  "projectToken": "${CHROMATIC_PROJECT_TOKEN}",
  "buildScriptName": "build-storybook",
  "onlyChanged": true,
  "exitZeroOnChanges": false,
  "exitOnceUploaded": false,
  "externals": ["public/**"],
  "skip": "dependabot/**",
  "diagnosticsFile": true
}
```

## CI/CD Integration

```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression
on:
  pull_request:
    paths:
      - 'components/**'
      - 'lib/design-tokens.ts'
      - 'app/**/*.tsx'
      - 'tailwind.config.ts'
      - '.storybook/**'

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Run Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          onlyChanged: true
          exitZeroOnChanges: false
          autoAcceptChanges: main
          traceChanged: true

      - name: Comment PR with visual diff
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '## Visual Regression Detected\n\nVisual changes were detected. Please review the Chromatic build and approve or update the baseline.\n\n[Review Changes](${{ steps.chromatic.outputs.buildUrl }})'
            })
```

## Cross-Browser Coverage Matrix

| Browser | Viewport | Status |
|---------|----------|--------|
| Chrome | 1440x900 (Desktop) | Active |
| Chrome | 375x812 (Mobile) | Active |
| Chrome | 768x1024 (Tablet) | Active |
| Firefox | 1440x900 (Desktop) | Planned |
| Safari | 1440x900 (Desktop) | Planned |
| Safari | 375x812 (iOS) | Planned |

## Baseline Management

### Approval Workflow

1. PR triggers visual regression build
2. Changed components flagged for review
3. Design owner reviews diff in Chromatic UI
4. Approve = new baseline, Deny = must fix
5. PR cannot merge with unapproved visual changes

### Auto-Accept Rules

```javascript
// Auto-accept changes on these branches
const autoAcceptBranches = ['main', 'develop']

// Auto-accept changes to these story kinds
const autoAcceptStories = [
  '**/Documentation/**',  // Doc-only stories
]
```

## Performance Budgets for Visual Tests

| Metric | Budget | Action |
|--------|--------|--------|
| Snapshot count | <500 | Warn at 400+ |
| Build time | <10 min | Warn at 8 min |
| Diff percentage | <20% per PR | Require manual review |
| False positive rate | <5% | Quarterly tuning |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Flaky diffs (animations) | Add `chromatic: { delay: 300 }` to story |
| Font loading diffs | Use `waitForSelector` or `isReadySelector` |
| Dynamic content | Mock data in stories, use fixed dates |
| Large diff count | Split stories, use `onlyChanged: true` |
