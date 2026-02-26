import { clerkClient } from '@clerk/nextjs/server'
import type { MagicLinkInviteParams, MagicLinkInviteResult } from './types'

const DEFAULT_ROLE = 'client'
const DEFAULT_EXPIRES_HOURS = 24
const MS_PER_HOUR = 60 * 60 * 1000

/**
 * Create a magic link invitation for a client to join the portal.
 *
 * Sends an organization invitation via Clerk with portal-specific metadata
 * (role, project access, expiration) stored in publicMetadata.
 *
 * The client receives an email with a magic link. Upon clicking,
 * Clerk handles sign-in/sign-up and adds them to the organization.
 */
export async function createMagicLinkInvite(
  params: MagicLinkInviteParams
): Promise<MagicLinkInviteResult> {
  const {
    email,
    organizationId,
    projectIds,
    role = DEFAULT_ROLE,
    expiresInHours = DEFAULT_EXPIRES_HOURS,
  } = params

  const clerk = await clerkClient()

  const invitation = await clerk.organizations.createOrganizationInvitation({
    organizationId,
    emailAddress: email,
    role: 'org:member',
    publicMetadata: {
      portalRole: role,
      projectIds,
      expiresAt: new Date(Date.now() + expiresInHours * MS_PER_HOUR).toISOString(),
    },
  })

  return {
    invitationId: invitation.id,
    email,
    status: invitation.status ?? 'pending',
  }
}
