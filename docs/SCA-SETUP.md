# Software Composition Analysis (SCA) Setup

> **Part of:** ROOSE-52 (OWASP 2025 Security Gates)
> **Implemented:** ROOSE-93 (CI SCA with Snyk/Dependabot)
> **Version:** 1.0.0

Complete guide voor dependency scanning, SBOM generatie, en license compliance.

---

## Overview

Multi-layered SCA approach:

| Layer | Tool | Purpose | Coverage |
|-------|------|---------|----------|
| **Layer 1** | Dependabot | Automated PR creation | NPM + GitHub Actions |
| **Layer 2** | npm audit | Built-in vulnerability scanner | NPM registry CVE database |
| **Layer 3** | Snyk | Commercial-grade SCA | Multi-ecosystem + deep analysis |
| **SBOM** | Syft | Bill of Materials generation | CycloneDX + SPDX formats |
| **Compliance** | license-checker | License validation | Copyleft detection |

---

## Dependabot Configuration

### Automatic Updates

Dependabot runs **daily at 3 AM CET** and checks for:
- 🔴 **Security vulnerabilities** (all severities)
- 🟡 **Production dependencies** (patch + minor)
- 🔵 **Development dependencies** (patch + minor)
- ⚙️ **GitHub Actions** (weekly, Monday)

### PR Labels

| Label | Meaning |
|-------|---------|
| `dependencies` | All dependency updates |
| `security` | Security vulnerability fixes |
| `automerge` | Eligible for auto-merge (patch only) |
| `ci` | GitHub Actions updates |

### Update Groups

**Security Patches** (highest priority):
- All security updates grouped together
- Includes patch, minor, and major versions
- Auto-merge eligible (with approval)

**Production Dependencies**:
- Patch and minor updates only
- Major updates require manual review

**Development Dependencies**:
- Minor and patch updates
- Low risk, auto-merge eligible

### Configuration

File: `.github/dependabot.yml`

```yaml
# Enable security-only mode (optional)
security-updates-only: true

# Increase PR limit for high-velocity projects
open-pull-requests-limit: 20
```

### Best Practices

**DO:**
- ✅ Review Dependabot PRs daily
- ✅ Auto-merge patch security updates
- ✅ Test PRs before merging (CI required)
- ✅ Keep dependencies up-to-date weekly

**DON'T:**
- ❌ Ignore security PRs
- ❌ Auto-merge major versions
- ❌ Disable Dependabot without replacement
- ❌ Skip CI checks for "small" updates

---

## Snyk Integration

### Setup

1. **Create Snyk Account**:
   ```bash
   # Visit https://snyk.io
   # Sign up with GitHub account
   ```

2. **Get API Token**:
   ```bash
   # Settings → API Token → Generate
   ```

3. **Add to GitHub Secrets**:
   ```bash
   # Repository Settings → Secrets → Actions
   # Add: SNYK_TOKEN = <your-token>
   ```

### Running Locally

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Test dependencies
snyk test

# Test with severity threshold
snyk test --severity-threshold=high

# Monitor project (sends to Snyk dashboard)
snyk monitor
```

### CI Integration

Snyk runs automatically in GitHub Actions:
- ✅ Every push to `main`
- ✅ Every pull request
- ✅ Daily at 2 AM UTC

**PR Blocking Rules**:
- **CRITICAL vulnerabilities**: PR BLOCKED
- **HIGH vulnerabilities** (>3): Warning, review required
- **MEDIUM/LOW**: Informational only

### Snyk vs npm audit

| Feature | npm audit | Snyk |
|---------|-----------|------|
| Vulnerability database | NPM registry | Snyk Intelligence |
| Reachability analysis | ❌ No | ✅ Yes |
| Fix suggestions | Basic | Detailed + automatic PRs |
| License scanning | ❌ No | ✅ Yes |
| Container scanning | ❌ No | ✅ Yes |
| False positive rate | Higher | Lower |

**Use both**: npm audit for baseline, Snyk for deep analysis.

---

## SBOM Generation

### What is SBOM?

Software Bill of Materials - complete inventory of all components.

**Benefits**:
- 📦 Supply chain transparency
- 🔍 Vulnerability tracking across versions
- 📋 Compliance requirements (e.g., NTIA Minimum Elements)
- 🛡️ Incident response (identify affected systems)

### Formats

| Format | Standard | Use Case |
|--------|----------|----------|
| **CycloneDX** | OWASP | Security-focused, VEX support |
| **SPDX** | Linux Foundation | Legal compliance, licensing |

Both formats are generated automatically in CI.

### Local Generation

```bash
# Install Syft
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin

