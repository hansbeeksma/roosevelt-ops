import { Title, Text } from '@tremor/react'
import { DoraMetrics } from './components/DoraMetrics'
import { PerformanceTier } from './components/PerformanceTier'
import { SpaceScores } from './components/SpaceScores'
import { SpaceSummary } from './components/SpaceSummary'
import { DashboardSummaryCards } from './components/DashboardSummaryCards'

export default function DashboardPage() {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Engineering Metrics Dashboard</Title>
      <Text>Roosevelt OPS - DORA + SPACE Framework</Text>

      <DashboardSummaryCards />

      {/* DORA Metrics Section */}
      <div className="mt-10">
        <Title className="mb-6">DORA Metrics</Title>
        <div className="space-y-6">
          <PerformanceTier />
          <DoraMetrics />
        </div>
      </div>

      {/* SPACE Framework Section */}
      <div className="mt-10">
        <Title className="mb-6">SPACE Framework</Title>
        <div className="space-y-6">
          <SpaceScores />
          <SpaceSummary />
        </div>
      </div>
    </main>
  )
}
