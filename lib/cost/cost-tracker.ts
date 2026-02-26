/**
 * Service Cost Tracker
 *
 * Tracks operational costs across services (Vercel, Supabase, Anthropic, etc.)
 * with budget alerting and monthly totals. Stores data in Supabase.
 *
 * Note: distinct from any AI-specific cost tracker — this covers all services.
 */

import { createClient } from '@/lib/supabase/server'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ServiceName =
  | 'vercel'
  | 'supabase'
  | 'github'
  | 'sentry'
  | 'clerk'
  | 'slack'
  | 'resend'
  | 'anthropic'

export type CostCategory = 'infrastructure' | 'api' | 'tooling'

export interface ServiceCost {
  service: ServiceName
  amount: number
  currency: 'EUR'
  /** Format: 'YYYY-MM' */
  period: string
  category: CostCategory
}

export interface CostBudget {
  service: string
  /** Monthly spend ceiling in EUR */
  monthlyLimit: number
  /** 0–1 fraction at which to trigger an alert (e.g. 0.8 = 80%) */
  alertThreshold: number
}

export interface BudgetAlert {
  service: string
  currentSpend: number
  limit: number
  percentage: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the current month in 'YYYY-MM' format. */
function currentMonthPeriod(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Store a service cost record in Supabase.
 * Inserts a new row each time — callers aggregate by service + period.
 */
export async function recordCost(cost: ServiceCost): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from('service_costs').insert({
    service: cost.service,
    amount: cost.amount,
    currency: cost.currency,
    period: cost.period,
    category: cost.category,
  })

  if (error) {
    throw new Error(`Failed to record cost for ${cost.service}: ${error.message}`)
  }
}

/**
 * Fetch all cost records for the current calendar month.
 */
export async function getCurrentMonthCosts(): Promise<ServiceCost[]> {
  const supabase = await createClient()
  const period = currentMonthPeriod()

  const { data, error } = await supabase
    .from('service_costs')
    .select('service, amount, currency, period, category')
    .eq('period', period)
    .order('recorded_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch current month costs: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    service: row.service as ServiceName,
    amount: Number(row.amount),
    currency: row.currency as 'EUR',
    period: row.period,
    category: row.category as CostCategory,
  }))
}

/**
 * Compare current spend per service against supplied budgets.
 * Returns only entries where spend >= alertThreshold.
 */
export async function checkBudgetAlerts(budgets: CostBudget[]): Promise<BudgetAlert[]> {
  const costs = await getCurrentMonthCosts()

  // Aggregate total spend per service for the current month
  const spendByService = costs.reduce<Record<string, number>>((acc, cost) => {
    return {
      ...acc,
      [cost.service]: (acc[cost.service] ?? 0) + cost.amount,
    }
  }, {})

  return budgets
    .map((budget) => {
      const currentSpend = spendByService[budget.service] ?? 0
      const percentage = budget.monthlyLimit > 0 ? currentSpend / budget.monthlyLimit : 0

      return {
        service: budget.service,
        currentSpend,
        limit: budget.monthlyLimit,
        percentage,
      }
    })
    .filter((alert) => {
      const budget = budgets.find((b) => b.service === alert.service)
      return budget ? alert.percentage >= budget.alertThreshold : false
    })
}

/**
 * Calculate the total EUR spend across all services for a given month.
 *
 * @param month - Period string in 'YYYY-MM' format
 */
export async function getTotalMonthlyCost(month: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('service_costs').select('amount').eq('period', month)

  if (error) {
    throw new Error(`Failed to fetch total cost for ${month}: ${error.message}`)
  }

  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0)
}
