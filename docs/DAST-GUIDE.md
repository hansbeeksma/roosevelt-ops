# Dynamic Application Security Testing (DAST) Guide

> **Part of:** ROOSE-52 (OWASP 2025 Security Gates)
> **Implemented:** ROOSE-94 (DAST with OWASP ZAP)
> **Version:** 1.0.0

Complete guide voor dynamic security testing met OWASP ZAP.

---

## Overview

**DAST (Dynamic Application Security Testing)** scant **running applications** voor security vulnerabilities door:
- HTTP requests te versturen naar de applicatie
- Responses te analyseren op security issues
- Authentication flows te testen
- API endpoints te scannen

**Difference from SAST**:
- SAST: Analyseert source code (white-box)
- DAST: Test running application (black-box)

**OWASP 2025 Coverage**:
- A01: Broken Access Control
- A02: Security Misconfiguration
- A05: Injection (SQL, XSS, etc.)

---

## Quick Start

### Option 1: GitHub Actions (Recommended for CI)

```bash
# 1. Deploy to Vercel preview
git push origin feature/my-branch

# 2. Get preview URL from Vercel
# Example: https://roosevelt-ops-abc123.vercel.app

# 3. Trigger DAST scan
gh workflow run dast-scan.yml \
  -f target_url=https://roosevelt-ops-abc123.vercel.app \
  -f scan_type=baseline

# 4. Check results
gh run list --workflow=dast-scan.yml
gh run view <run-id>
```

### Option 2: Local ZAP Desktop

```bash
# 1. Install OWASP ZAP
brew install --cask owasp-zap

# 2. Run application locally
npm run dev

# 3. Open ZAP Desktop
# - Manual Explore: http://localhost:3000
# - Automated Scan: Quick Start → Automated Scan
# - API Scan: Import → OpenAPI spec
```

### Option 3: ZAP Docker

```bash
# Baseline scan
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t http://localhost:3000 \
  -r zap-report.html

# Full scan
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py \
  -t http://localhost:3000 \
  -r zap-report.html
```

---

## GitHub Actions Workflow

### Manual Trigger

File: `.github/workflows/dast-scan.yml`

**When to use**:
- After Vercel preview deployment
- Before production deployment
- Weekly security scans
- After major feature changes

**Inputs**:
- `target_url`: Deployed application URL (required)
- `scan_type`: `baseline` or `full` (default: baseline)

**Scan Types**:

| Type | Duration | Use Case |
|------|----------|----------|
| **Baseline** | 2-5 min | PR validation, quick checks |
| **Full** | 30-60 min | Pre-production, thorough analysis |

**Results**:
- GitHub Issues created for findings
- HTML/JSON/Markdown reports in artifacts
- SARIF upload to Security tab

### Workflow Example

```yaml
# .github/workflows/deploy-and-scan.yml
on:
  pull_request:
    branches: [main]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    outputs:
      preview_url: ${{ steps.vercel.outputs.preview_url }}
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        id: vercel
        # ... Vercel deployment
      - name: Wait for deployment
        run: sleep 30  # Allow Vercel to fully deploy

  dast-scan:
    needs: deploy-preview
    uses: ./.github/workflows/dast-scan.yml
    with:
      target_url: ${{ needs.deploy-preview.outputs.preview_url }}
      scan_type: 'baseline'
```

---

## ZAP Configuration

### Rules File

File: `.zap/rules.tsv`

**Rule Actions**:
- `FAIL`: Block PR merge
- `WARN`: Report but allow merge
- `IGNORE`: Skip rule

**Customization**:

```tsv
# Format: RULE_ID	THRESHOLD	ACTION
10021	MEDIUM	FAIL	# X-Content-Type-Options missing
10020	MEDIUM	FAIL	# X-Frame-Options missing
10027	LOW	WARN	# Suspicious Comments
```

**Finding rule IDs**:
1. Run ZAP scan
2. Review findings
3. Note rule ID (e.g., `10021`)
4. Add to `.zap/rules.tsv`

### Common Rules

| Rule ID | Vulnerability | Severity | Action |
|---------|---------------|----------|--------|
| `10021` | X-Content-Type-Options missing | Medium | FAIL |
| `10020` | X-Frame-Options missing | Medium | FAIL |
| `10011` | Cookie without Secure flag | Medium | FAIL |
| `40012` | XSS (Reflected) | High | FAIL |
| `40018` | SQL Injection | Critical | FAIL |
| `10027` | Information Disclosure | Low | WARN |

---

## Scan Types

### 1. Baseline Scan (Quick)

**Duration**: 2-5 minutes
**Coverage**: Passive + basic active checks

**Use cases**:
- PR validation
- Quick security checks
- Development iterations

**Limitations**:
- No authenticated scanning
- Limited crawling
- No brute force attacks

**Command**:
```bash
gh workflow run dast-scan.yml \
  -f target_url=https://your-app.vercel.app \
  -f scan_type=baseline
```

### 2. Full Scan (Thorough)

**Duration**: 30-60 minutes
**Coverage**: Full spider + all active checks

**Use cases**:
- Pre-production validation
- Weekly security audits
- Major feature releases

**Includes**:
- Complete site crawling
- All vulnerability checks
- Brute force detection
- API security testing

**Command**:
```bash
gh workflow run dast-scan.yml \
  -f target_url=https://your-app.vercel.app \
  -f scan_type=full
```

### 3. API Scan (REST/GraphQL)

**Duration**: 5-15 minutes
**Coverage**: API endpoints only

**Requirements**:
- OpenAPI spec file (`public/api-spec.json`)
- Or manual endpoint configuration

