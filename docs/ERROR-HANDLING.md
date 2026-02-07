# Error Handling Security Framework

> **Part of:** ROOSE-52 (OWASP 2025 Security Gates)
> **Implemented:** ROOSE-96 (Error Handling Security Framework)
> **Version:** 1.0.0

Complete guide voor secure error handling volgens OWASP A10:2025 (Mishandling of Exceptional Conditions).

---

## Overview

**OWASP A10:2025 (NEW)**: Mishandling of Exceptional Conditions

Problematic error handling kan leiden tot:
- 🔓 **Information disclosure** (stack traces, file paths, credentials)
- 🎯 **Attack surface expansion** (revealing system internals)
- ⚠️ **Fail-open vulnerabilities** (default allow bij errors)
- 🗄️ **Data leakage** (sensitive data in error messages)

**Prevention Strategy**: Fail-secure defaults + sanitized errors + structured logging.

---

## Quick Start

### API Route Error Handling

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, createValidationError } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.email) {
      throw createValidationError('Email is required')
    }

    // Your logic here
    return NextResponse.json({ success: true })
  } catch (error) {
    // Centralized error handling
    return handleApiError(error, request)
  }
}
```

### Custom Error Types

```typescript
import {
  AppError,
  createAuthError,
  createForbiddenError,
  createNotFoundError,
  createRateLimitError,
  createDatabaseError,
} from '@/lib/error-handler'

// Validation errors
throw createValidationError('Invalid email format')

// Authentication errors
throw createAuthError('Invalid credentials')

// Authorization errors (fail-secure: deny by default)
throw createForbiddenError('Insufficient permissions')

// Not found errors
throw createNotFoundError('User not found')

// Rate limiting
throw createRateLimitError('Too many login attempts')

// Database errors
throw createDatabaseError('Failed to save user')
```

---

## Architecture

### Error Flow

```
1. Error occurs
   ↓
2. Catch in try-catch block
   ↓
3. handleApiError() or handleError()
   ↓
4. Error classification (AppError vs Error vs unknown)
   ↓
5. Message sanitization (remove sensitive data)
   ↓
6. Structured logging (Sentry + logs)
   ↓
7. Client response (NO stack trace in production)
```

### Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **error-handler.ts** | Core error handling logic | `lib/error-handler.ts` |
| **global-error.tsx** | Global React error boundary | `app/global-error.tsx` |
| **error.tsx** | Page-level error boundary | `app/error.tsx` |
| **not-found.tsx** | 404 handler | `app/not-found.tsx` |
| **API route example** | Error handling demo | `app/api/example/route.ts` |

---

## Security Features

### 1. No Stack Traces in Production

**Problem**: Stack traces reveal file paths, code structure, and dependencies.

**Solution**:
```typescript
// Development: Full stack trace
if (isDevelopment) {
  console.error('[ERROR]', { ...error, stack: error.stack })
}

// Production: Sanitized JSON only (NO stack)
if (!isDevelopment) {
  console.error(JSON.stringify({
    level: 'error',
    code: error.code,
    message: error.message,
    // stack: error.stack,  // ❌ FORBIDDEN
  }))
}
```

**Result**: Stack traces ONLY in development, NEVER in production logs or responses.

### 2. Message Sanitization

**Problem**: Error messages can contain sensitive data (file paths, emails, secrets).

**Solution**:
```typescript
function sanitizeMessage(message: string): string {
  // Remove file paths
  let sanitized = message.replace(/\/[^\s]+/g, '[PATH]')

  // Remove email addresses
  sanitized = sanitized.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]')

  // Remove potential secrets (base64, hex >20 chars)
  sanitized = sanitized.replace(/[A-Za-z0-9+/=]{20,}/g, '[REDACTED]')

  return sanitized
}
```

**Examples**:
| Original | Sanitized |
|----------|-----------|
| `Failed to read /etc/secrets/api-key` | `Failed to read [PATH]` |
| `Invalid email: user@example.com` | `Invalid email: [EMAIL]` |
| `Token ABC123XYZ789... invalid` | `Token [REDACTED] invalid` |

### 3. Fail-Secure Defaults

**Philosophy**: When in doubt, deny access.

**Implementation**:
```typescript
// Unknown errors → 500 Internal Error (fail closed)
if (!(error instanceof AppError) && !(error instanceof Error)) {
  code = ErrorCodes.INTERNAL_ERROR
  message = 'An unexpected error occurred'  // Generic
  severity = ErrorSeverity.CRITICAL
  statusCode = 500
}

// Access errors → 403 Forbidden (not 401, to avoid info leak)
// Validation errors → Generic message (no field details)
```

**Anti-Pattern**:
```typescript
// ❌ WRONG: Fail open (allow by default)
if (hasPermission(user)) {
  return data
}
// If hasPermission() throws → undefined → truthy → ALLOWED!

