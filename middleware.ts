/**
 * Next.js Middleware - API Security (ROOSE-40)
 *
 * Centralized security layer:
 * - Rate limiting (per-IP, per-endpoint)
 * - CORS policy (whitelist origins)
 * - Request logging for security monitoring
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limiter";

/** Production allowed origins */
const PRODUCTION_ORIGINS = [
  "https://roosevelt-ops.vercel.app",
  "https://rooseveltops.com",
];

/** Development-only origins */
const DEV_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

/**
 * Get allowed origins (evaluated at runtime for env awareness).
 */
function getAllowedOrigins(): Set<string> {
  return new Set([
    ...PRODUCTION_ORIGINS,
    ...(process.env.NODE_ENV === "development" ? DEV_ORIGINS : []),
  ]);
}

/** Allowed HTTP methods for API routes */
const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

/** Allowed headers for CORS */
const ALLOWED_HEADERS = [
  "Content-Type",
  "Authorization",
  "X-Request-ID",
  "X-Slack-Signature",
  "X-Slack-Request-Timestamp",
];

/**
 * Extract client IP from request headers.
 * Checks common proxy headers in priority order.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take first IP (client IP, before proxies)
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

/**
 * Check if origin is allowed for CORS.
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Same-origin requests have no Origin header
  return getAllowedOrigins().has(origin);
}

/**
 * Build CORS headers for the response.
 */
function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": ALLOWED_METHODS.join(", "),
    "Access-Control-Allow-Headers": ALLOWED_HEADERS.join(", "),
    "Access-Control-Max-Age": "86400", // 24 hours
  };

  // Only set Access-Control-Allow-Origin if origin is allowed
  if (origin && getAllowedOrigins().has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }

  return headers;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  // Only apply to API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // --- CORS Preflight ---
  if (request.method === "OPTIONS") {
    if (!isOriginAllowed(origin)) {
      return new NextResponse(null, { status: 403 });
    }
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  // --- CORS Origin Check ---
  if (!isOriginAllowed(origin)) {
    return NextResponse.json(
      { error: { message: "Origin not allowed", code: "CORS_ERROR" } },
      { status: 403 },
    );
  }

  // --- Rate Limiting ---
  const clientIp = getClientIp(request);
  const rateLimitResult = checkRateLimit(clientIp, pathname);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: {
          message: "Too many requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
        },
      },
      {
        status: 429,
        headers: {
          ...corsHeaders(origin),
          ...rateLimitHeaders(rateLimitResult),
        },
      },
    );
  }

  // --- Continue with CORS + Rate Limit headers ---
  const response = NextResponse.next();

  // Add CORS headers
  for (const [key, value] of Object.entries(corsHeaders(origin))) {
    response.headers.set(key, value);
  }

  // Add rate limit headers
  for (const [key, value] of Object.entries(
    rateLimitHeaders(rateLimitResult),
  )) {
    response.headers.set(key, value);
  }

  return response;
}

/**
 * Matcher: only run middleware on API routes.
 */
export const config = {
  matcher: "/api/:path*",
};
