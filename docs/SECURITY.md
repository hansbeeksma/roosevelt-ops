# Security Guidelines

> **Part of:** ROOSE-52 (OWASP 2025 Security Gates)
> **Implemented:** ROOSE-91 (Pre-commit Security Hooks), ROOSE-92 (CI SAST with Semgrep)
> **Version:** 1.1.0

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

## Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead:
- Email: security@roosevelt.digital
- Slack: #security-incidents (private channel)
- On-call: [PagerDuty security escalation]

---

**Version:** 1.1.0 (ROOSE-91, ROOSE-92)
**Last Updated:** 2026-02-06
**Owner:** Security Team
