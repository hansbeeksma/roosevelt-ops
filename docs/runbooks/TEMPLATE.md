# Runbook Template

**Copy this template when creating new runbooks**

---

# Runbook: [Service] - [Scenario]

**Last Updated**: YYYY-MM-DD
**Owner**: [Team/Person]
**Severity**: SEV-X
**Estimated Time**: X minutes

---

## Quick Reference

**One-line summary**: [Brief description of what this runbook solves]

**When to use**: [Specific symptoms or alerts that trigger this runbook]

---

## Prerequisites

- [ ] Access to [system/tool]
- [ ] Permissions for [operation]
- [ ] Knowledge of [concept]

---

## Symptoms

Observable signs that indicate this issue:

- [ ] [Symptom 1]: Description
- [ ] [Symptom 2]: Description
- [ ] [Alert fired]: Alert name from monitoring

**Monitoring**:
- Sentry alert: [Link or alert name]
- Grafana dashboard: [Link]
- Logs location: [Path or query]

---

## Diagnosis

### Step 1: Verify the issue

```bash
# Commands to verify the problem exists
```

**Expected output**: [What you should see if issue confirmed]

### Step 2: Check dependencies

```bash
# Check related services/systems
```

**Common causes**:
1. [Cause 1]: How to identify
2. [Cause 2]: How to identify

### Step 3: Identify root cause

```bash
# Commands to pinpoint the issue
```

---

## Mitigation

### Option A: Quick Fix (Recommended)

**Use when**: [Conditions for this approach]

**Steps**:
1. **[Action 1]**
   ```bash
   # Command with exact parameters
   ```
   **Verification**: [How to confirm step succeeded]

2. **[Action 2]**
   ```bash
   # Command with exact parameters
   ```
   **Verification**: [How to confirm step succeeded]

3. **[Action 3]**
   ```bash
   # Command with exact parameters
   ```
   **Verification**: [How to confirm step succeeded]

**Success criteria**: [How to know mitigation worked]

---

### Option B: Rollback (If Quick Fix Fails)

**Use when**: Quick fix doesn't resolve issue within X minutes

**Steps**:
1. **Rollback deployment**
   ```bash
   vercel rollback --yes [deployment-url]
   ```

2. **Verify rollback**
   ```bash
   vercel ls --prod | head -1
   ```

3. **Confirm service restored**
   - Check [monitoring dashboard]
   - Verify [key metric]

---

### Option C: Emergency Procedures

**Use when**: Options A & B failed, or data integrity at risk

**Steps**:
1. **Engage escalation path**: Page [role] via PagerDuty
2. **Enable maintenance mode**: [How to enable]
3. **Preserve evidence**: Capture logs, metrics before making changes
4. **Coordinate with team**: Post to #incidents channel

---

## Verification

After mitigation, verify resolution:

- [ ] Primary symptom resolved: [Specific check]
- [ ] No errors in logs for 5 minutes: `[log query]`
- [ ] Monitoring shows healthy state: [Dashboard link]
- [ ] Customer-reported issues resolved: Check support tickets
- [ ] Post resolution message to #incidents

---

## Prevention

**Short-term** (implement immediately):
- [ ] [Action item 1]
- [ ] [Action item 2]

**Long-term** (add to backlog):
- [ ] [Improvement 1]: Plane issue [ROOSE-XXX]
- [ ] [Improvement 2]: Plane issue [ROOSE-XXX]

**Monitoring improvements**:
- [ ] Add alert for [metric] threshold
- [ ] Create dashboard for [component]

---

## Rollback Plan

If mitigation causes new issues:

1. **Immediate**: [Undo command or action]
2. **Restore state**: [How to return to pre-mitigation state]
3. **Notify team**: Post to #incidents with rollback reason

---

## Communication Templates

### Internal (#incidents)

```
🟠 SEV-X: [Service] - [Issue]
Runbook: [This runbook name]
Status: Mitigating via [Option A/B/C]
ETA: [Time estimate]
Commander: @[your-name]
```

### External (Status Page)

```
We're investigating reports of [customer-visible symptom].
Our team is actively working on a resolution.
Updates: [Link to status page]
```

---

## Related Runbooks

- [Related runbook 1]: When to use instead
- [Related runbook 2]: Follow-up procedure

---

## FAQs

**Q: [Common question]**
A: [Answer]

**Q: [Common question]**
A: [Answer]

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| YYYY-MM-DD | Initial creation | [Name] |
| YYYY-MM-DD | Updated [section] | [Name] |

---

**Runbook Owner**: [Name]
**Review Cadence**: Quarterly
**Next Review**: YYYY-MM-DD
