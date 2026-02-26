'use client'

/**
 * PerformanceCard
 *
 * Displays P50/P90/P99 latency percentiles for API endpoints in a Tremor
 * table. Rows are colour-coded by the P99 value:
 *
 *   green  — P99 < 100 ms  (fast)
 *   yellow — P99 100–500 ms (acceptable)
 *   red    — P99 > 500 ms  (slow, needs attention)
 *
 * The component is intentionally presentational: it accepts pre-fetched data
 * and does not own any loading/fetching state. Wrap it with a server component
 * or SWR/React Query hook for data sourcing.
 */

import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Title,
  Badge,
} from '@tremor/react'
import type { PerformanceSummary } from '../../../../../lib/metrics/performance'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PerformanceRow extends PerformanceSummary {
  endpoint: string
}

export interface PerformanceCardProps {
  /** Pre-fetched endpoint performance summaries, one per row. */
  data: PerformanceRow[]
  /** Optional card title (default: 'API Performance'). */
  title?: string
  /** Optional window label shown in the subtitle (e.g. 'Last 24 hours'). */
  windowLabel?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type LatencyTier = 'green' | 'yellow' | 'red'

function latencyTier(p99Ms: number): LatencyTier {
  if (p99Ms < 100) return 'green'
  if (p99Ms <= 500) return 'yellow'
  return 'red'
}

const TIER_LABELS: Record<LatencyTier, string> = {
  green: 'Fast',
  yellow: 'Acceptable',
  red: 'Slow',
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`
  return `${ms} ms`
}

function formatErrorRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PerformanceCard({
  data,
  title = 'API Performance',
  windowLabel,
}: PerformanceCardProps) {
  if (data.length === 0) {
    return (
      <Card>
        <Title>{title}</Title>
        <div className="mt-4 flex items-center justify-center h-24">
          <p className="text-tremor-content-subtle text-sm">No performance data available yet.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-start justify-between">
        <Title>{title}</Title>
        {windowLabel && (
          <span className="text-tremor-content-subtle text-xs mt-0.5">{windowLabel}</span>
        )}
      </div>

      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Endpoint</TableHeaderCell>
            <TableHeaderCell className="text-right">P50</TableHeaderCell>
            <TableHeaderCell className="text-right">P90</TableHeaderCell>
            <TableHeaderCell className="text-right">P99</TableHeaderCell>
            <TableHeaderCell className="text-right">Avg</TableHeaderCell>
            <TableHeaderCell className="text-right">Errors</TableHeaderCell>
            <TableHeaderCell className="text-right">Requests</TableHeaderCell>
            <TableHeaderCell className="text-right">Status</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((row) => {
            const tier = latencyTier(row.p99)
            return (
              <TableRow key={row.endpoint}>
                <TableCell>
                  <span className="font-mono text-xs">{row.endpoint}</span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatMs(row.p50)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatMs(row.p90)}</TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {formatMs(row.p99)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-tremor-content-subtle">
                  {formatMs(row.avgMs)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatErrorRate(row.errorRate)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-tremor-content-subtle">
                  {row.requestCount.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Badge color={tier}>{TIER_LABELS[tier]}</Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
