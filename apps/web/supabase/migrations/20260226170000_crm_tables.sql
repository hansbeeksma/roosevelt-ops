-- CRM tables synced from Twenty CRM via Inngest webhooks
-- Organization-scoped with RLS for multi-tenant isolation
-- Pattern: organization_id::text = auth.jwt() ->> 'org_id'

-- Companies
CREATE TABLE IF NOT EXISTS public.crm_companies (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID        NOT NULL,
  twenty_id        TEXT        UNIQUE,
  name             TEXT        NOT NULL,
  domain           TEXT,
  industry         TEXT,
  employee_count   INT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crm_companies_org ON public.crm_companies(organization_id);
CREATE INDEX idx_crm_companies_twenty ON public.crm_companies(twenty_id) WHERE twenty_id IS NOT NULL;

ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_companies_org_isolation"
  ON public.crm_companies
  USING (organization_id::text = auth.jwt() ->> 'org_id');

CREATE POLICY "service_manage_crm_companies"
  ON public.crm_companies FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Contacts
CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID        NOT NULL,
  twenty_id        TEXT        UNIQUE,
  company_id       UUID        REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  first_name       TEXT        NOT NULL,
  last_name        TEXT        NOT NULL,
  email            TEXT,
  phone            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crm_contacts_org ON public.crm_contacts(organization_id);
CREATE INDEX idx_crm_contacts_company ON public.crm_contacts(company_id);

ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_contacts_org_isolation"
  ON public.crm_contacts
  USING (organization_id::text = auth.jwt() ->> 'org_id');

CREATE POLICY "service_manage_crm_contacts"
  ON public.crm_contacts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Opportunities (deals/pipeline)
CREATE TABLE IF NOT EXISTS public.crm_opportunities (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID        NOT NULL,
  twenty_id        TEXT        UNIQUE,
  company_id       UUID        REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  name             TEXT        NOT NULL,
  stage            TEXT        NOT NULL DEFAULT 'lead',
  amount           NUMERIC(12,2),
  currency         TEXT        DEFAULT 'EUR',
  expected_close   DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crm_opportunities_org ON public.crm_opportunities(organization_id);
CREATE INDEX idx_crm_opportunities_stage ON public.crm_opportunities(stage);

ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_opportunities_org_isolation"
  ON public.crm_opportunities
  USING (organization_id::text = auth.jwt() ->> 'org_id');

CREATE POLICY "service_manage_crm_opportunities"
  ON public.crm_opportunities FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE public.crm_companies IS 'Companies synced from Twenty CRM (ROOSE-371)';
COMMENT ON TABLE public.crm_contacts IS 'Contacts synced from Twenty CRM (ROOSE-371)';
COMMENT ON TABLE public.crm_opportunities IS 'Opportunities/deals synced from Twenty CRM (ROOSE-371)';
