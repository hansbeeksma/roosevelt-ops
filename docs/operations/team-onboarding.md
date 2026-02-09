# Team Member Onboarding SOP

> From signed contract to productive contributor

**Version:** 1.0.0
**Last Updated:** 2026-02-09
**Owner:** Sam Swaab

---

## Purpose

Ensure new team members (developers, designers, contractors) have a consistent, efficient onboarding experience. Reduce time-to-productivity and establish clear expectations from day one.

---

## Scope

**Use this SOP when:**
- New developer joins the team (full-time or contractor)
- New designer onboards for a project
- Existing team member moves to a new project stack

**Do NOT use for:**
- Client onboarding (use [Client Onboarding SOP](client-onboarding.md))
- Internal tooling changes (use communication protocols)

---

## Prerequisites

Before starting onboarding:

- [ ] Employment/contractor agreement signed
- [ ] Start date confirmed
- [ ] Team lead assigned as onboarding buddy
- [ ] Hardware/equipment requirements communicated

---

## Procedure

### Phase 1: Pre-Arrival (Before Day 1)

#### Step 1.1: Account Provisioning

**Timeline:** 1-2 business days before start date

**Actions:**

| Account | Tool | Access Level | Notes |
|---------|------|-------------|-------|
| GitHub | `hansbeeksma` org | Write on assigned repos | Add to relevant teams |
| Plane | rooseveltdigital workspace | Member | Add to relevant projects (ROOSE, VINO, etc.) |
| Slack | Roosevelt workspace | Member | Add to relevant channels |
| Supabase | Project-specific | Developer | Per-project database access |
| Vercel | Project-specific | Member | Deployment preview access |
| Google Workspace | `@rooseveltops.com` | User | Email, Calendar, Drive |
| Sentry | Project-specific | Member | Error monitoring access |

**Automation Opportunity:** Account provisioning script (Terraform/shell) to batch-create accounts. See [ROOSE-48 Phase 2].

#### Step 1.2: Prepare Workspace

**Actions:**

1. Create Plane project access for relevant projects
2. Prepare welcome message with first-day instructions
3. Share hardware setup guide (if applicable)
4. Pre-configure development environment documentation

---

### Phase 2: Day 1 - Orientation

#### Step 2.1: Welcome & Company Introduction

**Duration:** 1 hour

**Agenda:**

1. **Welcome** (10 min)
   - Personal introduction
   - Team introductions
   - Company culture overview

2. **Roosevelt Overview** (20 min)
   - Company profile (see `docs/company/profile.md`)
   - Mission, vision, values (see `docs/company/values.md`)
   - Products & services overview (see `docs/products/overview.md`)
   - Brand identity (see `docs/brand/identity.md`)

3. **Working at Roosevelt** (15 min)
   - Communication protocols (see `docs/operations/communication-protocols.md`)
   - Quality standards (see `docs/operations/quality-assurance.md`)
   - Status reporting cadence

4. **Q&A** (15 min)

#### Step 2.2: Tool Access Verification

**Duration:** 30 minutes

**Actions:**

1. Verify all accounts are accessible
2. Walk through Plane workspace and project boards
3. Demonstrate Slack channels and communication norms
4. Verify Git access and repository clone

**Troubleshooting:**
- Missing access? Check Step 1.1 account list
- SSO issues? Verify Google Workspace setup
- 2FA? Help set up hardware/software keys

---

### Phase 3: Week 1 - Development Environment

#### Step 3.1: Local Setup

**Duration:** 2-4 hours

**Actions:**

1. Follow project-specific `SETUP.md` (e.g., `docs/SETUP.md`)
2. Clone relevant repositories
3. Install dependencies (`node_modules`, etc.)
4. Configure environment variables (`.env.local` from vault)
5. Verify local development server runs
6. Run test suite to confirm green build

**Required Tools:**

| Tool | Purpose | Install Guide |
|------|---------|---------------|
| Node.js (LTS) | JavaScript runtime | `nvm install --lts` |
| pnpm | Package manager | `npm install -g pnpm` |
| Git | Version control | Pre-installed on macOS |
| Docker | Container runtime | Docker Desktop |
| Supabase CLI | Local database | `brew install supabase/tap/supabase` |
| Claude Code | AI-assisted development | `npm install -g @anthropic-ai/claude-code` |

#### Step 3.2: Development Workflow Introduction

**Duration:** 1-2 hours

**Topics:**

1. **Git Workflow**
   - Branch naming: `feature/PROJ-123-description`
   - Commit conventions: `feat(scope): description`
   - PR process and review expectations
   - See `~/.claude/rules/git-workflow.md`

2. **Plane Integration**
   - Issue lifecycle: Backlog > Todo > In Progress > Done
   - How to pick up issues
   - Status updates and comments

3. **Code Quality**
   - ESLint + Prettier (auto-formatted on save)
   - Pre-commit hooks (Husky + lint-staged)
   - Gitleaks for secret scanning
   - See `~/.claude/rules/coding-style.md`

4. **Testing**
   - TDD workflow: Red > Green > Refactor
   - Minimum 80% coverage for new code
   - E2E tests with Playwright
   - See `~/.claude/rules/testing.md`

#### Step 3.3: AI-Assisted Development Setup

**Duration:** 30 minutes

**Topics:**

