-- CRM Supabase Data Architecture
-- Views, materialized views, indexes, and helper functions for Twenty CRM integration

-- ============================================================
-- Tables: crm_companies and crm_opportunities
-- Created here if not already present from earlier migrations
-- ============================================================

CREATE TABLE IF NOT EXISTS public.crm_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twenty_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  employee_count INT,
  sync_status TEXT NOT NULL DEFAULT 'pending_sync'
    CHECK (sync_status IN ('synced', 'local_only', 'conflict', 'pending_sync')),
  synced_at TIMESTAMPTZ,
  twenty_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twenty_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  value NUMERIC(15, 2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  stage TEXT NOT NULL DEFAULT 'LEAD'
    CHECK (stage IN ('LEAD', 'MEETING', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST')),
  close_date DATE,
  sync_status TEXT NOT NULL DEFAULT 'pending_sync'
    CHECK (sync_status IN ('synced', 'local_only', 'conflict', 'pending_sync')),
  synced_at TIMESTAMPTZ,
  twenty_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_crm_companies_organization_id
  ON public.crm_companies(organization_id);

CREATE INDEX IF NOT EXISTS idx_crm_companies_twenty_id
  ON public.crm_companies(twenty_id);

CREATE INDEX IF NOT EXISTS idx_crm_opportunities_organization_id
  ON public.crm_opportunities(organization_id);

CREATE INDEX IF NOT EXISTS idx_crm_opportunities_stage
  ON public.crm_opportunities(organization_id, stage);

CREATE INDEX IF NOT EXISTS idx_crm_opportunities_company_id
  ON public.crm_opportunities(company_id);

-- Composite index on crm_contacts for org + email lookups
CREATE INDEX IF NOT EXISTS idx_crm_contacts_org_email
  ON public.crm_contacts(organization_id, email)
  WHERE email IS NOT NULL;

-- ============================================================
-- RLS: crm_companies
-- ============================================================

ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY crm_companies_org_isolation ON public.crm_companies
  USING (organization_id = auth.organization_id());

-- ============================================================
-- RLS: crm_opportunities
-- ============================================================

ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY crm_opportunities_org_isolation ON public.crm_opportunities
  USING (organization_id = auth.organization_id());

-- ============================================================
-- Updated-at triggers
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_crm_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_crm_companies_updated_at
  BEFORE UPDATE ON public.crm_companies
  FOR EACH ROW EXECUTE FUNCTION public.update_crm_companies_updated_at();

CREATE OR REPLACE FUNCTION public.update_crm_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_crm_opportunities_updated_at
  BEFORE UPDATE ON public.crm_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_crm_opportunities_updated_at();

-- ============================================================
-- VIEW: v_active_opportunities
-- Active pipeline — stages before a decision (win or lose)
-- RLS: Supabase applies underlying table RLS automatically
-- ============================================================

CREATE OR REPLACE VIEW public.v_active_opportunities AS
SELECT
  o.id,
  o.organization_id,
  o.name                  AS opportunity_name,
  o.stage,
  o.value,
  o.currency,
  o.close_date,
  o.created_at,
  o.updated_at,
  c.id                    AS company_id,
  c.name                  AS company_name,
  c.domain                AS company_domain
FROM public.crm_opportunities o
LEFT JOIN public.crm_companies c ON c.id = o.company_id
WHERE o.stage IN ('LEAD', 'MEETING', 'PROPOSAL', 'NEGOTIATION');

COMMENT ON VIEW public.v_active_opportunities IS
  'Active CRM pipeline: opportunities in pre-decision stages joined with company data. RLS enforced via underlying tables.';

-- ============================================================
-- VIEW: v_client_projects
-- Won deals — linking closed opportunities to project context
-- Plane project tracking can be joined here once a projects
-- table is available; for now surfaces won deal metadata.
-- ============================================================

CREATE OR REPLACE VIEW public.v_client_projects AS
SELECT
  o.id                    AS opportunity_id,
  o.organization_id,
  o.name                  AS project_name,
  o.value                 AS contract_value,
  o.currency,
  o.close_date            AS won_date,
  o.created_at,
  c.id                    AS company_id,
  c.name                  AS company_name,
  c.domain                AS company_domain
FROM public.crm_opportunities o
LEFT JOIN public.crm_companies c ON c.id = o.company_id
WHERE o.stage = 'CLOSED_WON';

COMMENT ON VIEW public.v_client_projects IS
  'Won deals surfaced as client projects. Extend with a projects table join once project tracking is added.';

-- ============================================================
-- FUNCTION: get_crm_summary(org_id uuid)
-- Returns aggregated CRM counts for a given organization
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_crm_summary(org_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_contacts',      (
      SELECT COUNT(*) FROM public.crm_contacts
      WHERE organization_id = org_id::TEXT
    ),
    'total_companies',     (
      SELECT COUNT(*) FROM public.crm_companies
      WHERE organization_id = org_id::TEXT
    ),
    'open_opportunities',  (
      SELECT COUNT(*) FROM public.crm_opportunities
      WHERE organization_id = org_id::TEXT
        AND stage IN ('LEAD', 'MEETING', 'PROPOSAL', 'NEGOTIATION')
    ),
    'won_ytd',             (
      SELECT COUNT(*) FROM public.crm_opportunities
      WHERE organization_id = org_id::TEXT
        AND stage = 'CLOSED_WON'
        AND EXTRACT(YEAR FROM close_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    )
  )
$$;

COMMENT ON FUNCTION public.get_crm_summary(UUID) IS
  'Returns a JSONB summary of CRM data for an organization: total_contacts, total_companies, open_opportunities, won_ytd.';

-- ============================================================
-- Table comments
-- ============================================================

COMMENT ON TABLE public.crm_companies IS
  'Mirrored company data from Twenty CRM via Inngest sync pipeline';

COMMENT ON TABLE public.crm_opportunities IS
  'Mirrored opportunity/deal data from Twenty CRM via Inngest sync pipeline';
