'use client'

import { AreaChart } from '@tremor/react'
import type { MetricsTrendProps } from './types'

export function MetricsTrend({ data, label, unit = '', color = 'blue' }: MetricsTrendProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-400">
        No trend data available
      </div>
    )
  }

  return (
    <AreaChart
      className="h-32 mt-2"
      data={data}
      index="date"
      categories={['value']}
      colors={[color]}
      valueFormatter={(v: number) => `${v.toFixed(1)}${unit ? ` ${unit}` : ''}`}
      showLegend={false}
      showYAxis={false}
      showGradient
      curveType="monotone"
      aria-label={`Trend chart for ${label}`}
    />
  )
}
