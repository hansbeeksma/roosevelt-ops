-- Create ops_incidents table for incident management workflow
-- Stores incident metadata, tracks lifecycle, and enables reporting
-- NOTE: Renamed from 'incidents' to 'ops_incidents' to avoid conflict with
-- the DORA metrics 'incidents' table (20260205_dora_metrics_schema.sql).

CREATE TABLE IF NOT EXISTS public.ops_incidents (
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
  statuspage_incident_id TEXT, -- Statuspage.io incident ID

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
CREATE INDEX idx_ops_incidents_status ON public.ops_incidents(status);
CREATE INDEX idx_ops_incidents_severity ON public.ops_incidents(severity);
CREATE INDEX idx_ops_incidents_started_at ON public.ops_incidents(started_at DESC);
CREATE INDEX idx_ops_incidents_channel_id ON public.ops_incidents(channel_id);
CREATE INDEX idx_ops_incidents_plane_issue_id ON public.ops_incidents(plane_issue_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ops_incidents_updated_at
  BEFORE UPDATE ON public.ops_incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE public.ops_incidents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read ops_incidents
CREATE POLICY "Allow authenticated read access"
  ON public.ops_incidents
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow all authenticated users to insert ops_incidents
CREATE POLICY "Allow authenticated insert access"
  ON public.ops_incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow all authenticated users to update ops_incidents
CREATE POLICY "Allow authenticated update access"
  ON public.ops_incidents
  FOR UPDATE
  TO authenticated
  USING (true);

-- Comments
COMMENT ON TABLE public.ops_incidents IS 'Ops incident tracking for incident management workflow (Slack/PagerDuty/Plane)';
COMMENT ON COLUMN public.ops_incidents.id IS 'Unique incident identifier (UUID)';
COMMENT ON COLUMN public.ops_incidents.severity IS 'SEV-1 (critical) to SEV-4 (low)';
COMMENT ON COLUMN public.ops_incidents.status IS 'active or resolved';
COMMENT ON COLUMN public.ops_incidents.mttr_minutes IS 'Mean Time To Resolution in minutes (auto-calculated)';
COMMENT ON COLUMN public.ops_incidents.channel_id IS 'Dedicated Slack channel for incident coordination';
COMMENT ON COLUMN public.ops_incidents.plane_issue_id IS 'Linked Plane issue for tracking action items';
COMMENT ON COLUMN public.ops_incidents.pagerduty_incident_id IS 'PagerDuty incident ID for on-call integration';
