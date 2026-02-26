import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createMagicLinkInvite } from '@roosevelt/portal-auth'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const inviteSchema = z.object({
  email: z.string().email(),
  projectIds: z.array(z.string().min(1)).min(1),
})

export async function POST(request: NextRequest) {
  const { userId, orgId } = await auth()

  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Record access grant in Supabase for audit trail
    const supabase = await createClient()
    const { error: dbError } = await supabase.from('client_project_access').upsert(
      projectIds.map((projectId) => ({
        organization_id: orgId,
        clerk_user_id: result.invitationId, // placeholder until webhook confirms acceptance
        project_id: projectId,
        granted_by: userId,
      })),
      { onConflict: 'organization_id,clerk_user_id,project_id', ignoreDuplicates: true },
    )

    if (dbError) {
      console.error('Failed to record access grant:', dbError)
      // Non-fatal — invitation already sent via Clerk
    }

    return NextResponse.json({ success: true, invitationId: result.invitationId })
  } catch (error) {
    console.error('Portal invite error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send invitation' },
      { status: 500 },
    )
  }
}
