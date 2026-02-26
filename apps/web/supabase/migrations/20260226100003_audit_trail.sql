-- Audit Trail Tabel
-- ROOSE-315: Multi-tenant database schema
--
-- Registreert alle mutaties (create, update, delete, restore) per organisatie.
-- Elke entry bevat de wijzigingen als JSON diff: {field: {old, new}}.
-- Gebruikt voor compliance, debugging en data recovery.

-- ============================================================
-- audit_trail
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_trail (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID        NOT NULL REFERENCES public.organizations(id),
  user_id          UUID        NOT NULL,
  action           TEXT        NOT NULL,  -- 'create', 'update', 'delete', 'restore'
  entity_type      TEXT        NOT NULL,  -- tabelnaam
  entity_id        UUID        NOT NULL,
  changes          JSONB,                 -- {field: {old, new}}
  metadata         JSONB       DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
-- Snel opzoeken van audit trail per entiteit binnen een organisatie
CREATE INDEX IF NOT EXISTS idx_audit_org_entity
  ON public.audit_trail(organization_id, entity_type, entity_id);

-- Tijdlijn-weergave per organisatie (nieuwste eerst)
CREATE INDEX IF NOT EXISTS idx_audit_org_created
  ON public.audit_trail(organization_id, created_at DESC);

-- Opzoeken per gebruiker (wie heeft wat gedaan)
CREATE INDEX IF NOT EXISTS idx_audit_org_user
  ON public.audit_trail(organization_id, user_id);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_trail_org_isolation" ON public.audit_trail
  USING (organization_id::text = auth.jwt() ->> 'org_id');

-- ============================================================
-- Comments
-- ============================================================
COMMENT ON TABLE  public.audit_trail IS 'Audit trail voor alle mutaties per organisatie (ROOSE-315)';
COMMENT ON COLUMN public.audit_trail.action IS 'Type mutatie: create, update, delete, restore';
COMMENT ON COLUMN public.audit_trail.entity_type IS 'Naam van de tabel waarin de mutatie plaatsvond';
COMMENT ON COLUMN public.audit_trail.entity_id IS 'UUID van het gemuteerde record';
COMMENT ON COLUMN public.audit_trail.changes IS 'JSON diff van wijzigingen: {field: {old: waarde, new: waarde}}';
COMMENT ON COLUMN public.audit_trail.metadata IS 'Extra context zoals IP-adres, user agent, request ID';

-- ============================================================
-- Verificatie
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE 'Audit trail tabel aangemaakt (ROOSE-315)';
  RAISE NOTICE 'Kolommen: id, organization_id, user_id, action, entity_type, entity_id, changes, metadata, created_at';
  RAISE NOTICE 'RLS policy: audit_trail_org_isolation';
  RAISE NOTICE '';
  RAISE NOTICE 'Gebruik:';
  RAISE NOTICE '  INSERT INTO audit_trail (organization_id, user_id, action, entity_type, entity_id, changes)';
  RAISE NOTICE '  VALUES (org_uuid, user_uuid, ''update'', ''time_entries'', entity_uuid, ''{"description": {"old": "oud", "new": "nieuw"}}'');';
END $$;
