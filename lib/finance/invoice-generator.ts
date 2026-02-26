/**
 * Invoice Generator
 *
 * Dutch VAT-aware invoice generation for Roosevelt OPS freelance agency.
 * Handles BTW (21%) calculations, invoice numbering, and Supabase persistence.
 *
 * Currency: EUR | VAT: 21% (Dutch BTW standard rate)
 */

import { createClient } from '@/lib/supabase/server'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  vatRate: number
}

export interface Invoice {
  id: string
  number: string
  clientId: string
  clientName: string
  lines: InvoiceLineItem[]
  subtotal: number
  vatAmount: number
  total: number
  currency: 'EUR'
  dueDate: string
  issuedAt: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
}

export interface InvoiceTotals {
  subtotal: number
  vatAmount: number
  total: number
}

// ── Pure helpers ───────────────────────────────────────────────────────────────

/**
 * Generate a Dutch-style invoice number: YYYY-NNN
 *
 * @example generateInvoiceNumber(2026, 1)  // '2026-001'
 * @example generateInvoiceNumber(2026, 42) // '2026-042'
 */
export function generateInvoiceNumber(year: number, seq: number): string {
  const paddedSeq = String(seq).padStart(3, '0')
  return `${year}-${paddedSeq}`
}

/**
 * Calculate invoice totals from line items.
 * Pure function — no side effects, no mutation.
 *
 * Each line's VAT is calculated independently to match Dutch BTW conventions.
 */
export function calculateInvoiceTotals(lines: InvoiceLineItem[]): InvoiceTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)

  const vatAmount = lines.reduce((sum, line) => {
    const lineSubtotal = line.quantity * line.unitPrice
    return sum + lineSubtotal * (line.vatRate / 100)
  }, 0)

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: Math.round((subtotal + vatAmount) * 100) / 100,
  }
}

/** Returns the next invoice sequence number for the given year from Supabase. */
async function getNextSequenceNumber(year: number): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('number')
    .like('number', `${year}-%`)
    .order('number', { ascending: false })
    .limit(1)

  if (error) {
    throw new Error(`Failed to fetch invoice sequence for ${year}: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return 1
  }

  const lastNumber = data[0].number as string
  const lastSeq = parseInt(lastNumber.split('-')[1] ?? '0', 10)
  return lastSeq + 1
}

/** Returns the ISO date string 30 days from now (standard Dutch invoice term). */
function dueDateFromNow(): string {
  const due = new Date()
  due.setDate(due.getDate() + 30)
  return due.toISOString().split('T')[0] ?? ''
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Create and persist a new invoice for a client.
 *
 * Automatically:
 * - Assigns the next sequential invoice number for the current year
 * - Calculates subtotal, BTW (VAT), and total
 * - Sets due date to 30 days from now
 * - Saves to Supabase in 'draft' status
 *
 * @param clientId   - UUID of the client
 * @param clientName - Display name of the client
 * @param lines      - Line items with description, quantity, unit price, VAT rate
 */
export async function createInvoice(
  clientId: string,
  clientName: string,
  lines: InvoiceLineItem[]
): Promise<Invoice> {
  const supabase = await createClient()

  const now = new Date()
  const year = now.getFullYear()
  const seq = await getNextSequenceNumber(year)
  const number = generateInvoiceNumber(year, seq)
  const totals = calculateInvoiceTotals(lines)
  const issuedAt = now.toISOString()
  const dueDate = dueDateFromNow()

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      number,
      client_id: clientId,
      client_name: clientName,
      lines,
      subtotal: totals.subtotal,
      vat_amount: totals.vatAmount,
      total: totals.total,
      currency: 'EUR',
      due_date: dueDate,
      issued_at: issuedAt,
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create invoice ${number}: ${error.message}`)
  }

  return {
    id: data.id as string,
    number: data.number as string,
    clientId: data.client_id as string,
    clientName: data.client_name as string,
    lines: data.lines as InvoiceLineItem[],
    subtotal: Number(data.subtotal),
    vatAmount: Number(data.vat_amount),
    total: Number(data.total),
    currency: 'EUR',
    dueDate: data.due_date as string,
    issuedAt: data.issued_at as string,
    status: data.status as Invoice['status'],
  }
}

/**
 * Fetch all invoices, optionally filtered by status.
 */
export async function getInvoices(status?: Invoice['status']): Promise<Invoice[]> {
  const supabase = await createClient()

  let query = supabase
    .from('invoices')
    .select(
      'id, number, client_id, client_name, lines, subtotal, vat_amount, total, currency, due_date, issued_at, status'
    )
    .order('issued_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch invoices: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    number: row.number as string,
    clientId: row.client_id as string,
    clientName: row.client_name as string,
    lines: row.lines as InvoiceLineItem[],
    subtotal: Number(row.subtotal),
    vatAmount: Number(row.vat_amount),
    total: Number(row.total),
    currency: 'EUR' as const,
    dueDate: row.due_date as string,
    issuedAt: row.issued_at as string,
    status: row.status as Invoice['status'],
  }))
}

/**
 * Fetch outstanding (sent + overdue) invoices sorted by due date ascending.
 */
export async function getOutstandingInvoices(): Promise<Invoice[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoices')
    .select(
      'id, number, client_id, client_name, lines, subtotal, vat_amount, total, currency, due_date, issued_at, status'
    )
    .in('status', ['sent', 'overdue'])
    .order('due_date', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch outstanding invoices: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    number: row.number as string,
    clientId: row.client_id as string,
    clientName: row.client_name as string,
    lines: row.lines as InvoiceLineItem[],
    subtotal: Number(row.subtotal),
    vatAmount: Number(row.vat_amount),
    total: Number(row.total),
    currency: 'EUR' as const,
    dueDate: row.due_date as string,
    issuedAt: row.issued_at as string,
    status: row.status as Invoice['status'],
  }))
}
