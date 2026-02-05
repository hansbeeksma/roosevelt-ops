/**
 * Incident Management Types
 *
 * Generated from Supabase incidents table schema
 */

export type IncidentSeverity = 'SEV-1' | 'SEV-2' | 'SEV-3' | 'SEV-4';

export type IncidentStatus = 'active' | 'resolved';

/**
 * Core incident record from database
 */
export interface Incident {
  id: string;
  title: string;
  description: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;

  // People
  commander: string; // Slack username
  responders: string[] | null; // Array of Slack user IDs

  // Integration IDs
  channel_id: string; // Slack channel ID
  plane_issue_id: string | null; // Plane issue UUID
  pagerduty_incident_id: string | null; // PagerDuty incident ID
  statuspage_incident_id: string | null; // Statuspage.io incident ID

  // Timeline
  started_at: string; // ISO timestamp
  resolved_at: string | null; // ISO timestamp

  // Metrics (auto-calculated)
  mttr_minutes: number | null; // Mean Time To Resolution

  // Metadata
  created_at: string;
  updated_at: string;
}

/**
 * Create incident payload (for inserts)
 */
export interface CreateIncidentInput {
  title: string;
  description?: string;
  severity: IncidentSeverity;
  commander: string;
  channel_id: string;
  started_at?: string; // Defaults to NOW()
}

/**
 * Update incident payload (for updates)
 */
export interface UpdateIncidentInput {
  title?: string;
  description?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  responders?: string[];
  plane_issue_id?: string;
  pagerduty_incident_id?: string;
  statuspage_incident_id?: string;
  resolved_at?: string;
}

/**
 * Incident with calculated metrics
 */
export interface IncidentWithMetrics extends Incident {
  duration_minutes: number; // Duration in minutes (live or resolved)
  response_time_minutes: number; // Time from start to first update
  is_sla_violated: boolean; // Based on severity SLA targets
}

/**
 * Severity SLA targets (response time in minutes)
 */
export const SEVERITY_SLA_TARGETS: Record<IncidentSeverity, number> = {
  'SEV-1': 5, // 5 minutes
  'SEV-2': 15, // 15 minutes
  'SEV-3': 120, // 2 hours
  'SEV-4': Infinity, // Best effort
};

/**
 * Severity emoji mapping for Slack
 */
export const SEVERITY_EMOJI: Record<IncidentSeverity, string> = {
  'SEV-1': '🔴',
  'SEV-2': '🟠',
  'SEV-3': '🟡',
  'SEV-4': '🟢',
};

/**
 * Severity descriptions
 */
export const SEVERITY_DESCRIPTIONS: Record<IncidentSeverity, string> = {
  'SEV-1': 'Critical - Total outage, data loss risk, security breach',
  'SEV-2': 'High - Major functionality broken, significant user impact',
  'SEV-3': 'Medium - Degraded performance, workaround available',
  'SEV-4': 'Low - Minor issue, minimal user impact',
};

/**
 * Calculate if incident violates SLA
 */
export function isIncidentSLAViolated(incident: Incident): boolean {
  if (incident.status === 'resolved' && incident.mttr_minutes !== null) {
    const slaTarget = SEVERITY_SLA_TARGETS[incident.severity];
    return incident.mttr_minutes > slaTarget;
  }

  // For active incidents, check if response time exceeded
  const elapsedMinutes =
    (new Date().getTime() - new Date(incident.started_at).getTime()) / 60000;
  const slaTarget = SEVERITY_SLA_TARGETS[incident.severity];

  return elapsedMinutes > slaTarget;
}

/**
 * Format incident duration for display
 */
export function formatIncidentDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Get Slack message blocks for incident
 */
export function getIncidentSlackBlocks(incident: Incident) {
  const emoji = SEVERITY_EMOJI[incident.severity];
  const statusEmoji = incident.status === 'active' ? '🚨' : '✅';

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${statusEmoji} ${emoji} ${incident.severity}: ${incident.title}`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Incident ID:*\n${incident.id}`,
        },
        {
          type: 'mrkdwn',
          text: `*Status:*\n${incident.status}`,
        },
        {
          type: 'mrkdwn',
          text: `*Commander:*\n${incident.commander}`,
        },
        {
          type: 'mrkdwn',
          text: `*Started:*\n<!date^${Math.floor(new Date(incident.started_at).getTime() / 1000)}^{date_short_pretty} {time}|${incident.started_at}>`,
        },
      ],
    },
  ];
}