// ✅ CORRECT: Fail closed (deny by default)
const allowed = hasPermission(user)
if (!allowed) {
  throw createForbiddenError('Access denied')
}
return data
```

### 4. Structured Logging

**Production Logging** (JSON format for parsing):
```json
{
  "level": "error",
  "severity": "high",
  "code": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "requestId": "1738834123456-xyz789",
  "timestamp": "2026-02-06T09:00:00.000Z",
  "path": "/api/users",
  "method": "POST",
  "userId": "user-123"
}
```

**Development Logging** (readable format):
```javascript
console.error('[ERROR]', {
  code: 'VALIDATION_ERROR',
  message: 'Invalid email format',
  stack: 'Error: Invalid email format\n    at...',  // ONLY in dev
})
```

### 5. Request Tracking

Every error gets a unique `requestId` for tracing:

```typescript
// Generated automatically
requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Included in response
{
  "error": {
    "message": "...",
    "code": "...",
    "requestId": "1738834123456-xyz789",  // ← Track this
    "timestamp": "2026-02-06T09:00:00.000Z"
  }
}

// Included in logs (for correlation)
console.error(JSON.stringify({
  requestId: "1738834123456-xyz789",  // ← Same ID
  code: "VALIDATION_ERROR",
  ...
}))
```

**Usage**: User reports issue → provide `requestId` → lookup in logs.

---

## Error Types & HTTP Status Codes

| Error Code | HTTP Status | Severity | Use Case |
|------------|-------------|----------|----------|
| `BAD_REQUEST` | 400 | Low | Malformed request |
| `UNAUTHORIZED` | 401 | Medium | Missing/invalid auth |
| `FORBIDDEN` | 403 | Medium | Insufficient permissions |
| `NOT_FOUND` | 404 | Low | Resource doesn't exist |
| `VALIDATION_ERROR` | 422 | Low | Invalid input data |
| `RATE_LIMIT_EXCEEDED` | 429 | Medium | Too many requests |
| `INTERNAL_ERROR` | 500 | High | Unexpected error |
| `SERVICE_UNAVAILABLE` | 503 | Critical | System down |
| `DATABASE_ERROR` | 500 | Critical | DB operation failed |
| `EXTERNAL_API_ERROR` | 502 | High | Third-party API failed |

---

## Integration with External Services

### Sentry Error Tracking

**Setup** (already configured in project):
```typescript
// global-error.tsx and error.tsx
useEffect(() => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'global',
        digest: error.digest,
      },
    })
  }
}, [error])
```

**What to send**:
- ✅ Error message (sanitized)
- ✅ Error code
- ✅ Request ID
- ✅ Severity level
- ✅ User ID (if authenticated)
- ❌ Stack trace (Sentry auto-captures)

**Sentry Dashboard**:
- Error frequency
- Affected users
- Release tracking
- Performance impact

### CloudWatch / DataDog Logging

**Structured JSON logging** for log aggregation:

```typescript
console.error(JSON.stringify({
  level: 'error',
  severity: error.severity,
  code: error.code,
  message: error.message,
  requestId: error.requestId,
  timestamp: error.timestamp,
  path: error.path,
  method: error.method,
  userId: error.userId,
}))
```

**Query examples**:
```
# Find all critical errors
severity:critical

# Find errors for specific user
userId:user-123

# Find errors in specific timeframe
timestamp:[2026-02-06T00:00:00 TO 2026-02-06T23:59:59]
```

---

## Best Practices

### DO

- ✅ **Use error factories** (`createValidationError`, `createAuthError`, etc.)
- ✅ **Sanitize error messages** (no file paths, emails, secrets)
- ✅ **Log structured errors** (JSON format for parsing)
- ✅ **Include request IDs** (for tracing)
- ✅ **Fail secure** (deny by default)
- ✅ **Hide stack traces in production**
- ✅ **Use Sentry** (or similar) for error tracking
- ✅ **Provide user-friendly messages** (no technical details)

### DON'T

- ❌ **Expose stack traces in production**
- ❌ **Return sensitive data in error messages**
- ❌ **Use generic catch-all errors** (classify errors properly)
- ❌ **Fail open** (allow by default on errors)
- ❌ **Log passwords/tokens** (even in development!)
- ❌ **Ignore errors** (always handle explicitly)
- ❌ **Reveal system internals** (file paths, dependencies, versions)

---

## Testing Error Handling

### Unit Tests

```typescript
import { handleError, createValidationError } from '@/lib/error-handler'

