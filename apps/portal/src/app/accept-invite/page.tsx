import { AcceptInvite } from '@roosevelt/portal-auth'

interface AcceptInvitePageProps {
  searchParams: Promise<{ invitation_id?: string }>
}

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const { invitation_id: invitationId } = await searchParams

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md">
        <AcceptInvite invitationId={invitationId ?? ''} />
      </div>
    </div>
  )
}
