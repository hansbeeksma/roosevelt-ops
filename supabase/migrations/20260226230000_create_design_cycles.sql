CREATE TABLE IF NOT EXISTS public.design_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  current_phase TEXT NOT NULL DEFAULT 'discover'
    CHECK (current_phase IN ('discover', 'define', 'develop', 'deliver', 'completed')),
  phase_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.design_cycle_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES public.design_cycles(id) ON DELETE CASCADE,
  from_phase TEXT NOT NULL,
  to_phase TEXT NOT NULL,
  transitioned_by TEXT,
  notes TEXT,
  transitioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_design_cycles_project_id ON public.design_cycles(project_id);
CREATE INDEX IF NOT EXISTS idx_design_cycle_transitions_cycle_id ON public.design_cycle_transitions(cycle_id);

ALTER TABLE public.design_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_cycle_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY design_cycles_org ON public.design_cycles
  USING (organization_id = auth.organization_id());

CREATE POLICY design_cycle_transitions_org ON public.design_cycle_transitions
  USING (EXISTS (
    SELECT 1 FROM public.design_cycles dc
    WHERE dc.id = cycle_id AND dc.organization_id = auth.organization_id()
  ));
