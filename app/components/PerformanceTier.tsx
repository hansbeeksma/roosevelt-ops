'use client'

import { Card, Title, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge } from '@tremor/react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PerformanceMetric {
  metric: string
  value: string
  tier: string
  target: string
}

export function PerformanceTier() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTier() {
      const supabase = createClient()

      const { data, error } = await supabase.rpc('get_dora_performance_tier', {
        p_repository: 'roosevelt-ops',
        p_days: 7
      })

      if (error) {
        console.error('Error fetching performance tier:', error)
        setLoading(false)
        return
      }

      if (data) {
        setMetrics(data.map((row: any) => ({
          metric: row.metric,
          value: row.value !== null ? row.value.toString() : 'N/A',
          tier: row.tier || 'Unknown',
          target: row.target || 'N/A',
        })))
      }

      setLoading(false)
    }

    fetchTier()
  }, [])

  const getTierColor = (tier: string): "emerald" | "blue" | "yellow" | "red" | "gray" => {
    switch (tier.toLowerCase()) {
      case 'elite':
        return 'emerald'
      case 'high':
        return 'blue'
      case 'medium':
        return 'yellow'
      case 'low':
        return 'red'
      default:
        return 'gray'
    }
  }

  if (loading) {
    return (
      <Card>
        <Title>DORA Performance Tier (Last 7 Days)</Title>
        <div className="mt-4 h-48 flex items-center justify-center">
          <p className="text-gray-500">Loading performance tier...</p>
        </div>
      </Card>
    )
  }

  if (metrics.length === 0) {
    return (
      <Card>
        <Title>DORA Performance Tier (Last 7 Days)</Title>
        <div className="mt-4 h-48 flex items-center justify-center">
          <p className="text-gray-500">No data available for performance tier calculation.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <Title>DORA Performance Tier (Last 7 Days)</Title>
      <Table className="mt-6">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Metric</TableHeaderCell>
            <TableHeaderCell>Current Value</TableHeaderCell>
            <TableHeaderCell>Performance Tier</TableHeaderCell>
            <TableHeaderCell>Elite Target</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {metrics.map((metric) => (
            <TableRow key={metric.metric}>
              <TableCell>{metric.metric}</TableCell>
              <TableCell>{metric.value}</TableCell>
              <TableCell>
                <Badge color={getTierColor(metric.tier)}>
                  {metric.tier}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-500">{metric.target}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
