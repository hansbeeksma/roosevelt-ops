# Quarterly Penetration Testing Program

> **Part of:** ROOSE-52 (OWASP 2025 Security Gates)
> **Implemented:** ROOSE-98 (Quarterly Penetration Testing Program)
> **Version:** 1.0.0

Complete framework voor quarterly penetration testing program.

---

## Overview

**Penetration Testing** (pentesting) valideert security controls door simulated attacks uit te voeren op systemen.

**Why Quarterly?**
- 📅 Continuous validation (4x/jaar)
- 🔄 Regular feedback loop
- 🎯 Catch regressions early
- 📊 Trend analysis over time

**OWASP 2025 Coverage**: All categories (comprehensive validation)

---

## Testing Scope

### In-Scope Assets

| Asset Type | Examples | Test Frequency |
|------------|----------|----------------|
| **Web Applications** | https://roosevelt-ops.vercel.app | Quarterly |
| **APIs** | REST, GraphQL endpoints | Quarterly |
| **Authentication** | OAuth, JWT, session management | Quarterly |
| **Infrastructure** | Cloud resources (AWS/Azure/GCP) | Bi-annually |
| **Mobile Apps** | iOS, Android applications | Quarterly |

### Out-of-Scope

- ❌ Third-party services (unless explicitly approved)
- ❌ Production databases (use staging replicas)
- ❌ Social engineering attacks
- ❌ Physical security testing
- ❌ Denial-of-Service (DoS) attacks

---

## Vendor Selection Criteria

### Must-Have Qualifications

- [ ] CREST or OSCP certified testers
- [ ] Minimum 5 years pentesting experience
- [ ] Experience with our tech stack (Next.js, Supabase, Vercel)
- [ ] OWASP Top 10:2025 testing methodology
- [ ] Insurance coverage ($2M+ cyber liability)
- [ ] NDA and data protection agreements

### Evaluation Criteria

| Criteria | Weight | Evaluation |
|----------|--------|------------|
| **Technical Expertise** | 35% | Certifications, years of experience, tech stack knowledge |
| **Methodology** | 25% | OWASP-based, manual testing, automation balance |
| **Reporting Quality** | 20% | Sample reports, remediation guidance, clarity |
| **Cost** | 10% | Per-test cost, retesting policy |
| **Availability** | 10% | Quarterly scheduling, emergency support |

### Recommended Vendors (Examples)

- **Cobalt.io**: Platform-based pentesting, flexible scheduling
- **Synack**: Crowdsourced pentesting, continuous coverage
- **Bishop Fox**: Enterprise-grade, CREST certified
- **NCC Group**: Global coverage, deep expertise
- **Trail of Bits**: Advanced security research, code audits

---

## Testing Schedule

### Quarterly Calendar

| Quarter | Months | Focus Area | Deliverable |
|---------|--------|------------|-------------|
| **Q1** | Jan-Mar | Web application + API security | Full penetration test report |
| **Q2** | Apr-Jun | Infrastructure + cloud security | Infrastructure security assessment |
| **Q3** | Jul-Sep | Web application + API security | Full penetration test report |
| **Q4** | Oct-Dec | Year-end comprehensive + mobile | Annual security summary |

### Pre-Test Checklist

**2 weeks before test:**
- [ ] Confirm scope with vendor
- [ ] Provision test environment (staging replica)
- [ ] Create test user accounts
- [ ] Notify team (avoid false alarms)
- [ ] Prepare documentation for vendor (API specs, architecture diagrams)

**1 week before test:**
- [ ] Vendor NDA signed
- [ ] IP whitelist updated (allow vendor IPs)
- [ ] Monitoring thresholds adjusted (reduce noise)
- [ ] Backup production (in case of accidental impact)

**Day of test:**
- [ ] Kickoff call with vendor
- [ ] Point of contact available (Slack, phone)
- [ ] Log monitoring active

---

## Testing Methodology

### OWASP Top 10:2025 Coverage

