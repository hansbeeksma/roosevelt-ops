import { auth } from '@clerk/nextjs/server'

export async function requireClientAuth() {
  const { userId, orgId, orgRole } = await auth()
  if (!userId) throw new Error('Not authenticated')
  if (!orgId) throw new Error('No organization')
  return { userId, orgId, orgRole }
}

export async function isClientRole(): Promise<boolean> {
  const { orgRole } = await auth()
  return orgRole === 'org:client'
}
