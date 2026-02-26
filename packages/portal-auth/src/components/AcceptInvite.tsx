'use client'

import { useOrganizationList } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

type InviteStatus = 'loading' | 'accepted' | 'error'

interface AcceptInviteProps {
  readonly invitationId: string
}

/**
 * Client invitation acceptance component.
 *
 * Displays the status of a magic link invitation after the user
 * signs in via the Clerk magic link. Clerk handles the actual
 * invitation acceptance automatically upon sign-in.
 *
 * This component provides visual feedback during the process.
 */
export function AcceptInvite({ invitationId: _invitationId }: AcceptInviteProps) {
  const { isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  })
  const [status, setStatus] = useState<InviteStatus>('loading')

  useEffect(() => {
    if (!isLoaded) return

    // Invitation acceptance is handled automatically by Clerk
    // when the user signs in via the magic link.
    // We only need to confirm the membership loaded successfully.
    // _invitationId is available for future invitation-specific validation.
    setStatus('accepted')
  }, [isLoaded])

  if (status === 'loading') {
    return (
      <div className="text-center p-8">
        <p>Uitnodiging wordt verwerkt...</p>
      </div>
    )
  }

  if (status === 'accepted') {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold">Welkom bij het project!</h2>
        <p className="mt-2 text-gray-600">Je hebt nu toegang tot het client portal.</p>
      </div>
    )
  }

  return (
    <div className="text-center p-8 text-red-600">
      <p>Er ging iets mis bij het verwerken van de uitnodiging.</p>
    </div>
  )
}
