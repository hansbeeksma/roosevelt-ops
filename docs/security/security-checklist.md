# OWASP Top 10 2025 — Roosevelt OPS Security Checklist

> Version: 1.0.0 | Last Updated: 2026-02-26 | Owner: Security Team
> Task: ROOSE-38 (Security Audit & Remediation)

This document maps the OWASP Top 10 2025 categories to implementations in the
Roosevelt OPS platform. Update status symbols and notes as work progresses.

Status key: OK = implemented and verified, PARTIAL = partially implemented, OPEN = not yet addressed

---

## A01: Broken Access Control

**Status: PARTIAL**

| Control | Status | Implementation |
|---------|--------|----------------|
| Clerk authentication on all protected routes | OK | `middleware.ts` + Clerk middleware |
| RLS on all Supabase tables | PARTIAL | Enabled on `audit_log`; verify remaining tables |
| API route authorization checks | PARTIAL | Rate limiting applied; per-route auth checks to be audited |
| CORS origin allowlist | OK | `apps/api/src/plugins/security.ts`, `middleware.ts` |
| Audit logging of data access | OK | `lib/security/audit-logger.ts` + `audit_log` table |

**Notes:**
- Run `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'` to verify RLS coverage.
- Admin endpoints should use Clerk `has({ role: 'admin' })` guards.

---

## A02: Cryptographic Failures

**Status: PARTIAL**

| Control | Status | Implementation |
|---------|--------|----------------|
| HTTPS enforced (HSTS) | OK | HSTS header in `security.ts` (`max-age=63072000`) |
| No secrets in source code | OK | Gitleaks pre-commit hook + CI scan |
| Environment variables for all credentials | OK | `.env.local` / Vercel env vars |
| Supabase data at rest encryption | OK | Supabase default (AES-256) |
| JWT tokens via Clerk (RS256) | OK | Clerk default |
| Weak hashing algorithms | OK | No MD5/SHA1 in codebase (Semgrep rule) |

**Notes:**
- Periodically rotate Supabase service role key and Clerk secret key.
- Ensure `NEXT_PUBLIC_` prefix is NOT used for server secrets.

---

## A03: Injection

**Status: OK**

| Control | Status | Implementation |
|---------|--------|----------------|
| Parameterized queries (Supabase client) | OK | `@supabase/supabase-js` uses prepared statements |
| HTML stripping on user input | OK | `lib/security/input-sanitizer.ts` — `sanitizeString()` |
| SQL wildcard escaping for search | OK | `lib/security/input-sanitizer.ts` — `sanitizeSearchQuery()` |
| Zod schema validation on API inputs | OK | `lib/security/input-sanitizer.ts` — `createZodSchemas()` |
| No `eval()` or dynamic code execution | OK | Semgrep rule blocks `eval` usage |
| JSON schema validation on Fastify routes | OK | Route-level `schema` definitions in `metrics.routes.ts` |

**Notes:**
- Fastify routes should always declare a `schema.body` / `schema.querystring` to reject unexpected fields.

---

## A04: Insecure Design

**Status: PARTIAL**

| Control | Status | Implementation |
|---------|--------|----------------|
| Threat model documented | OPEN | Create threat model document |
| Security design review for new features | PARTIAL | Security checklist in PR template |
| Fail-secure defaults (deny by default) | OK | `lib/error-handler.ts` uses fail-secure error factories |
| Principle of least privilege for service accounts | PARTIAL | Supabase RLS enforced; verify IAM roles |

**Notes:**
- Add threat model to `docs/security/threat-model.md`.
- Ensure Supabase anon key has minimal permissions (read-only where possible).

---

## A05: Security Misconfiguration

**Status: OK**

| Control | Status | Implementation |
|---------|--------|----------------|
| Security headers set on all responses | OK | `apps/api/src/plugins/security.ts` onSend hook |
| X-Frame-Options: DENY | OK | `security.ts` |
| X-Content-Type-Options: nosniff | OK | `security.ts` |
| Content-Security-Policy | OK | `security.ts` — nonce-based CSP |
| Referrer-Policy: strict-origin-when-cross-origin | OK | `security.ts` |
| Permissions-Policy | OK | `security.ts` — blocks camera, mic, geolocation |
| HSTS | OK | `security.ts` |
| Cross-Origin-Opener-Policy | OK | `security.ts` |
| No debug mode in production | OK | `NODE_ENV` check in Fastify logger |
| `.env` files not committed | OK | `.gitignore` + Gitleaks |

**Notes:**
- Test security header scores at https://securityheaders.com after each deployment.
- Next.js security headers are set via `next.config.js` headers config for the web app.

---

## A06: Vulnerable and Outdated Components

**Status: OK**

