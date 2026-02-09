# GitHub Merge Queue Configuration voor Agent Branches

**Frequency:** One-time per repository | **Owner:** DevOps | **Last Updated:** 2026-02-09

---

## Context

Bij multi-agent development workflows werken meerdere Claude Code agents parallel aan verschillende issues. Elk agent werkt in een geïsoleerde git worktree met een dedicated branch pattern `agent-feature/{issue-id}`. GitHub's merge queue voorkomt race conditions en garandeert dat elke merge eerst gebuild en getest wordt tegen de laatste main branch.

**Related Documentation:**
- Multi-agent issue claiming research: `docs/research/multi-agent-issue-claiming-research.md`
- Terminal sync protocol: `~/.claude/docs/TERMINAL-SYNC.md`

---

## Acceptance Criteria

- [x] Concurrency groups per agent branch in GitHub Actions
- [x] Auto-delete branches na merge
- [x] Path-based filtering voor agent branches
- [x] Branch protection rules voor merge queue

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| GitHub subscription | Team, Enterprise, or Pro | Merge queue requires paid plan |
| Repository admin access | - | Needed for branch protection rules |
| Existing CI workflow | - | Must have tests/checks defined |

---

## Part 1: GitHub Actions Concurrency Groups

Voorkom dat meerdere agent branches simultaan builden en conflicten veroorzaken.

### Workflow Configuration

Voeg toe aan `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches:
      - main
      - 'agent-feature/**'  # Agent branches
  pull_request:
    branches:
      - main

# Concurrency groups per branch
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true  # Cancel oude runs bij nieuwe push

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

  lint:
    runs-on: ubuntu-latest
    steps:
      # ... lint steps
```

**Key Configuration:**

| Setting | Value | Purpose |
|---------|-------|---------|
| `group` | `${{ github.workflow }}-${{ github.ref }}` | Unique per branch |
| `cancel-in-progress` | `true` | Cancel stale runs |

**What this does:**
- Each agent branch gets its own concurrency group
- New pushes cancel old CI runs (saves compute)
- Main branch runs independently

---

## Part 2: Auto-Delete Branches After Merge

Voorkom branch accumulation door agent branches automatisch te verwijderen na merge.

### Method 1: GitHub UI (Recommended)

**Settings → General → Pull Requests**

1. Navigate to repository Settings
2. Scroll to "Pull Requests" section
3. Enable: ☑️ **Automatically delete head branches**

### Method 2: Via GitHub API

```bash
# Enable auto-delete via gh CLI
gh api repos/{owner}/{repo} \
  --method PATCH \
  --field delete_branch_on_merge=true
```

### Method 3: Workflow Automation

For repos without paid GitHub plan, use a workflow:

```yaml
name: Cleanup Merged Branches

on:
  pull_request:
    types: [closed]

jobs:
  cleanup:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Delete merged branch
        uses: actions/github-script@v7
        with:
          script: |
            const ref = context.payload.pull_request.head.ref;

            // Only delete agent branches
            if (ref.startsWith('agent-feature/')) {
              await github.rest.git.deleteRef({
                owner: context.repo.owner,
                repo: context.repo.repo,
                ref: `heads/${ref}`
              });
              console.log(`Deleted branch: ${ref}`);
            }
```

---

## Part 3: Path-Based Filtering voor Agent Branches

Voorkom onnodige CI runs door alleen relevante paden te monitoren.

### Workflow Path Filters

Voeg toe aan workflows die alleen moeten draaien bij specifieke file changes:

```yaml
on:
  push:
    branches:
      - 'agent-feature/**'
    paths:
      - 'src/**'
      - 'lib/**'
      - 'package.json'
      - 'package-lock.json'
      # Exclude documentatie
      - '!docs/**'
      - '!*.md'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # ... test steps
```

### Path-Based Job Execution

Voor complexere scenario's, gebruik conditional job execution:

