-- Alert History Table for Deduplication
-- Tracks sent alerts to prevent spam with 1-hour cooldown

CREATE TABLE IF NOT EXISTS alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  alert_message TEXT NOT NULL,
  alert_severity TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient cooldown queries
CREATE INDEX IF NOT EXISTS idx_alert_history_type_time
  ON alert_history(alert_type, created_at DESC);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_alert_history_created_at
  ON alert_history(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE alert_history IS 'Tracks DORA metrics alerts sent to Slack for deduplication (1h cooldown)';
COMMENT ON COLUMN alert_history.alert_type IS 'Alert type: deploy_freq, lead_time, cfr, mttr';
COMMENT ON COLUMN alert_history.alert_message IS 'Full alert message sent to Slack';
COMMENT ON COLUMN alert_history.alert_severity IS 'Alert severity: HIGH, MEDIUM, LOW';

-- Optional: Automatic cleanup of old alerts (>30 days)
-- Run this manually or via cron job:
-- DELETE FROM alert_history WHERE created_at < NOW() - INTERVAL '30 days';
