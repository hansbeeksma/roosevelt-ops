# Project Initiation SOP

> Setup project infrastructure and foundation

**Version:** 1.0.0
**Last Updated:** 2026-02-03
**Owner:** Sam Swaab

---

## Purpose

Ensure every project starts with proper infrastructure, documentation, and tooling. Create consistent foundation for successful delivery.

---

## Scope

**Use this SOP for:**
- New client projects
- New internal products
- Major feature initiatives

**Skip for:**
- Small experiments (<1 week)
- Proof of concepts
- Documentation-only work

---

## Prerequisites

- [ ] Project approved (client contract OR internal greenlight)
- [ ] Project name decided
- [ ] Initial requirements documented
- [ ] Budget/timeline confirmed

---

## Procedure

### Phase 1: Planning & Documentation (Day 1)

#### Step 1.1: Create Project Structure

**Location:** `~/Development/projects/[project-name]/`

**Required directories:**
```bash
mkdir -p ~/Development/projects/[project-name]/{
  src,
  tests,
  docs,
  .github/workflows,
  config
}
```

#### Step 1.2: Initialize Documentation

**Create these files:**

1. **README.md**
```markdown
# [Project Name]

[One-line description]

## Overview
[What this project does]

## Status
[PLANNING | IN_PROGRESS | PRODUCTION]

## Stack
- [Technology 1]
- [Technology 2]

## Getting Started
[How to run locally]

## Documentation
See docs/ folder
```

2. **docs/PROJECT.md**
```markdown
# Project Overview

## Client
[Client name or Internal]

## Timeline
Start: [Date]
Target: [Date]

## Deliverables
- [ ] Deliverable 1
- [ ] Deliverable 2

## Milestones
[Key milestones]
```

3. **docs/ARCHITECTURE.md**
```markdown
# Architecture

## System Design
[High-level architecture]

## Technology Stack
[Detailed tech choices]

## Infrastructure
[Hosting, deployment]

## Security
[Security considerations]
```

#### Step 1.3: Initialize Version Control

```bash
cd ~/Development/projects/[project-name]
git init
git add .
git commit -m "chore: initialize project structure"
```

**Create `.gitignore`:**
```
# Dependencies
node_modules/
.pnp/

# Testing
coverage/

# Environment
.env
.env.local

# Build
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
```

---

### Phase 2: Infrastructure Setup (Day 1-2)

#### Step 2.1: Create GitHub Repository

**Actions:**
1. Create repo on GitHub
2. Add remote: `git remote add origin [url]`
3. Push: `git push -u origin main`
4. Configure branch protection:
   - ✅ Require PR reviews
   - ✅ Require status checks
   - ✅ Require conversation resolution

#### Step 2.2: Setup Project Management

**Plane Configuration:**

1. **Create Project in Plane**
   - Identifier: `[PROJ]` (5 chars max)
   - Description from PROJECT.md

2. **Create Labels**
   ```
   - priority: p0, p1, p2, p3
   - type: feature, bug, docs, refactor
   - status: blocked, needs-review
   ```

3. **Create Initial Issues**
   - Setup & configuration tasks
   - Architecture decisions
   - First milestone deliverables

4. **Create Modules** (if applicable)
   - Group related features
   - Milestones/phases

#### Step 2.3: Setup CI/CD

**Create `.github/workflows/ci.yml`:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
```

---

### Phase 3: Development Setup (Day 2)

#### Step 3.1: Initialize Package Manager

**For Node.js projects:**
```bash
npm init -y
# OR
pnpm init
```

**Update `package.json`:**
```json
{
  "name": "project-name",
  "version": "0.1.0",
  "scripts": {
    "dev": "...",
    "build": "...",
    "test": "vitest",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  }
}
```

#### Step 3.2: Setup Linting & Formatting

**Install:**
```bash
npm install -D eslint prettier typescript @typescript-eslint/eslint-plugin
```

**Create `.eslintrc.json`:**
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}
```

**Create `.prettierrc`:**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

#### Step 3.3: Setup Testing

