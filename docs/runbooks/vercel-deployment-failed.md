# Runbook: Vercel - Deployment Failed

**Last Updated**: 2026-02-05
**Owner**: DevOps Team
**Severity**: SEV-2
**Estimated Time**: 10-15 minutes

---

## Quick Reference

**One-line summary**: Rollback failed Vercel deployment to last known good version.

**When to use**: Vercel deployment fails, production site broken, or new deployment causes errors.

---

## Prerequisites

- [ ] Vercel CLI installed (`npm i -g vercel`)
- [ ] Authenticated with Vercel (`vercel login`)
- [ ] Access to roosevelt-d9f64ff6 team

---

## Symptoms

Observable signs indicating failed deployment:

- [ ] **Production site down**: Users see 500 errors or blank page
- [ ] **Build failed**: Vercel dashboard shows red "Failed" status
- [ ] **Spike in Sentry errors**: Error rate > 5% immediately after deployment
- [ ] **Slack alert**: Vercel deployment notification shows failure

**Monitoring**:
- Vercel dashboard: https://vercel.com/roosevelt-d9f64ff6/roosevelt-ops
- Sentry dashboard: https://roosevelt-ops.sentry.io/
- Production URL: https://roosevelt-de5dqsl0y-roosevelt-d9f64ff6.vercel.app

---

## Diagnosis

### Step 1: Verify deployment status

```bash
# List recent deployments
vercel ls roosevelt-ops --prod

# Check specific deployment
vercel inspect [deployment-url]
```

**Expected output**:
- State: "ERROR" or "CANCELED"
- Exit code: Non-zero
- Build logs show failure reason

---

### Step 2: Check build logs

```bash
# View build logs
vercel logs [deployment-url]

# Or via dashboard
open "https://vercel.com/roosevelt-d9f64ff6/roosevelt-ops/[deployment-id]"
```

**Common causes**:
1. **Build errors**: TypeScript compilation failures, missing dependencies
2. **Environment variables**: Missing or incorrect values
3. **Memory limit**: Build exceeds Vercel's memory limits
4. **Timeout**: Build takes > 15 minutes
5. **Dependencies**: `npm install` failed

---

### Step 3: Identify last good deployment

```bash
# List recent successful deployments
vercel ls roosevelt-ops --prod | grep "READY"

# Note the deployment URL of last successful build
```

---

## Mitigation

### Option A: Rollback (Recommended)

**Use when**: Deployment failed or production is broken

**Steps**:

1. **Identify last good deployment**
   ```bash
   # List last 10 production deployments
   vercel ls roosevelt-ops --prod | head -10
   ```

   Look for most recent deployment with `READY` status (green checkmark).

2. **Rollback to last good deployment**
   ```bash
   # Promote previous deployment to production
   vercel promote [last-good-deployment-url] --yes
   ```

   **Verification**: Command shows "Success!" and new production URL.

3. **Verify rollback succeeded**
   ```bash
   # Check current production deployment
   vercel ls roosevelt-ops --prod | head -1
   ```

   **Expected**: First entry matches the deployment you rolled back to.

4. **Confirm site is healthy**
   - Open production URL: https://roosevelt-de5dqsl0y-roosevelt-d9f64ff6.vercel.app
   - Check Sentry: Error rate should drop to < 1%
   - Test critical user flows (login, dashboard, etc.)

**Success criteria**:
- ✅ Production URL loads successfully
- ✅ No 500 errors in last 5 minutes
- ✅ Sentry error rate < 1%

---

### Option B: Redeploy (If build was the issue)

**Use when**: Build failed but code is actually correct (e.g., transient network issue)

**Steps**:

1. **Trigger rebuild**
   ```bash
   # Redeploy from Git
   vercel --prod --yes
   ```

2. **Watch build progress**
   ```bash
   # Follow build logs in real-time
   vercel logs --follow
   ```

3. **If build succeeds**: Verify as in Option A step 4
4. **If build fails again**: Switch to Option A (rollback)

---

### Option C: Emergency Hotfix

**Use when**: Rollback isn't sufficient and hotfix is needed

**Steps**:

1. **Create hotfix branch**
   ```bash
   git checkout -b hotfix/[issue-description]
   ```

2. **Apply minimal fix**
   ```bash
   # Make the smallest possible fix
   # Edit affected files
   git add .
   git commit -m "hotfix: [brief description]"
   ```

3. **Deploy hotfix**
   ```bash
   git push origin hotfix/[issue-description]
   vercel --prod --yes
   ```

