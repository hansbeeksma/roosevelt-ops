# Security Guidelines

> **Part of:** ROOSE-52 (OWASP 2025 Security Gates)
> **Implemented:** ROOSE-91 (Pre-commit), ROOSE-92 (SAST), ROOSE-93 (SCA), ROOSE-94 (DAST), ROOSE-95 (Misconfig), ROOSE-96 (Error Handling), ROOSE-97 (Security Champions)
> **Version:** 1.6.0

## Pre-Commit Secret Scanning

All commits are automatically scanned for secrets (API keys, tokens, passwords) using [Gitleaks](https://github.com/gitleaks/gitleaks).

### What is Scanned

- Stripe keys (live, test, restricted, webhook secrets)
- Supabase Service Role keys
- SendGrid API keys
- Printify API tokens
- Shopify access tokens
- AWS credentials
- Generic secrets (private keys, passwords, etc.)

### Installation

Gitleaks is required for commits:

```bash
# macOS
brew install gitleaks

# Or download binary
# https://github.com/gitleaks/gitleaks/releases
```

### Normal Workflow

```bash
# Gitleaks runs automatically on commit
git add .
git commit -m "feat: implement feature"
# → Gitleaks scans staged files
# → If secrets found: commit BLOCKED
# → If no secrets: commit proceeds
```

### If Secrets Detected

**Option 1: Remove the Secret (RECOMMENDED)**

```bash
# Remove the secret from your code
# Use environment variables instead

# Example - BEFORE:
const apiKey = "sk_live_abc123xyz..."

# Example - AFTER:
const apiKey = process.env.STRIPE_SECRET_KEY
```

**Option 2: Add to Allowlist (False Positives)**

If Gitleaks incorrectly flags something (e.g., test data, documentation):

```toml
# Edit .gitleaks.toml
[allowlist]
paths = [
  '''path/to/file\.ext''',  # Specific file
]

# Or add rule-specific allowlist
[[rules]]
id = "your-rule-id"
[rules.allowlist]
paths = [
  '''__tests__/''',  # Test files
]
```

**Option 3: Emergency Bypass (⚠️ NOT RECOMMENDED)**

Only use in genuine emergencies (production down, time-critical fix):

```bash
# Bypass Gitleaks (will be logged!)
SKIP_GITLEAKS=1 git commit -m "hotfix: critical production issue"
```

**⚠️ Warning:** Emergency bypasses are:
- Logged to `.git/security.log`
- Flagged in security reviews
- Require post-commit remediation

### Emergency Bypass Log

All bypasses are logged:

```bash
# View bypass log
cat .git/security.log

# Example entry:
[2026-02-06T12:34:56Z] SECURITY BYPASS: Gitleaks check skipped
User: developer@example.com
Commit: hotfix: critical production issue
Branch: main
Files staged: 3
```

**Post-Bypass Actions:**
1. Create follow-up issue to remove the secret
2. Rotate the secret immediately
3. Document the incident in security review

### Configuration

Gitleaks config: `.gitleaks.toml` (copied from `~/Development/shared/.gitleaks.toml`)

**Environment Variables:**
- `SKIP_GITLEAKS=1` - Emergency bypass
- `GITLEAKS_CONFIG=path/to/config.toml` - Custom config
- `GITLEAKS_LOG_FILE=path/to/log` - Custom log location

### CI/CD Integration

Gitleaks also runs in CI:

```yaml
# .github/workflows/security.yml
- name: Run Gitleaks
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

CI failures **block** the PR merge.

### False Positive Examples

Common false positives already allowlisted:

- `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` (dependency hashes)
- Test files (`*.test.ts`, `*.spec.ts`, `__tests__/`)
- Documentation examples (if clearly marked)
- CI workflow files (`.github/workflows/`)

### Best Practices

**DO:**
- ✅ Use environment variables for secrets
- ✅ Add false positives to allowlist
- ✅ Rotate secrets immediately if committed
- ✅ Review security log regularly

**DON'T:**
- ❌ Commit secrets "temporarily" (they stay in git history!)
- ❌ Use bypass for convenience
- ❌ Ignore Gitleaks warnings
- ❌ Store secrets in code comments

### Getting Help

**Gitleaks detected a secret:**
1. Review the detection output (shows file + line number)
2. Decide: remove secret OR add to allowlist
3. If unsure: ask in #security channel

**Need to bypass:**
1. Confirm it's a genuine emergency
2. Use `SKIP_GITLEAKS=1` with clear commit message
3. Create follow-up issue immediately
4. Document in post-commit review

### Related

- OWASP 2025 Top 10: A04 - Cryptographic Failures
- Shift-Left Security: Catch secrets before they reach remote
- Gitleaks Documentation: https://github.com/gitleaks/gitleaks
- Roosevelt OPS Security Framework: ROOSE-52

## CI/CD Security - SAST (Semgrep)

All pull requests and commits are automatically scanned for security vulnerabilities using [Semgrep](https://semgrep.dev).

### What is Scanned

**OWASP Top 10:2025 Coverage:**
- A01: Broken Access Control (missing auth middleware)
- A02: Cryptographic Failures (weak hashing algorithms)
- A03: Injection (SQL injection, command injection)
- A04: Insecure Design (hardcoded secrets)
- A05: Security Misconfiguration (CORS, weak session config)
- A06: Vulnerable Components (eval usage, unsafe functions)
- A07: Authentication Failures (weak session cookies)
- A08: Data Integrity Failures (unsafe deserialization)
- A09: Security Logging Failures (missing error logging)
- A10: SSRF (unvalidated external requests)

**Project-Specific Patterns:**
- Missing rate limiting middleware
- Missing input validation middleware
- Debug statements (`console.log`) in production code

### Normal Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ... code ...

# Commit (triggers pre-commit hooks)
git commit -m "feat: implement feature"

# Push (triggers CI)
git push origin feature/my-feature

# Create PR
# → Semgrep scans code automatically
# → Findings appear in GitHub Security tab
# → PR blocked if CRITICAL/HIGH findings detected
```

### When Findings are Detected

Semgrep findings are shown in:
1. **GitHub Security tab** (SARIF format)
2. **PR comments** (if Semgrep App connected)
3. **CI logs** (detailed output)

**Severity Levels:**
- **ERROR** (blocks PR): Fix required before merge
- **WARNING** (blocks PR): Fix or justify before merge
- **INFO** (informational): Consider fixing, doesn't block

### Fixing Common Issues

**1. SQL Injection Risk**

```javascript
// ❌ WRONG: String concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`
db.query(query)

// ✅ CORRECT: Parameterized query
db.query('SELECT * FROM users WHERE id = ?', [userId])
```

**2. Missing Auth Middleware**

```javascript
// ❌ WRONG: Unprotected endpoint
app.get('/api/admin/users', async (req, res) => {
  // ...
})

// ✅ CORRECT: Auth middleware
app.get('/api/admin/users', requireAuth, async (req, res) => {
  // ...
})
```

**3. Hardcoded Secrets**

```javascript
// ❌ WRONG: Hardcoded API key
const STRIPE_KEY = "sk_live_1234567890abcdef"

// ✅ CORRECT: Environment variable
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
```

**4. Weak Crypto**

```javascript
// ❌ WRONG: MD5 hash
const hash = crypto.createHash('md5').update(password).digest('hex')

// ✅ CORRECT: bcrypt with strong rounds
const hash = await bcrypt.hash(password, 12)
```

### Suppressing False Positives

For legitimate code that Semgrep incorrectly flags:

```javascript
// nosemgrep: sql-injection-risk
const staticQuery = `SELECT * FROM users WHERE role = 'admin'`
```

**Warning:** Only use suppressions for genuine false positives!

### Running Locally

Install Semgrep:

```bash
# macOS
brew install semgrep

# Or via pip
pip install semgrep
```

Scan your code:

```bash
# Full scan with custom rules
semgrep --config .semgrep/rules.yml .

# Scan with OWASP rulesets
semgrep --config "p/owasp-top-ten" --config .semgrep/rules.yml .

# Only show errors
semgrep --config .semgrep/rules.yml --severity ERROR .
```

### Configuration

Semgrep config: `.semgrep/rules.yml`
- Custom security rules for Roosevelt OPS
- Project-specific patterns
- OWASP Top 10:2025 coverage

Semgrep ignore: `.semgrep/.semgrepignore`
- Test files excluded by default
- Node modules excluded
- Documentation excluded

### CI Schedule

Semgrep runs:
- ✅ Every push to `main`
- ✅ Every pull request
- ✅ Daily at 2:00 AM UTC (full scan)

### Security Dashboard

View findings:
1. **GitHub Security tab** → Code scanning alerts
2. **Semgrep App** (if connected) → Trends and analytics
3. **Pull Request checks** → Inline comments

### Best Practices

**DO:**
- ✅ Fix ERROR severity findings immediately
- ✅ Review WARNING severity findings before merge
- ✅ Run Semgrep locally before pushing
- ✅ Suppress only genuine false positives with comments

**DON'T:**
- ❌ Ignore security findings
- ❌ Suppress findings without justification
- ❌ Bypass PR checks without security team approval
- ❌ Use `--disable` flags in CI

### Getting Help

**Semgrep finding unclear:**
1. Check `.semgrep/README.md` for rule documentation
2. Ask in #security channel
3. Tag @security-team in PR for review

**Need to suppress a finding:**
1. Add inline comment with rule ID: `// nosemgrep: rule-id`
2. Explain why in PR description
3. Get security team approval

**Custom rule needed:**
1. Add rule to `.semgrep/rules.yml`
2. Test locally: `semgrep --validate .semgrep/rules.yml`
3. Create PR with rule justification

### Related

- OWASP 2025 Top 10: https://owasp.org/Top10/2025/
- Semgrep Documentation: https://semgrep.dev/docs/
- Custom Rules Guide: `.semgrep/README.md`
- Roosevelt OPS Security Framework: ROOSE-52

## Software Composition Analysis (SCA)

All dependencies are scanned for vulnerabilities using **multi-layered SCA**:

### Automated Scanning

**Layer 1: Dependabot** (daily at 3 AM)
- Automatic PR creation for security updates
- Grouped updates (security patches, production deps, dev deps)
- Auto-merge eligible patches (with approval)

**Layer 2: npm audit** (every push/PR)
- Built-in NPM vulnerability scanner
- Fast baseline security check

**Layer 3: Snyk** (every push/PR)
- Deep vulnerability analysis
- Reachability detection
- Automatic fix suggestions

### SBOM (Software Bill of Materials)

Every push to `main` generates:
- **CycloneDX** format (security-focused)
- **SPDX** format (compliance-focused)
- 📦 Available in GitHub Artifacts (90-day retention)

**Use cases**:
- Supply chain transparency
- Vulnerability tracking
- Compliance requirements (NTIA)
- Incident response

### License Compliance

All dependencies checked for license compatibility:
- ✅ **Allowed**: MIT, Apache-2.0, BSD, ISC
- ⚠️ **Review required**: GPL, AGPL, LGPL, MPL
- ❌ **Blocked**: Proprietary, Unknown

Copyleft licenses trigger warnings in CI.

### Vulnerability Response

| Severity | Response Time | Action |
|----------|---------------|--------|
| 🚨 **Critical** | Immediate | PR blocked, fix required |
| ⚠️ **High** | 7 days | Fix or document exception |
| 🟡 **Medium** | 30 days | Fix in next sprint |
| 🔵 **Low** | Next quarter | Backlog item |

### Best Practices

**DO:**
- ✅ Review Dependabot PRs daily
- ✅ Auto-merge security patches (after CI passes)
- ✅ Keep dependencies up-to-date
- ✅ Check SBOM before releases

**DON'T:**
- ❌ Ignore dependency PRs
- ❌ Auto-merge major version updates
- ❌ Add dependencies without license review
- ❌ Skip CI checks for "small" updates

### Full Documentation

Complete SCA setup guide: `docs/SCA-SETUP.md`
- Dependabot configuration
- Snyk integration
- SBOM generation
- License compliance
- Vulnerability response workflow

### Related

- OWASP 2025: A03 - Software Supply Chain Failures
- Dependabot: https://docs.github.com/en/code-security/dependabot
- Snyk: https://snyk.io
- SBOM Guide: https://www.cisa.gov/sbom
- Roosevelt OPS Security Framework: ROOSE-52

## Security Misconfiguration Prevention

**CRITICAL**: Security Misconfiguration surged to **#2** in OWASP Top 10:2025 (was #5 in 2021).

### Automated Checks

**Local checker** (before commit):
```bash
./scripts/security-check.sh
```

**CI checks** (every push/PR):
- ✅ Environment variable validation (.env files not in git)
- ✅ Security headers configuration
- ✅ CORS misconfiguration detection
- ✅ Hardcoded secrets patterns
- ✅ Next.js security settings

### Security Headers

All routes automatically serve security headers:

| Header | Protection |
|--------|------------|
| `Strict-Transport-Security` | Force HTTPS (2 years) |
| `X-Frame-Options` | Prevent clickjacking |
| `X-Content-Type-Options` | Prevent MIME sniffing |
| `Content-Security-Policy` | XSS protection |
| `Referrer-Policy` | Limit referrer leakage |
| `Permissions-Policy` | Block camera/mic/geolocation |

**Test headers**:
```bash
curl -I https://your-domain.com | grep -i security
```

Or use: https://securityheaders.com/

### Environment Variables

**Rules**:
1. NEVER commit `.env.local` or `.env.production` to git
2. Use `.env.example` as template for developers
3. Use `NEXT_PUBLIC_` prefix ONLY for client-safe vars
4. Keep server secrets without `NEXT_PUBLIC_` prefix
5. Rotate immediately if secrets leaked

**Validation**:
```bash
# Check for .env files in git
git ls-files | grep "^\.env\." | grep -v "\.example$"
# Should return nothing
```

### CORS Configuration

**Bad** (wildcard - allows all):
```typescript
'Access-Control-Allow-Origin': '*'  // ❌ INSECURE
```

**Good** (restricted):
```typescript
const allowedOrigins = ['https://your-domain.com']
if (allowedOrigins.includes(origin)) {
  headers['Access-Control-Allow-Origin'] = origin  // ✅ SECURE
}
```

### Best Practices

**DO:**
- ✅ Run `./scripts/security-check.sh` before commits
- ✅ Test security headers after deployment
- ✅ Use environment variables for all secrets
- ✅ Restrict CORS to specific origins
- ✅ Validate authentication on all API routes

**DON'T:**
- ❌ Commit .env files with secrets
- ❌ Use wildcard CORS in production
- ❌ Expose server secrets to client
- ❌ Skip security checks for "small" changes

### Full Documentation

Complete misconfiguration guide: `docs/SECURITY-CONFIG.md`
- Security headers configuration
- Environment variable security
- CORS best practices
- Next.js security patterns
- Docker security (if applicable)
- CI/CD security checks

### Related

- OWASP 2025: A02 - Security Misconfiguration
- Next.js Security: https://nextjs.org/docs/advanced-features/security-headers
- CSP Guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- Security Headers: https://securityheaders.com/
- Roosevelt OPS Security Framework: ROOSE-52

## Dynamic Application Security Testing (DAST)

**Runtime security testing** of deployed applications using OWASP ZAP.

### What is DAST

DAST tests **running applications** by:
- Sending HTTP requests to deployed app
- Analyzing responses for vulnerabilities
- Testing authentication flows
- Scanning API endpoints

**Difference from SAST**:
- SAST: Analyzes source code (white-box)
- DAST: Tests running app (black-box)

**OWASP 2025 Coverage**:
- A01: Broken Access Control
- A02: Security Misconfiguration
- A05: Injection (SQL, XSS, etc.)

### Quick Start

**GitHub Actions (Recommended)**:
```bash
# 1. Deploy to Vercel preview
git push origin feature/my-branch

# 2. Trigger DAST scan
gh workflow run dast-scan.yml \
  -f target_url=https://roosevelt-ops-abc123.vercel.app \
  -f scan_type=baseline

# 3. Check results
gh run list --workflow=dast-scan.yml
```

**Local ZAP Desktop**:
```bash
brew install --cask owasp-zap
npm run dev
# Open ZAP Desktop → Manual Explore: http://localhost:3000
```

### Scan Types

| Type | Duration | Use Case |
|------|----------|----------|
| **Baseline** | 2-5 min | PR validation, quick checks |
| **Full** | 30-60 min | Pre-production, thorough analysis |

### When to Run

- ✅ After Vercel preview deployment (before merge)
- ✅ Weekly on production (Sunday 2 AM)
- ✅ Before major releases
- ✅ After security-sensitive changes

### Results

Findings appear in:
1. **GitHub Issues** (auto-created)
2. **GitHub Security tab** (SARIF format)
3. **Workflow Artifacts** (HTML/JSON/Markdown reports)

**Severity Response**:
| Level | Action |
|-------|--------|
| **High** | Fix immediately, blocks PR |
| **Medium** | Fix before merge |
| **Low** | Fix when possible |
| **Informational** | Review, may ignore |

### Common Findings

**Missing Security Headers**:
- Already implemented in `next.config.js` (ROOSE-95)
- Verify in deployed app via `curl -I`

**Cookie Security**:
- Ensure production uses HTTPS (Vercel default)

**XSS Vulnerabilities**:
- Sanitize user input
- Use CSP headers (configured)

### Best Practices

**DO**:
- ✅ Scan preview deployments before merge
- ✅ Run full scans weekly on production
- ✅ Review all High/Medium findings
- ✅ Update `.zap/rules.tsv` based on findings

**DON'T**:
- ❌ Scan production during business hours
- ❌ Ignore Medium severity findings
- ❌ Run full scans on every commit (too slow)

### Full Documentation

Complete DAST guide: `docs/DAST-GUIDE.md`
- GitHub Actions workflow details
- Local ZAP usage
- Authenticated scanning
- Result interpretation
- Integration with Vercel

### Related

- OWASP ZAP: https://www.zaproxy.org/
- ZAP GitHub Actions: https://github.com/zaproxy/action-baseline
- DAST Guide: `docs/DAST-GUIDE.md`
- Roosevelt OPS Security Framework: ROOSE-52

## Error Handling Security Framework

**Secure error handling** voor OWASP A10:2025 (NEW: Mishandling of Exceptional Conditions).

### Core Principles

**Fail-secure defaults**:
- Unknown errors → deny access
- Missing permissions → 403 Forbidden
- Unexpected behavior → fail closed

**No information disclosure**:
- ❌ Stack traces in production
- ❌ File paths in error messages
- ❌ Database structure revealed
- ❌ Dependency versions exposed

**Structured logging**:
- JSON format for log aggregation
- Request IDs for tracing
- Severity levels for alerting
- No sensitive data logged

### Quick Usage

**API routes**:
```typescript
import { handleApiError, createValidationError } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.email) {
      throw createValidationError('Email is required')
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, request)  // ← Centralized handling
  }
}
```

**Error factories**:
```typescript
import {
  createAuthError,      // 401 Unauthorized
  createForbiddenError, // 403 Forbidden (fail-secure)
  createNotFoundError,  // 404 Not Found
  createRateLimitError, // 429 Too Many Requests
  createDatabaseError,  // 500 Internal Error (critical)
} from '@/lib/error-handler'
```

### Error Response Format

**Production** (sanitized):
```json
{
  "error": {
    "message": "Invalid email format",
    "code": "VALIDATION_ERROR",
    "requestId": "1738834123456-xyz789",
    "timestamp": "2026-02-06T09:00:00.000Z"
  }
}
```

**Development** (with stack trace):
```json
{
  "error": { ... },
  "stack": "Error: Invalid email format\n    at..."
}
```

### Components

| Component | Purpose |
|-----------|---------|
| `lib/error-handler.ts` | Core error handling logic |
| `app/global-error.tsx` | Global React error boundary |
| `app/error.tsx` | Page-level error boundary |
| `app/not-found.tsx` | 404 handler |
| `app/api/example/route.ts` | API error handling example |

### Security Features

**Message sanitization**:
| Original | Sanitized |
|----------|-----------|
| `Failed to read /etc/secrets/api-key` | `Failed to read [PATH]` |
| `Invalid email: user@example.com` | `Invalid email: [EMAIL]` |
| `Token ABC123XYZ... invalid` | `Token [REDACTED] invalid` |

**Severity-based alerting**:
- LOW → Slack (daily review)
- MEDIUM → Slack + Email (hourly review)
- HIGH → Email + Slack ping (< 15 min)
- CRITICAL → PagerDuty + Phone (< 5 min)

### Best Practices

**DO**:
- ✅ Use error factories for consistent handling
- ✅ Sanitize all error messages
- ✅ Include request IDs for tracing
- ✅ Fail secure (deny by default)
- ✅ Log structured errors (JSON)
- ✅ Use Sentry for error tracking

**DON'T**:
- ❌ Expose stack traces in production
- ❌ Return sensitive data in errors
- ❌ Fail open (allow by default)
- ❌ Ignore errors silently
- ❌ Log passwords/tokens

### Full Documentation

Complete error handling guide: `docs/ERROR-HANDLING.md`
- Error flow architecture
- Error factories reference
- Integration with Sentry
- Testing error handling
- Monitoring & alerting setup

### Related

- OWASP A10:2025: Mishandling of Exceptional Conditions
- Next.js Error Handling: https://nextjs.org/docs/app/building-your-application/routing/error-handling
- Sentry Documentation: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- RFC 7807 Problem Details: https://www.rfc-editor.org/rfc/rfc7807
- Roosevelt OPS Security Framework: ROOSE-52

## Security Champions Program

**Embed security expertise** in development teams through peer-led education and collaborative security reviews.

### Overview

**Security Champions** zijn developers die security ownership nemen binnen hun teams en fungeren als brug tussen security team en development.

**Benefits**:
- Shift-left security (catch issues earlier)
- Knowledge sharing (security expertise spreads)
- Faster security reviews (embedded expertise)
- Better security culture (ownership mindset)

### Responsibilities

**Security Champions:**
- ✅ Monthly security training attendance
- ✅ Peer security reviews for PRs
- ✅ Advocate for security best practices
- ✅ Escalate security concerns
- ✅ Contribute to security knowledge base

**Time Commitment**: ~4-6 hours/month

### Selection Criteria

**Prerequisites:**
- 2+ years development experience
- Strong code review skills
- Interest in security
- Good communication skills
- Team peer nomination

**Ratio**: 1 Security Champion per 5-10 developers

### Training Curriculum

**Month 1-3**: OWASP Top 10, secure coding, threat modeling
**Month 4-6**: Auth/crypto, API security, injection prevention
**Month 7-9**: Container security, secrets management, CI/CD security
**Month 10-12**: Incident response, compliance, pentesting basics

### Security Review Checklist

Key areas to check in PRs:
- [ ] Authentication & authorization on new endpoints
- [ ] Input validation (server-side)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output escaping)
- [ ] Cryptography (strong algorithms, secure RNG)
- [ ] Error handling (no stack traces, fail-secure)
- [ ] Dependencies scanned for vulnerabilities
- [ ] Security headers configured