**Use cases**:
- API-first applications
- Microservices testing
- Backend security validation

---

## Authenticated Scanning

### Setup

DAST works best with **authenticated** access to test protected routes.

**Option 1: Test User Credentials**

```yaml
# .github/workflows/dast-scan.yml (add env vars)
env:
  ZAP_AUTH_USER: ${{ secrets.ZAP_TEST_USER }}
  ZAP_AUTH_PASS: ${{ secrets.ZAP_TEST_PASS }}
```

**Option 2: Auth Script**

Create `.zap/auth-script.js`:

```javascript
// ZAP authentication script
function authenticate(helper, paramsValues, credentials) {
  var loginUrl = paramsValues.get("loginUrl")
  var postData = "email=" + credentials.getParam("username") +
                 "&password=" + credentials.getParam("password")

  var msg = helper.prepareMessage()
  msg.setRequestHeader("POST " + loginUrl + " HTTP/1.1")
  msg.setRequestBody(postData)
  helper.sendAndReceive(msg)

  return msg
}
```

**Option 3: Session Token**

For OAuth/JWT apps:

```bash
# Get auth token manually
TOKEN=$(curl -X POST https://your-app.vercel.app/api/auth \
  -d '{"email":"test@example.com","password":"test"}' | jq -r '.token')

# Pass to ZAP
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t https://your-app.vercel.app \
  -z "-config api.addrs.addr.name=Authorization -config api.addrs.addr.value='Bearer $TOKEN'"
```

---

## Interpreting Results

### Severity Levels

| Level | Priority | Action |
|-------|----------|--------|
| **High** | Urgent | Fix immediately, blocks PR |
| **Medium** | Important | Fix before merge |
| **Low** | Optional | Fix when possible |
| **Informational** | FYI | Review, may ignore |

### Common Findings

**1. Missing Security Headers**

**Finding**: X-Frame-Options header missing
**Fix**: Already implemented in `next.config.js` (ROOSE-95)
**Verify**: Check deployed app

**2. Cookie Security**

**Finding**: Cookie without Secure flag
**Fix**: Ensure production uses HTTPS (Vercel default)

**3. XSS Vulnerabilities**

**Finding**: Reflected XSS detected
**Fix**: Sanitize user input, use CSP

**4. Information Disclosure**

**Finding**: Stack trace visible
**Fix**: Disable debug mode in production

### False Positives

**Common false positives**:
- Next.js build artifacts in `/_next/`
- Vercel analytics scripts
- Public documentation paths

**Handling**:
1. Verify finding is false positive
2. Add to `.zap/rules.tsv` with `IGNORE` action
3. Document reason in comments

---

## Integration with Vercel

### Preview Deployments

**Workflow**:
1. Push branch → Vercel creates preview
2. Get preview URL from Vercel comment/API
3. Trigger DAST scan with preview URL
4. Review findings before merge

**Vercel API Integration**:

```bash
# Get latest preview URL
PREVIEW_URL=$(curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  https://api.vercel.com/v13/deployments | \
  jq -r '.deployments[0].url')

# Trigger scan
gh workflow run dast-scan.yml -f target_url=https://$PREVIEW_URL
```

### Production Scanning

**Schedule**: Weekly (Sunday 2 AM)

```yaml
# .github/workflows/dast-production.yml
on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly Sunday 2 AM

jobs:
  scan-production:
    uses: ./.github/workflows/dast-scan.yml
    with:
      target_url: 'https://your-production-domain.com'
      scan_type: 'full'
```

---

## Best Practices

### DO:
- ✅ Scan preview deployments before merge
- ✅ Run full scans weekly on production
- ✅ Use authenticated scanning for protected routes
- ✅ Review all High/Medium findings
- ✅ Update `.zap/rules.tsv` based on findings

### DON'T:
- ❌ Scan production during business hours
- ❌ Ignore Medium severity findings
- ❌ Skip authentication setup
- ❌ Over-suppress findings without investigation
- ❌ Run full scans on every commit (too slow)

---

## Troubleshooting

### "Target URL not accessible"

**Cause**: Deployment not ready or URL incorrect
**Fix**: Wait 30-60s after deployment, verify URL manually

### "Scan takes too long"

**Cause**: Full scan on large application
**Fix**: Use baseline scan for quick checks, full scan weekly only

### "Too many false positives"

**Cause**: ZAP default rules too strict
**Fix**: Tune `.zap/rules.tsv` with `WARN` or `IGNORE`

### "Authentication fails"

**Cause**: Auth script incorrect or credentials wrong
**Fix**: Test login manually, verify auth script

---

## Complementary Tools

DAST works best combined with other security layers:

| Tool | Type | Purpose |
|------|------|---------|
| **Gitleaks** | Secret Scanning | Pre-commit secrets |
| **Semgrep** | SAST | Static code analysis |
| **Snyk** | SCA | Dependency vulnerabilities |
| **ZAP** | DAST | Running app testing |
| **Security Headers** | Config | Header validation |

**Complete Security Stack**: All tools implemented (ROOSE-52).

---

## Related Documentation

- **SAST**: `.semgrep/README.md` (Semgrep)
- **SCA**: `docs/SCA-SETUP.md` (Snyk/Dependabot)
- **Security Config**: `docs/SECURITY-CONFIG.md` (Headers)
- **OWASP ZAP**: https://www.zaproxy.org/docs/
- **ZAP GitHub Actions**: https://github.com/zaproxy/action-baseline
- **OWASP 2025**: https://owasp.org/Top10/2025/

---

**Version:** 1.0.0 (ROOSE-94)
**Last Updated:** 2026-02-06
**Owner:** Security Team
