# Security Misconfiguration Prevention

> **Part of:** ROOSE-52 (OWASP 2025 Security Gates)
> **Implemented:** ROOSE-95 (Security Misconfiguration Checks)
> **Version:** 1.0.0

Complete guide voor het voorkomen en detecteren van security misconfigurations.

**OWASP 2025 Context**: Security Misconfiguration surged to **#2** in OWASP Top 10:2025, up from #5 in 2021.

---

## Overview

Security misconfigurations kunnen leiden tot:
- 🔓 Unauthorized access
- 🗄️ Data leakage
- ⚠️ Privilege escalation
- 🎯 Attack surface expansion

**Prevention Strategy**: Multi-layered automated checks in local development + CI/CD.

---

## Quick Start

### Local Security Check

```bash
# Run full security audit
./scripts/security-check.sh

# Exit codes:
# 0 = All checks passed
# 1 = Errors found (blocks deployment)
```

### Pre-Commit Hook (Recommended)

Add to `.husky/pre-commit`:

```bash
# Security configuration check (ROOSE-95)
./scripts/security-check.sh || exit 1
```

---

## Security Headers

### Implemented Headers

All routes serve the following security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS for 2 years |
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | Enable XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer information |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Block unnecessary permissions |
| `Content-Security-Policy` | See below | XSS protection via CSP |

### Content Security Policy (CSP)

**Current CSP**:
```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https: blob:;
font-src 'self' data:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com https://vercel.live;
frame-ancestors 'self';
base-uri 'self';
form-action 'self';
```

**CSP Violations**: Monitor via browser console or Sentry CSP reports.

### Testing Security Headers

```bash
# Local test (requires running server)
curl -I http://localhost:3000 | grep -i "x-frame-options\|content-security-policy\|strict-transport"

# Production test
curl -I https://your-domain.com | grep -i security

# Online checker
# https://securityheaders.com/
```

### Customizing Headers

Edit `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Custom-Security-Header',
          value: 'your-value'
        },
      ],
    },
  ]
}
```

---

## Environment Variable Security

### Rules

1. **NEVER commit** `.env.local`, `.env.production`, or any file with real secrets
2. **ALWAYS use** `.env.example` or `.env.local.example` as templates
3. **Use NEXT_PUBLIC_** prefix ONLY for client-safe variables
4. **Keep server secrets** without NEXT_PUBLIC_ prefix (e.g., `SUPABASE_SERVICE_ROLE_KEY`)
5. **Rotate immediately** if secrets are accidentally committed

### Gitignore Configuration

Ensure `.gitignore` contains:

```gitignore
# Environment files (CRITICAL)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local

# Allow example files
!.env.example
!.env*.example
```

### Environment Variable Validation

**Startup validation** (recommended):

```typescript
// lib/env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

export function validateEnv() {
  const missing = requiredEnvVars.filter(v => !process.env[v])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Call in app/layout.tsx or middleware
validateEnv()
```

### CI/CD Environment Secrets

**Vercel configuration**:
1. Project Settings → Environment Variables
2. Add secrets with appropriate scope (Production, Preview, Development)
3. NEVER commit production secrets to git

**GitHub Actions secrets**:
```yaml
# .github/workflows/deploy.yml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  # etc.
```

---

## CORS Configuration

### Next.js API Routes

**Bad (wildcard CORS)**:
```typescript
// ❌ WRONG - allows all origins
export async function GET(request: Request) {
  return new Response(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',  // INSECURE
    },
  })
}
```

**Good (restricted CORS)**:
```typescript
// ✅ CORRECT - specific origins
const allowedOrigins = [
  'https://your-domain.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
].filter(Boolean)

export async function GET(request: Request) {
  const origin = request.headers.get('origin')
  const headers: Record<string, string> = {}

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  return new Response(data, { headers })
}
```

### Preflight Requests (OPTIONS)

```typescript
// app/api/your-endpoint/route.ts
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')
  const allowed = allowedOrigins.includes(origin || '')

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowed ? origin! : '',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
```

---

## Next.js Security Best Practices

### 1. Disable Powered-By Header

```javascript
// next.config.js
module.exports = {
  poweredByHeader: false,  // Don't advertise Next.js
}
```

