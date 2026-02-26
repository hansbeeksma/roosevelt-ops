-- Projects and milestones for project management module
-- Links to CRM companies for client-project relationships
-- Pattern: organization_id::text = auth.jwt() ->> 'org_id'

CREATE TABLE IF NOT EXISTS public.projects (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID        NOT NULL,
  name             TEXT        NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'active',
  client_id        UUID        REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  description      TEXT,
  start_date       DATE,
  end_date         DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_project_status CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled'))
);

CREATE INDEX idx_projects_org ON public.projects(organization_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_client ON public.projects(client_id);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_org_isolation"
  ON public.projects
  USING (organization_id::text = auth.jwt() ->> 'org_id');

CREATE POLICY "service_manage_projects"
  ON public.projects FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Milestones linked to projects
CREATE TABLE IF NOT EXISTS public.milestones (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  due_date         DATE,
  completed        BOOLEAN     DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_milestones_project ON public.milestones(project_id);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "milestones_via_project_org_isolation"
  ON public.milestones
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = milestones.project_id
      AND projects.organization_id::text = auth.jwt() ->> 'org_id'
    )
  );

CREATE POLICY "service_manage_milestones"
  ON public.milestones FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Add FK from time_entries.project_id to projects
-- time_entries was created in 20260226000001 with project_id as TEXT (external ref)
-- When ready to enforce FK, use: ALTER TABLE time_entries ALTER COLUMN project_id TYPE UUID USING project_id::uuid;
-- For now, keep as TEXT to support mixed Plane/internal project IDs.

COMMENT ON TABLE public.projects IS 'Client projects with status tracking (ROOSE-371)';
COMMENT ON TABLE public.milestones IS 'Project milestones with due dates (ROOSE-371)';
