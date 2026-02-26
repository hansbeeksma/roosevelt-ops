'use client'

import {
  Card,
  Title,
  Text,
  BarChart,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  Grid,
  Metric,
  Flex,
} from '@tremor/react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_BUDGETS, TOTAL_MONTHLY_BUDGET } from '@/lib/cost/budget-config'
import type { ServiceCost, BudgetAlert } from '@/lib/cost/cost-tracker'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ServiceTotal {
  service: string
  amount: number
  category: string
}

interface MonthlyTrend {
  month: string
  total: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function currentMonthPeriod(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function previousMonthPeriod(): string {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/** Format EUR amounts with two decimal places. */
function formatEur(amount: number): string {
  return `€${amount.toFixed(2)}`
}

/** Determine badge colour based on budget utilisation percentage. */
function budgetColour(percentage: number): 'green' | 'yellow' | 'red' {
  if (percentage >= 1) return 'red'
  if (percentage >= 0.7) return 'yellow'
  return 'green'
}

/** Compute per-service totals from raw cost rows. */
function aggregateByService(costs: ServiceCost[]): ServiceTotal[] {
  const map = costs.reduce<Record<string, ServiceTotal>>((acc, cost) => {
    if (acc[cost.service]) {
      return {
        ...acc,
        [cost.service]: {
          ...acc[cost.service],
          amount: acc[cost.service].amount + cost.amount,
        },
      }
    }
    return {
      ...acc,
      [cost.service]: {
        service: cost.service,
        amount: cost.amount,
        category: cost.category,
      },
    }
  }, {})

  return Object.values(map).sort((a, b) => b.amount - a.amount)
}

/** Compute budget alerts client-side from fetched costs. */
function computeAlerts(costs: ServiceCost[]): BudgetAlert[] {
  const spendByService = costs.reduce<Record<string, number>>(
    (acc, cost) => ({
      ...acc,
      [cost.service]: (acc[cost.service] ?? 0) + cost.amount,
    }),
    {}
  )

  return DEFAULT_BUDGETS.map((budget) => {
    const currentSpend = spendByService[budget.service] ?? 0
    const percentage = budget.monthlyLimit > 0 ? currentSpend / budget.monthlyLimit : 0
    return { service: budget.service, currentSpend, limit: budget.monthlyLimit, percentage }
  }).filter((alert) => {
    const budget = DEFAULT_BUDGETS.find((b) => b.service === alert.service)
    return budget ? alert.percentage >= budget.alertThreshold : false
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CostsDashboardPage() {
  const [currentCosts, setCurrentCosts] = useState<ServiceCost[]>([])
  const [prevMonthTotal, setPrevMonthTotal] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const currentPeriod = currentMonthPeriod()
      const prevPeriod = previousMonthPeriod()

      const [{ data: current }, { data: previous }] = await Promise.all([
        supabase
          .from('service_costs')
          .select('service, amount, currency, period, category')
          .eq('period', currentPeriod),
        supabase.from('service_costs').select('amount').eq('period', prevPeriod),
      ])

      if (current) {
        setCurrentCosts(
          current.map((row) => ({
            service: row.service,
            amount: Number(row.amount),
            currency: row.currency,
            period: row.period,
            category: row.category,
          }))
        )
      }

      if (previous) {
        setPrevMonthTotal(previous.reduce((sum, row) => sum + Number(row.amount), 0))
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const serviceTotals = aggregateByService(currentCosts)
  const totalThisMonth = currentCosts.reduce((sum, c) => sum + c.amount, 0)
  const alerts = computeAlerts(currentCosts)

  const trendData: MonthlyTrend[] = [
    { month: previousMonthPeriod(), total: prevMonthTotal },
    { month: currentMonthPeriod(), total: totalThisMonth },
  ]

  if (loading) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Title>Cost Monitoring</Title>
        <Text>Loading cost data…</Text>
      </main>
    )
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Cost Monitoring</Title>
      <Text>Monthly operational costs across all services</Text>

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <Grid numItemsMd={3} className="gap-6 mt-6">
        <Card>
          <Text>This Month</Text>
          <Metric>{formatEur(totalThisMonth)}</Metric>
          <Flex className="mt-2">
            <Text>Budget: {formatEur(TOTAL_MONTHLY_BUDGET)}</Text>
            <Badge color={budgetColour(totalThisMonth / TOTAL_MONTHLY_BUDGET)}>
              {Math.round((totalThisMonth / TOTAL_MONTHLY_BUDGET) * 100)}%
            </Badge>
          </Flex>
        </Card>

        <Card>
          <Text>Previous Month</Text>
          <Metric>{formatEur(prevMonthTotal)}</Metric>
          <Flex className="mt-2">
            <Text>Month-over-month</Text>
            <Badge color={totalThisMonth <= prevMonthTotal ? 'green' : 'yellow'}>
              {prevMonthTotal > 0
                ? `${totalThisMonth <= prevMonthTotal ? '↓' : '↑'} ${Math.abs(
                    Math.round(((totalThisMonth - prevMonthTotal) / prevMonthTotal) * 100)
                  )}%`
                : 'No data'}
            </Badge>
          </Flex>
        </Card>

        <Card>
          <Text>Budget Alerts</Text>
          <Metric>{alerts.length}</Metric>
          <Flex className="mt-2">
            <Text>Services over threshold</Text>
            <Badge color={alerts.length === 0 ? 'green' : 'red'}>
              {alerts.length === 0
                ? 'All clear'
                : `${alerts.length} alert${alerts.length > 1 ? 's' : ''}`}
            </Badge>
          </Flex>
        </Card>
      </Grid>

      {/* ── Bar chart: service breakdown ────────────────────────────────────── */}
      <Card className="mt-6">
        <Title>Cost by Service — {currentMonthPeriod()}</Title>
        {serviceTotals.length > 0 ? (
          <BarChart
            className="mt-6"
            data={serviceTotals}
            index="service"
            categories={['amount']}
            colors={['blue']}
            valueFormatter={(v: number) => formatEur(v)}
            yAxisWidth={64}
          />
        ) : (
          <Text className="mt-6 text-center py-12">
            No cost data recorded yet. Use recordCost() to start tracking.
          </Text>
        )}
      </Card>

      {/* ── Month-over-month trend ───────────────────────────────────────────── */}
      <Card className="mt-6">
        <Title>Month-over-Month Trend</Title>
        <BarChart
          className="mt-6"
          data={trendData}
          index="month"
          categories={['total']}
          colors={['indigo']}
          valueFormatter={(v: number) => formatEur(v)}
          yAxisWidth={64}
        />
      </Card>

      {/* ── Budget utilisation ───────────────────────────────────────────────── */}
      <Card className="mt-6">
        <Title>Budget Utilisation</Title>
        <Text>Monthly limits per service with colour-coded thresholds</Text>
        <div className="mt-4 space-y-4">
          {DEFAULT_BUDGETS.map((budget) => {
            const spend = currentCosts
              .filter((c) => c.service === budget.service)
              .reduce((sum, c) => sum + c.amount, 0)
            const pct = budget.monthlyLimit > 0 ? spend / budget.monthlyLimit : 0
            const colour = budgetColour(pct)
            const barColour =
              colour === 'red'
                ? 'bg-red-500'
                : colour === 'yellow'
                  ? 'bg-yellow-400'
                  : 'bg-green-500'

            return (
              <div key={budget.service}>
                <Flex className="mb-1">
                  <Text className="capitalize font-medium">{budget.service}</Text>
                  <Text>
                    {formatEur(spend)} / {formatEur(budget.monthlyLimit)}{' '}
                    <span className={colour === 'red' ? 'text-red-600 font-semibold' : ''}>
                      ({Math.round(pct * 100)}%)
                    </span>
                  </Text>
                </Flex>
                {/* Native progress bar — avoids Tremor ProgressBar version gaps */}
                <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${barColour}`}
                    style={{ width: `${Math.min(pct * 100, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* ── Detailed cost table ──────────────────────────────────────────────── */}
      <Card className="mt-6">
        <Title>Service Detail — {currentMonthPeriod()}</Title>
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Service</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Spend</TableHeaderCell>
              <TableHeaderCell>Budget</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {DEFAULT_BUDGETS.map((budget) => {
              const spend = currentCosts
                .filter((c) => c.service === budget.service)
                .reduce((sum, c) => sum + c.amount, 0)
              const pct = budget.monthlyLimit > 0 ? spend / budget.monthlyLimit : 0
              const colour = budgetColour(pct)

              // Derive category from serviceTotals or fall back to the budget config
              const serviceRow = serviceTotals.find((s) => s.service === budget.service)
              const category = serviceRow?.category ?? '—'

              return (
                <TableRow key={budget.service}>
                  <TableCell className="capitalize font-medium">{budget.service}</TableCell>
                  <TableCell className="capitalize">{category}</TableCell>
                  <TableCell>{formatEur(spend)}</TableCell>
                  <TableCell>{formatEur(budget.monthlyLimit)}</TableCell>
                  <TableCell>
                    <Badge color={colour}>
                      {colour === 'red' ? 'Over limit' : colour === 'yellow' ? 'Near limit' : 'OK'}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </main>
  )
}