**Install Vitest:**
```bash
npm install -D vitest @vitest/ui
```

**Create `vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

---

### Phase 4: Communication Setup (Day 2)

#### Step 4.1: Client Communication Channels

**Setup:**
1. **Email thread** - Primary async communication
2. **Slack channel** (if client uses Slack) - Quick questions
3. **Weekly status reports** - Regular updates
4. **Bi-weekly calls** - Sync and demos

**Document in PROJECT.md:**
```markdown
## Communication

### Channels
- Email: [client-email]
- Slack: #project-name (optional)
- Calls: Every other Friday 2pm CET

### Status Updates
- Weekly written reports (Fridays)
- Bi-weekly demo calls
```

#### Step 4.2: Internal Communication

**Plane Project:**
- All technical decisions
- Issue tracking
- Milestone progress

**Git Commits:**
- Meaningful commit messages
- Reference issue numbers

---

### Phase 5: Security & Secrets (Day 2)

#### Step 5.1: Environment Variables

**Create `.env.example`:**
```bash
# Database
DATABASE_URL=postgresql://...

# API Keys
API_KEY=sk_...

# Environment
NODE_ENV=development
```

**Setup secrets management:**
- Development: `.env.local` (gitignored)
- Production: Environment variables in hosting platform

#### Step 5.2: Security Checklist

- [ ] No secrets in code
- [ ] `.env` in `.gitignore`
- [ ] Dependencies security audit: `npm audit`
- [ ] Branch protection enabled
- [ ] Code review required

---

### Phase 6: Kickoff (Day 3)

#### Step 6.1: Internal Kickoff

**Review:**
- Architecture decisions
- Technology stack
- Timeline and milestones
- Risks and dependencies

**Document:**
- Architecture Decision Records (ADRs)
- Technical decisions in `docs/decisions/`

#### Step 6.2: Client Kickoff (if applicable)

**Agenda:**
1. Project structure overview
2. Communication plan confirmation
3. First milestone walkthrough
4. Access and credentials handoff
5. Q&A

**Share access:**
- GitHub repository (if appropriate)
- Staging environment (when ready)
- Project documentation

---

## Validation

### Project Initiation Complete When:

#### Documentation
- [ ] README.md complete
- [ ] PROJECT.md documented
- [ ] ARCHITECTURE.md drafted

#### Version Control
- [ ] Git initialized
- [ ] GitHub repository created
- [ ] `.gitignore` configured
- [ ] Branch protection enabled

#### Project Management
- [ ] Plane project created
- [ ] Labels configured
- [ ] Initial issues created
- [ ] Milestones defined

#### Development
- [ ] Package manager initialized
- [ ] Linting configured
- [ ] Testing framework setup
- [ ] CI/CD pipeline configured

#### Communication
- [ ] Client channels established
- [ ] Status update schedule set
- [ ] Kickoff meeting completed

#### Security
- [ ] Secrets management setup
- [ ] Security audit completed
- [ ] Access controls configured

---

## Templates

### Architecture Decision Record (ADR)

**Location:** `docs/decisions/001-[decision].md`

```markdown
# ADR-001: [Decision Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[What is the issue that we're seeing?]

## Decision
[What is the change that we're proposing?]

## Consequences
[What becomes easier or harder after this change?]
```

---

## Troubleshooting

**Issue:** GitHub Actions failing on first push
**Solution:**
- Check Node version compatibility
- Verify all dependencies in package.json
- Check for missing test files

**Issue:** Plane project not syncing
**Solution:**
- Verify API keys in settings
- Check project mapping file
- Manual refresh via MCP tools

---

## Related Documents

- [Client Onboarding](client-onboarding.md) - Precedes this SOP
- [Communication Protocols](communication-protocols.md) - How to communicate
- [Quality Assurance](quality-assurance.md) - QA standards
- [Company Values](../company/values.md) - Principles

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-03 | 1.0.0 | Initial SOP creation |

---

*Maintained by: Technical Writing Department*
*Review Schedule: Quarterly*
