import { OrganizationSwitcher } from '@clerk/nextjs'

/**
 * Organization switcher for multi-tenant navigation.
 * Clerk organization_id maps to tenant_id in Supabase RLS.
 */
export function OrgSwitcher() {
  return (
    <OrganizationSwitcher
      afterSelectOrganizationUrl="/"
      afterCreateOrganizationUrl="/"
      afterLeaveOrganizationUrl="/sign-in"
    />
  )
}
