'use client'

import { Card, Title, AreaChart, BarChart } from '@tremor/react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DoraSummary {
  date: string
  deployments: number
  avg_lead_time_hours: number
  change_failure_rate_pct: number
}

interface IncidentMetrics {
  created_at: string
  mttr_hours: number
}

export function DoraMetrics() {
  const [doraData, setDoraData] = useState<DoraSummary[]>([])
  const [incidents, setIncidents] = useState<IncidentMetrics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // Fetch DORA summary data
      const { data: summary } = await supabase
        .from('dora_summary')
        .select('*')
        .order('date', { ascending: true })
        .limit(30)

      // Fetch incident data for MTTR
      const { data: incidentData } = await supabase
        .from('incidents')
        .select('created_at, mttr_hours')
        .order('created_at', { ascending: true })
        .limit(30)

      if (summary) {
        setDoraData(summary.map(row => ({
          date: new Date(row.date).toLocaleDateString(),
          deployments: row.deployments || 0,
          avg_lead_time_hours: parseFloat(row.avg_lead_time_hours) || 0,
          change_failure_rate_pct: parseFloat(row.change_failure_rate_pct) || 0,
        })))
      }

      if (incidentData) {
        setIncidents(incidentData.map(row => ({
          created_at: new Date(row.created_at).toLocaleDateString(),
          mttr_hours: parseFloat(row.mttr_hours) || 0,
        })))
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <Title>DORA Metrics</Title>
        <div className="mt-4 h-72 flex items-center justify-center">
          <p className="text-gray-500">Loading metrics...</p>
        </div>
      </Card>
    )
  }

  if (doraData.length === 0) {
    return (
      <Card>
        <Title>DORA Metrics</Title>
        <div className="mt-4 h-72 flex items-center justify-center">
          <p className="text-gray-500">No data available. Start collecting metrics via GitHub Actions.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <Title>Deployment Frequency</Title>
        <BarChart
          className="mt-6"
          data={doraData}
          index="date"
          categories={["deployments"]}
          colors={["blue"]}
          valueFormatter={(value: number) => `${value} deployments`}
          yAxisWidth={48}
        />
      </Card>

      <Card>
        <Title>Lead Time for Changes</Title>
        <AreaChart
          className="mt-6"
          data={doraData}
          index="date"
          categories={["avg_lead_time_hours"]}
          colors={["indigo"]}
          valueFormatter={(value: number) => `${value.toFixed(1)} hours`}
          yAxisWidth={48}
        />
      </Card>

      <Card>
        <Title>Change Failure Rate</Title>
        <AreaChart
          className="mt-6"
          data={doraData}
          index="date"
          categories={["change_failure_rate_pct"]}
          colors={["rose"]}
          valueFormatter={(value: number) => `${value.toFixed(1)}%`}
          yAxisWidth={48}
        />
      </Card>

      {incidents.length > 0 && (
        <Card>
          <Title>Mean Time to Recovery (MTTR)</Title>
          <AreaChart
            className="mt-6"
            data={incidents}
            index="created_at"
            categories={["mttr_hours"]}
            colors={["amber"]}
            valueFormatter={(value: number) => `${value.toFixed(1)} hours`}
            yAxisWidth={48}
          />
        </Card>
      )}
    </div>
  )
}
