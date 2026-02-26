CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','on_hold','cancelled')),
  client_visible BOOLEAN NOT NULL DEFAULT true,
  twenty_deal_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'on_track' CHECK (status IN ('on_track','at_risk','delayed','completed')),
  published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.project_milestones(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','uploaded','in_review','approved')),
  published BOOLEAN NOT NULL DEFAULT false,
  file_path TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project_published ON public.project_milestones(project_id, published);
CREATE INDEX IF NOT EXISTS idx_project_deliverables_milestone_published ON public.project_deliverables(milestone_id, published);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_client_read ON public.projects FOR SELECT
  USING (organization_id = auth.organization_id() AND client_visible = true);

CREATE POLICY milestones_client_read ON public.project_milestones FOR SELECT
  USING (organization_id = auth.organization_id() AND published = true);

CREATE POLICY deliverables_client_read ON public.project_deliverables FOR SELECT
  USING (organization_id = auth.organization_id() AND published = true);

COMMENT ON TABLE public.project_milestones IS 'Alleen published=true items zichtbaar voor clients via RLS.';
