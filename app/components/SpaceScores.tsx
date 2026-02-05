'use client'

import { Card, Title, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge } from '@tremor/react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SpaceScore {
  dimension: string
  current_score: number
  trend: string
  benchmark: string
}

export function SpaceScores() {
  const [scores, setScores] = useState<SpaceScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchScores() {
      const supabase = createClient()

      const { data, error } = await supabase.rpc('get_space_scores', {
        p_weeks: 4
      })

      if (error) {
        console.error('Error fetching SPACE scores:', error)
        setLoading(false)
        return
      }

      if (data) {
        setScores(data)
      }

      setLoading(false)
    }

    fetchScores()
  }, [])

  const getTrendColor = (trend: string): "emerald" | "blue" | "yellow" | "red" | "gray" => {
    const lowerTrend = trend.toLowerCase()
    if (lowerTrend === 'excellent' || lowerTrend === 'high') return 'emerald'
    if (lowerTrend === 'good' || lowerTrend === 'moderate') return 'blue'
    if (lowerTrend === 'fair') return 'yellow'
    if (lowerTrend === 'poor' || lowerTrend === 'low') return 'red'
    return 'gray'
  }

  if (loading) {
    return (
      <Card>
        <Title>SPACE Framework Scores (Last 4 Weeks)</Title>
        <div className="mt-4 h-48 flex items-center justify-center">
          <p className="text-gray-500">Loading SPACE scores...</p>
        </div>
      </Card>
    )
  }

  if (scores.length === 0) {
    return (
      <Card>
        <Title>SPACE Framework Scores (Last 4 Weeks)</Title>
        <div className="mt-4 h-48 flex items-center justify-center">
          <p className="text-gray-500">No data available for SPACE scores.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <Title>SPACE Framework Scores (Last 4 Weeks)</Title>
      <Table className="mt-6">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Dimension</TableHeaderCell>
            <TableHeaderCell>Current Score</TableHeaderCell>
            <TableHeaderCell>Trend</TableHeaderCell>
            <TableHeaderCell>Benchmark</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {scores.map((score, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{score.dimension}</TableCell>
              <TableCell>{score.current_score.toFixed(1)}</TableCell>
              <TableCell>
                <Badge color={getTrendColor(score.trend)}>
                  {score.trend}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-500">{score.benchmark}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
