/**
 * Exact Online API Client (ROOSE-326)
 *
 * Authenticated HTTP client for the Exact Online REST API.
 * Handles token retrieval, 401 retry, and typed resource fetching.
 *
 * API base: https://start.exactonline.nl/api/v1/{divisionId}
 *
 * Usage:
 *   const invoices = await fetchInvoices(orgId, '2026')
 *   const contacts = await fetchContacts(orgId)
 */

import { getValidTokens } from './auth'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const EXACT_API_BASE = 'https://start.exactonline.nl/api/v1'

// ---------------------------------------------------------------------------
// Resource interfaces
// ---------------------------------------------------------------------------

export interface ExactInvoice {
  InvoiceID: string
  InvoiceNumber: number
  /** Account GUID of the customer */
  OrderedBy: string
  /** Amount in document currency (incl. VAT) */
  AmountDC: number
  /** VAT amount in document currency */
  VATAmountDC: number
  /** ISO date string: YYYY-MM-DD */
  InvoiceDate: string
  /** 20 = Draft, 50 = On hold, 55 = Partially delivered, 70 = Delivered */
  Status: number
}

export interface ExactContact {
  ID: string
  FullName: string
  Email: string
  AccountName: string
}

// Internal shape of the Exact Online OData envelope
interface ODataEnvelope<T> {
  d: {
    results: T[]
    __next?: string
  }
}

// ---------------------------------------------------------------------------
// Core API client
// ---------------------------------------------------------------------------

/**
 * Perform an authenticated GET request against the Exact Online API.
 *
 * Automatically retrieves a valid (auto-refreshed) access token for `orgId`.
 * Retries once on 401 by forcing a token refresh via `getValidTokens`.
 *
 * @param orgId - Organisation identifier used to look up stored tokens
 * @param path  - API path, e.g. `/{divisionId}/salesinvoice/SalesInvoices`
 */
export async function fetchExactResource<T>(orgId: string, path: string): Promise<T> {
  return executeRequest<T>(orgId, path)
}

// ---------------------------------------------------------------------------
// High-level resource helpers
// ---------------------------------------------------------------------------

/**
 * Fetch sales invoices for an organisation.
 *
 * @param orgId  - Organisation identifier
 * @param period - Optional financial year string (e.g. `'2026'`).
 *                 When provided, filters by `InvoiceDate ge YYYY-01-01`.
 */
export async function fetchInvoices(orgId: string, period?: string): Promise<ExactInvoice[]> {
  const tokens = await requireTokens(orgId)
  const divisionId = tokens.divisionId

  const baseFields = 'InvoiceID,InvoiceNumber,OrderedBy,AmountDC,VATAmountDC,InvoiceDate,Status'
  const params = new URLSearchParams({ $select: baseFields })

  if (period) {
    const year = Number.parseInt(period, 10)
    if (!Number.isNaN(year)) {
      params.set('$filter', `InvoiceDate ge datetime'${year}-01-01T00:00:00'`)
    }
  }

  const path = `/${divisionId}/salesinvoice/SalesInvoices?${params.toString()}`
  const envelope = await fetchExactResource<ODataEnvelope<ExactInvoice>>(orgId, path)
  return collectResults<ExactInvoice>(orgId, envelope)
}

/**
 * Fetch contacts (CRM) for an organisation.
 *
 * @param orgId - Organisation identifier
 */
export async function fetchContacts(orgId: string): Promise<ExactContact[]> {
  const tokens = await requireTokens(orgId)
  const divisionId = tokens.divisionId

  const fields = 'ID,FullName,Email,AccountName'
  const path = `/${divisionId}/crm/Contacts?$select=${fields}`
  const envelope = await fetchExactResource<ODataEnvelope<ExactContact>>(orgId, path)
  return collectResults<ExactContact>(orgId, envelope)
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Collect all pages from an OData response.
 * Exact Online returns `__next` for subsequent pages.
 */
async function collectResults<T>(orgId: string, envelope: ODataEnvelope<T>): Promise<T[]> {
  const items: T[] = [...envelope.d.results]
  let nextUrl = envelope.d.__next

  while (nextUrl) {
    const nextEnvelope = await executeRequest<ODataEnvelope<T>>(orgId, nextUrl)
    items.push(...nextEnvelope.d.results)
    nextUrl = nextEnvelope.d.__next
  }

  return items
}

/**
 * Execute a single authenticated GET request.
 * Retries once on 401 (token may have just expired between check and call).
 */
async function executeRequest<T>(orgId: string, pathOrUrl: string, isRetry = false): Promise<T> {
  const tokens = await getValidTokens(orgId)

  if (!tokens) {
    throw new Error(
      `No Exact Online connection found for organisation "${orgId}". ` +
        'The organisation must complete the OAuth flow first.'
    )
  }

  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${EXACT_API_BASE}${pathOrUrl}`

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  })

  if (response.status === 401 && !isRetry) {
    // Force refresh via getValidTokens (which auto-refreshes on next call)
    return executeRequest<T>(orgId, pathOrUrl, true)
  }

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Exact Online API error ${response.status} at ${url}: ${body}`)
  }

  return response.json() as Promise<T>
}

/**
 * Retrieve tokens or throw a descriptive error when not connected.
 */
async function requireTokens(orgId: string) {
  const tokens = await getValidTokens(orgId)
  if (!tokens) {
    throw new Error(
      `Organisation "${orgId}" is not connected to Exact Online. ` +
        'Complete the OAuth flow at /api/auth/exact/connect.'
    )
  }
  return tokens
}
