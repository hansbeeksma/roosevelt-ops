/**
 * Portal authentication types.
 *
 * Defines the contract for portal user data and magic link invitations.
 * Used by the client portal to authenticate external clients via Clerk.
 */

export interface PortalUser {
  readonly id: string
  readonly email: string
  readonly firstName: string | null
  readonly lastName: string | null
  readonly orgId: string
  readonly projectIds: readonly string[]
  readonly role: string
}

export interface MagicLinkInviteParams {
  readonly email: string
  readonly organizationId: string
  readonly projectIds: readonly string[]
  readonly role?: string
  readonly expiresInHours?: number
}

export interface MagicLinkInviteResult {
  readonly invitationId: string
  readonly email: string
  readonly status: string
}

/**
 * Public metadata stored on Clerk organization membership.
 * Used to pass portal-specific data (role, project access) through Clerk.
 */
export interface PortalMembershipMetadata {
  readonly portalRole: string
  readonly projectIds: readonly string[]
  readonly expiresAt: string
}
