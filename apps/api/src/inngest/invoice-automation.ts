/**
 * Multi-agent workflow: Monthly Invoice Automation
 *
 * Runs on the 1st of every month via cron trigger.
 * Steps:
 *   1. Fetch all active clients
 *   2. Fetch time entries for each client from the previous month
 *   3. Calculate billable amounts
 *   4. Create invoices in the system
 *   5. Send invoice emails to clients
 */

import { inngest } from './agent-workflows'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TimeEntry {
  id: string
  clientId: string
  description: string
  hours: number
  date: string
  ratePerHour: number
  taskCategory: string
}

export interface ClientInvoiceInput {
  clientId: string
  clientName: string
  clientEmail: string
  billingPeriod: string
  hourlyRate: number
  entries: TimeEntry[]
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  number: string
  billingPeriod: string
  lineItems: InvoiceLineItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  total: number
  currency: 'EUR'
  dueDate: string
  createdAt: string
}

export interface InvoiceBatchResult {
  period: string
  invoicesCreated: number
  totalRevenue: number
  errors: string[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBillingPeriod(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function previousMonth(date: Date): { start: string; end: string; label: string } {
  const first = new Date(date.getFullYear(), date.getMonth() - 1, 1)
  const last = new Date(date.getFullYear(), date.getMonth(), 0)

  return {
    start: first.toISOString().split('T')[0],
    end: last.toISOString().split('T')[0],
    label: formatBillingPeriod(first),
  }
}

async function fetchActiveClients(
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ id: string; name: string; email: string; hourlyRate: number }[]> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/clients?status=eq.active&select=id,name,email,hourly_rate`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch active clients (${response.status}): ${await response.text()}`)
  }

  return (await response.json()) as {
    id: string
    name: string
    email: string
    hourlyRate: number
  }[]
}

async function fetchTimeEntries(
  supabaseUrl: string,
  supabaseKey: string,
  clientId: string,
  startDate: string,
  endDate: string
): Promise<TimeEntry[]> {
  const params = new URLSearchParams({
    client_id: `eq.${clientId}`,
    date: `gte.${startDate}`,
    and: `(date.lte.${endDate})`,
    select: 'id,client_id,description,hours,date,rate_per_hour,task_category',
  })

  const response = await fetch(`${supabaseUrl}/rest/v1/time_entries?${params.toString()}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch time entries for client ${clientId}: ${await response.text()}`)
  }

  const rows = (await response.json()) as Array<{
    id: string
    client_id: string
    description: string
    hours: number
    date: string
    rate_per_hour: number
    task_category: string
  }>

  return rows.map((row) => ({
    id: row.id,
    clientId: row.client_id,
    description: row.description,
    hours: row.hours,
    date: row.date,
    ratePerHour: row.rate_per_hour,
    taskCategory: row.task_category,
  }))
}

function calculateLineItems(entries: TimeEntry[]): InvoiceLineItem[] {
  // Group entries by category
  const grouped = entries.reduce<Record<string, TimeEntry[]>>((acc, entry) => {
    const category = entry.taskCategory ?? 'General'
    return {
      ...acc,
      [category]: [...(acc[category] ?? []), entry],
    }
  }, {})

  return Object.entries(grouped).map(([category, categoryEntries]) => {
    const totalHours = categoryEntries.reduce((sum, e) => sum + e.hours, 0)
    const ratePerHour = categoryEntries[0]?.ratePerHour ?? 0
    return {
      description: category,
      quantity: Math.round(totalHours * 100) / 100,
      unit: 'hours',
      unitPrice: ratePerHour,
      total: Math.round(totalHours * ratePerHour * 100) / 100,
    }
  })
}