### 2. Server Actions Security

```typescript
// app/actions.ts
'use server'

import { auth } from '@/lib/auth'

export async function sensitiveAction(data: FormData) {
  // ALWAYS validate authentication
  const user = await auth()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // ALWAYS validate input
  const validated = schema.parse(data)

  // Proceed with action
}
```

### 3. API Route Protection

```typescript
// app/api/protected/route.ts
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Proceed with authenticated logic
}
```

### 4. Avoid Client-Side Secrets

```typescript
// ❌ WRONG - exposes secret to client
'use client'
const SECRET_KEY = process.env.SECRET_KEY  // Available in browser!

// ✅ CORRECT - server component
const SECRET_KEY = process.env.SECRET_KEY  // Server-only
```

---

## Docker Security (Future Use)

### Dockerfile Best Practices

```dockerfile
# Use specific versions (not latest)
FROM node:20-alpine AS base

# Don't run as root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy with correct ownership
COPY --chown=nextjs:nodejs . .

# Switch to non-root user
USER nextjs

# No secrets in ENV
# Use runtime secrets or build args
```

### .dockerignore

```gitignore
.env
.env.local
.env*.local
node_modules
.git
.next
Dockerfile
.dockerignore
```

---

## CI/CD Security Checks

### GitHub Actions Workflow

File: `.github/workflows/security-config.yml`

**Checks performed**:
1. ✅ Environment variable validation (no .env files in git)
2. ✅ Security headers presence in next.config.js
3. ✅ CORS misconfiguration detection
4. ✅ Hardcoded secrets patterns
5. ✅ Next.js security settings
6. ✅ Docker security (if applicable)

**When checks run**:
- Every push to `main`
- Every pull request
- Weekly scheduled scan (Monday 3 AM)

**PR Blocking**:
- Errors **block** merge
- Warnings are **informational**

---

## Monitoring & Alerting

### Sentry CSP Reports

Configure CSP reporting:

```javascript
// next.config.js CSP header
Content-Security-Policy: ...; report-uri https://sentry.io/api/.../security/?sentry_key=...
```

### Vercel Security Logs

Check deployment logs for:
- Environment variable leaks
- Build-time errors
- Runtime security warnings

---

## Troubleshooting

### CSP Violations

**Problem**: Inline scripts blocked by CSP
**Solution**: Use `nonce` or `hash` for inline scripts

```typescript
// app/layout.tsx
import { headers } from 'next/headers'

export default function RootLayout() {
  const nonce = headers().get('x-nonce')

  return (
    <html>
      <head>
        <script nonce={nonce}>
          {/* Safe inline script */}
        </script>
      </head>
    </html>
  )
}
```

### CORS Errors

**Problem**: API calls blocked by CORS
**Solution**: Add origin to allowlist

```typescript
const allowedOrigins = [
  'https://your-frontend.com',
  // Add more as needed
]
```

### Header Not Appearing

**Problem**: Security header missing in production
**Solution**: Check Vercel deployment logs

```bash
# Verify headers locally
npm run build && npm start
curl -I http://localhost:3000
```

---

## Compliance Checklist

Before production deployment:

- [ ] All security headers configured
- [ ] CSP policy tested and working
- [ ] No .env files in git
- [ ] CORS restricted to specific origins
- [ ] API routes require authentication
- [ ] Server actions validate input
- [ ] No client-side secrets
- [ ] Docker uses non-root user (if applicable)
- [ ] Security headers checker passing
- [ ] Sentry CSP reporting configured

---

## Related Documentation

- **Pre-commit Hooks**: `docs/SECURITY.md` (Gitleaks)
- **SAST**: `.semgrep/README.md` (Semgrep)
- **SCA**: `docs/SCA-SETUP.md` (Snyk/Dependabot)
- **OWASP 2025**: https://owasp.org/Top10/2025/
- **Next.js Security**: https://nextjs.org/docs/advanced-features/security-headers
- **CSP Reference**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **Security Headers**: https://securityheaders.com/

---

**Version:** 1.0.0 (ROOSE-95)
**Last Updated:** 2026-02-06
**Owner:** Security Team