describe('Error Handler', () => {
  it('sanitizes file paths in error messages', () => {
    const error = new Error('Failed to read /etc/secrets/api-key')
    const { response } = handleError(error)

    expect(response.error.message).not.toContain('/etc/secrets')
    expect(response.error.message).toContain('[PATH]')
  })

  it('does not include stack trace in production', () => {
    process.env.NODE_ENV = 'production'
    const error = new Error('Test error')
    const { response } = handleError(error)

    expect(response.stack).toBeUndefined()
  })

  it('includes stack trace in development', () => {
    process.env.NODE_ENV = 'development'
    const error = new Error('Test error')
    const { response } = handleError(error)

    expect(response.stack).toBeDefined()
  })
})
```

### Integration Tests

Test API error responses:

```typescript
describe('API Error Handling', () => {
  it('returns 422 for validation errors', async () => {
    const response = await fetch('/api/example', {
      method: 'POST',
      body: JSON.stringify({ name: '' }),  // Invalid
    })

    expect(response.status).toBe(422)
    const data = await response.json()
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(data.error.requestId).toBeDefined()
  })

  it('returns 401 for missing auth', async () => {
    const response = await fetch('/api/example?id=123')
    expect(response.status).toBe(401)
  })
})
```

---

## Monitoring & Alerting

### Error Budget

**Concept**: Allowable error rate before triggering alerts.

**Example SLO** (Service Level Objective):
- 99.9% of requests succeed (0.1% error budget)
- Error rate > 1% for 5 minutes → PagerDuty alert
- Critical errors → immediate alert

**Implementation** (via Sentry/CloudWatch):
```yaml
# CloudWatch Alarm
MetricName: ErrorRate
Threshold: 1.0  # 1%
EvaluationPeriods: 5  # 5 minutes
ComparisonOperator: GreaterThanThreshold
AlarmActions:
  - arn:aws:sns:us-east-1:123456789:pagerduty
```

### Severity-Based Alerts

| Severity | Alert Channel | Response Time |
|----------|---------------|---------------|
| **LOW** | Slack #alerts | Review daily |
| **MEDIUM** | Slack #alerts + Email | Review hourly |
| **HIGH** | Email + Slack ping | < 15 minutes |
| **CRITICAL** | PagerDuty + Phone call | < 5 minutes |

---

## Common Patterns

### Pattern 1: Database Error Handling

```typescript
try {
  const user = await db.user.findUnique({ where: { id } })
  if (!user) {
    throw createNotFoundError('User not found')
  }
  return user
} catch (error) {
  // Classify database errors
  if (error.code === 'P2002') {  // Prisma unique constraint
    throw createValidationError('Email already exists')
  }
  if (error.code === 'P2025') {  // Prisma record not found
    throw createNotFoundError('User not found')
  }
  // Unknown database error
  throw createDatabaseError('Database operation failed')
}
```

### Pattern 2: External API Error Handling

```typescript
try {
  const response = await fetch('https://api.external.com/data')
  if (!response.ok) {
    throw new Error(`External API returned ${response.status}`)
  }
  return await response.json()
} catch (error) {
  // Classify external errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new AppError(
      'External service unavailable',
      ErrorCodes.EXTERNAL_API_ERROR,
      ErrorSeverity.HIGH,
      502
    )
  }
  throw createDatabaseError('Failed to fetch external data')
}
```

### Pattern 3: Validation Error Aggregation

```typescript
const errors: string[] = []

if (!body.name) errors.push('Name is required')
if (!body.email) errors.push('Email is required')
if (body.email && !isValidEmail(body.email)) {
  errors.push('Invalid email format')
}

if (errors.length > 0) {
  throw createValidationError(errors.join('; '))
}
```

---

## Troubleshooting

### Problem: Errors not logged

**Cause**: Missing error handler in API route
**Fix**: Wrap route in try-catch + `handleApiError()`

### Problem: Stack traces visible in production

**Cause**: `NODE_ENV` not set to `production`
**Fix**: Set `NODE_ENV=production` in Vercel environment variables

### Problem: Sentry not capturing errors

**Cause**: Missing `NEXT_PUBLIC_SENTRY_DSN` env var
**Fix**: Add Sentry DSN to `.env.local` and Vercel

### Problem: Too many error logs

**Cause**: Logging non-errors (warnings, info)
**Fix**: Use `console.warn()` for warnings, `console.error()` only for errors

---

## Related Documentation

- **OWASP A10:2025**: https://owasp.org/Top10/2025/A10-Mishandling-of-Exceptional-Conditions/
- **Sentry Documentation**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Next.js Error Handling**: https://nextjs.org/docs/app/building-your-application/routing/error-handling
- **RFC 7807 Problem Details**: https://www.rfc-editor.org/rfc/rfc7807
- **Roosevelt OPS Security Framework**: ROOSE-52

---

**Version:** 1.0.0 (ROOSE-96)
**Last Updated:** 2026-02-06
**Owner:** Security Team
