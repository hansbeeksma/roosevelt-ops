-- Organizations Tabel
-- ROOSE-315: Multi-tenant database schema
--
-- Centrale organisatie-entiteit voor multi-tenancy.
-- Alle andere tabellen refereren naar deze tabel via organization_id.
-- Clerk integration via clerk_org_id voor SSO/auth koppeling.

-- ============================================================
-- organizations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL,
  slug             TEXT        NOT NULL UNIQUE,
  clerk_org_id     TEXT        UNIQUE,        -- Clerk organization ID
  plan             TEXT        NOT NULL DEFAULT 'free',
  settings         JSONB       NOT NULL DEFAULT '{}',

  -- BaseTable pattern (soft-delete + optimistic concurrency)
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,
  deleted_by       UUID,
  version          INTEGER     NOT NULL DEFAULT 0
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_organizations_slug
  ON public.organizations(slug);

CREATE INDEX IF NOT EXISTS idx_organizations_clerk
  ON public.organizations(clerk_org_id);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- updated_at trigger (hergebruikt functie uit incidents migration)
-- ============================================================
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Comments
-- ============================================================
COMMENT ON TABLE  public.organizations IS 'Centrale organisatie-entiteit voor multi-tenancy (ROOSE-315)';
COMMENT ON COLUMN public.organizations.slug IS 'URL-veilige unieke identifier voor de organisatie';
COMMENT ON COLUMN public.organizations.clerk_org_id IS 'Clerk organization ID voor SSO/auth koppeling';
COMMENT ON COLUMN public.organizations.plan IS 'Abonnement: free, pro, enterprise';
COMMENT ON COLUMN public.organizations.settings IS 'Organisatie-specifieke instellingen als JSON';
COMMENT ON COLUMN public.organizations.version IS 'Optimistic concurrency counter, verhoogd bij elke update';
