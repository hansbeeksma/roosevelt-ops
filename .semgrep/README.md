# Semgrep Security Rules

Custom Semgrep rules voor Roosevelt OPS, gericht op OWASP Top 10:2025 patterns en project-specific security issues.

## Rules Overzicht

### OWASP Top 10:2025 Coverage

| ID | OWASP Category | Severity | Beschrijving |
|----|----------------|----------|--------------|
| `missing-auth-check` | A01 - Broken Access Control | ERROR | Endpoints zonder auth middleware |
| `weak-crypto` | A02 - Cryptographic Failures | WARNING | Zwakke hash algoritmes (MD5, SHA1) |
| `sql-injection-risk` | A03 - Injection | ERROR | SQL injection via string concatenatie |
| `command-injection-risk` | A03 - Injection | ERROR | Command injection via user input |
| `hardcoded-secrets` | A04 - Insecure Design | ERROR | Hardcoded API keys/secrets |
| `cors-allow-all` | A05 - Security Misconfiguration | WARNING | CORS wildcard origin |
| `eval-usage` | A06 - Vulnerable Components | ERROR | eval() of Function() constructor |
| `weak-session-config` | A07 - Authentication Failures | WARNING | Onveilige session cookies |
| `unsafe-yaml-load` | A08 - Data Integrity Failures | ERROR | yaml.load() ipv safeLoad() |
| `missing-error-logging` | A09 - Logging Failures | INFO | Exceptions zonder logging |
| `ssrf-risk` | A10 - SSRF | WARNING | Ongevalideerde externe requests |

### Project-Specific Rules

| ID | Severity | Beschrijving |
|----|----------|--------------|
| `missing-rate-limit` | INFO | Endpoints zonder rate limiting |
| `missing-input-validation` | WARNING | POST endpoints zonder schema validatie |
| `console-log-in-production` | INFO | Debug statements in code |

## Lokaal Draaien

### Installatie

```bash
# macOS
brew install semgrep

# Of via pip
pip install semgrep
```

### Scan Uitvoeren

```bash
# Scan hele project
semgrep --config .semgrep/rules.yml .

# Scan specifieke directory
semgrep --config .semgrep/rules.yml src/

# Scan met OWASP rulesets
semgrep --config "p/owasp-top-ten" --config .semgrep/rules.yml .

# JSON output voor CI
semgrep --config .semgrep/rules.yml --json --output semgrep-results.json .
```

### Filters

```bash
# Alleen ERROR severity
semgrep --config .semgrep/rules.yml --severity ERROR .

# Exclude test files
semgrep --config .semgrep/rules.yml --exclude "**/*.test.ts" .

# Specific rule only
semgrep --config .semgrep/rules.yml --include "sql-injection-risk" .
```

## CI/CD Integratie

Semgrep draait automatisch in GitHub Actions bij:
- ✅ Elke push naar `main`
- ✅ Elke pull request
- ✅ Dagelijks om 2:00 AM UTC

### PR Blocking

PR wordt **geblokkeerd** bij:
- ERROR severity findings
- WARNING severity findings (configurable)

PR wordt **niet geblokkeerd** bij:
- INFO severity findings (warnings only)

## Findings Oplossen

### 1. Fix de Code (Aanbevolen)

```javascript
// ❌ FOUT: SQL injection risk
const query = `SELECT * FROM users WHERE id = ${userId}`
db.query(query)

// ✅ GOED: Parameterized query
db.query('SELECT * FROM users WHERE id = ?', [userId])
```

### 2. Suppress False Positives

Voor legitieme gevallen die Semgrep verkeerd detecteert:

```javascript
// nosemgrep: sql-injection-risk
const staticQuery = `SELECT * FROM users WHERE role = 'admin'`
```

**Waarschuwing**: Gebruik suppress alleen bij echte false positives!

### 3. Allowlist Bestand

Voor hele bestanden (bijv. test fixtures):

```yaml
# .semgrep/.semgrepignore
tests/fixtures/
*.test.ts
```

## Custom Rules Toevoegen

Voeg nieuwe rules toe aan `.semgrep/rules.yml`:

```yaml
rules:
  - id: my-custom-rule
    pattern: dangerous_function(...)
    message: Don't use dangerous_function!
    languages: [javascript, typescript]
    severity: WARNING
    metadata:
      category: security
```

Test je rule:

```bash
semgrep --config .semgrep/rules.yml --test .semgrep/tests/
```

## Semgrep App Integration

Voor team dashboards en trendanalyse:

1. Ga naar [semgrep.dev](https://semgrep.dev)
2. Connect GitHub repository
3. View findings in Semgrep App dashboard
4. Set `SEMGREP_APP_TOKEN` secret in GitHub

**Security findings dashboard** beschikbaar op:
- GitHub Security tab (SARIF integration)
- Semgrep App dashboard (met trends)

## Troubleshooting

### "Rule not found"

Semgrep kan public rulesets niet vinden:

```bash
# Gebruik volledige registry URL
semgrep --config "p/owasp-top-ten" .
```

### "Too many findings"

Start met ERROR severity:

```bash
semgrep --config .semgrep/rules.yml --severity ERROR .
```

### "False positives"

Verfijn de rule met `pattern-not`:

```yaml
- id: my-rule
  pattern: risky_function(...)
  pattern-not: risky_function("safe-constant")
```

## Resources

- [Semgrep Documentation](https://semgrep.dev/docs/)
- [Rule Writing Guide](https://semgrep.dev/docs/writing-rules/overview/)
- [OWASP Top 10:2025](https://owasp.org/Top10/)
- [Semgrep Registry](https://semgrep.dev/explore)

## Maintenance

### Update Rules

```bash
# Valideer nieuwe rules
semgrep --validate .semgrep/rules.yml

# Test op bestaande codebase
semgrep --config .semgrep/rules.yml --metrics=off .
```

### Tune Severity

Review findings elke sprint:
- Verhoog severity voor herhaalde issues
- Verlaag severity voor acceptabele patterns
- Voeg suppressions toe voor false positives

---

**Versie:** 1.0.0 (ROOSE-92)
**Last Updated:** 2026-02-06
**Owner:** Security Team
