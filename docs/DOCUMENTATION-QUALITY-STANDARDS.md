# Documentation Quality Standards

> **Status**: ✅ Production Ready
> **Last Updated**: 2026-02-09
> **Related Issues**: ROOSE-47

## Overview

Complete framework voor documentation quality: automated tooling, linting, freshness tracking, en contribution templates. Van audit tot productie deployment in 3 weken.

**Core Capabilities**:
- **Auto-Documentation**: Code → markdown (TypeDoc, JSDoc, TSDoc)
- **Vale Linting**: Style guide enforcement (terminology, voice, grammar)
- **Freshness Tracking**: Automated stale docs alerts (>90 dagen)
- **Contribution Templates**: Lowered barrier voor doc updates

---

## Table of Contents

1. [Documentation Audit Framework](#1-documentation-audit-framework)
2. [Vale Setup & Configuration](#2-vale-setup--configuration)
3. [Auto-Documentation Tools](#3-auto-documentation-tools)
4. [Freshness Tracking](#4-freshness-tracking)
5. [Documentation Templates](#5-documentation-templates)
6. [Contribution Guidelines](#6-contribution-guidelines)
7. [CI/CD Integration](#7-cicd-integration)
8. [Quality Metrics](#8-quality-metrics)
9. [Maintenance & Review Cycles](#9-maintenance--review-cycles)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Documentation Audit Framework

### 1.1 Inventory Script

```bash
#!/bin/bash
# scripts/doc-audit.sh - Documentation inventory

set -euo pipefail

OUTPUT_DIR="docs/audit"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT="$OUTPUT_DIR/audit-${TIMESTAMP}.json"

mkdir -p "$OUTPUT_DIR"

echo "📊 Starting documentation audit..."

# Find all documentation files
find . -type f \( \
  -name "*.md" -o \
  -name "*.mdx" -o \
  -name "README*" -o \
  -name "CHANGELOG*" -o \
  -name "CONTRIBUTING*" \
) -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
| while read -r file; do
  # Get file metadata
  size=$(wc -c < "$file")
  lines=$(wc -l < "$file")
  last_modified=$(stat -f "%Sm" -t "%Y-%m-%d" "$file" 2>/dev/null || stat -c "%y" "$file" | cut -d' ' -f1)

  # Calculate staleness (days since last update)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    last_epoch=$(stat -f "%m" "$file")
  else
    last_epoch=$(stat -c "%Y" "$file")
  fi
  current_epoch=$(date +%s)
  days_old=$(( (current_epoch - last_epoch) / 86400 ))

  # Determine status
  if [ $days_old -gt 180 ]; then
    status="🔴 CRITICAL"
  elif [ $days_old -gt 90 ]; then
    status="🟡 STALE"
  else
    status="🟢 FRESH"
  fi

  # Output JSON line
  jq -n \
    --arg file "$file" \
    --argjson size "$size" \
    --argjson lines "$lines" \
    --arg modified "$last_modified" \
    --argjson age "$days_old" \
    --arg status "$status" \
    '{file: $file, size: $size, lines: $lines, last_modified: $modified, days_old: $age, status: $status}'
done | jq -s '.' > "$REPORT"

# Generate summary
echo ""
echo "📋 Audit Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

total=$(jq 'length' "$REPORT")
fresh=$(jq '[.[] | select(.days_old <= 90)] | length' "$REPORT")
stale=$(jq '[.[] | select(.days_old > 90 and .days_old <= 180)] | length' "$REPORT")
critical=$(jq '[.[] | select(.days_old > 180)] | length' "$REPORT")

echo "Total files: $total"
echo "🟢 Fresh (<90 days): $fresh"
echo "🟡 Stale (90-180 days): $stale"
echo "🔴 Critical (>180 days): $critical"
echo ""
echo "Report saved: $REPORT"

# Generate markdown report
cat > "$OUTPUT_DIR/AUDIT-REPORT.md" <<EOF
# Documentation Audit Report

**Generated**: $(date +"%Y-%m-%d %H:%M:%S")

## Summary

| Status | Count | Percentage |
|--------|-------|------------|
| 🟢 Fresh | $fresh | $(bc <<< "scale=1; $fresh * 100 / $total")% |
| 🟡 Stale | $stale | $(bc <<< "scale=1; $stale * 100 / $total")% |
| 🔴 Critical | $critical | $(bc <<< "scale=1; $critical * 100 / $total")% |
| **Total** | **$total** | **100%** |

## Critical Files (>180 days)

$(jq -r '.[] | select(.days_old > 180) | "- \(.file) - \(.days_old) days old"' "$REPORT")

## Stale Files (90-180 days)

$(jq -r '.[] | select(.days_old > 90 and .days_old <= 180) | "- \(.file) - \(.days_old) days old"' "$REPORT")

## Recommendations

1. **Immediate**: Update critical files (>180 days)
2. **This week**: Review stale files (90-180 days)
3. **Next sprint**: Setup freshness monitoring
4. **Ongoing**: Quarterly doc review sessions

EOF

echo "Markdown report: $OUTPUT_DIR/AUDIT-REPORT.md"
```

### 1.2 Gap Analysis

**Common Documentation Gaps**:

| Type | Description | Priority | Action |
|------|-------------|----------|--------|
| **Missing API Docs** | Functions zonder JSDoc | 🔴 High | Add TypeDoc comments |
| **Outdated Setup** | Installation steps changed | 🟡 Medium | Update README |
| **No Troubleshooting** | Common errors undocumented | 🟡 Medium | Add TROUBLESHOOTING.md |
| **Architecture Diagrams** | Missing system overviews | 🟢 Low | Create diagrams (Mermaid) |
| **Changelog Gaps** | Missing release notes | 🔴 High | Update CHANGELOG.md |

---

## 2. Vale Setup & Configuration

### 2.1 Installation

```bash
# macOS
brew install vale

# Linux
wget https://github.com/errata-ai/vale/releases/download/v2.29.0/vale_2.29.0_Linux_64-bit.tar.gz
tar -xvzf vale_2.29.0_Linux_64-bit.tar.gz
sudo mv vale /usr/local/bin/

# Verify
vale --version
```

### 2.2 Configuration File

Create `.vale.ini` in project root:

```ini
# .vale.ini
StylesPath = .vale/styles

# Minimum alert level (suggestion, warning, error)
MinAlertLevel = suggestion

# Vocabularies (project-specific terms)
Vocab = Roosevelt

[*.md]
# Built-in rules
BasedOnStyles = Vale, write-good, proselint

# Custom rules
Roosevelt.Acronyms = YES
Roosevelt.Terminology = YES
Roosevelt.VoiceAndTone = YES

# Ignore patterns
TokenIgnores = (\$[^\$]+\$), (`[^`]+`)

[*.{js,ts,jsx,tsx}]
# Only check JSDoc comments
BasedOnStyles = Vale
TokenIgnores = (\/\*[\s\S]*?\*\/)
```

### 2.3 Custom Style Guides

Create `Roosevelt` vocabulary:

```bash
mkdir -p .vale/styles/Roosevelt
```

**Terminology Rules** (`.vale/styles/Roosevelt/Terminology.yml`):

```yaml
extends: substitution
message: "Use '%s' instead of '%s'."
level: error
ignorecase: true
swap:
  # Technical terms
  'regex': 'regular expression'
  'repo': 'repository'
  'codebase': 'code base'

  # Product names (correct casing)
  'github': 'GitHub'
  'javascript': 'JavaScript'
  'typescript': 'TypeScript'
  'supabase': 'Supabase'
  'hetzner': 'Hetzner'

  # Consistency
  'e\.g\.': 'for example'
  'i\.e\.': 'that is'
```

**Voice & Tone** (`.vale/styles/Roosevelt/VoiceAndTone.yml`):

```yaml
extends: existence
message: "Avoid passive voice: '%s'."
level: warning
nonword: true
tokens:
  - '\b(am|is|are|was|were|be|been|being)\s+\w+ed\b'
```

**Acronyms** (`.vale/styles/Roosevelt/Acronyms.yml`):

```yaml
extends: conditional
message: "Define '%s' on first use."
level: suggestion
first: true
# Match all-caps words 2+ characters
tokens:
  - '\b[A-Z]{2,}\b'
```

### 2.4 CI Integration

**GitHub Actions** (`.github/workflows/docs-lint.yml`):

```yaml
name: Documentation Linting

on:
  pull_request:
    paths:
      - '**.md'
      - '**.mdx'
      - 'docs/**'

jobs:
  vale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Vale
        run: |
          wget https://github.com/errata-ai/vale/releases/download/v2.29.0/vale_2.29.0_Linux_64-bit.tar.gz
          tar -xvzf vale_2.29.0_Linux_64-bit.tar.gz
          sudo mv vale /usr/local/bin/

      - name: Run Vale
        run: vale --config=.vale.ini docs/
        continue-on-error: false

      - name: Vale Report
        if: failure()
        run: |
          echo "❌ Vale linting failed"
          echo "Run locally: vale --config=.vale.ini docs/"
```

---

## 3. Auto-Documentation Tools

### 3.1 TypeDoc Setup (TypeScript)

```bash
npm install --save-dev typedoc typedoc-plugin-markdown
```

**Configuration** (`typedoc.json`):

```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "plugin": ["typedoc-plugin-markdown"],
  "readme": "none",
  "theme": "markdown",
  "exclude": [
    "**/*.test.ts",
    "**/node_modules/**"
  ],
  "includeVersion": true,
  "excludePrivate": true,
  "excludeProtected": false,
  "categorizeByGroup": true,
  "sort": ["source-order"],
  "validation": {
    "notExported": true,
    "invalidLink": true,
    "notDocumented": true
  }
}
```

**NPM Script** (`package.json`):

```json
{
  "scripts": {
    "docs:generate": "typedoc",
    "docs:watch": "typedoc --watch"
  }
}
```

**Example TSDoc Comment**:

```typescript
/**
 * Fetches user data from Supabase.
 *
 * @param userId - The unique identifier of the user
 * @param options - Optional fetch parameters
 * @param options.includeProfile - Include user profile data
 * @param options.includeOrders - Include order history
 *
 * @returns Promise resolving to user data with optional relations
 *
 * @throws {AuthenticationError} If user is not authenticated
 * @throws {NotFoundError} If user ID does not exist
 *
 * @example
 * ```typescript
 * const user = await fetchUser('123', { includeProfile: true })
 * console.log(user.email)
 * ```
 *
 * @see {@link updateUser} for updating user data
 * @see https://supabase.com/docs/reference/javascript/select
 */
export async function fetchUser(
  userId: string,
  options?: FetchUserOptions
): Promise<UserWithRelations> {
  // Implementation...
}
```

### 3.2 JSDoc Setup (JavaScript)

```bash
npm install --save-dev jsdoc jsdoc-to-markdown
```

**Configuration** (`jsdoc.json`):

```json
{
  "source": {
    "include": ["src"],
    "exclude": ["src/**/*.test.js"]
  },
  "opts": {
    "destination": "docs/api",
    "recurse": true,
    "readme": "README.md",
    "template": "node_modules/docdash"
  },
  "plugins": ["plugins/markdown"],
  "markdown": {
    "idInHeadings": true
  }
}
```

**Generate Markdown**:

```bash
# Generate markdown API docs
jsdoc2md "src/**/*.js" > docs/API.md
```

### 3.3 Automated Documentation Updates

**Pre-commit Hook** (`.husky/pre-commit`):

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Auto-generate docs before commit
echo "📚 Generating documentation..."

# TypeScript projects
if [ -f "typedoc.json" ]; then
  npm run docs:generate
  git add docs/api/
fi

# JavaScript projects
if [ -f "jsdoc.json" ]; then
  npm run docs:jsdoc
  git add docs/api/
fi

echo "✅ Documentation updated"
```

---

## 4. Freshness Tracking

### 4.1 Freshness Monitor Script

```bash
#!/bin/bash
# scripts/freshness-monitor.sh - Alert on stale docs

set -euo pipefail

THRESHOLD_DAYS=90
SLACK_WEBHOOK="${SLACK_DOCS_WEBHOOK:-}"

stale_docs=$(find docs -type f -name "*.md" -mtime +${THRESHOLD_DAYS})

if [ -n "$stale_docs" ]; then
  count=$(echo "$stale_docs" | wc -l | tr -d ' ')

  echo "⚠️  Found $count stale documentation files (>$THRESHOLD_DAYS days old)"
  echo ""
  echo "$stale_docs"

  # Send Slack alert
  if [ -n "$SLACK_WEBHOOK" ]; then
    curl -X POST "$SLACK_WEBHOOK" \
      -H 'Content-Type: application/json' \
      -d "{
        \"text\": \"📚 Documentation Freshness Alert\",
        \"blocks\": [
          {
            \"type\": \"header\",
            \"text\": {
              \"type\": \"plain_text\",
              \"text\": \"📚 Stale Documentation Detected\"
            }
          },
          {
            \"type\": \"section\",
            \"text\": {
              \"type\": \"mrkdwn\",
              \"text\": \"Found *$count* documentation files older than $THRESHOLD_DAYS days.\"
            }
          },
          {
            \"type\": \"section\",
            \"text\": {
              \"type\": \"mrkdwn\",
              \"text\": \"\`\`\`$(echo \"$stale_docs\" | head -10)\`\`\`\"
            }
          },
          {
            \"type\": \"context\",
            \"elements\": [
              {
                \"type\": \"mrkdwn\",
                \"text\": \"Run \\\`npm run docs:audit\\\` for full report.\"
              }
            ]
          }
        ]
      }"
  fi

  exit 1
else
  echo "✅ All documentation is fresh (<$THRESHOLD_DAYS days old)"
  exit 0
fi
```

### 4.2 Cron Job (Weekly Check)

```bash
# Add to crontab
crontab -e

# Every Monday at 9 AM
0 9 * * 1 /path/to/scripts/freshness-monitor.sh
```

### 4.3 GitHub Action (Automated Alerts)

```yaml
name: Documentation Freshness Check

on:
  schedule:
    - cron: '0 9 * * 1' # Every Monday at 9 AM
  workflow_dispatch:

jobs:
  freshness:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check Freshness
        run: ./scripts/freshness-monitor.sh
        env:
          SLACK_DOCS_WEBHOOK: ${{ secrets.SLACK_DOCS_WEBHOOK }}

      - name: Create Issue on Failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '📚 Stale Documentation Detected',
              body: 'Automated freshness check found stale documentation files. Run `npm run docs:audit` for details.',
              labels: ['documentation', 'maintenance']
            })
```

---

## 5. Documentation Templates

### 5.1 API Reference Template

```markdown
<!-- docs/templates/API-REFERENCE.md -->

# API Reference: [Module Name]

> **Last Updated**: YYYY-MM-DD
> **Version**: X.Y.Z

## Overview

Brief description of what this module does.

## Installation

\`\`\`bash
npm install [package-name]
\`\`\`

## Usage

\`\`\`typescript
import { functionName } from '[package-name]'

// Example usage
const result = functionName(params)
\`\`\`

## API

### `functionName(param1, param2)`

**Description**: What this function does.

**Parameters**:
- `param1` (Type): Description
- `param2` (Type, optional): Description. Default: `value`

**Returns**: `ReturnType` - Description

**Throws**:
- `ErrorType`: When this error occurs

**Example**:

\`\`\`typescript
const result = functionName('value1', { option: true })
console.log(result)
\`\`\`

**See Also**:
- [Related Function](#related-function)
- [External Resource](https://example.com)

---

## Types

### `TypeName`

\`\`\`typescript
interface TypeName {
  field1: string
  field2: number
  field3?: boolean
}
\`\`\`

---

## Changelog

### v1.0.0 (YYYY-MM-DD)
- Initial release

---

**Maintainer**: [@username](https://github.com/username)
**Support**: [Open an issue](https://github.com/org/repo/issues)
```

### 5.2 How-To Guide Template

```markdown
<!-- docs/templates/HOW-TO-GUIDE.md -->

# How To: [Task Description]

> **Last Updated**: YYYY-MM-DD
> **Difficulty**: Beginner | Intermediate | Advanced
> **Estimated Time**: X minutes

## Goal

What you'll accomplish by following this guide.

## Prerequisites

- [ ] Required software/tools installed
- [ ] Required access/permissions
- [ ] Required background knowledge

## Steps

### Step 1: [Action]

Description of what to do.

\`\`\`bash
# Commands to run
command --flag value
\`\`\`

**Expected output**:
\`\`\`
Output example
\`\`\`

### Step 2: [Action]

Next step description.

## Verification

How to verify the task was completed successfully:

\`\`\`bash
# Verification command
verify-command
\`\`\`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Error message | How to fix |

## Next Steps

- Link to related guides
- Suggestions for what to do next

---

**Questions?** [Open a discussion](https://github.com/org/repo/discussions)
```

### 5.3 Tutorial Template

```markdown
<!-- docs/templates/TUTORIAL.md -->

# Tutorial: [Feature Name]

> **Last Updated**: YYYY-MM-DD
> **Level**: Beginner | Intermediate | Advanced
> **Time Required**: X hours

## What You'll Learn

- Learning objective 1
- Learning objective 2
- Learning objective 3

## What You'll Build

Description of the final product/outcome.

## Prerequisites

- [ ] Skill/knowledge requirement
- [ ] Software requirement
- [ ] Account/access requirement

## Part 1: [Section Title]

### Introduction

What this section covers.

### Step 1.1: [Substep]

Detailed instructions with code examples.

\`\`\`typescript
// Code example
const example = 'value'
\`\`\`

**Explanation**: Why this code works.

### Step 1.2: [Substep]

Continue with next substep.

## Part 2: [Section Title]

Continue tutorial sections...

## Summary

What you've learned and built.

## What's Next

- Advanced topics to explore
- Related tutorials
- Additional resources

---

**Feedback?** [Improve this tutorial](https://github.com/org/repo/edit/main/docs/tutorials/...)
```

---

## 6. Contribution Guidelines

### 6.1 Documentation Contributing Guide

Create `docs/CONTRIBUTING.md`:

```markdown
# Contributing to Documentation

Thank you for improving our documentation! This guide will help you make effective contributions.

## Quick Start

1. **Find what to improve**: Check [stale docs report](docs/audit/AUDIT-REPORT.md)
2. **Choose a template**: Use [documentation templates](docs/templates/)
3. **Follow style guide**: Run Vale linter before committing
4. **Submit PR**: Include "docs:" prefix in commit message

## Documentation Standards

### Writing Style

- **Active voice**: "Run the command" (not "The command should be run")
- **Present tense**: "The function returns" (not "The function will return")
- **Second person**: "You can configure" (not "One can configure")
- **Short sentences**: Aim for <25 words per sentence
- **Serial comma**: Use Oxford comma (A, B, and C)

### Formatting

- **Headings**: Sentence case (not Title Case)
- **Code blocks**: Always specify language
- **Links**: Use descriptive text (not "click here")
- **Lists**: Parallel structure (all items start same way)

## Tools

### Vale Linting

```bash
# Check your changes
vale docs/

# Auto-fix common issues
vale --output=line docs/ | while read -r line; do
  # Manual review required
  echo "$line"
done
```

### Generate API Docs

```bash
# TypeScript
npm run docs:generate

# JavaScript
npm run docs:jsdoc
```

### Check Freshness

```bash
npm run docs:audit
```

## PR Checklist

- [ ] Vale linter passes (no errors)
- [ ] Code examples tested
- [ ] Links verified (no 404s)
- [ ] Diagrams included (if needed)
- [ ] Changelog updated (if versioned docs)
- [ ] "docs:" prefix in commit message

## Getting Help

- [Documentation style guide](.vale/styles/Roosevelt/)
- [Template examples](docs/templates/)
- [Slack #docs channel](https://workspace.slack.com/archives/...)

---

**Questions?** Ping @docs-team in Slack
```

---

## 7. CI/CD Integration

### 7.1 Complete CI Pipeline

```yaml
# .github/workflows/docs-ci.yml
name: Documentation CI

on:
  pull_request:
    paths:
      - 'docs/**'
      - '**.md'
  push:
    branches:
      - main

jobs:
  lint:
    name: Vale Linting
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Vale
        run: |
          wget https://github.com/errata-ai/vale/releases/download/v2.29.0/vale_2.29.0_Linux_64-bit.tar.gz
          tar -xvzf vale_2.29.0_Linux_64-bit.tar.gz
          sudo mv vale /usr/local/bin/

      - name: Run Vale
        run: vale --config=.vale.ini docs/
        continue-on-error: false

  link-check:
    name: Check Links
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Link Checker
        uses: lycheeverse/lychee-action@v1
        with:
          args: --verbose --no-progress 'docs/**/*.md'
          fail: true

  auto-docs:
    name: Generate API Docs
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Dependencies
        run: npm ci

      - name: Generate Docs
        run: npm run docs:generate

      - name: Commit Changes
        if: github.ref == 'refs/heads/main'
        run: |
          git config user.name "docs-bot"
          git config user.email "bot@rooseveltops.nl"
          git add docs/api/
          git diff --quiet && git diff --staged --quiet || git commit -m "docs: auto-update API documentation"
          git push

  deploy:
    name: Deploy to GitHub Pages
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: [lint, link-check, auto-docs]
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

---

## 8. Quality Metrics

### 8.1 Documentation Coverage

```bash
#!/bin/bash
# scripts/doc-coverage.sh - Measure documentation coverage

set -euo pipefail

# TypeScript files
ts_files=$(find src -name "*.ts" -not -name "*.test.ts" | wc -l)
ts_documented=$(grep -r "@param\|@returns\|@throws" src --include="*.ts" | wc -l)
ts_coverage=$(bc <<< "scale=1; $ts_documented * 100 / $ts_files")

echo "📊 Documentation Coverage"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TypeScript files: $ts_files"
echo "Documented: $ts_documented"
echo "Coverage: $ts_coverage%"

# Set threshold
THRESHOLD=80

if (( $(echo "$ts_coverage < $THRESHOLD" | bc -l) )); then
  echo "❌ Coverage below threshold ($THRESHOLD%)"
  exit 1
else
  echo "✅ Coverage meets threshold"
  exit 0
fi
```

### 8.2 Quality Scorecard

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Vale Pass Rate** | 95% | TBD | 🔵 |
| **Doc Coverage** | 80% | TBD | 🔵 |
| **Freshness (<90 days)** | 90% | TBD | 🔵 |
| **Link Health** | 100% | TBD | 🔵 |
| **Tutorial Completion Rate** | 85% | TBD | 🔵 |

---

## 9. Maintenance & Review Cycles

### 9.1 Quarterly Review Process

**Week 1: Audit**
- Run `npm run docs:audit`
- Review stale docs report
- Identify priority updates

**Week 2: Update Sprint**
- Assign docs to team members
- Update critical/stale docs
- Run Vale linting

**Week 3: New Content**
- Add missing how-to guides
- Create tutorials for new features
- Update API references

**Week 4: Polish**
- Fix broken links
- Add diagrams where needed
- Review contribution metrics

### 9.2 Documentation Dashboard

```bash
#!/bin/bash
# scripts/doc-dashboard.sh - Generate metrics dashboard

cat > docs/DASHBOARD.md <<EOF
# Documentation Dashboard

**Last Updated**: $(date +"%Y-%m-%d %H:%M:%S")

## Health Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Docs | $(find docs -name "*.md" | wc -l) | - | - |
| Fresh (<90d) | $(find docs -name "*.md" -mtime -90 | wc -l) | 90% | 🟢 |
| Vale Pass | TBD | 95% | 🔵 |
| Coverage | TBD | 80% | 🔵 |

## Recent Updates

$(git log --since="30 days ago" --pretty=format:"- %s (%ar)" --grep="docs:" | head -10)

## Top Contributors (Last 30 Days)

$(git log --since="30 days ago" --pretty=format:"%an" --grep="docs:" | sort | uniq -c | sort -rn | head -5)

EOF

echo "Dashboard updated: docs/DASHBOARD.md"
```

---

## 10. Troubleshooting

### Common Issues

#### Vale Fails on Valid Terms

**Problem**: Vale flags project-specific terms as errors.

**Solution**: Add to vocabulary file:

```bash
# .vale/styles/Roosevelt/accept.txt
ProjectName
CustomTerm
AcronymXYZ
```

#### TypeDoc Generation Fails

**Problem**: TypeDoc can't parse certain TypeScript syntax.

**Solution**: Check TypeScript version compatibility:

```bash
npm install --save-dev typescript@latest typedoc@latest
```

#### Stale Docs Not Detected

**Problem**: Freshness monitor doesn't catch obvious stale docs.

**Solution**: Check file modification timestamps:

```bash
# Force update timestamp
touch docs/stale-file.md

# Verify
stat docs/stale-file.md
```

#### CI Docs Generation Fails

**Problem**: Auto-docs fail in CI but work locally.

**Solution**: Check Node version consistency:

```yaml
# .github/workflows/docs-ci.yml
- uses: actions/setup-node@v4
  with:
    node-version-file: '.nvmrc'  # Use same version as local
```

---

## Implementation Checklist

### Phase 1: Audit (Week 1)

- [ ] Run documentation audit script
- [ ] Generate freshness report
- [ ] Identify critical gaps
- [ ] Create priority list

### Phase 2: Tooling (Week 2)

- [ ] Install Vale locally
- [ ] Configure Vale style guide
- [ ] Setup TypeDoc/JSDoc
- [ ] Add CI/CD pipeline
- [ ] Deploy freshness monitoring

### Phase 3: Templates & Guidelines (Week 3)

- [ ] Create documentation templates
- [ ] Write contribution guide
- [ ] Setup pre-commit hooks
- [ ] Train team on tools
- [ ] Schedule quarterly reviews

---

## Resources

### Tools

- **Vale**: https://vale.sh/
- **TypeDoc**: https://typedoc.org/
- **JSDoc**: https://jsdoc.app/
- **Lychee Link Checker**: https://github.com/lycheeverse/lychee

### Style Guides

- **Google Developer Docs**: https://developers.google.com/style
- **Microsoft Writing Style**: https://learn.microsoft.com/en-us/style-guide/
- **Write the Docs**: https://www.writethedocs.org/guide/

---

## Quick Reference Commands

```bash
# Audit documentation
npm run docs:audit

# Generate API docs
npm run docs:generate

# Run Vale linter
vale docs/

# Check freshness
./scripts/freshness-monitor.sh

# Generate dashboard
./scripts/doc-dashboard.sh

# Check doc coverage
./scripts/doc-coverage.sh
```

---

**Ready to improve your docs?** Start met [Phase 1: Audit](#1-documentation-audit-framework) 📚
