import { auth, currentUser } from '@clerk/nextjs/server'

/**
 * Get authenticated user or throw.
 * Use in Server Components and Route Handlers that require auth.
 */
export async function getAuthOrRedirect() {
  const { userId, orgId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return { userId, orgId }
}

/**
 * Get current user profile (nullable).
 * Returns a simplified user object or null if not authenticated.
 * Combines user data from currentUser() with orgId from auth().
 */
export async function getCurrentUser() {
  const [user, { orgId }] = await Promise.all([currentUser(), auth()])
  if (!user) return null
  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    orgId: orgId ?? null,
  }
}
