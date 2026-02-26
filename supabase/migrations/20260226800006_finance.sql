-- FinOps: Invoice generation and revenue tracking
-- ROOSE-33: Financial Operations (FinOps) for Dutch freelance agency
--
-- Tables:
--   invoices        - per-client VAT-aware invoices (BTW 21%)
--   revenue_entries - revenue ledger by client, month, and category
--
-- Currency: EUR | VAT: Dutch BTW standard 21%

-- ============================================================================
-- TABLE: invoices
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Human-readable invoice number: YYYY-NNN (e.g. 2026-001)
  number      TEXT          NOT NULL UNIQUE,

  client_id   UUID          NOT NULL,
  client_name TEXT          NOT NULL,

  -- Line items serialised as JSONB: [{description, quantity, unitPrice, vatRate}]
  lines       JSONB         NOT NULL DEFAULT '[]'::jsonb,

  -- Amounts in EUR (stored as NUMERIC for precision)
  subtotal    NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  vat_amount  NUMERIC(12,2) NOT NULL CHECK (vat_amount >= 0),
  total       NUMERIC(12,2) NOT NULL CHECK (total >= 0),

  currency    TEXT          NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),

  due_date    DATE          NOT NULL,
  issued_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),

  status      TEXT          NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),

  -- Set when invoice transitions to 'paid'
  paid_at     TIMESTAMPTZ,

  -- Constraint: paid invoices must have a paid_at timestamp
  CONSTRAINT invoices_paid_at_consistency
    CHECK (status != 'paid' OR paid_at IS NOT NULL)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Fast overdue detection and status filtering
CREATE INDEX IF NOT EXISTS idx_invoices_status_due_date
  ON public.invoices (status, due_date ASC);

-- Fast lookup by client
CREATE INDEX IF NOT EXISTS idx_invoices_client_id
  ON public.invoices (client_id);

-- Fast lookup by issue date for reporting
CREATE INDEX IF NOT EXISTS idx_invoices_issued_at
  ON public.invoices (issued_at DESC);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all invoices
CREATE POLICY "invoices_authenticated_read"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role has full write access (used by API and cron jobs)
CREATE POLICY "invoices_service_role_all"
  ON public.invoices
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TABLE: revenue_entries
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.revenue_entries (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  client_id   UUID          NOT NULL,

  -- Denormalised for display without joins
  client_name TEXT,

  amount      NUMERIC(12,2) NOT NULL CHECK (amount >= 0),

  -- Calendar month in 'YYYY-MM' format (e.g. '2026-02')
  month       TEXT          NOT NULL
    CHECK (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),

  category    TEXT          NOT NULL
    CHECK (category IN ('consulting', 'retainer', 'project')),

  -- Optional link back to the source invoice
  invoice_id  UUID          REFERENCES public.invoices(id) ON DELETE SET NULL,

  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Primary reporting pattern: revenue by client within a period
CREATE INDEX IF NOT EXISTS idx_revenue_entries_client_month
  ON public.revenue_entries (client_id, month);

-- Monthly aggregation across all clients
CREATE INDEX IF NOT EXISTS idx_revenue_entries_month
  ON public.revenue_entries (month);

-- YTD query: range scan on month column
CREATE INDEX IF NOT EXISTS idx_revenue_entries_month_range
  ON public.revenue_entries (month DESC);

-- Category breakdown queries
CREATE INDEX IF NOT EXISTS idx_revenue_entries_category
  ON public.revenue_entries (category, month);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.revenue_entries ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all revenue entries
CREATE POLICY "revenue_entries_authenticated_read"
  ON public.revenue_entries
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role has full write access
CREATE POLICY "revenue_entries_service_role_all"
  ON public.revenue_entries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.invoices IS
  'Dutch BTW-aware invoices (21% VAT). number format: YYYY-NNN. Currency: EUR only.';

COMMENT ON COLUMN public.invoices.lines IS
  'JSON array of InvoiceLineItem: [{description, quantity, unitPrice, vatRate}]';

COMMENT ON COLUMN public.invoices.vat_amount IS
  'Total BTW (VAT) amount in EUR. Dutch standard rate is 21%.';

COMMENT ON COLUMN public.invoices.status IS
  'Lifecycle: draft -> sent -> paid. overdue set by cron when due_date passes.';

COMMENT ON TABLE public.revenue_entries IS
  'Revenue ledger: one row per client per month. Links to invoices where applicable.';

COMMENT ON COLUMN public.revenue_entries.month IS
  'Calendar month in YYYY-MM format, e.g. ''2026-02''. Used for MRR/YTD aggregation.';

COMMENT ON COLUMN public.revenue_entries.category IS
  'consulting = ad-hoc work, retainer = recurring contract (MRR), project = fixed-price.';

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260226800006_finance: complete';
  RAISE NOTICE '  Table  : invoices (BTW-aware, EUR, YYYY-NNN numbering)';
  RAISE NOTICE '  Table  : revenue_entries (client x month x category)';
  RAISE NOTICE '  Indexes: invoices(status+due_date, client_id, issued_at)';
  RAISE NOTICE '  Indexes: revenue_entries(client+month, month, month_range, category)';
  RAISE NOTICE '  RLS    : authenticated=read-all, service_role=full-write';
END $$;
