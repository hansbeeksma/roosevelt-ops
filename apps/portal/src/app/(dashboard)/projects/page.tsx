import { auth, currentUser } from '@clerk/nextjs/server'

export default async function ProjectsPage() {
  const { userId, orgId } = await auth()
  const user = await currentUser()

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Mijn Projecten</h1>
      <p className="text-sm text-gray-500">
        Welkom {user?.firstName ?? 'klant'}. Jouw organisatie: {orgId ?? 'onbekend'}
      </p>
      {/* Project lijst volgt via ROOSE-352 (client auth, magic links) */}
      <div className="mt-6 p-4 border rounded-lg text-sm text-gray-400">
        Project milestone views worden geladen... (ROOSE-355)
      </div>
    </div>
  )
}
