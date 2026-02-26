-- RLS policy ensuring clients only see their own organization's data
-- Uses Clerk JWT org_id claim

CREATE OR REPLACE FUNCTION auth.client_org_id() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'org_id',
    ''
  )
$$ LANGUAGE sql STABLE;

-- Example policy for projects table (clients see read-only)
-- Apply similar pattern to invoices, milestones tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_read_own_org_projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (org_id = auth.client_org_id());