| Control | Status | Implementation |
|---------|--------|----------------|
| Dependabot enabled | OK | `.github/dependabot.yml` |
| npm audit in CI | OK | `security.yml` workflow |
| Snyk scanning | OK | `security.yml` workflow |
| SBOM generation | OK | CycloneDX + SPDX on main |
| License compliance check | OK | CI workflow |

**Notes:**
- Review Dependabot PRs weekly.
- Critical CVEs must be patched within 24 hours.

---

## A07: Identification and Authentication Failures

**Status: OK**

| Control | Status | Implementation |
|---------|--------|----------------|
| Clerk authentication (managed provider) | OK | App-wide Clerk middleware |
| Auth event audit logging | OK | `lib/security/audit-logger.ts` — `logAuthEvent()` |
| Rate limiting on all endpoints | OK | `apps/api/src/plugins/security.ts` — global 100 req/min |
| Stricter limits on auth-adjacent routes | OK | AI routes: 10 req/min; webhook: 20 req/min |
| No session fixation | OK | Clerk manages session lifecycle |
| No hardcoded credentials | OK | Gitleaks + Semgrep enforce this |

**Notes:**
- Enable Clerk brute-force lockout in Clerk dashboard.
- Consider adding MFA requirement for admin roles.

---

## A08: Software and Data Integrity Failures

**Status: PARTIAL**

| Control | Status | Implementation |
|---------|--------|----------------|
| CI/CD pipeline integrity | OK | GitHub Actions with pinned action versions |
| Subresource Integrity (SRI) on CDN assets | PARTIAL | Next.js handles bundled assets; verify third-party CDN usage |
| No unsafe deserialization | OK | No `eval(JSON...)` patterns (Semgrep) |
| Package lock files committed | OK | `package-lock.json` committed |
| Dependency pinning | PARTIAL | Ranges used; consider exact pins for critical deps |

**Notes:**
- Pin GitHub Actions to full commit SHAs for supply chain security.
- Audit any third-party `<script>` tags in the Next.js app for SRI attributes.

---

## A09: Security Logging and Monitoring Failures

**Status: OK**

| Control | Status | Implementation |
|---------|--------|----------------|
| Auth event logging | OK | `lib/security/audit-logger.ts` — `logAuthEvent()` |
| Data access logging | OK | `lib/security/audit-logger.ts` — `logDataAccess()` |
| Structured JSON audit log in Supabase | OK | `supabase/migrations/20260226800005_audit_log.sql` |
| User-scoped RLS on audit_log reads | OK | Migration RLS policy |
| Sentry error monitoring | OK | `sentry.*.config.ts` in all environments |
| Log retention | PARTIAL | Supabase default retention; define explicit policy |
| Alerting on security events | PARTIAL | Sentry alerts configured; add Supabase log alerts |

**Notes:**
- Define log retention policy (e.g. 90 days for audit_log, 1 year for critical events).
- Create Sentry alert rules for authentication failure spikes.

---

## A10: Server-Side Request Forgery (SSRF)

**Status: OK**

| Control | Status | Implementation |
|---------|--------|----------------|
| URL validation with domain allowlist | OK | `lib/security/input-sanitizer.ts` — `validateUrl()` |
| Private IP range blocking | OK | Blocks 127.x, 10.x, 172.16-31.x, 192.168.x, 169.254.x |
| AWS metadata endpoint blocked | OK | `169.254.0.0/16` blocked |
| Google metadata endpoint blocked | OK | `metadata.google.internal` blocked |
| HTTP-only (no file://, ftp://) in production | OK | Protocol allowlist in `validateUrl()` |
| Zod URL schema with SSRF check | OK | `createZodSchemas().url` |

**Notes:**
- Any route that fetches a user-supplied URL must use `validateUrl()` before making the request.
- Review MCP integration endpoints for outbound request validation.

---

## Summary

| Category | Status |
|----------|--------|
| A01: Broken Access Control | PARTIAL |
| A02: Cryptographic Failures | PARTIAL |
| A03: Injection | OK |
| A04: Insecure Design | PARTIAL |
| A05: Security Misconfiguration | OK |
| A06: Vulnerable and Outdated Components | OK |
| A07: Identification and Authentication Failures | OK |
| A08: Software and Data Integrity Failures | PARTIAL |
| A09: Security Logging and Monitoring Failures | OK |
| A10: Server-Side Request Forgery | OK |

**6/10 fully implemented, 4/10 partially implemented, 0/10 open.**

## Follow-up Issues

- [ ] Complete RLS audit across all Supabase tables (A01)
- [ ] Create threat model document (A04)
- [ ] Pin GitHub Actions to commit SHAs (A08)
- [ ] Define log retention policy (A09)
- [ ] Admin route authorization audit (A01)
