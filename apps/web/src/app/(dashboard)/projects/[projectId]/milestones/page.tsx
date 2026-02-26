import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { MilestoneTimeline } from '@/components/milestones/MilestoneTimeline'

export default async function MilestonesPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const { orgId } = await auth()
  if (!orgId) return notFound()
  // TODO: Supabase query via server action (ROOSE-352 voegt auth toe)
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Projectvoortgang</h1>
      <MilestoneTimeline milestones={[]} />
    </div>
  )
}
