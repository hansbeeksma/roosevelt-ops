import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { InviteClientForm } from './InviteClientForm'

// Placeholder project list — vervangen door echte Plane API call in ROOSE-355
const MOCK_PROJECTS = [
  { id: 'project-alpha', name: 'Project Alpha' },
  { id: 'project-beta', name: 'Project Beta' },
  { id: 'project-gamma', name: 'Project Gamma' },
]

export default async function ClientsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-1">Klanten uitnodigen</h1>
      <p className="text-sm text-gray-500 mb-6">
        Stuur een magic link naar een klant. De link is 24 uur geldig en geeft toegang tot de
        geselecteerde projecten in het client portal.
      </p>

      <InviteClientForm projectOptions={MOCK_PROJECTS} />
    </div>
  )
}
