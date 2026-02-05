'use client'

import { Card, Title, Text, Grid, Metric, Flex, BadgeDelta } from '@tremor/react'
import { DoraMetrics } from './components/DoraMetrics'
import { PerformanceTier } from './components/PerformanceTier'
import { SpaceScores } from './components/SpaceScores'
import { SpaceSummary } from './components/SpaceSummary'

export default function DashboardPage() {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Engineering Metrics Dashboard</Title>
      <Text>Roosevelt OPS - DORA + SPACE Framework</Text>

      <Grid numItemsMd={2} numItemsLg={4} className="gap-6 mt-6">
        <Card>
          <Text>Current Sprint</Text>
          <Metric>Week 5 of 12</Metric>
          <Flex className="mt-4">
            <Text>Phase 1 & 2: Complete</Text>
            <BadgeDelta deltaType="moderateIncrease">✅ Done</BadgeDelta>
          </Flex>
        </Card>

        <Card>
          <Text>Team Velocity</Text>
          <Metric>42 pts</Metric>
          <Flex className="mt-4">
            <Text>vs Target: 40 pts</Text>
            <BadgeDelta deltaType="moderateIncrease">+5%</BadgeDelta>
          </Flex>
        </Card>

        <Card>
          <Text>Active Tasks</Text>
          <Metric>8</Metric>
          <Flex className="mt-4">
            <Text>In Progress</Text>
            <BadgeDelta deltaType="unchanged">On Track</BadgeDelta>
          </Flex>
        </Card>

        <Card>
          <Text>Code Coverage</Text>
          <Metric>78.2%</Metric>
          <Flex className="mt-4">
            <Text>Target: 80%</Text>
            <BadgeDelta deltaType="moderateIncrease">Near Target</BadgeDelta>
          </Flex>
        </Card>
      </Grid>

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
