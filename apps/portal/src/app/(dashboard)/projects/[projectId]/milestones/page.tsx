import { notFound } from 'next/navigation'
import { hasProjectAccess, requirePortalAuth } from '@roosevelt/portal-auth'
import { createServiceClient } from '@/lib/supabase'
import {
  MilestoneTimeline,
  type Deliverable,
  type Milestone,
} from '@/components/milestones/MilestoneTimeline'

export const dynamic = 'force-dynamic'

const SIGNED_URL_EXPIRES_IN = 3600 // 1 hour

interface Props {
  params: Promise<{ projectId: string }>
}

export default async function MilestonesPage({ params }: Props) {
  const { projectId } = await params
  const user = await requirePortalAuth()

  if (!hasProjectAccess(user, projectId)) {
    notFound()
  }

  const supabase = createServiceClient()

  // Fetch published milestones for this project/org (service role + explicit org filter)
  const { data: rawMilestones, error: milestoneError } = await supabase
    .from('project_milestones')
    .select('id, title, description, due_date, status')
    .eq('project_id', projectId)
    .eq('organization_id', user.orgId)
    .eq('published', true)
    .order('sort_order', { ascending: true })

  if (milestoneError) {
    throw new Error('Kon mijlpalen niet laden')
  }

  if (!rawMilestones || rawMilestones.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold mb-6">Projectvoortgang</h1>
        <MilestoneTimeline milestones={[]} />
      </div>
    )
  }

  const milestoneIds = rawMilestones.map((m) => m.id)

  // Fetch published deliverables for these milestones
  const { data: rawDeliverables, error: deliverableError } = await supabase
    .from('project_deliverables')
    .select('id, milestone_id, title, status, file_path, file_name')
    .in('milestone_id', milestoneIds)
    .eq('organization_id', user.orgId)
    .eq('published', true)

  if (deliverableError) {
    throw new Error('Kon deliverables niet laden')
  }

  // Generate signed URLs for approved deliverables with a file_path
  const deliverableWithUrls = await Promise.all(
    (rawDeliverables ?? []).map(async (d) => {
      if (d.status === 'approved' && d.file_path) {
        const { data: signedData } = await supabase.storage
          .from('deliverables')
          .createSignedUrl(d.file_path, SIGNED_URL_EXPIRES_IN)
        return { ...d, downloadUrl: signedData?.signedUrl ?? null }
      }
      return { ...d, downloadUrl: null }
    })
  )

  // Group deliverables by milestone
  const deliverablesByMilestone = deliverableWithUrls.reduce<Record<string, Deliverable[]>>(
    (acc, d) => {
      const list = acc[d.milestone_id] ?? []
      return {
        ...acc,
        [d.milestone_id]: [
          ...list,
          {
            id: d.id,
            title: d.title,
            status: d.status as Deliverable['status'],
            file_name: d.file_name,
            downloadUrl: d.downloadUrl,
          },
        ],
      }
    },
    {}
  )

  const milestones: Milestone[] = rawMilestones.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    due_date: m.due_date,
    status: m.status as Milestone['status'],
    deliverables: deliverablesByMilestone[m.id] ?? [],
  }))

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Projectvoortgang</h1>
      <MilestoneTimeline milestones={milestones} />
    </div>
  )
}
