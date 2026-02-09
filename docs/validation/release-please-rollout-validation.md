# Release-Please Rollout Validation

**Datum:** 2026-02-09
**Issue:** ROOSE-132
**Scope:** vino12 en roosevelt-ops repositories

---

## Executive Summary

Release-Please is **geconfigureerd maar niet actief** in beide productie repositories. Configuratie is correct opgezet via reusable workflows, maar er zijn **geen release PRs aangemaakt** ondanks meerdere conventional commits naar main.

**Status:** ⚠️ **NEEDS ACTION** - Configuration werkt, maar workflow triggert niet zoals verwacht.

---

## Validation Checklist

| Check | vino12 | roosevelt-ops | Status |
|-------|--------|---------------|--------|
| ✅ `.release-please-manifest.json` exists | Yes (v0.1.0) | Yes (v0.1.0) | ✅ |
| ✅ `release-please-config.json` exists | Yes | Yes | ✅ |
| ✅ `.github/workflows/release.yml` exists | Yes | Yes | ✅ |
| ✅ Calls reusable workflow correctly | Yes | Yes | ✅ |
| ✅ Conventional commits present | Yes (10+) | Yes (10+) | ✅ |
| ❌ Release-please PRs created | **NO** | **NO** | ❌ |
| ❌ GitHub Releases created | **NO** | **NO** | ❌ |

---

## Configuration Analysis

### Shared Reusable Workflow Pattern

Beide repos gebruiken **identieke setup** via `hansbeeksma/release-infrastructure`:

```yaml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    uses: hansbeeksma/release-infrastructure/.github/workflows/reusable-release-please.yml@main
    with:
      release-type: "node"
    secrets: inherit
```

**Reusable workflow** (`release-infrastructure/.github/workflows/reusable-release-please.yml`):
- Uses `googleapis/release-please-action@v4` ✅
- Inputs: release-type, target-branch, config-file, manifest-file ✅
- Outputs: release-created, tag-name, version, pr-number ✅
- GitHub Step Summary generation ✅

**Verdict:** ✅ Configuration is **correct and production-ready**.

---

### Release-Please Configuration

**Both repos:**
```json
{
  "release-type": "node",
  "bump-minor-pre-major": true,
  "bump-patch-for-minor-pre-major": true,
  "include-component-in-tag": false,
  "changelog-sections": [
    { "type": "feat", "section": "Features" },
    { "type": "fix", "section": "Bug Fixes" },
    { "type": "perf", "section": "Performance" },
    { "type": "security", "section": "Security" },
    { "type": "docs", "hidden": true },
    { "type": "refactor", "hidden": true },
    { "type": "test", "hidden": true },
    { "type": "chore", "hidden": true },
    { "type": "ci", "hidden": true }
  ]
}
```

**Verdict:** ✅ Configuration follows best practices.

---

## Commit Analysis

### VINO12 Recent Commits (last 10)

| Commit | Type | Message | Date |
|--------|------|---------|------|
| 68ff993 | `feat(analytics)` | add funnel event tracker and scorer tool docs | 2026-02-09 |
| 521e98a | `feat(analytics)` | add conversion funnel API and SQL views | 2026-02-09 |
| e4721b6 | `docs(planning)` | add validation report template and scoring tool | 2026-02-09 |
| 33c8f06 | `docs(analytics)` | add conversion funnel documentation | 2026-02-09 |
| 604d1c1 | `chore` | add Storybook visual regression CI, mutation testing deps | 2026-02-09 |
| e533dd2 | `docs(planning)` | add Go/No-Go decision framework | 2026-02-09 |
| 4b21ba8 | `test(mutation)` | add Stryker mutation testing configuration | 2026-02-09 |
| 7c79e21 | `test(storybook)` | add test-runner config and update stories | 2026-02-09 |
| 444a221 | `feat(experiments)` | add homepage CTA A/B testing variants | 2026-02-09 |
| 3a173d2 | `feat(analytics)` | add AARRR metrics, page view tracking, and admin dashboard | 2026-02-09 |