| OWASP Category | Test Activities |
|----------------|-----------------|
| **A01: Broken Access Control** | Test IDOR, missing auth, privilege escalation |
| **A02: Security Misconfiguration** | Check headers, CORS, error messages, default configs |
| **A03: Software Supply Chain** | Test dependency vulnerabilities, third-party integrations |
| **A04: Cryptographic Failures** | Weak crypto, insecure storage, TLS configuration |
| **A05: Injection** | SQL injection, XSS, command injection, LDAP injection |
| **A06: Vulnerable Components** | Exploit known CVEs in dependencies |
| **A07: Authentication Failures** | Brute force, session fixation, weak passwords |
| **A08: Data Integrity Failures** | Insecure deserialization, unsigned JWTs |
| **A09: Security Logging Failures** | Missing audit logs, insufficient monitoring |
| **A10: Mishandling of Exceptions** | Information disclosure via errors |

### Manual vs Automated Testing

**Automated (40%)**:
- Vulnerability scanning (Burp Suite, Nessus)
- Dependency checks (Snyk, OWASP Dependency-Check)
- Configuration review (Cloud Security Posture Management)

**Manual (60%)**:
- Business logic flaws
- Complex authentication flows
- Authorization bypass techniques
- Chained attacks (exploit combination)

---

## Remediation SLAs

### Severity Definitions

| Severity | Impact | Exploitability | Remediation SLA |
|----------|--------|----------------|-----------------|
| **Critical** | Complete system compromise | Easy (automated exploit available) | **7 days** |
| **High** | Sensitive data exposure | Medium (manual exploit, requires skill) | **30 days** |
| **Medium** | Limited data exposure | Hard (requires specific conditions) | **90 days** |
| **Low** | Informational | Very hard (theoretical risk) | **180 days or backlog** |

### Escalation Path

**Critical findings:**
1. Vendor notifies security team **immediately**
2. Security team notifies CTO within **1 hour**
3. Emergency fix deployed within **24 hours**
4. Retesting within **7 days**

**High findings:**
1. Vendor reports in final report
2. Security team creates Plane issues
3. Development team fixes within **30 days**
4. Retesting in next quarterly test

---

## Findings Tracking in Plane

### Plane Integration

**Workflow:**
```
Pentest Report (PDF)
    ↓
Security team reviews
    ↓
Create Plane issues for each finding
    ↓
Assign to appropriate team
    ↓
Track remediation progress
    ↓
Request retesting
    ↓
Close issue after verification
```

### Plane Issue Template

```markdown
**Pentest Finding: [Vulnerability Name]**

**Severity**: [Critical / High / Medium / Low]
**CVSS Score**: [9.8 / 10.0]
**OWASP Category**: [A05: Injection]

**Description**:
[Vendor's description of the vulnerability]

**Location**:
- **Endpoint**: `/api/users/:id`
- **Parameter**: `id`
- **Method**: GET

**Proof of Concept**:
```bash
curl -X GET 'https://app.example.com/api/users/1%20OR%201=1'
```

**Impact**:
Attacker can retrieve all user data from database, including passwords and PII.

**Remediation**:
Use parameterized queries instead of string concatenation:
```typescript
// Before (vulnerable)
const query = `SELECT * FROM users WHERE id = ${userId}`

// After (fixed)
const query = 'SELECT * FROM users WHERE id = ?'
db.query(query, [userId])
```

**SLA**: Fix by [2026-02-13] (7 days)
**Retest Required**: Yes

**Labels**: `security`, `pentest-q1-2026`, `critical`, `a05-injection`
```

### Plane Labels

| Label | Purpose |
|-------|---------|
| `pentest-q1-2026` | Findings from Q1 2026 pentest |
| `pentest-q2-2026` | Findings from Q2 2026 pentest |
| `pentest-remediated` | Fixed and verified |
| `pentest-retest-needed` | Awaiting vendor verification |
| `pentest-false-positive` | Vendor finding, but not exploitable |

---

## Retesting Process

### When to Retest

- **Critical/High findings**: Within 7-30 days after fix
- **Medium findings**: During next quarterly test
- **Low findings**: Optional (may defer)

### Retesting Options

**Option 1: Dedicated Retest** (for critical findings)
- Schedule with vendor (usually 1-2 days)
- Focused on specific findings only
- Cost: ~20% of full test cost

**Option 2: Include in Next Test** (for medium/low findings)
- Add to scope of next quarterly test
- No additional cost
- Delay: Up to 3 months

### Verification Checklist

- [ ] Finding reproduced using original PoC
- [ ] Fix confirmed effective
- [ ] No regressions introduced
- [ ] Documentation updated
- [ ] Plane issue closed with verification comment

---

## Reporting & Documentation

### Expected Deliverables

