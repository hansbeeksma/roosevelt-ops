-- Time Tracking Tables
-- ROOSE-316: Time Entry Data Model
--
-- time_entries: core entity for hour registration
-- timers: active timer state per user (max 1 running per user per org)

-- ============================================================
-- time_entries
-- ============================================================
CREATE TABLE IF NOT EXISTS public.time_entries (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID        NOT NULL,
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id       TEXT,                   -- external ref (Plane project)
  task_id          TEXT,                   -- external ref (Plane issue, nullable)
  description      TEXT,
  duration_minutes INTEGER     NOT NULL CHECK (duration_minutes >= 0),
  started_at       TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ,
  billable         BOOLEAN     NOT NULL DEFAULT true,
  hourly_rate      DECIMAL(10,2),          -- override rate for this entry
  notes            TEXT,

  -- BaseTable pattern (soft-delete + optimistic concurrency)
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,
  deleted_by       UUID        REFERENCES auth.users(id),
  version          INTEGER     NOT NULL DEFAULT 0
);

-- ============================================================
-- timers
-- ============================================================
CREATE TABLE IF NOT EXISTS public.timers (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      UUID        NOT NULL,
  user_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id           TEXT,
  task_id              TEXT,
  started_at           TIMESTAMPTZ NOT NULL,
  paused_at            TIMESTAMPTZ,
  accumulated_seconds  INTEGER     NOT NULL DEFAULT 0,
  is_running           BOOLEAN     NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: at most one running timer per user per org.
  -- DEFERRABLE so within-transaction stop+start sequences work.
  UNIQUE (organization_id, user_id, is_running) DEFERRABLE INITIALLY DEFERRED
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_time_entries_org_user_created
  ON public.time_entries(organization_id, user_id, created_at DESC);

CREATE INDEX idx_time_entries_org_project
  ON public.time_entries(organization_id, project_id);

CREATE INDEX idx_timers_org_user
  ON public.timers(organization_id, user_id);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timers       ENABLE ROW LEVEL SECURITY;

-- Org isolation: users can only access their own organisation's rows.
-- JWT claim 'org_id' is set by the application on sign-in.
CREATE POLICY "time_entries_org_isolation" ON public.time_entries
  USING (organization_id::text = auth.jwt() ->> 'org_id');

CREATE POLICY "timers_org_isolation" ON public.timers
  USING (organization_id::text = auth.jwt() ->> 'org_id');

-- ============================================================
-- updated_at trigger (reuses function from incidents migration)
-- ============================================================
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Comments
-- ============================================================
COMMENT ON TABLE  public.time_entries IS 'Hour registration records per user per organisation (ROOSE-316)';
COMMENT ON COLUMN public.time_entries.duration_minutes IS 'Logged duration in whole minutes (>= 0)';
COMMENT ON COLUMN public.time_entries.billable         IS 'Whether this entry is billed to the client';
COMMENT ON COLUMN public.time_entries.hourly_rate      IS 'Override rate in currency units; NULL = use project default';
COMMENT ON COLUMN public.time_entries.version          IS 'Optimistic concurrency counter, incremented on every update';

COMMENT ON TABLE  public.timers IS 'Active stopwatch state per user (max 1 running per org+user, ROOSE-316)';
COMMENT ON COLUMN public.timers.accumulated_seconds IS 'Total paused time in seconds before current run';
COMMENT ON COLUMN public.timers.is_running          IS 'True = clock is ticking; False = paused/stopped';