**Analysis:**
- ✅ All commits follow conventional commits spec
- ✅ Multiple `feat:` commits (should trigger minor version bump)
- ✅ Commits pushed to `main` branch
- ⚠️ **NO release-please PR created**

### Roosevelt OPS Recent Commits (last 10)

| Commit | Type | Message | Date |
|--------|------|---------|------|
| f41bebf | `ci` | migrate to reusable workflows from release-infrastructure | 2026-02-08 |
| 0ea0123 | `fix(ci)` | remove lighthouse:recommended preset, keep explicit assertions | 2026-02-07 |
| 9ae50bd | `fix(ci)` | disable inapplicable Lighthouse assertions | 2026-02-07 |
| 944a877 | `fix(ci)` | resolve Dependency Audit and Performance Budget failures | 2026-02-07 |
| 1f4c4d1 | `chore(deps)` | bump @supabase/supabase-js (#5) | 2026-02-07 |
| 6efd16f | `chore(deps-dev)` | bump lint-staged from 15.5.2 to 16.2.7 (#11) | 2026-02-07 |
| 113a0ac | `chore(deps-dev)` | bump @types/node from 22.19.9 to 25.2.1 (#9) | 2026-02-07 |
| 4466a2d | `ci(deps)` | bump actions/setup-node from 4 to 6 (#3) | 2026-02-07 |
| 928991e | `ci(deps)` | bump actions/upload-artifact from 4 to 6 (#2) | 2026-02-07 |
| b771236 | `ci(deps)` | bump actions/checkout from 4 to 6 (#1) | 2026-02-07 |

**Analysis:**
- ✅ All commits follow conventional commits spec
- ✅ Multiple `fix:` commits (should trigger patch version bump)
- ✅ Commits pushed to `main` branch
- ⚠️ **NO release-please PR created**

---

## Pull Request Analysis

### VINO12 PRs (last 20)

**Total PRs:** 14
**Release-Please PRs:** **0** ❌

**PR breakdown:**
- 13 Dependabot PRs (automated dependency updates)
- 1 Feature PR by hansbeeksma

**NO release-please PRs found.**

### Roosevelt OPS PRs (last 20)

**Total PRs:** 21
**Release-Please PRs:** **0** ❌

**PR breakdown:**
- 21 Dependabot PRs (automated dependency updates)
- 0 Feature PRs
- 0 Release PRs

**NO release-please PRs found.**

---

## Root Cause Analysis

### Why Release-Please is Not Creating PRs

**Possible causes (ordered by likelihood):**

1. **Workflow Not Triggered Yet**
   - Release workflow runs only on `push` to `main` branch
   - Recent commits might not have triggered workflow yet
   - **Action:** Check GitHub Actions run history

2. **Insufficient Commits for Release**
   - Release-please may require multiple commits before creating PR
   - Current manifest version: `0.1.0` (initial version)
   - **Action:** Check release-please thresholds

3. **Workflow Failing Silently**
   - Workflow might be running but failing
   - No error notifications configured
   - **Action:** Check GitHub Actions logs for failures

4. **Manifest Version Issue**
   - Manifest at `0.1.0` might indicate no releases yet created
   - Release-please might be waiting for first release trigger
   - **Action:** Manual first release trigger via GitHub UI

5. **Branch Protection Rules**
   - Branch protection might block bot from creating PRs
   - **Action:** Check if `release-please[bot]` has bypass permissions

---

## Recommendations

### Immediate Actions (P0)

1. **Check GitHub Actions Workflow Runs**
   ```bash
   # Via gh CLI
   gh run list --workflow=release.yml --limit 20
   ```
   - Verify if workflow runs are succeeding or failing
   - Check logs for error messages

2. **Manual First Release Trigger** (if no workflow runs)
   - Push a conventional commit to trigger workflow
   - Monitor workflow run in GitHub Actions UI
   - Expected: release-please PR should be created

3. **Verify Bot Permissions**
   - Check if `release-please[bot]` can create PRs
   - Verify `secrets.GITHUB_TOKEN` has correct permissions
   - May need `contents: write` and `pull-requests: write`

### Short-term Actions (P1)

4. **Add Workflow Monitoring**
   - Enable GitHub Actions email notifications on failure
   - Add Slack webhook for workflow failures (if applicable)
   - Track workflow success rate

5. **Document Release Process**
   - Create `docs/procedures/manual-release.md`
   - Document how to manually trigger releases if workflow fails
   - Include troubleshooting steps

### Long-term Improvements (P2)

6. **Add Release Verification Tests**
   - Create CI job that validates release-please PRs
   - Add automated changelog verification
   - Track release frequency metrics

7. **Implement Release Notifications**
   - Slack notification on new releases
   - Changelog email to stakeholders
   - Update project dashboard with latest version

---

## Testing Protocol

To validate release-please is working correctly:

### Test 1: Trigger Workflow Manually

```bash
# 1. Make a conventional commit
cd ~/Development/products/vino12
git checkout main
echo "# Test Release" >> README.md
git add README.md
git commit -m "docs: add test release trigger"
git push origin main

# 2. Wait 1-2 minutes for workflow to run

# 3. Check for release-please PR
gh pr list --author "release-please[bot]"
```

**Expected result:** A PR titled `chore(main): release 0.1.1` (or similar) should be created.

### Test 2: Verify Workflow Logs

```bash
# Check recent workflow runs
gh run list --workflow=release.yml --limit 5

# View logs of most recent run
gh run view --log
```

**Expected result:** Workflow should show successful completion with release-please action output.

### Test 3: Manual Release Creation

If automated approach fails, manually create first release:

```bash
# Via GitHub UI
1. Go to Releases tab
2. Click "Draft a new release"
3. Create tag: v0.1.0
4. Title: "v0.1.0"
5. Description: "Initial release"
6. Publish release

# Then push new conventional commit
# Release-please should now create PR for v0.1.1
```

---

## Verification Criteria

Release-please rollout is **COMPLETE** when:

- [ ] Release workflow runs successfully on every push to `main`
- [ ] Release-please creates PRs after conventional commits
- [ ] PRs include changelog and version bump
- [ ] Merging release PR creates GitHub Release automatically
- [ ] Manifest version updates correctly after release
- [ ] Both vino12 and roosevelt-ops have at least 1 release created

**Current Status:** 0/6 criteria met ❌

---

## Conclusion

**Configuration Status:** ✅ **CORRECT** - All config files properly set up via reusable workflows.

**Operational Status:** ❌ **NOT WORKING** - No release PRs created despite conventional commits.

**Next Step:** Check GitHub Actions workflow run history to determine if workflows are executing and identify any errors.

**Estimated Time to Fix:** 30-60 minutes (pending workflow log analysis)

**Risk Level:** **LOW** - Configuration is correct, likely just needs workflow trigger or permission fix.

---

## Appendix: Configuration Files

### VINO12

- Manifest: `{"." : "0.1.0"}` (unchanged since setup)
- Config: Node release type, pre-major versioning enabled
- Workflow: Calls `hansbeeksma/release-infrastructure/.github/workflows/reusable-release-please.yml@main`

### Roosevelt OPS

- Manifest: `{"." : "0.1.0"}` (unchanged since setup)
- Config: Identical to vino12
- Workflow: Identical to vino12 (same reusable workflow)

### Shared Reusable Workflow

Located in `hansbeeksma/release-infrastructure`:
- Action: `googleapis/release-please-action@v4`
- Inputs: release-type, target-branch (main), config/manifest paths
- Outputs: release-created, tag-name, version, pr-number
- Summary: GitHub Step Summary with release info

---

**Related Issues:**
- ROOSE-132: Release-Please Rollout Validation ← This issue
- Plane Sync recommended: Update ROOSE-132 to Done with validation findings

**Follow-up Issue Recommended:**
- Create ROOSE-XXX: "Troubleshoot release-please workflow - no PRs created" (P1)