```yaml
jobs:
  check-changed-files:
    runs-on: ubuntu-latest
    outputs:
      src: ${{ steps.filter.outputs.src }}
      docs: ${{ steps.filter.outputs.docs }}
    steps:
      - uses: actions/checkout@v4

      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            src:
              - 'src/**'
              - 'lib/**'
            docs:
              - 'docs/**'
              - '*.md'

  test:
    needs: check-changed-files
    if: needs.check-changed-files.outputs.src == 'true'
    runs-on: ubuntu-latest
    steps:
      # Run tests only if source code changed
      - run: npm test

  lint-docs:
    needs: check-changed-files
    if: needs.check-changed-files.outputs.docs == 'true'
    runs-on: ubuntu-latest
    steps:
      # Lint docs only if docs changed
      - run: npm run lint:markdown
```

---

## Part 4: Branch Protection Rules + Merge Queue

Configureer branch protection met merge queue voor veilige parallel merges.

### Step 1: Enable Branch Protection

**Settings → Branches → Branch protection rules**

1. Click "Add rule"
2. Branch name pattern: `main`
3. Enable the following:

| Setting | Configuration |
|---------|--------------|
| ☑️ Require a pull request before merging | - |
| ☑️ Require approvals | 0 (auto-merge) of 1+ (review required) |
| ☑️ Require status checks to pass | Select: `test`, `lint`, `build` |
| ☑️ Require branches to be up to date | **CRITICAL** - ensures merge against latest main |
| ☑️ Require merge queue | **Enable this** |
| ☑️ Do not allow bypassing the above settings | Enforces rules for admins too |

### Step 2: Configure Merge Queue Settings

**Settings → Branches → [Edit rule] → Merge queue**

| Setting | Recommended Value | Rationale |
|---------|------------------|-----------|
| **Build concurrency** | 5 | Max parallel builds in queue |
| **Minimum time in queue** | 0 minutes | No artificial delay |
| **Maximum time in queue** | 60 minutes | Timeout for stuck builds |
| **Merge method** | Squash | Clean linear history |
| **Status check timeout** | 120 minutes | Max CI runtime |

### Step 3: Merge Queue Workflow

```yaml
name: Merge Queue

on:
  merge_group:
    types: [checks_requested]

jobs:
  test-merge:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.merge_group.head_sha }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Integration tests
        run: npm run test:integration
```

**What happens:**

1. Agent creates PR from `agent-feature/ROOSE-42`
2. PR added to merge queue
3. GitHub creates temporary merge commit with latest main
4. Merge queue workflow runs against temporary commit
5. If tests pass → merge to main
6. If tests fail → remove from queue, notify agent
7. Branch auto-deleted after successful merge

### Step 4: Queue Status Check

```bash
# Check merge queue status via gh CLI
gh pr checks --watch

# View queue position
gh pr view --json mergeStateStatus,mergeable
```

---

## Complete Example: Production-Ready Configuration

### Repository Settings Checklist

```bash
# Enable all settings via gh CLI
REPO="hansbeeksma/vino12"  # Example

# 1. Auto-delete branches
gh api repos/$REPO --method PATCH \
  --field delete_branch_on_merge=true

# 2. Branch protection (via JSON file)
cat > branch-protection.json <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["test", "lint", "build"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": true,
  "required_conversation_resolution": true
}
EOF

gh api repos/$REPO/branches/main/protection \
  --method PUT \
  --input branch-protection.json
```

### Complete Workflow File

```yaml
# .github/workflows/ci-with-merge-queue.yml
name: CI with Merge Queue

on:
  push:
    branches:
      - main
      - 'agent-feature/**'
  pull_request:
    branches:
      - main
  merge_group:
    types: [checks_requested]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test -- --coverage

      - name: Build
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: always()
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
```

---

## Agent Workflow Integration

### Terminal Sync Commands