# Generate CycloneDX SBOM
syft packages dir:. -o cyclonedx-json=sbom.json

# Generate SPDX SBOM
syft packages dir:. -o spdx-json=sbom-spdx.json

# Human-readable table
syft packages dir:. -o table
```

### CI Integration

SBOM is generated on every push to `main`:
- 📄 **CycloneDX**: `sbom-cyclonedx.json`
- 📄 **SPDX**: `sbom-spdx.json`
- 📦 **Retention**: 90 days in GitHub Artifacts
- 🚀 **Release**: Attach to releases for distribution

### SBOM Usage

**Vulnerability Scanning**:
```bash
# Scan SBOM for known vulnerabilities
grype sbom:sbom-cyclonedx.json
```

**Dependency Analysis**:
```bash
# Analyze SBOM components
jq '.components[] | {name: .name, version: .version, licenses: .licenses}' sbom-cyclonedx.json
```

---

## License Compliance

### Allowed Licenses

**Permissive** (approved for production):
- ✅ MIT
- ✅ Apache-2.0
- ✅ BSD-2-Clause, BSD-3-Clause
- ✅ ISC
- ✅ CC0-1.0 (public domain)

**Copyleft** (requires review):
- ⚠️ GPL-2.0, GPL-3.0
- ⚠️ AGPL-3.0
- ⚠️ LGPL-2.1, LGPL-3.0
- ⚠️ MPL-2.0

**Blocked** (not allowed):
- ❌ Proprietary licenses
- ❌ Unknown/Custom licenses
- ❌ Non-commercial licenses

### Running Locally

```bash
# Install license-checker
npm install -g license-checker

# Check all licenses
license-checker

# JSON report
license-checker --json --out licenses.json

# Summary only
license-checker --summary

# Exclude dev dependencies
license-checker --production

# Check for specific licenses
license-checker --onlyAllow "MIT;Apache-2.0;BSD-3-Clause"
```

### CI Integration

License compliance checks run on every PR:
- 🔍 Scans all dependencies (including transitive)
- ⚠️ Warns on copyleft licenses (GPL, AGPL)
- ❌ Blocks on proprietary/unknown licenses (optional)
- 📊 Generates JSON report (90-day retention)

### Handling Copyleft Dependencies

If copyleft dependency detected:

1. **Check if it's production dependency**:
   ```bash
   npm ls <package-name>
   ```

2. **Options**:
   - Replace with permissive alternative
   - Move to devDependencies (if possible)
   - Get legal review for production use
   - Document exception in `LICENSE.md`

---

## Vulnerability Response Workflow

### 1. Detection

Vulnerability detected by Dependabot/Snyk:
- 🚨 **Critical**: Immediate action required
- ⚠️ **High**: Fix within 7 days
- 🟡 **Medium**: Fix within 30 days
- 🔵 **Low**: Fix in next sprint

### 2. Assessment

```bash
# Get vulnerability details
npm audit --json | jq '.vulnerabilities."<package-name>"'