async function persistInvoice(
  supabaseUrl: string,
  supabaseKey: string,
  invoice: Omit<Invoice, 'id'>
): Promise<Invoice> {
  const response = await fetch(`${supabaseUrl}/rest/v1/invoices`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      client_id: invoice.clientId,
      client_name: invoice.clientName,
      client_email: invoice.clientEmail,
      number: invoice.number,
      billing_period: invoice.billingPeriod,
      line_items: invoice.lineItems,
      subtotal: invoice.subtotal,
      vat_rate: invoice.vatRate,
      vat_amount: invoice.vatAmount,
      total: invoice.total,
      currency: invoice.currency,
      due_date: invoice.dueDate,
      status: 'draft',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to persist invoice: ${await response.text()}`)
  }

  const [created] = (await response.json()) as [Invoice]
  return created
}

async function sendInvoiceEmail(invoice: Invoice): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    throw new Error('Missing RESEND_API_KEY — cannot send invoice emails')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'billing@rooseveltdigital.nl',
      to: invoice.clientEmail,
      subject: `Invoice ${invoice.number} — ${invoice.billingPeriod}`,
      html: buildInvoiceEmailHtml(invoice),
    }),
  })

  if (!response.ok) {
    throw new Error(
      `Failed to send invoice email to ${invoice.clientEmail}: ${await response.text()}`
    )
  }
}

function buildInvoiceEmailHtml(invoice: Invoice): string {
  const lineItemRows = invoice.lineItems
    .map(
      (item) =>
        `<tr>
          <td>${item.description}</td>
          <td>${item.quantity} ${item.unit}</td>
          <td>€${item.unitPrice.toFixed(2)}</td>
          <td>€${item.total.toFixed(2)}</td>
        </tr>`
    )
    .join('\n')

  return `
    <html>
      <body style="font-family: sans-serif; color: #333;">
        <h1>Invoice ${invoice.number}</h1>
        <p>Dear ${invoice.clientName},</p>
        <p>Please find your invoice for the period <strong>${invoice.billingPeriod}</strong> below.</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><strong>Subtotal</strong></td>
              <td>€${invoice.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3">VAT (${(invoice.vatRate * 100).toFixed(0)}%)</td>
              <td>€${invoice.vatAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3"><strong>Total due</strong></td>
              <td><strong>€${invoice.total.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
        <p>Payment due by: <strong>${invoice.dueDate}</strong></p>
        <p>Thank you for your business.</p>
        <p>Roosevelt Digital</p>
      </body>
    </html>
  `
}

// ---------------------------------------------------------------------------
// Inngest function
// ---------------------------------------------------------------------------

export const invoiceAutomationWorkflow = inngest.createFunction(
  {
    id: 'invoice-automation',
    name: 'Monthly Invoice Automation',
    retries: 2,
  },
  // Trigger: 1st of every month at 08:00 Amsterdam time
  { cron: '0 8 1 * *' },
  async ({ step }): Promise<InvoiceBatchResult> => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
    if (!supabaseUrl) throw new Error('Missing SUPABASE_URL')
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

    const now = new Date()
    const period = previousMonth(now)

    // Step 1 — Fetch all active clients
    const clients = await step.run('fetch-active-clients', async () =>
      fetchActiveClients(supabaseUrl, supabaseKey)
    )

    const errors: string[] = []
    let invoicesCreated = 0
    let totalRevenue = 0

    // Step 2–4 — Process each client sequentially to keep memory bounded
    for (const client of clients) {
      const clientLabel = `client-${client.id}`

      const entries = await step.run(`fetch-time-entries-${clientLabel}`, async () =>
        fetchTimeEntries(supabaseUrl, supabaseKey, client.id, period.start, period.end)
      )

      // Skip clients with no billable time
      if (entries.length === 0) {
        continue
      }

      const lineItems = calculateLineItems(entries)
      const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
      const vatRate = 0.21 // Netherlands VAT
      const vatAmount = Math.round(subtotal * vatRate * 100) / 100
      const total = Math.round((subtotal + vatAmount) * 100) / 100

      // Due date: 30 days from today
      const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const invoiceNumber = `INV-${period.label.replace('-', '')}-${client.id.slice(0, 6).toUpperCase()}`

      const invoiceDraft: Omit<Invoice, 'id'> = {
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        number: invoiceNumber,
        billingPeriod: period.label,
        lineItems,
        subtotal,
        vatRate,
        vatAmount,
        total,
        currency: 'EUR',
        dueDate,
        createdAt: now.toISOString(),
      }

      const invoice = await step.run(`create-invoice-${clientLabel}`, async () =>
        persistInvoice(supabaseUrl, supabaseKey, invoiceDraft)
      )

      await step.run(`send-invoice-email-${clientLabel}`, async () => {
        try {
          await sendInvoiceEmail(invoice)
        } catch (err) {
          // Non-fatal: log the error but don't fail the entire batch
          errors.push(
            `Email send failed for ${client.name}: ${err instanceof Error ? err.message : String(err)}`
          )
        }
      })

      invoicesCreated += 1
      totalRevenue += total
    }

    return {
      period: period.label,
      invoicesCreated,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      errors,
    }
  }
)
