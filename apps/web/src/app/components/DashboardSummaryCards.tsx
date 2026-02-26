'use client'

import { Card, Text, Metric, Flex, BadgeDelta, Grid } from '@tremor/react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SpaceScoreRow {
  dimension: string
  current_score: number
  trend: string
  benchmark: string
}

interface DoraSummaryRow {
  date: string
  deployments: number
  avg_lead_time_hours: number
  change_failure_rate_pct: number
}

interface SummaryData {
  sprintLabel: string
  velocity: number | null
  activeTasks: number | null
  codeCoverage: number | null
}

function calculateSprintWeek(): string {
  // Sprint start: 2026-01-05 (first Monday of 2026), 12-week cadence
  const SPRINT_START = new Date('2026-01-05T00:00:00Z')
  const SPRINT_DURATION_WEEKS = 12

  const now = new Date()
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weeksSinceStart = Math.floor((now.getTime() - SPRINT_START.getTime()) / msPerWeek)
  const currentWeek = (weeksSinceStart % SPRINT_DURATION_WEEKS) + 1

  return `Week ${currentWeek} of ${SPRINT_DURATION_WEEKS}`
}

function CardSkeleton({ label }: { label: string }) {
  return (
    <Card>
      <Text>{label}</Text>
      <div className="mt-2 h-8 w-24 bg-gray-200 rounded animate-pulse" />
      <Flex className="mt-4">
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
      </Flex>
    </Card>
  )
}

function getCoverageDelta(coverage: number | null): {
  label: string
  type: 'moderateIncrease' | 'moderateDecrease' | 'unchanged'
} {
  if (coverage === null) return { label: 'No data', type: 'unchanged' }
  if (coverage >= 80) return { label: 'At Target', type: 'moderateIncrease' }
  if (coverage >= 70) return { label: 'Near Target', type: 'moderateIncrease' }
  return { label: 'Below Target', type: 'moderateDecrease' }
}

function getVelocityDelta(velocity: number | null): {
  label: string
  type: 'moderateIncrease' | 'moderateDecrease' | 'unchanged'
} {
  if (velocity === null) return { label: 'No data', type: 'unchanged' }
  // Commits/week: >50 = High, 20-50 = Moderate, <20 = Low
  if (velocity >= 50) return { label: 'High Activity', type: 'moderateIncrease' }
  if (velocity >= 20) return { label: 'Moderate', type: 'unchanged' }
  return { label: 'Low Activity', type: 'moderateDecrease' }
}

export function DashboardSummaryCards() {
  const [data, setData] = useState<SummaryData>({
    sprintLabel: calculateSprintWeek(),
    velocity: null,
    activeTasks: null,
    codeCoverage: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSummaryData() {
      const supabase = createClient()

      try {
        // Fetch SPACE scores for coverage metric
        const { data: spaceData, error: spaceError } = await supabase.rpc('get_space_scores', {
          p_weeks: 4,
        })

        if (spaceError) {
          throw new Error(`SPACE scores fetch failed: ${spaceError.message}`)
        }

        // Fetch recent DORA summary for velocity (commits proxy) and active tasks
        const { data: doraData, error: doraError } = await supabase
          .from('dora_summary')
          .select('date, deployments, avg_lead_time_hours, change_failure_rate_pct')
          .order('date', { ascending: false })
          .limit(7)

        if (doraError) {
          throw new Error(`DORA summary fetch failed: ${doraError.message}`)
        }

        const spaceRows: SpaceScoreRow[] = spaceData ?? []
        const doraRows: DoraSummaryRow[] = doraData ?? []

        // Extract code coverage from SPACE scores
        const coverageRow = spaceRows.find((r) => r.dimension === 'Performance (Coverage)')
        const codeCoverage = coverageRow?.current_score ?? null

        // Velocity: total deployments over last 7 days as activity proxy
        const totalDeployments =
          doraRows.length > 0 ? doraRows.reduce((sum, r) => sum + (r.deployments ?? 0), 0) : null

        // Active tasks: count of days with deployments in last 7 days
        const activeDays =
          doraRows.length > 0 ? doraRows.filter((r) => (r.deployments ?? 0) > 0).length : null

        setData({
          sprintLabel: calculateSprintWeek(),
          velocity: totalDeployments,
          activeTasks: activeDays,
          codeCoverage,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchSummaryData()
  }, [])

  if (loading) {
    return (
      <Grid numItemsMd={2} numItemsLg={4} className="gap-6 mt-6">
        <CardSkeleton label="Current Sprint" />
        <CardSkeleton label="Deployments (7d)" />
        <CardSkeleton label="Active Days" />
        <CardSkeleton label="Code Coverage" />
      </Grid>
    )
  }

  if (error) {
    return (
      <Grid numItemsMd={2} numItemsLg={4} className="gap-6 mt-6">
        <Card className="col-span-full">
          <Text className="text-red-500">Dashboard data unavailable: {error}</Text>
        </Card>
      </Grid>
    )
  }

  const coverageDelta = getCoverageDelta(data.codeCoverage)
  const velocityDelta = getVelocityDelta(data.velocity)

  return (
    <Grid numItemsMd={2} numItemsLg={4} className="gap-6 mt-6">
      <Card>
        <Text>Current Sprint</Text>
        <Metric>{data.sprintLabel}</Metric>
        <Flex className="mt-4">
          <Text>12-week cadence</Text>
          <BadgeDelta deltaType="unchanged">Active</BadgeDelta>
        </Flex>
      </Card>

      <Card>
        <Text>Deployments (7d)</Text>
        <Metric>{data.velocity !== null ? `${data.velocity}` : '—'}</Metric>
        <Flex className="mt-4">
          <Text>Last 7 days total</Text>
          <BadgeDelta deltaType={velocityDelta.type}>{velocityDelta.label}</BadgeDelta>
        </Flex>
      </Card>

      <Card>
        <Text>Active Days</Text>
        <Metric>{data.activeTasks !== null ? `${data.activeTasks}` : '—'}</Metric>
        <Flex className="mt-4">
          <Text>Days with deployments</Text>
          <BadgeDelta deltaType="unchanged">
            {data.activeTasks !== null ? 'Tracked' : 'No data'}
          </BadgeDelta>
        </Flex>
      </Card>

      <Card>
        <Text>Code Coverage</Text>
        <Metric>{data.codeCoverage !== null ? `${data.codeCoverage.toFixed(1)}%` : '—'}</Metric>
        <Flex className="mt-4">
          <Text>Target: 80%</Text>
          <BadgeDelta deltaType={coverageDelta.type}>{coverageDelta.label}</BadgeDelta>
        </Flex>
      </Card>
    </Grid>
  )
}
