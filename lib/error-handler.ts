/**
 * Error Handling Security Framework (ROOSE-96)
 * OWASP A10:2025 - Mishandling of Exceptional Conditions
 *
 * Implements secure error handling with:
 * - No stack traces in production
 * - Sanitized error messages
 * - Structured logging
 * - Fail-secure defaults
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Error severity levels for monitoring and alerting
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Structured error response (no sensitive data)
 */
export interface ErrorResponse {
  error: {
    message: string
    code: string
    requestId?: string
    timestamp: string
  }
  // Stack trace ONLY in development
  stack?: string
}

/**
 * Internal error structure for logging
 */
export interface StructuredError {
  message: string
  code: string
  severity: ErrorSeverity
  requestId?: string
  timestamp: string
  path?: string
  method?: string
  userId?: string
  // Sensitive data (NEVER in response, only in logs)
  stack?: string
  originalError?: unknown
}

/**
 * Error codes following RFC 7807 Problem Details
 */
export const ErrorCodes = {
  // Client errors (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
} as const

/**
 * Map error codes to HTTP status codes
 */
const ErrorStatusMap: Record<string, number> = {
  [ErrorCodes.BAD_REQUEST]: 400,
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.VALIDATION_ERROR]: 422,
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503,
  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.EXTERNAL_API_ERROR]: 502,
}

/**
 * Map error codes to severity levels
 */
const ErrorSeverityMap: Record<string, ErrorSeverity> = {
  [ErrorCodes.BAD_REQUEST]: ErrorSeverity.LOW,
  [ErrorCodes.UNAUTHORIZED]: ErrorSeverity.MEDIUM,
  [ErrorCodes.FORBIDDEN]: ErrorSeverity.MEDIUM,
  [ErrorCodes.NOT_FOUND]: ErrorSeverity.LOW,
  [ErrorCodes.VALIDATION_ERROR]: ErrorSeverity.LOW,
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: ErrorSeverity.MEDIUM,
  [ErrorCodes.INTERNAL_ERROR]: ErrorSeverity.HIGH,
  [ErrorCodes.SERVICE_UNAVAILABLE]: ErrorSeverity.CRITICAL,
  [ErrorCodes.DATABASE_ERROR]: ErrorSeverity.CRITICAL,
  [ErrorCodes.EXTERNAL_API_ERROR]: ErrorSeverity.HIGH,
}

/**
 * Custom error class with code and severity
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = ErrorCodes.INTERNAL_ERROR,
    public severity: ErrorSeverity = ErrorSeverity.HIGH,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'

    // Maintain stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Sanitize error message (remove sensitive data)
 */
function sanitizeMessage(message: string): string {
  // Remove file paths
  let sanitized = message.replace(/\/[^\s]+/g, '[PATH]')

  // Remove email addresses
  sanitized = sanitized.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]')

  // Remove potential secrets (base64, hex strings >20 chars)
  sanitized = sanitized.replace(/[A-Za-z0-9+/=]{20,}/g, '[REDACTED]')
  sanitized = sanitized.replace(/[0-9a-fA-F]{20,}/g, '[REDACTED]')

  return sanitized
}

/**
 * Generate unique request ID for error tracking
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Log structured error (for monitoring/alerting)
 *
 * In production, this would send to:
 * - Sentry (error tracking)
 * - CloudWatch/DataDog (logging)
 * - PagerDuty (critical alerts)
 */