**Result**:
- ✅ All passed → Approve PR
- ⚠️ Minor issues → Approve with comments
- ❌ Critical issues → Request changes, escalate to security team

### Metrics Dashboard

**Security Posture**:
| Metric | Target |
|--------|--------|
| High severity findings | <5 |
| Secrets in git | 0 |
| PR security review coverage | >80% |
| Time to remediate critical | <24 hours |

**Program Health**:
| Metric | Target |
|--------|--------|
| Champion retention | >90% |
| Training attendance | >85% |
| Knowledge base contributions | 10+/month |
| Security incidents | <2/quarter |

### Escalation Process

**When to escalate to security team**:
1. Critical vulnerability (SQL injection, hardcoded secret)
2. Architectural security concern (broken auth design)
3. Compliance issue (GDPR violation)
4. Security incident (suspected breach)
5. Unclear security decision (cryptography choice)

**Channels**:
| Severity | Channel | Response Time |
|----------|---------|---------------|
| Critical | Slack #security-incidents + PagerDuty | < 15 min |
| High | Slack #security-team | < 2 hours |
| Medium | GitHub issue + Slack | < 1 day |
| Low | GitHub issue | < 1 week |

### Full Documentation

Complete Security Champions program guide: `docs/SECURITY-CHAMPIONS.md`
- Security Champions Charter
- Complete training curriculum (12 months)
- Detailed security review checklist
- Metrics dashboard templates
- Recognition & rewards program
- Knowledge base structure
- Quarterly sync meeting templates

### Related

- OWASP Security Champions Guide: https://owasp.org/www-project-security-champions-guidebook/
- Security Training Resources: `docs/SECURITY.md`
- Roosevelt OPS Security Framework: ROOSE-52

## Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead:
- Email: security@roosevelt.digital
- Slack: #security-incidents (private channel)
- On-call: [PagerDuty security escalation]

---

**Version:** 1.6.0 (ROOSE-91, ROOSE-92, ROOSE-93, ROOSE-94, ROOSE-95, ROOSE-96, ROOSE-97)
**Last Updated:** 2026-02-06
**Owner:** Security Team
