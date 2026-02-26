import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createMagicLinkInvite } from '@roosevelt/portal-auth'
import { z } from 'zod'

const inviteSchema = z.object({
  email: z.string().email(),
  projectIds: z.array(z.string().min(1)).min(1),
})

export async function POST(request: NextRequest) {
  const { userId, orgId, orgRole } = await auth()

  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Alleen org:admin mag clients uitnodigen.
  // Clients krijgen org:member rol — die mogen geen nieuwe invites sturen.
  if (orgRole !== 'org:admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { email, projectIds } = parsed.data

  try {
    const result = await createMagicLinkInvite({
      email,
      organizationId: orgId,
      projectIds,
    })

    // Supabase audit trail wordt bijgewerkt via Clerk webhook (ROOSE-385)
    // nadat de uitnodiging is geaccepteerd en het echte clerk_user_id beschikbaar is.

    return NextResponse.json({ success: true, invitationId: result.invitationId })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 })
  }
}