```bash
# Agent claims issue + creates worktree
tsync claim ROOSE-42

# Agent works in isolated branch
cd ~/Development/products/vino12/.worktrees/agent-feature/ROOSE-42

# Agent pushes work + creates PR
agent-push.sh
# → Automatically creates PR
# → PR enters merge queue
# → CI runs against latest main
# → Auto-merges if tests pass
# → Branch auto-deleted

# Agent releases claim
tsync release ROOSE-42
```

### Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `Merge blocked: required status checks` | CI not passing | Check workflow logs, fix tests |
| `Merge blocked: branch not up to date` | Main changed since PR created | Rebase: `git pull --rebase origin main` |
| `Merge queue timeout` | CI took >60 min | Optimize tests, increase timeout |
| `Queue position: 3` | Other PRs ahead | Wait, or check if they're stuck |

---

## Monitoring & Metrics

### Queue Health Metrics

```bash
# Average queue time (via GitHub API)
gh api graphql -f query='
{
  repository(owner: "hansbeeksma", name: "vino12") {
    mergeQueue(branch: "main") {
      entries(first: 100) {
        nodes {
          estimatedTimeToMerge
          position
        }
      }
    }
  }
}'
```

### Dashboard (Optional - BetterStack/Datadog)

Track:
- Average time in queue
- Queue success rate (merged / total)
- Failed merge reasons
- Concurrency utilization

---

## Cost Optimization

| Optimization | Savings | Implementation |
|--------------|---------|----------------|
| Path-based filtering | ~40% CI minutes | Use `paths:` in workflows |
| Cancel in-progress | ~20% CI minutes | `cancel-in-progress: true` |
| Reusable workflows | ~30% config overhead | Extract to `release-infrastructure` repo |
| Haiku for non-critical checks | ~50% LLM cost | Use model-router skill |

**Estimated Cost per Merge:**
- With optimizations: ~2-3 GitHub Actions minutes
- Without: ~8-10 minutes

---

## Troubleshooting

### Issue: Merge queue stuck

**Symptoms:** PRs sit in queue for >10 minutes without progressing

**Diagnosis:**
```bash
gh pr checks --watch
gh api repos/$REPO/commits/$(gh pr view --json headRefOid -q .headRefOid)/check-runs
```

**Fix:**
1. Check if CI is running: `gh run list --workflow=ci.yml`
2. Cancel stuck runs: `gh run cancel <run-id>`
3. Re-trigger: Push empty commit to PR branch

### Issue: Branch not auto-deleting

**Symptoms:** Old agent branches accumulate in repo

**Diagnosis:**
```bash
gh api repos/$REPO | jq '.delete_branch_on_merge'
# Should return: true
```

**Fix:**
```bash
# Enable via API
gh api repos/$REPO --method PATCH --field delete_branch_on_merge=true

# Manual cleanup
git branch -r | grep 'agent-feature/' | sed 's/origin\///' | xargs -n 1 gh api repos/$REPO/git/refs/heads/{} --method DELETE
```

---

## Rollout Checklist

Apply to all active repositories in priority order:

- [ ] **vino12** (active development)
- [ ] **h2ww-platform** (active development)
- [ ] **vetteshirts** (maintenance)
- [ ] **roosevelt-ops** (documentation)

Per repository:
1. [ ] Enable auto-delete branches
2. [ ] Add concurrency groups to CI workflow
3. [ ] Configure path-based filtering
4. [ ] Create branch protection rule with merge queue
5. [ ] Create merge queue workflow
6. [ ] Test with dummy PR
7. [ ] Monitor queue for 1 week
8. [ ] Document any repo-specific quirks

---

## References

- [GitHub Merge Queue Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue)
- [GitHub Actions Concurrency](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#concurrency)
- Multi-agent research: `~/Development/products/roosevelt-ops/docs/research/multi-agent-issue-claiming-research.md`
- Terminal sync: `~/.claude/docs/TERMINAL-SYNC.md`

---

*Linked to: ROOSE-158 (Multi-Agent Issue Claiming & Conflict-Free Git Workflow)*
*Linked to: ROOSE-166 (GitHub merge queue config voor agent branches)*