4. **Verify and merge to main**
   ```bash
   # After verification
   git checkout main
   git merge hotfix/[issue-description]
   git push origin main
   ```

---

## Verification

After mitigation, verify resolution:

- [ ] **Production site loads**: Visit URL and check homepage
- [ ] **No errors in Sentry**: Check last 5 minutes
- [ ] **Vercel deployment status**: "READY" with green checkmark
- [ ] **Recent logs clean**: `vercel logs` shows no errors
- [ ] **Critical flows work**: Test login, navigation, key features
- [ ] **Post resolution to #incidents**

---

## Prevention

**Short-term** (implement immediately):
- [ ] Enable staging environment preview for all PRs
- [ ] Add pre-deployment smoke tests
- [ ] Set up Vercel deployment protection (require manual approval for prod)

**Long-term** (add to backlog):
- [ ] Implement E2E tests in CI (Plane issue: ROOSE-XXX)
- [ ] Add deployment health checks with automatic rollback
- [ ] Create staging environment that mirrors production
- [ ] Set up canary deployments (gradual rollout)

**Monitoring improvements**:
- [ ] Alert on Vercel deployment failures (Slack integration)
- [ ] Dashboard showing deployment frequency and success rate
- [ ] Automated Sentry error rate comparison (pre vs post deploy)

---

## Rollback Plan

If rollback causes issues:

1. **Immediate**: Promote even older deployment
   ```bash
   vercel ls roosevelt-ops --prod | head -3
   # Pick deployment from 2-3 versions back
   vercel promote [older-deployment-url] --yes
   ```

2. **Preserve evidence**: Before rolling back further
   ```bash
   # Capture deployment logs
   vercel logs [failed-deployment-url] > /tmp/deployment-failure-$(date +%s).log

   # Capture Sentry errors
   # Open Sentry dashboard and export error list
   ```

3. **Escalate**: If multiple rollbacks fail
   - Post to #incidents: "Multiple rollback attempts failed"
   - Tag @team-lead or @cto
   - Consider enabling maintenance mode

---

## Communication Templates

### Internal (#incidents)

```
🟠 SEV-2: Vercel deployment failed
Runbook: vercel-deployment-failed
Status: Rolling back to deployment [short-hash]
ETA: 5 minutes
Commander: @[your-name]

Deployment: https://vercel.com/roosevelt-d9f64ff6/roosevelt-ops/[deployment-id]
```

### Status Update

```
Update: Rollback complete. Production restored to previous version.
Monitoring for stability. Root cause investigation in progress.
```

---

## Common Deployment Failures

### Build Error: TypeScript Compilation

**Symptom**: `error TS2322: Type 'X' is not assignable to type 'Y'`

**Fix**: Check recent code changes, ensure types are correct
```bash
# Run type check locally
npm run type-check
```

---

### Build Error: Missing Environment Variable

**Symptom**: `Error: NEXT_PUBLIC_X is not defined`

**Fix**: Add missing env var to Vercel
```bash
vercel env add NEXT_PUBLIC_X production
# Enter value when prompted
```

---

### Build Error: Out of Memory

**Symptom**: `JavaScript heap out of memory`

**Fix**: Optimize build or upgrade Vercel plan
- Short-term: Clear build cache
- Long-term: Reduce bundle size, code-split

---

### Runtime Error: API Route 500s

**Symptom**: Deployment succeeds but API routes fail

**Fix**: Check environment variables and database connections
```bash
# Test API routes locally
curl https://roosevelt-de5dqsl0y-roosevelt-d9f64ff6.vercel.app/api/health
```

---

## Related Runbooks

- `supabase-connection-pool.md`: If API errors are database-related
- `sentry-alert-storm.md`: If error rate spikes after deployment
- `rate-limit-exceeded.md`: If deployment triggers rate limiting

---

## FAQs

**Q: How long does rollback take?**
A: Typically 2-3 minutes. Vercel switches production alias to previous deployment.

**Q: Will rollback lose data?**
A: No. Rollback only changes application code, not database state.

**Q: Should I rollback for every failed deployment?**
A: Roll back if production is broken. If only build failed (site still works), fix and redeploy.

**Q: Can I rollback multiple versions at once?**
A: Yes, but risky. Prefer rolling back one version at a time to isolate issues.

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-05 | Initial creation | Sam Swaab |

---

**Runbook Owner**: DevOps Team
**Review Cadence**: Quarterly
**Next Review**: 2026-05-05
