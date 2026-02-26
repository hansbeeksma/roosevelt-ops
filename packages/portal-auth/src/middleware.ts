import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/**
 * Public routes that do not require authentication in the portal.
 *
 * - /sign-in: Clerk sign-in page (magic link entry point)
 * - /accept-invite: Invitation acceptance landing page
 * - /api/webhooks: Clerk webhook endpoints
 */
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/accept-invite(.*)',
  '/api/webhooks(.*)',
])

/**
 * Portal authentication middleware.
 *
 * Protects all non-public routes by requiring Clerk authentication.
 * Public routes (sign-in, accept-invite, webhooks) are excluded.
 *
 * Usage in the portal app's middleware.ts:
 *
 * ```ts
 * import { portalAuthMiddleware } from '@roosevelt/portal-auth'
 * export default portalAuthMiddleware
 * export const config = { matcher: [...] }
 * ```
 */
export const portalAuthMiddleware = clerkMiddleware(async (authFn, request) => {
  if (!isPublicRoute(request)) {
    await authFn.protect()
  }
})
