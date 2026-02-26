import Link from 'next/link'
import { requirePortalAuth } from '@roosevelt/portal-auth'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const user = await requirePortalAuth()

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Mijn Projecten</h1>
      <p className="text-sm text-gray-500 mb-6">Welkom {user.firstName ?? 'klant'}.</p>
      {user.projectIds.length === 0 ? (
        <p className="text-sm text-gray-400">Geen projecten gevonden.</p>
      ) : (
        <ul className="space-y-3">
          {user.projectIds.map((projectId) => (
            <li key={projectId}>
              <Link
                href={`/projects/${projectId}/milestones`}
                className="block rounded-xl border bg-white shadow-sm p-4 hover:border-gray-400 transition-colors"
              >
                <span className="text-sm font-medium">Project voortgang bekijken</span>
                <span className="block text-xs text-gray-400 mt-0.5 font-mono">{projectId}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
