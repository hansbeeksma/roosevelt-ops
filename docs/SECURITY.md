# Security Guidelines

> **Part of:** ROOSE-52 (OWASP 2025 Security Gates)
> **Implemented:** ROOSE-91 (Pre-commit Security Hooks)
> **Version:** 1.0.0

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

## Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead:
- Email: security@roosevelt.digital
- Slack: #security-incidents (private channel)
- On-call: [PagerDuty security escalation]

---

**Version:** 1.0.0 (ROOSE-91)
**Last Updated:** 2026-02-06
**Owner:** Security Team