1. Claude Code configuration and usage
2. MCP server overview (relevant servers for their project)
3. Skills and agents available
4. When to use AI assistance vs manual work

---

### Phase 4: Week 1-2 - First Contributions

#### Step 4.1: Starter Issue

**Timeline:** Day 2-3

**Actions:**

1. Assign a well-defined, small-scope issue (labeled `good-first-issue`)
2. Pair programming session with buddy (optional)
3. First PR submitted
4. Code review with constructive feedback
5. PR merged

**Good First Issues Criteria:**
- Clear acceptance criteria
- Isolated scope (1-3 files)
- Existing test patterns to follow
- No production-critical path

#### Step 4.2: Architecture Walkthrough

**Timeline:** Day 3-5

**Duration:** 1-2 hours

**Topics:**

1. Project architecture overview
2. Key directories and their purpose
3. Database schema and relationships
4. API patterns and conventions
5. Deployment pipeline

#### Step 4.3: Independent Work

**Timeline:** Week 2

**Actions:**

1. Pick up a medium-scope issue independently
2. Create implementation plan (optional, for complex issues)
3. Submit PR following established patterns
4. Participate in code review for others

---

### Phase 5: Month 1 - Ramp-Up

#### Step 5.1: Knowledge Deepening

**Actions:**

1. Review project documentation thoroughly
2. Understand business context and user needs
3. Explore related systems and integrations
4. Identify knowledge gaps and address them

#### Step 5.2: First Meaningful Deliverable

**Actions:**

1. Complete a feature or significant bug fix end-to-end
2. Write tests and documentation
3. Deploy to staging/preview
4. Receive stakeholder feedback

#### Step 5.3: Onboarding Feedback

**Timeline:** End of month 1

**Actions:**

1. Complete [Onboarding Feedback Form](#feedback-form)
2. 1-on-1 with team lead to discuss experience
3. Identify process improvements
4. Update this SOP with improvements found

---

## Validation

### Onboarding Complete When:

- [ ] All accounts provisioned and verified
- [ ] Local development environment working
- [ ] First PR merged
- [ ] Architecture walkthrough completed
- [ ] Independent medium-scope issue completed
- [ ] Onboarding feedback collected
- [ ] Can independently pick up, implement, and deliver issues

---

## Automation Opportunities

Identified during Phase 1 playbook creation:

| Area | Current Process | Automation Potential | Effort |
|------|----------------|---------------------|--------|
| Account provisioning | Manual creation per service | Shell/Terraform script | Medium |
| Environment setup | Manual SETUP.md follow | `make setup` or `./scripts/setup.sh` | Low |
| Repo access | Manual GitHub team assignment | GitHub API script | Low |
| Plane project access | Manual workspace invite | Plane API script | Low |
| Welcome message | Manual Slack message | Slack bot/workflow | Low |
| Guided tour | Verbal walkthrough | Intro.js product tour | Medium |
| Knowledge check | Informal conversation | Structured quiz/checklist | Low |

**Priority order for automation (Phase 2):**
1. Environment setup script (highest time savings)
2. Account provisioning batch script
3. Guided tour with Intro.js
4. Knowledge base in Obsidian

---

## Feedback Form

### Onboarding Experience Survey

Complete after 30 days:

1. **How would you rate the overall onboarding experience?** (1-5)
2. **Were all accounts set up before your first day?** (Yes/No/Partial)
3. **How long did local environment setup take?** (Hours)
4. **Was the documentation sufficient to get started?** (1-5)
5. **Did you feel supported during your first week?** (1-5)
6. **What was the most helpful part of onboarding?** (Open text)
7. **What could be improved?** (Open text)
8. **How confident do you feel working independently?** (1-5)

**Target metrics:**
- Time-to-first-PR: < 3 days
- Time-to-independent-work: < 2 weeks
- Onboarding satisfaction: > 4.0/5.0
- Environment setup time: < 4 hours

---

## Troubleshooting

### Common Issues

**Issue:** Environment setup fails
**Solution:**
1. Check Node.js version matches project requirements
2. Clear `node_modules` and reinstall
3. Verify `.env.local` has all required variables
4. Check Docker is running (for Supabase local)

**Issue:** Git access denied
**Solution:**
1. Verify SSH key is added to GitHub
2. Check team membership in `hansbeeksma` org
3. Test with `ssh -T git@github.com`

**Issue:** Supabase connection fails
**Solution:**
1. Verify Supabase CLI is installed
2. Run `supabase start` for local development
3. Check `.env.local` Supabase URL and anon key

**Issue:** New member feels overwhelmed
**Solution:**
1. Reduce scope of initial issues
2. Increase pair programming time
3. Schedule daily check-ins for first week
4. Focus on one project/domain at a time

---

## Related Documents

- [Client Onboarding](client-onboarding.md) - For client relationships
- [Project Initiation](project-initiation.md) - Project setup steps
- [Communication Protocols](communication-protocols.md) - How we communicate
- [Quality Assurance](quality-assurance.md) - Quality standards
- [Onboarding Checklist Template](../templates/onboarding-checklist.md) - Printable checklist

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-09 | 1.0.0 | Initial SOP creation (ROOSE-48 Phase 1) |

---

*Maintained by: Technical Writing Department*
*Review Schedule: Quarterly*
