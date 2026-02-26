import { createClient } from '@supabase/supabase-js'
import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'roosevelt-ops',
  name: 'Roosevelt OPS',
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ServiceCostRow {
  service: string
  amount: number
  currency: string
  period: string
  category: string
}

interface CostBudget {
  service: string
  /** Monthly spend ceiling in EUR */
  monthlyLimit: number
  /** 0–1 fraction at which to trigger an alert (e.g. 0.8 = 80%) */
  alertThreshold: number
}

interface BudgetViolation {
  service: string
  currentSpend: number
  limit: number
  percentage: number
  severity: 'warning' | 'critical'
}

// ---------------------------------------------------------------------------
// Budget defaults
// lib/cost/budget-config.ts does not exist on this branch yet — defined
// inline here. When that module lands, replace with:
//   import { DEFAULT_BUDGETS } from '@/lib/cost/budget-config'
// ---------------------------------------------------------------------------

const DEFAULT_BUDGETS: CostBudget[] = [
  { service: 'vercel', monthlyLimit: 50, alertThreshold: 0.8 },
  { service: 'supabase', monthlyLimit: 25, alertThreshold: 0.8 },
  { service: 'anthropic', monthlyLimit: 100, alertThreshold: 0.7 },
  { service: 'github', monthlyLimit: 20, alertThreshold: 0.9 },
  { service: 'sentry', monthlyLimit: 26, alertThreshold: 0.8 },
  { service: 'clerk', monthlyLimit: 25, alertThreshold: 0.8 },
  { service: 'slack', monthlyLimit: 15, alertThreshold: 0.9 },
  { service: 'resend', monthlyLimit: 20, alertThreshold: 0.8 },
]

// ---------------------------------------------------------------------------
// Supabase admin client (no cookie context — runs in Inngest worker)
// ---------------------------------------------------------------------------

function createSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured')
  }

  return createClient(url, key)
}

/** Returns the current month in 'YYYY-MM' format. */
function currentMonthPeriod(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// ---------------------------------------------------------------------------
// Budget evaluation
// ---------------------------------------------------------------------------

function evaluateBudgetViolations(
  costs: ServiceCostRow[],
  budgets: CostBudget[]
): BudgetViolation[] {
  const spendByService = costs.reduce<Record<string, number>>((acc, row) => {
    return {
      ...acc,
      [row.service]: (acc[row.service] ?? 0) + row.amount,
    }
  }, {})

  const violations: BudgetViolation[] = []

  for (const budget of budgets) {
    const currentSpend = spendByService[budget.service] ?? 0
    const percentage = budget.monthlyLimit > 0 ? currentSpend / budget.monthlyLimit : 0

    if (percentage >= budget.alertThreshold) {
      violations.push({
        service: budget.service,
        currentSpend,
        limit: budget.monthlyLimit,
        percentage,
        severity: percentage >= 1 ? 'critical' : 'warning',
      })
    }
  }

  return violations
}

// ---------------------------------------------------------------------------
// Slack alerting
// ---------------------------------------------------------------------------

async function sendSlackBudgetAlert(violations: BudgetViolation[]): Promise<void> {
  const webhookUrl =
    process.env.SLACK_BUDGET_WEBHOOK_URL || process.env.SLACK_MONITORING_WEBHOOK_URL

  if (!webhookUrl) {
    return
  }

  const lines = violations.map((v) => {
    const emoji = v.severity === 'critical' ? ':rotating_light:' : ':warning:'
    const pct = (v.percentage * 100).toFixed(0)
    return `${emoji} *${v.service}*: €${v.currentSpend.toFixed(2)} / €${v.limit} (${pct}%)`
  })

  const text = [
    ':bar_chart: *Roosevelt OPS Daily Budget Report*',
    `${violations.length} service(s) above threshold:`,
    ...lines,
  ].join('\n')

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
}

// ---------------------------------------------------------------------------
// Inngest scheduled function — daily at 09:00
// ---------------------------------------------------------------------------

export const dailyBudgetCheck = inngest.createFunction(
  {
    id: 'daily-budget-check',
    name: 'Daily Budget Check',
    retries: 2,
  },
  { cron: '0 9 * * *' },
  async ({ step }) => {
    const costs = await step.run('fetch-costs', async () => {
      const supabase = createSupabaseAdmin()
      const period = currentMonthPeriod()

      const { data, error } = await supabase
        .from('service_costs')
        .select('service, amount, currency, period, category')
        .eq('period', period)

      if (error) {
        throw new Error(`Failed to fetch service costs: ${error.message}`)
      }

      return (data ?? []) as ServiceCostRow[]
    })

    const violations = await step.run('check-budgets', async () => {
      return evaluateBudgetViolations(costs, DEFAULT_BUDGETS)
    })

    const alertResult = await step.run('send-alerts', async () => {
      if (violations.length === 0) {
        return { action: 'skipped', reason: 'no_violations', violations: 0 }
      }

      await sendSlackBudgetAlert(violations)

      return { action: 'sent', violations: violations.length }
    })

    return {
      checkedAt: new Date().toISOString(),
      period: currentMonthPeriod(),
      servicesEvaluated: costs.length,
      alert: alertResult,
      violations: violations.map((v) => ({
        service: v.service,
        percentage: v.percentage,
        severity: v.severity,
      })),
    }
  }
)
