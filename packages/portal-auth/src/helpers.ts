import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'
import type { PortalMembershipMetadata, PortalUser } from './types'

/**
 * Get the current portal user from Clerk session.
 *
 * Returns null if not authenticated or not part of an organization.
 * Extracts portal-specific metadata (role, project access) from
 * the organization membership's publicMetadata.
 */
export async function getPortalUser(): Promise<PortalUser | null> {
  const user = await currentUser()
  if (!user) return null

  const { orgId } = await auth()
  if (!orgId) return null

  const clerk = await clerkClient()
  const membershipList = await clerk.users.getOrganizationMembershipList({ userId: user.id })
  const membership = membershipList.data.find((m) => m.organization.id === orgId)

  const metadata = membership?.publicMetadata as Partial<PortalMembershipMetadata> | undefined

  // Controleer of de magic link-toegang niet is verlopen (24u na uitnodiging)
  if (metadata?.expiresAt && new Date(metadata.expiresAt) < new Date()) {
    return null
  }

  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? '',
    firstName: user.firstName,
    lastName: user.lastName,
    orgId,
    projectIds: (metadata?.projectIds as string[]) ?? [],
    role: metadata?.portalRole ?? 'client',
  }
}

/**
 * Require portal authentication -- throws if not authenticated.
 *
 * Use in server components and route handlers that must have
 * an authenticated portal user. Throws a descriptive error
 * that can be caught by error boundaries.
 */
export async function requirePortalAuth(): Promise<PortalUser> {
  const user = await getPortalUser()
  if (!user) {
    throw new Error('Portal authentication required')
  }
  return user
}

/**
 * Check if a portal user has access to a specific project.
 *
 * Returns true if the user's projectIds includes the given projectId.
 * Useful for guarding project-specific routes and data.
 */
export function hasProjectAccess(user: PortalUser, projectId: string): boolean {
  return user.projectIds.includes(projectId)
}

/**
 * Require access to a specific project -- throws if not authorized.
 *
 * Combines authentication check with project access verification.
 */
export async function requireProjectAccess(projectId: string): Promise<PortalUser> {
  const user = await requirePortalAuth()
  if (!hasProjectAccess(user, projectId)) {
    throw new Error(`Access denied to project ${projectId}`)
  }
  return user
}
