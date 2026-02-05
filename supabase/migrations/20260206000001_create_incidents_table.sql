-- Create incidents table for incident management workflow
-- Stores incident metadata, tracks lifecycle, and enables reporting

CREATE TABLE IF NOT EXISTS public.incidents (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core fields
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('SEV-1', 'SEV-2', 'SEV-3', 'SEV-4')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),

  -- People
  commander TEXT NOT NULL, -- Slack username
  responders TEXT[], -- Array of Slack user IDs

  -- Integration IDs
  channel_id TEXT NOT NULL, -- Slack channel ID
  plane_issue_id TEXT, -- Plane issue UUID
  pagerduty_incident_id TEXT, -- PagerDuty incident ID

  -- Timeline
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,

  -- Metrics (calculated)
  mttr_minutes INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN resolved_at IS NOT NULL
      THEN EXTRACT(EPOCH FROM (resolved_at - started_at)) / 60
      ELSE NULL
    END
  ) STORED,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_severity ON public.incidents(severity);
CREATE INDEX idx_incidents_started_at ON public.incidents(started_at DESC);
CREATE INDEX idx_incidents_channel_id ON public.incidents(channel_id);
CREATE INDEX idx_incidents_plane_issue_id ON public.incidents(plane_issue_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read incidents
CREATE POLICY "Allow authenticated read access"
  ON public.incidents
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow all authenticated users to insert incidents
CREATE POLICY "Allow authenticated insert access"
  ON public.incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow all authenticated users to update incidents
CREATE POLICY "Allow authenticated update access"
  ON public.incidents
  FOR UPDATE
  TO authenticated
  USING (true);

-- Comments
COMMENT ON TABLE public.incidents IS 'Incident tracking for incident management workflow';
COMMENT ON COLUMN public.incidents.id IS 'Unique incident identifier (UUID)';
COMMENT ON COLUMN public.incidents.severity IS 'SEV-1 (critical) to SEV-4 (low)';
COMMENT ON COLUMN public.incidents.status IS 'active or resolved';
COMMENT ON COLUMN public.incidents.mttr_minutes IS 'Mean Time To Resolution in minutes (auto-calculated)';
COMMENT ON COLUMN public.incidents.channel_id IS 'Dedicated Slack channel for incident coordination';
COMMENT ON COLUMN public.incidents.plane_issue_id IS 'Linked Plane issue for tracking action items';
COMMENT ON COLUMN public.incidents.pagerduty_incident_id IS 'PagerDuty incident ID for on-call integration';
