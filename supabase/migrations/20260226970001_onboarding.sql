-- Onboarding Checklists
-- ROOSE-48: Automated client/team member onboarding flows
--
-- Stores per-organisation onboarding checklist state.
-- Steps are persisted as JSONB so the shape can evolve without further migrations.

-- ============================================================================
-- TABLE: onboarding_checklists
-- ============================================================================

CREATE TABLE onboarding_checklists (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid        REFERENCES organizations(id) ON DELETE CASCADE,

  -- 'client' | 'team_member'
  checklist_type    text        NOT NULL DEFAULT 'client'
                                CHECK (checklist_type IN ('client', 'team_member')),

  -- JSONB array of { id, completed, completedAt? } objects
  steps             jsonb       NOT NULL DEFAULT '[]',

  completed_steps   int         NOT NULL DEFAULT 0,
  total_steps       int         NOT NULL,

  completed_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  -- One checklist per org per type
  UNIQUE (organization_id, checklist_type)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_onboarding_checklists_org
  ON onboarding_checklists (organization_id);

CREATE INDEX idx_onboarding_checklists_type
  ON onboarding_checklists (checklist_type);

CREATE INDEX idx_onboarding_checklists_completed_at
  ON onboarding_checklists (completed_at DESC NULLS LAST);

-- GIN index for step-level queries: steps @> '[{"id":"create-org","completed":true}]'
CREATE INDEX idx_onboarding_checklists_steps_gin
  ON onboarding_checklists USING GIN (steps);

-- ── Updated-at trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_onboarding_checklists_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_onboarding_checklists_updated_at
  BEFORE UPDATE ON onboarding_checklists
  FOR EACH ROW EXECUTE FUNCTION update_onboarding_checklists_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE onboarding_checklists ENABLE ROW LEVEL SECURITY;

-- Service role has full access (used by API worker and Inngest steps)
CREATE POLICY "Service role full access"
  ON onboarding_checklists
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users may read their own organisation's checklist
CREATE POLICY "Authenticated read own org checklist"
  ON onboarding_checklists
  FOR SELECT
  TO authenticated
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

-- ── Helper: upsert a checklist ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION upsert_onboarding_checklist(
  p_organization_id   uuid,
  p_checklist_type    text,
  p_steps             jsonb,
  p_total_steps       int
)
RETURNS onboarding_checklists
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_completed_steps int;
  v_completed_at    timestamptz;
  result            onboarding_checklists;
BEGIN
  -- Count completed steps from the JSONB array
  SELECT COUNT(*)
  INTO v_completed_steps
  FROM jsonb_array_elements(p_steps) AS step
  WHERE (step ->> 'completed')::boolean = true;

  -- Set completed_at if all steps are done
  v_completed_at := CASE
    WHEN v_completed_steps >= p_total_steps THEN now()
    ELSE NULL
  END;

  INSERT INTO onboarding_checklists (
    organization_id,
    checklist_type,
    steps,
    completed_steps,
    total_steps,
    completed_at
  )
  VALUES (
    p_organization_id,
    p_checklist_type,
    p_steps,
    v_completed_steps,
    p_total_steps,
    v_completed_at
  )
  ON CONFLICT (organization_id, checklist_type)
  DO UPDATE SET
    steps           = EXCLUDED.steps,
    completed_steps = EXCLUDED.completed_steps,
    total_steps     = EXCLUDED.total_steps,
    completed_at    = EXCLUDED.completed_at,
    updated_at      = now()
  RETURNING * INTO result;

  RETURN result;
END;
$$;

-- ── Verification ──────────────────────────────────────────────────────────────

DO $$
BEGIN
  RAISE NOTICE 'Migration 20260226970001_onboarding: complete';
  RAISE NOTICE '  Table    : onboarding_checklists';
  RAISE NOTICE '  Indexes  : 4 (org, type, completed_at, steps GIN)';
  RAISE NOTICE '  RLS      : enabled (service_role + authenticated)';
  RAISE NOTICE '  Trigger  : updated_at auto-set on UPDATE';
  RAISE NOTICE '  Helper   : upsert_onboarding_checklist()';
END $$;
