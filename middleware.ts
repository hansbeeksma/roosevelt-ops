/**
 * Next.js Middleware - Auth + API Security
 *
 * Combines:
 * - Clerk authentication (ROOSE-346): protects page routes
 * - CORS + rate limiting (ROOSE-40): secures API routes
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limiter'

/** Public routes that do not require authentication */
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health',
  '/api/webhooks(.*)',
])

/** Production allowed origins */
const PRODUCTION_ORIGINS = ['https://roosevelt-ops.vercel.app', 'https://rooseveltops.com']

/** Development-only origins */
const DEV_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']

function getAllowedOrigins(): Set<string> {
  return new Set([
    ...PRODUCTION_ORIGINS,
    ...(process.env.NODE_ENV === 'development' ? DEV_ORIGINS : []),
  ])
}

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Request-ID',
  'X-Slack-Signature',
  'X-Slack-Request-Timestamp',
]

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') ?? '127.0.0.1'
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true
  return getAllowedOrigins().has(origin)
}

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
    'Access-Control-Max-Age': '86400',
  }
  if (origin && getAllowedOrigins().has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Vary'] = 'Origin'
  }
  return headers
}

function handleApiRoute(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin')

  if (request.method === 'OPTIONS') {
    if (!isOriginAllowed(origin)) {
      return new NextResponse(null, { status: 403 })
    }
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
  }

  if (!isOriginAllowed(origin)) {
    return NextResponse.json(
      { error: { message: 'Origin not allowed', code: 'CORS_ERROR' } },
      { status: 403 }
    )
  }

  const clientIp = getClientIp(request)
  const rateLimitResult = checkRateLimit(clientIp, request.nextUrl.pathname)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
        },
      },
      {
        status: 429,
        headers: {
          ...corsHeaders(origin),
          ...rateLimitHeaders(rateLimitResult),
        },
      }
    )
  }

  const response = NextResponse.next()
  for (const [key, value] of Object.entries(corsHeaders(origin))) {
    response.headers.set(key, value)
  }
  for (const [key, value] of Object.entries(rateLimitHeaders(rateLimitResult))) {
    response.headers.set(key, value)
  }
  return response
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl

  // API routes: apply CORS + rate limiting (auth handled by Clerk JWT in API layer)
  if (pathname.startsWith('/api/')) {
    return handleApiRoute(request) ?? NextResponse.next()
  }

  // Page routes: enforce Clerk authentication
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
