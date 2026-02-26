import { cn } from '@/lib/utils'

interface Deliverable {
  id: string
  title: string
  status: 'pending' | 'uploaded' | 'in_review' | 'approved'
  file_name?: string | null
}

interface Milestone {
  id: string
  title: string
  description?: string | null
  due_date?: string | null
  status: 'on_track' | 'at_risk' | 'delayed' | 'completed'
  deliverables: Deliverable[]
}

const statusConfig = {
  on_track: { label: 'Op schema', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  at_risk: { label: 'Risico', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  delayed: { label: 'Vertraagd', color: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
  completed: { label: 'Afgerond', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
}

const deliverableStatus = {
  pending: 'text-gray-500',
  uploaded: 'text-blue-600',
  in_review: 'text-yellow-600',
  approved: 'text-green-600',
}

const deliverableLabel = {
  pending: 'Gepland',
  uploaded: 'Geüpload',
  in_review: 'In review',
  approved: 'Goedgekeurd',
}

export function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
  if (milestones.length === 0) {
    return (
      <p className="text-center py-12 text-gray-400 text-sm">Nog geen mijlpalen gepubliceerd.</p>
    )
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      <ol className="space-y-8">
        {milestones.map((m) => {
          const cfg = statusConfig[m.status]
          return (
            <li key={m.id} className="relative pl-12">
              <span
                className={cn(
                  'absolute left-2.5 top-1.5 h-3 w-3 rounded-full ring-2 ring-white',
                  cfg.dot
                )}
              />
              <div className="rounded-xl border bg-white shadow-sm p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm">{m.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', cfg.color)}>
                      {cfg.label}
                    </span>
                    {m.due_date && (
                      <span className="text-xs text-gray-400">
                        {new Date(m.due_date).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    )}
                  </div>
                </div>
                {m.description && <p className="text-xs text-gray-500 mb-3">{m.description}</p>}
                {m.deliverables.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                      Deliverables
                    </p>
                    {m.deliverables.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center gap-2 py-1 border-b last:border-0"
                      >
                        <span className={cn('text-xs font-medium', deliverableStatus[d.status])}>
                          {deliverableLabel[d.status]}
                        </span>
                        <span className="text-sm">{d.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
