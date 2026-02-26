-- Client project access table
-- ROOSE-352: Client portal authentication with magic links
--
-- Bijhoudt welke clients toegang hebben tot welke projecten.
-- Clerk beheert authenticatie; deze tabel is de source of truth voor projecttoegang.
-- Project IDs zijn Plane project UUIDs.

CREATE TABLE IF NOT EXISTS public.client_project_access (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  clerk_user_id   text        NOT NULL,
  project_id      text        NOT NULL,
  granted_by      text        NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  revoked_at      timestamptz,

  CONSTRAINT client_project_access_unique UNIQUE (organization_id, clerk_user_id, project_id)
);

CREATE INDEX idx_client_project_access_org    ON public.client_project_access (organization_id);
CREATE INDEX idx_client_project_access_user   ON public.client_project_access (clerk_user_id);
CREATE INDEX idx_client_project_access_active ON public.client_project_access (organization_id, clerk_user_id) WHERE revoked_at IS NULL;

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.client_project_access ENABLE ROW LEVEL SECURITY;

-- Clients mogen alleen hun eigen actieve records zien (via sub claim = Clerk user ID).
CREATE POLICY "client_project_access_self_read" ON public.client_project_access
  FOR SELECT
  USING (
    clerk_user_id = auth.jwt() ->> 'sub'
    AND revoked_at IS NULL
  );

-- Interne org-leden (PMs) mogen alle records voor hun organisatie lezen.
CREATE POLICY "client_project_access_org_read" ON public.client_project_access
  FOR SELECT
  USING (organization_id::text = auth.jwt() ->> 'org_id');

-- Alleen service_role mag schrijven (via API routes/webhooks met service key).
-- Geen INSERT/UPDATE/DELETE voor authenticated gebruikers via client SDK.

DO $$
BEGIN
  RAISE NOTICE 'client_project_access tabel aangemaakt (ROOSE-352)';
  RAISE NOTICE 'RLS: clients lezen eigen records, PMs lezen org-records';
  RAISE NOTICE 'Schrijven alleen via service_role (API routes)';
END $$;