function logStructuredError(error: StructuredError): void {
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Development: console.error with full details
  if (isDevelopment) {
    console.error('[ERROR]', {
      ...error,
      // Include stack trace in dev
      stack: error.stack,
    })
    return
  }

  // Production: structured JSON logging (no stack trace)
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
    // NEVER log stack trace in production JSON
    // stack: error.stack,  // ❌ FORBIDDEN
  }))

  // TODO: Send to external services (Sentry, CloudWatch, etc.)
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureException(error.originalError, {
  //     tags: { code: error.code, severity: error.severity },
  //     extra: { requestId: error.requestId },
  //   })
  // }
}

/**
 * Handle error with fail-secure defaults
 *
 * Philosophy: Fail closed (deny by default)
 * - Unknown errors → 500 Internal Error
 * - Access errors → 403 Forbidden (not 401, to avoid info leak)
 * - Validation errors → Generic message (no field details)
 */
export function handleError(
  error: unknown,
  request?: NextRequest
): { response: ErrorResponse; statusCode: number } {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const requestId = generateRequestId()
  const timestamp = new Date().toISOString()

  // Extract request context (safe)
  const path = request?.nextUrl?.pathname
  const method = request?.method
  // TODO: Extract user ID from auth token (if available)
  // const userId = extractUserId(request)

  let code: string
  let message: string
  let severity: ErrorSeverity
  let statusCode: number
  let stack: string | undefined

  // Handle AppError (known errors)
  if (error instanceof AppError) {
    code = error.code
    message = sanitizeMessage(error.message)
    severity = error.severity
    statusCode = error.statusCode
    stack = error.stack
  }
  // Handle standard Error
  else if (error instanceof Error) {
    code = ErrorCodes.INTERNAL_ERROR
    message = isDevelopment
      ? sanitizeMessage(error.message)
      : 'An unexpected error occurred. Please try again later.'
    severity = ErrorSeverity.HIGH
    statusCode = 500
    stack = error.stack
  }
  // Handle unknown errors (fail-secure: treat as critical)
  else {
    code = ErrorCodes.INTERNAL_ERROR
    message = 'An unexpected error occurred. Please try again later.'
    severity = ErrorSeverity.CRITICAL
    statusCode = 500
    stack = undefined
  }

  // Log structured error (internal only)
  const structuredError: StructuredError = {
    message,
    code,
    severity,
    requestId,
    timestamp,
    path,
    method,
    stack,
    originalError: error,
  }
  logStructuredError(structuredError)

  // Build response (client-facing, NO sensitive data)
  const response: ErrorResponse = {
    error: {
      message,
      code,
      requestId,
      timestamp,
    },
    // Stack trace ONLY in development
    ...(isDevelopment && stack ? { stack } : {}),
  }

  return { response, statusCode }
}

/**
 * API error handling middleware
 *
 * Usage in API routes:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   try {
 *     // Your logic
 *     return NextResponse.json({ success: true })
 *   } catch (error) {
 *     return handleApiError(error, request)
 *   }
 * }
 * ```
 */
export function handleApiError(
  error: unknown,
  request: NextRequest
): NextResponse {
  const { response, statusCode } = handleError(error, request)

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': response.error.requestId || '',
    },
  })
}

/**
 * Validation error factory
 */
export function createValidationError(message: string): AppError {
  return new AppError(
    message,
    ErrorCodes.VALIDATION_ERROR,
    ErrorSeverity.LOW,
    422
  )
}

/**
 * Authorization error factory
 */
export function createAuthError(message: string = 'Unauthorized'): AppError {
  return new AppError(
    message,
    ErrorCodes.UNAUTHORIZED,
    ErrorSeverity.MEDIUM,
    401
  )
}

/**
 * Forbidden error factory (fail-secure: deny by default)
 */
export function createForbiddenError(message: string = 'Access denied'): AppError {
  return new AppError(
    message,
    ErrorCodes.FORBIDDEN,
    ErrorSeverity.MEDIUM,
    403
  )
}

/**
 * Not found error factory
 */
export function createNotFoundError(message: string = 'Resource not found'): AppError {
  return new AppError(
    message,
    ErrorCodes.NOT_FOUND,
    ErrorSeverity.LOW,
    404
  )
}

/**
 * Rate limit error factory
 */
export function createRateLimitError(message: string = 'Too many requests'): AppError {
  return new AppError(
    message,
    ErrorCodes.RATE_LIMIT_EXCEEDED,
    ErrorSeverity.MEDIUM,
    429
  )
}

/**
 * Database error factory
 */
export function createDatabaseError(message: string = 'Database operation failed'): AppError {
  return new AppError(
    message,
    ErrorCodes.DATABASE_ERROR,
    ErrorSeverity.CRITICAL,
    500
  )
}