**From Vendor:**
1. **Executive Summary** (5-10 pages)
   - High-level findings
   - Risk ratings
   - Strategic recommendations

2. **Technical Report** (50-100 pages)
   - Detailed findings
   - Proof-of-concepts
   - Remediation guidance
   - CVSS scoring

3. **Retest Report** (if applicable)
   - Verification of fixes
   - Remaining issues
   - New findings (if any)

**From Security Team:**
1. **Remediation Plan** (Plane issues)
   - Assigned owners
   - Due dates (SLAs)
   - Progress tracking

2. **Metrics Dashboard**
   - Findings trend (Q-over-Q)
   - Remediation velocity
   - Coverage by OWASP category

3. **Executive Briefing** (for leadership)
   - Key takeaways
   - Business impact
   - Investment needs (if any)

---

## Metrics & KPIs

### Security Posture Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Critical findings | 0 | Per quarterly test |
| High findings | <3 | Per quarterly test |
| Remediation within SLA | >95% | Fixes completed on time |
| Retest pass rate | >90% | Fixed findings verified |

### Program Health Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Tests per year | 4 | Quarterly cadence |
| Test coverage | >90% | Assets tested vs total assets |
| Vendor consistency | Same vendor 2+ quarters | Vendor relationship stability |
| Cost per test | <$15k | Budget efficiency |

### Trend Analysis

**Quarter-over-Quarter:**
- Are findings decreasing?
- Are remediation times improving?
- Are we catching issues earlier (shift-left)?

**Example Chart:**
```
Critical Findings (Q1 2025 → Q4 2025)
Q1: ████████ 8
Q2: ████     4
Q3: ██       2
Q4:          0  ← Target achieved!
```

---

## Best Practices

### DO

- ✅ **Test staging environments** (production replicas)
- ✅ **Provide vendor context** (API specs, architecture diagrams)
- ✅ **Fix findings promptly** (respect SLAs)
- ✅ **Retest critical issues** (verify fixes work)
- ✅ **Track trends** (are we improving?)
- ✅ **Share learnings** (security champions, postmortems)

### DON'T

- ❌ **Test production without approval** (risk of downtime)
- ❌ **Ignore "low" findings** (may become high later)
- ❌ **Skip retesting** (verify fixes actually work)
- ❌ **Work with uninsured vendors** (liability risk)
- ❌ **Delay critical fixes** (exploit window)
- ❌ **Keep findings secret** (transparency with team)

---

## Budget Planning

### Cost Breakdown (Example)

| Item | Frequency | Cost |
|------|-----------|------|
| **Web app pentest** | Quarterly (4x/year) | $10k × 4 = $40k |
| **Infrastructure test** | Bi-annually (2x/year) | $15k × 2 = $30k |
| **Retesting** | As needed (~4x/year) | $2k × 4 = $8k |
| **Annual subscription** (if platform-based) | Yearly | $20k |
| **Total** | Annual | **~$98k** |

### Budget Justification

**ROI Calculation:**
- Average data breach cost: **$4.45M** (IBM 2023)
- Average pentest cost: **$98k/year**
- Risk reduction: **~60%** (via early detection)
- **Expected value**: $4.45M × 60% = $2.67M avoided loss
- **ROI**: $2.67M / $98k = **27x** return

---

## Emergency Response

### If Vendor Finds Critical Vulnerability

**Hour 0:**
- Vendor notifies security team (Slack + phone call)
- Security team notifies CTO

**Hour 1:**
- Incident response team assembled
- Impact assessment (is it already exploited?)

**Hour 2-4:**
- Emergency fix deployed to staging
- Testing and verification

**Hour 4-8:**
- Fix deployed to production
- Monitoring for exploitation attempts

**Day 1-7:**
- Vendor retests fix
- Plane issue updated and closed

---

## Related Documentation

- **OWASP Testing Guide**: https://owasp.org/www-project-web-security-testing-guide/
- **PTES (Penetration Testing Execution Standard)**: http://www.pentest-standard.org/
- **CVSS Calculator**: https://www.first.org/cvss/calculator/3.1
- **Security Incident Response**: `docs/SECURITY.md` (Reporting Security Issues)
- **Roosevelt OPS Security Framework**: ROOSE-52

---

**Version:** 1.0.0 (ROOSE-98)
**Last Updated:** 2026-02-06
**Owner:** Security Team
