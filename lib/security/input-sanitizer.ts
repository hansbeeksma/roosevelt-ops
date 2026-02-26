/**
 * Input Sanitization & Validation (ROOSE-38)
 *
 * OWASP Top 10 2025 coverage:
 * - A03: Injection — SQL-safe search, HTML stripping
 * - A10: SSRF — URL validation with domain allowlist
 *
 * All functions are pure and immutable (no side effects).
 */

import { z } from 'zod'

// ── String sanitization ──────────────────────────────────────────────────────

/**
 * Strip HTML tags and trim whitespace from a string.
 * Prevents stored XSS when input is later rendered.
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/&[a-z]+;/gi, ' ') // replace HTML entities with space
    .trim()
}

// ── Email validation ─────────────────────────────────────────────────────────

/**
 * Validate an email address against a simplified RFC 5322 pattern.
 * Rejects addresses with quoted local parts and comments for simplicity.
 */
export function validateEmail(email: string): boolean {
  // RFC 5322 simplified: local@domain.tld
  // Allows alphanumeric, dots, hyphens, underscores, plus signs in local part
  const pattern =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
  return pattern.test(email.trim())
}

// ── URL validation (SSRF prevention) ─────────────────────────────────────────

/**
 * Validate a URL, blocking private/internal network ranges to prevent SSRF.
 *
 * @param url            - URL string to validate
 * @param allowedDomains - Optional allowlist of hostnames (e.g. ['api.github.com'])
 */
export function validateUrl(url: string, allowedDomains?: string[]): boolean {
  let parsed: URL

  try {
    parsed = new URL(url)
  } catch {
    return false
  }

  // Only allow https (and http in development)
  const allowedProtocols = new Set(['https:'])
  if (process.env.NODE_ENV === 'development') {
    allowedProtocols.add('http:')
  }

  if (!allowedProtocols.has(parsed.protocol)) {
    return false
  }

  const hostname = parsed.hostname.toLowerCase()

  // Block SSRF targets: loopback, private ranges, metadata endpoints
  const blockedPatterns = [
    /^localhost$/,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^169\.254\./, // link-local / AWS metadata
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
    /^0\.0\.0\.0$/,
    /metadata\.google\.internal/,
  ]

  for (const pattern of blockedPatterns) {
    if (pattern.test(hostname)) {
      return false
    }
  }

  // If an allowlist is provided, enforce it
  if (allowedDomains && allowedDomains.length > 0) {
    return allowedDomains.some(
      (domain) => hostname === domain.toLowerCase() || hostname.endsWith(`.${domain.toLowerCase()}`)
    )
  }

  return true
}

// ── Search query sanitization ────────────────────────────────────────────────

/**
 * Sanitize a search query to be safe for use in database LIKE/ILIKE clauses.
 *
 * - Strips HTML
 * - Escapes SQL wildcard characters (%, _)
 * - Removes null bytes
 * - Truncates to a safe maximum length
 */
export function sanitizeSearchQuery(query: string, maxLength = 200): string {
  return sanitizeString(query)
    .replace(/\0/g, '') // remove null bytes
    .replace(/%/g, '\\%') // escape LIKE wildcard
    .replace(/_/g, '\\_') // escape LIKE single-char wildcard
    .slice(0, maxLength)
}

// ── Zod schemas ──────────────────────────────────────────────────────────────

/**
 * Common reusable Zod schemas for request validation.
 */
export function createZodSchemas() {
  const email = z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email too long')
    .email('Invalid email format')
    .toLowerCase()
    .trim()

  const orgSlug = z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(63, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens')
    .refine((s) => !s.startsWith('-') && !s.endsWith('-'), {
      message: 'Slug cannot start or end with a hyphen',
    })

  const uuid = z.string().uuid('Invalid UUID format')

  const dateRange = z
    .object({
      from: z.string().datetime({ message: 'from must be an ISO 8601 datetime' }),
      to: z.string().datetime({ message: 'to must be an ISO 8601 datetime' }),
    })
    .refine((range) => new Date(range.from) <= new Date(range.to), {
      message: '"from" must be before or equal to "to"',
    })

  const searchQuery = z.string().max(200, 'Search query too long').transform(sanitizeSearchQuery)

  const url = z
    .string()
    .url('Invalid URL format')
    .refine((u) => validateUrl(u), { message: 'URL not allowed (SSRF prevention)' })

  return { email, orgSlug, uuid, dateRange, searchQuery, url }
}