# Check if exploitable
snyk test --severity-threshold=high --json | jq '.vulnerabilities[] | select(.id == "<CVE-ID>")'
```

### 3. Remediation

**Option 1: Update Dependency** (preferred)
```bash
# Accept Dependabot PR
# Or manual update:
npm update <package-name>
```

**Option 2: Replace Dependency**
```bash
# Find alternative
npm search <alternative-package>
npm install <alternative-package>
npm uninstall <vulnerable-package>
```

**Option 3: Patch (Temporary)**
```bash
# Use patch-package for urgent fixes
npx patch-package <package-name>
```

**Option 4: Accept Risk** (requires justification)
```bash
# Document in security review
# Add to .snyk policy file (Snyk only)
```

### 4. Verification

```bash
# Re-scan after fix
npm audit
snyk test

# Verify no regressions
npm test
```

---

## OWASP 2025 Coverage

### A03: Software and Data Integrity Failures (NEW 2025)

**Covered by SCA**:
- ✅ Vulnerable dependencies detection
- ✅ Supply chain transparency (SBOM)
- ✅ License compliance (copyleft detection)
- ✅ Integrity verification (lock file validation)
- ✅ Automated security updates (Dependabot)

**Not Covered** (requires additional tools):
- ❌ Code signing verification
- ❌ Build provenance (use SLSA framework)
- ❌ Binary artifact integrity

---

## Artifacts & Reports

### GitHub Actions Artifacts

| Artifact | Retention | Contents |
|----------|-----------|----------|
| `npm-audit-results` | 30 days | npm audit JSON output |
| `snyk-results` | 30 days | Snyk vulnerabilities JSON |
| `sbom` | 90 days | CycloneDX + SPDX SBOM files |
| `license-report` | 90 days | License checker JSON output |

### Accessing Artifacts

```bash
# Via GitHub CLI
gh run list --workflow=security.yml
gh run download <run-id> --name sbom

# Via web UI
# Actions → Security workflow → Latest run → Artifacts
```

---

## Maintenance

### Weekly Tasks

- [ ] Review Dependabot PRs
- [ ] Check Snyk dashboard for new findings
- [ ] Verify CI passes on main branch

### Monthly Tasks

- [ ] Review license compliance report
- [ ] Update Dependabot config if needed
- [ ] Audit SBOM for unexpected packages

### Quarterly Tasks

- [ ] Review SCA tool effectiveness
- [ ] Update blocked/allowed licenses list
- [ ] Security training on dependency management

---

## Troubleshooting

### "Dependabot PRs not appearing"

**Cause**: PRs limit reached or security-only mode enabled.

**Fix**:
```yaml
# .github/dependabot.yml
open-pull-requests-limit: 20  # Increase limit
security-updates-only: false  # Allow all updates
```

### "Snyk fails with 401"

**Cause**: Missing or invalid `SNYK_TOKEN` secret.

**Fix**:
```bash
# Get new token: https://snyk.io/account/
# Add to GitHub Secrets: SNYK_TOKEN
```

### "SBOM missing packages"

**Cause**: Syft may not detect all package managers.

**Fix**:
```bash
# Generate with npm (alternative)
npm sbom --sbom-format cyclonedx > sbom.json
```

### "License check blocks legitimate package"

**Cause**: License classifier misidentifies license.

**Fix**:
```bash
# Check package.json manually
# Add exception to CI workflow
```

---

## Related Documentation

- **Pre-commit Hooks**: `docs/SECURITY.md` (Gitleaks)
- **SAST**: `.semgrep/README.md` (Semgrep)
- **OWASP 2025**: https://owasp.org/Top10/2025/
- **Dependabot**: https://docs.github.com/en/code-security/dependabot
- **Snyk**: https://docs.snyk.io/
- **SBOM**: https://www.cisa.gov/sbom
- **CycloneDX**: https://cyclonedx.org/
- **SPDX**: https://spdx.dev/

---

**Version:** 1.0.0 (ROOSE-93)
**Last Updated:** 2026-02-06
**Owner:** Security Team
