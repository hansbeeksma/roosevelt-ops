'use client'

import {
  Badge,
  BadgeDelta,
  Card,
  DonutChart,
  Flex,
  Grid,
  Metric,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
} from '@tremor/react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClientRevenue {
  name: string
  value: number
}

interface OutstandingInvoice {
  id: string
  number: string
  clientName: string
  total: number
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
}

interface FinanceData {
  mrr: number
  ytdTotal: number
  projectedAnnual: number
  clientBreakdown: ClientRevenue[]
  outstandingInvoices: OutstandingInvoice[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatEUR(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function statusBadgeColor(status: OutstandingInvoice['status']): string {
  const map: Record<OutstandingInvoice['status'], string> = {
    draft: 'gray',
    sent: 'blue',
    paid: 'green',
    overdue: 'red',
  }
  return map[status]
}

function statusLabel(status: OutstandingInvoice['status']): string {
  const map: Record<OutstandingInvoice['status'], string> = {
    draft: 'Concept',
    sent: 'Verzonden',
    paid: 'Betaald',
    overdue: 'Achterstallig',
  }
  return map[status]
}

function currentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function monthsAgo(n: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// ── Data Fetching ─────────────────────────────────────────────────────────────

async function fetchFinanceData(): Promise<FinanceData> {
  const supabase = createClient()
  const month = currentMonth()
  const yearStart = `${new Date().getFullYear()}-01`

  // Parallel fetches for performance
  const [mrrResult, ytdResult, outstandingResult, last3MonthsResult] = await Promise.all([
    supabase.from('revenue_entries').select('amount').eq('month', month).eq('category', 'retainer'),

    supabase
      .from('revenue_entries')
      .select('client_id, client_name, amount, month')
      .gte('month', yearStart)
      .lte('month', month),

    supabase
      .from('invoices')
      .select('id, number, client_name, total, due_date, status')
      .in('status', ['sent', 'overdue'])
      .order('due_date', { ascending: true })
      .limit(20),

    supabase
      .from('revenue_entries')
      .select('amount, month')
      .in('month', [monthsAgo(1), monthsAgo(2), monthsAgo(3)]),
  ])

  // MRR: sum of retainer entries for current month
  const mrr = (mrrResult.data ?? []).reduce((sum, r) => sum + Number(r.amount), 0)

  // YTD totals + client breakdown
  const ytdEntries = ytdResult.data ?? []
  const ytdTotal = ytdEntries.reduce((sum, r) => sum + Number(r.amount), 0)

  const clientTotals = ytdEntries.reduce<Record<string, { name: string; total: number }>>(
    (acc, r) => {
      const id = r.client_id as string
      const name = (r.client_name as string | null) ?? id
      const amount = Number(r.amount)
      const existing = acc[id]
      if (existing) {
        return { ...acc, [id]: { name, total: existing.total + amount } }
      }
      return { ...acc, [id]: { name, total: amount } }
    },
    {}
  )

  const clientBreakdown = Object.values(clientTotals)
    .map((c) => ({ name: c.name, value: Math.round(c.total * 100) / 100 }))
    .sort((a, b) => b.value - a.value)

  // Projected annual: avg of last 3 complete months * 12
  const last3 = last3MonthsResult.data ?? []
  const byMonth = last3.reduce<Record<string, number>>((acc, r) => {
    const m = r.month as string
    return { ...acc, [m]: (acc[m] ?? 0) + Number(r.amount) }
  }, {})
  const monthTotals = Object.values(byMonth)
  const avgMonthly =
    monthTotals.length > 0 ? monthTotals.reduce((s, v) => s + v, 0) / monthTotals.length : 0
  const projectedAnnual = Math.round(avgMonthly * 12 * 100) / 100

  // Outstanding invoices
  const outstandingInvoices = (outstandingResult.data ?? []).map((r) => ({
    id: r.id as string,
    number: r.number as string,
    clientName: (r.client_name as string | null) ?? '-',
    total: Number(r.total),
    dueDate: r.due_date as string,
    status: r.status as OutstandingInvoice['status'],
  }))

  return { mrr, ytdTotal, projectedAnnual, clientBreakdown, outstandingInvoices }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FinancePage() {
  const [data, setData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFinanceData()
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Title>Finance Dashboard</Title>
        <Text>Roosevelt OPS — Financieel overzicht</Text>
        <div className="mt-10 flex items-center justify-center h-64">
          <Text>Gegevens laden...</Text>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Title>Finance Dashboard</Title>
        <div className="mt-10">
          <Card>
            <Text className="text-red-500">Fout bij laden: {error}</Text>
          </Card>
        </div>
      </main>
    )
  }

  const { mrr, ytdTotal, projectedAnnual, clientBreakdown, outstandingInvoices } = data ?? {
    mrr: 0,
    ytdTotal: 0,
    projectedAnnual: 0,
    clientBreakdown: [],
    outstandingInvoices: [],
  }

  const ytdVsProjected =
    projectedAnnual > 0 ? Math.round((ytdTotal / projectedAnnual) * 1000) / 10 : 0

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Finance Dashboard</Title>
      <Text>Roosevelt OPS — BTW 21% | EUR | Freelance bureau</Text>

      {/* ── KPI Cards ── */}
      <Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6">
        <Card>
          <Text>MRR (Maandelijks Terugkerend)</Text>
          <Metric>{formatEUR(mrr)}</Metric>
          <Flex className="mt-4">
            <Text>Retainer contracten</Text>
            <BadgeDelta deltaType={mrr > 0 ? 'moderateIncrease' : 'unchanged'}>
              {mrr > 0 ? 'Actief' : 'Geen data'}
            </BadgeDelta>
          </Flex>
        </Card>

        <Card>
          <Text>YTD Omzet</Text>
          <Metric>{formatEUR(ytdTotal)}</Metric>
          <Flex className="mt-4">
            <Text>Huidig jaar</Text>
            <BadgeDelta deltaType={ytdTotal > 0 ? 'moderateIncrease' : 'unchanged'}>
              {ytdVsProjected > 0 ? `${ytdVsProjected}% van prognose` : 'Geen prognose'}
            </BadgeDelta>
          </Flex>
        </Card>

        <Card>
          <Text>Jaarprognose</Text>
          <Metric>{formatEUR(projectedAnnual)}</Metric>
          <Flex className="mt-4">
            <Text>Gemiddeld 3 maanden x 12</Text>
            <BadgeDelta deltaType={projectedAnnual > 0 ? 'moderateIncrease' : 'unchanged'}>
              {projectedAnnual > 0 ? 'Berekend' : 'Onvoldoende data'}
            </BadgeDelta>
          </Flex>
        </Card>
      </Grid>

      {/* ── Revenue by Client ── */}
      <div className="mt-8">
        <Card>
          <Title>Omzet per klant (YTD)</Title>
          {clientBreakdown.length > 0 ? (
            <Grid numItemsMd={2} className="mt-4 gap-6">
              <DonutChart
                className="mt-2 h-52"
                data={clientBreakdown}
                category="value"
                index="name"
                valueFormatter={formatEUR}
                colors={['blue', 'indigo', 'violet', 'purple', 'fuchsia', 'sky', 'cyan']}
              />
              <div className="mt-4 space-y-2">
                {clientBreakdown.map((client) => (
                  <Flex key={client.name} className="justify-between">
                    <Text className="truncate max-w-[200px]">{client.name}</Text>
                    <Text className="font-semibold">{formatEUR(client.value)}</Text>
                  </Flex>
                ))}
              </div>
            </Grid>
          ) : (
            <div className="mt-4 h-52 flex items-center justify-center">
              <Text className="text-gray-500">Geen omzetdata beschikbaar</Text>
            </div>
          )}
        </Card>
      </div>

      {/* ── Outstanding Invoices ── */}
      <div className="mt-8">
        <Card>
          <Title>Openstaande facturen</Title>
          <Text className="mt-1">Verzonden en achterstallige facturen</Text>

          {outstandingInvoices.length > 0 ? (
            <Table className="mt-4">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Factuurnummer</TableHeaderCell>
                  <TableHeaderCell>Klant</TableHeaderCell>
                  <TableHeaderCell>Vervaldatum</TableHeaderCell>
                  <TableHeaderCell>Bedrag (incl. BTW)</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outstandingInvoices.map((invoice) => {
                  const isOverdue = invoice.status === 'overdue'
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">{invoice.number}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                        {new Date(invoice.dueDate).toLocaleDateString('nl-NL')}
                      </TableCell>
                      <TableCell className="font-semibold">{formatEUR(invoice.total)}</TableCell>
                      <TableCell>
                        <Badge color={statusBadgeColor(invoice.status)}>
                          {statusLabel(invoice.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="mt-4 h-20 flex items-center justify-center">
              <Text className="text-gray-500">Geen openstaande facturen</Text>
            </div>
          )}
        </Card>
      </div>

      {/* ── YTD vs Projected ── */}
      {projectedAnnual > 0 && (
        <div className="mt-8">
          <Card>
            <Title>YTD vs. Jaarprognose</Title>
            <Flex className="mt-4">
              <div>
                <Text>Gerealiseerd YTD</Text>
                <Metric>{formatEUR(ytdTotal)}</Metric>
              </div>
              <div className="text-right">
                <Text>Prognose volledig jaar</Text>
                <Metric>{formatEUR(projectedAnnual)}</Metric>
              </div>
            </Flex>
            <div className="mt-4">
              <Flex className="justify-between mb-1">
                <Text>Voortgang</Text>
                <Text>{ytdVsProjected}%</Text>
              </Flex>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(ytdVsProjected, 100)}%` }}
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </main>
  )
}
