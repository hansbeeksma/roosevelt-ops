// @roosevelt/portal-auth -- Client portal authentication via Clerk magic links

export { createMagicLinkInvite } from './magic-link'
export { portalAuthMiddleware } from './middleware'
export {
  getPortalUser,
  requirePortalAuth,
  hasProjectAccess,
  requireProjectAccess,
} from './helpers'
export { AcceptInvite } from './components/AcceptInvite'
export type {
  PortalUser,
  MagicLinkInviteParams,
  MagicLinkInviteResult,
  PortalMembershipMetadata,
} from './types'
