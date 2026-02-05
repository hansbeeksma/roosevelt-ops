'use client'

import { Card, Title, AreaChart, BarChart, Grid } from '@tremor/react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SpaceSummaryData {
  week_start: string
  avg_nps: number | null
  avg_work_satisfaction: number | null
  avg_coverage: number | null
  total_commits: number | null
  total_prs_created: number | null
  total_prs_reviewed: number | null
  avg_review_response_minutes: number | null
  cross_team_collaboration_pct: number | null
  avg_focus_time_minutes: number | null
  avg_meeting_time_minutes: number | null
  avg_context_switches: number | null
}

export function SpaceSummary() {
  const [data, setData] = useState<SpaceSummaryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      const { data: summary } = await supabase
        .from('space_summary')
        .select('*')
        .order('week_start', { ascending: true })
        .limit(12)

      if (summary) {
        setData(summary.map(row => ({
          week_start: new Date(row.week_start).toLocaleDateString(),
          avg_nps: row.avg_nps ? parseFloat(row.avg_nps) : null,
          avg_work_satisfaction: row.avg_work_satisfaction ? parseFloat(row.avg_work_satisfaction) : null,
          avg_coverage: row.avg_coverage ? parseFloat(row.avg_coverage) : null,
          total_commits: row.total_commits || null,
          total_prs_created: row.total_prs_created || null,
          total_prs_reviewed: row.total_prs_reviewed || null,
          avg_review_response_minutes: row.avg_review_response_minutes ? parseFloat(row.avg_review_response_minutes) : null,
          cross_team_collaboration_pct: row.cross_team_collaboration_pct ? parseFloat(row.cross_team_collaboration_pct) : null,
          avg_focus_time_minutes: row.avg_focus_time_minutes ? parseFloat(row.avg_focus_time_minutes) : null,
          avg_meeting_time_minutes: row.avg_meeting_time_minutes ? parseFloat(row.avg_meeting_time_minutes) : null,
          avg_context_switches: row.avg_context_switches ? parseFloat(row.avg_context_switches) : null,
        })))
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <Title>SPACE Metrics Trends</Title>
        <div className="mt-4 h-72 flex items-center justify-center">
          <p className="text-gray-500">Loading SPACE metrics...</p>
        </div>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <Title>SPACE Metrics Trends</Title>
        <div className="mt-4 h-72 flex items-center justify-center">
          <p className="text-gray-500">No data available. Start collecting SPACE metrics.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Grid numItemsLg={2} className="gap-6">
        {/* Satisfaction */}
        <Card>
          <Title>Satisfaction - NPS Score</Title>
          <AreaChart
            className="mt-6"
            data={data.filter(d => d.avg_nps !== null)}
            index="week_start"
            categories={["avg_nps"]}
            colors={["blue"]}
            valueFormatter={(value: number) => `${value.toFixed(1)}`}
            yAxisWidth={48}
            minValue={0}
            maxValue={10}
          />
        </Card>

        {/* Performance */}
        <Card>
          <Title>Performance - Code Coverage</Title>
          <AreaChart
            className="mt-6"
            data={data.filter(d => d.avg_coverage !== null)}
            index="week_start"
            categories={["avg_coverage"]}
            colors={["emerald"]}
            valueFormatter={(value: number) => `${value.toFixed(1)}%`}
            yAxisWidth={48}
            minValue={0}
            maxValue={100}
          />
        </Card>
      </Grid>

      <Grid numItemsLg={2} className="gap-6">
        {/* Activity */}
        <Card>
          <Title>Activity - Commits & PRs</Title>
          <BarChart
            className="mt-6"
            data={data.filter(d => d.total_commits !== null)}
            index="week_start"
            categories={["total_commits", "total_prs_created"]}
            colors={["indigo", "violet"]}
            valueFormatter={(value: number) => `${value}`}
            yAxisWidth={48}
          />
        </Card>

        {/* Collaboration */}
        <Card>
          <Title>Collaboration - Review Response Time</Title>
          <AreaChart
            className="mt-6"
            data={data.filter(d => d.avg_review_response_minutes !== null)}
            index="week_start"
            categories={["avg_review_response_minutes"]}
            colors={["amber"]}
            valueFormatter={(value: number) => `${value.toFixed(0)} min`}
            yAxisWidth={48}
          />
        </Card>
      </Grid>

      <Grid numItemsLg={2} className="gap-6">
        {/* Efficiency - Focus Time */}
        <Card>
          <Title>Efficiency - Focus vs Meeting Time</Title>
          <AreaChart
            className="mt-6"
            data={data.filter(d => d.avg_focus_time_minutes !== null)}
            index="week_start"
            categories={["avg_focus_time_minutes", "avg_meeting_time_minutes"]}
            colors={["teal", "rose"]}
            valueFormatter={(value: number) => `${(value / 60).toFixed(1)}h`}
            yAxisWidth={48}
          />
        </Card>

        {/* Efficiency - Context Switches */}
        <Card>
          <Title>Efficiency - Context Switches</Title>
          <BarChart
            className="mt-6"
            data={data.filter(d => d.avg_context_switches !== null)}
            index="week_start"
            categories={["avg_context_switches"]}
            colors={["orange"]}
            valueFormatter={(value: number) => `${value.toFixed(0)} switches`}
            yAxisWidth={48}
          />
        </Card>
      </Grid>
    </div>
  )
}
