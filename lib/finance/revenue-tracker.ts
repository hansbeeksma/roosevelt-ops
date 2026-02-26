/**
 * Revenue Tracker
 *
 * Tracks revenue entries by client, month, and category for Roosevelt OPS.
 * Supports MRR calculation, YTD aggregation, and 3-month rolling projections.
 *
 * Currency: EUR | Month format: 'YYYY-MM'
 */

import { createClient } from '@/lib/supabase/server'

// ── Types ─────────────────────────────────────────────────────────────────────

export type RevenueCategory = 'consulting' | 'retainer' | 'project'

export interface RevenueEntry {
  id: string
  clientId: string
  clientName: string
  amount: number
  month: string
  category: RevenueCategory
  invoiceId: string | null
  createdAt: string
}

export interface YTDRevenue {
  total: number
  byClient: Record<string, number>
  byMonth: Record<string, number>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the current month in 'YYYY-MM' format. */
function currentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/** Returns the start of the current calendar year in 'YYYY-MM' format. */
function yearStart(): string {
  return `${new Date().getFullYear()}-01`
}

/** Returns the 'YYYY-MM' string for N months ago. */
function monthsAgo(n: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function mapRow(row: Record<string, unknown>): RevenueEntry {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    clientName: (row.client_name as string | null) ?? '',
    amount: Number(row.amount),
    month: row.month as string,
    category: row.category as RevenueCategory,
    invoiceId: (row.invoice_id as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Fetch all revenue entries for a given month (format: 'YYYY-MM').
 */
export async function getMonthlyRevenue(month: string): Promise<RevenueEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('revenue_entries')
    .select('id, client_id, client_name, amount, month, category, invoice_id, created_at')
    .eq('month', month)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch revenue for month ${month}: ${error.message}`)
  }

  return (data ?? []).map(mapRow)
}

/**
 * Fetch revenue entries for a specific client over the last N months.
 *
 * @param clientId - UUID of the client
 * @param months   - Number of months to look back (default: 12)
 */
export async function getRevenueByClient(
  clientId: string,
  months: number = 12
): Promise<RevenueEntry[]> {
  const supabase = await createClient()
  const from = monthsAgo(months)
  const to = currentMonth()

  const { data, error } = await supabase
    .from('revenue_entries')
    .select('id, client_id, client_name, amount, month, category, invoice_id, created_at')
    .eq('client_id', clientId)
    .gte('month', from)
    .lte('month', to)
    .order('month', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch revenue for client ${clientId}: ${error.message}`)
  }

  return (data ?? []).map(mapRow)
}

/**
 * Get year-to-date revenue aggregated by client and month.
 *
 * Returns:
 * - total:    combined EUR revenue since January 1st
 * - byClient: map of clientId -> total EUR
 * - byMonth:  map of 'YYYY-MM' -> total EUR
 */
export async function getYTDRevenue(): Promise<YTDRevenue> {
  const supabase = await createClient()
  const start = yearStart()
  const end = currentMonth()

  const { data, error } = await supabase
    .from('revenue_entries')
    .select('client_id, amount, month')
    .gte('month', start)
    .lte('month', end)

  if (error) {
    throw new Error(`Failed to fetch YTD revenue: ${error.message}`)
  }

  const entries = data ?? []

  const byClient = entries.reduce<Record<string, number>>((acc, row) => {
    const clientId = row.client_id as string
    const amount = Number(row.amount)
    return {
      ...acc,
      [clientId]: (acc[clientId] ?? 0) + amount,
    }
  }, {})

  const byMonth = entries.reduce<Record<string, number>>((acc, row) => {
    const month = row.month as string
    const amount = Number(row.amount)
    return {
      ...acc,
      [month]: (acc[month] ?? 0) + amount,
    }
  }, {})

  const total = entries.reduce((sum, row) => sum + Number(row.amount), 0)

  return {
    total: Math.round(total * 100) / 100,
    byClient,
    byMonth,
  }
}

/**
 * Project annual revenue based on the average of the last 3 complete months.
 *
 * Formula: avg(last 3 months) * 12
 * Falls back to 0 if no data is available.
 */
export async function getProjectedAnnualRevenue(): Promise<number> {
  const supabase = await createClient()

  // Use months 1-3 months ago (not current month — it may be incomplete)
  const months = [monthsAgo(1), monthsAgo(2), monthsAgo(3)]

  const { data, error } = await supabase
    .from('revenue_entries')
    .select('amount, month')
    .in('month', months)

  if (error) {
    throw new Error(`Failed to fetch data for annual projection: ${error.message}`)
  }

  const entries = data ?? []

  if (entries.length === 0) {
    return 0
  }

  const byMonth = entries.reduce<Record<string, number>>((acc, row) => {
    const month = row.month as string
    const amount = Number(row.amount)
    return {
      ...acc,
      [month]: (acc[month] ?? 0) + amount,
    }
  }, {})

  const totalsPerMonth = Object.values(byMonth)
  const averageMonthly = totalsPerMonth.reduce((sum, v) => sum + v, 0) / totalsPerMonth.length

  return Math.round(averageMonthly * 12 * 100) / 100
}

/**
 * Get Monthly Recurring Revenue (MRR) for the current month.
 *
 * Only counts 'retainer' category entries as they represent recurring contracts.
 */
export async function getMRR(): Promise<number> {
  const supabase = await createClient()
  const month = currentMonth()

  const { data, error } = await supabase
    .from('revenue_entries')
    .select('amount')
    .eq('month', month)
    .eq('category', 'retainer')

  if (error) {
    throw new Error(`Failed to fetch MRR for ${month}: ${error.message}`)
  }

  const total = (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0)
  return Math.round(total * 100) / 100
}

/**
 * Get revenue breakdown by client for the current month,
 * enriched with client names for display.
 *
 * Returns array of { clientId, clientName, total, percentage } sorted by total desc.
 */
export async function getMonthlyRevenueByClient(): Promise<
  Array<{ clientId: string; clientName: string; total: number; percentage: number }>
> {
  const month = currentMonth()
  const entries = await getMonthlyRevenue(month)

  if (entries.length === 0) {
    return []
  }

  const grouped = entries.reduce<
    Record<string, { clientId: string; clientName: string; total: number }>
  >((acc, entry) => {
    const existing = acc[entry.clientId]
    if (existing) {
      return {
        ...acc,
        [entry.clientId]: {
          ...existing,
          total: existing.total + entry.amount,
        },
      }
    }
    return {
      ...acc,
      [entry.clientId]: {
        clientId: entry.clientId,
        clientName: entry.clientName,
        total: entry.amount,
      },
    }
  }, {})

  const grandTotal = Object.values(grouped).reduce((sum, g) => sum + g.total, 0)

  return Object.values(grouped)
    .map((g) => ({
      ...g,
      percentage: grandTotal > 0 ? Math.round((g.total / grandTotal) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total)
}
