/**
 * PagerDuty Integration
 *
 * Triggers PagerDuty alerts for critical incidents (SEV-1, SEV-2)
 * and syncs incident status between Slack and PagerDuty.
 */

import { IncidentSeverity, Incident } from '@/lib/types/incidents';

interface PagerDutyEvent {
  routing_key: string;
  event_action: 'trigger' | 'acknowledge' | 'resolve';
  payload: {
    summary: string;
    severity: 'critical' | 'error' | 'warning' | 'info';
    source: string;
    component?: string;
    group?: string;
    class?: string;
    custom_details?: Record<string, any>;
  };
  dedup_key?: string;
  images?: Array<{
    src: string;
    href?: string;
    alt?: string;
  }>;
  links?: Array<{
    href: string;
    text?: string;
  }>;
  client?: string;
  client_url?: string;
}

interface PagerDutyResponse {
  status: string;
  message: string;
  dedup_key: string;
}

/**
 * Map incident severity to PagerDuty severity
 */
function mapSeverityToPagerDuty(severity: IncidentSeverity): 'critical' | 'error' | 'warning' | 'info' {
  switch (severity) {
    case 'SEV-1':
      return 'critical';
    case 'SEV-2':
      return 'error';
    case 'SEV-3':
      return 'warning';
    case 'SEV-4':
      return 'info';
  }
}

/**
 * Check if severity requires PagerDuty alert
 * Only SEV-1 and SEV-2 trigger pages
 */
export function shouldTriggerPagerDuty(severity: IncidentSeverity): boolean {
  return severity === 'SEV-1' || severity === 'SEV-2';
}

/**
 * Trigger PagerDuty incident
 *
 * Creates a new PagerDuty incident and pages the on-call engineer
 */
export async function triggerPagerDutyIncident(
  incident: Incident,
  slackChannelUrl?: string
): Promise<string | null> {
  const routingKey = process.env.PAGERDUTY_ROUTING_KEY;

  if (!routingKey) {
    console.warn('PagerDuty routing key not configured - skipping alert');
    return null;
  }

  // Only trigger for SEV-1 and SEV-2
  if (!shouldTriggerPagerDuty(incident.severity)) {
    console.log(`Incident ${incident.id} is ${incident.severity} - no PagerDuty alert needed`);
    return null;
  }

  const event: PagerDutyEvent = {
    routing_key: routingKey,
    event_action: 'trigger',
    payload: {
      summary: `${incident.severity}: ${incident.title}`,
      severity: mapSeverityToPagerDuty(incident.severity),
      source: 'Roosevelt OPS Incident Bot',
      component: 'incident-management',
      group: 'production',
      class: incident.severity,
      custom_details: {
        incident_id: incident.id,
        commander: incident.commander,
        started_at: incident.started_at,
        description: incident.description,
        slack_channel_id: incident.channel_id,
      },
    },
    dedup_key: incident.id, // Use incident ID for deduplication
    client: 'Roosevelt OPS',
    client_url: slackChannelUrl,
  };

  // Add Slack channel link if available
  if (slackChannelUrl) {
    event.links = [
      {
        href: slackChannelUrl,
        text: 'Open Slack Incident Channel',
      },
    ];
  }

  try {
    const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pagerduty+json;version=2',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`PagerDuty API error: ${errorData.message || response.statusText}`);
    }

    const data: PagerDutyResponse = await response.json();
    console.log(`PagerDuty incident triggered: ${data.dedup_key}`);

    return data.dedup_key;
  } catch (error) {
    console.error('Failed to trigger PagerDuty incident:', error);
    // Don't fail the whole incident creation if PagerDuty fails
    return null;
  }
}

/**
 * Acknowledge PagerDuty incident
 *
 * Called when incident commander starts working on the incident
 */
export async function acknowledgePagerDutyIncident(
  incidentId: string
): Promise<boolean> {
  const routingKey = process.env.PAGERDUTY_ROUTING_KEY;

  if (!routingKey) {
    return false;
  }

  const event: PagerDutyEvent = {
    routing_key: routingKey,
    event_action: 'acknowledge',
    payload: {
      summary: 'Incident acknowledged',
      severity: 'info',
      source: 'Roosevelt OPS Incident Bot',
    },
    dedup_key: incidentId,
  };

  try {
    const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pagerduty+json;version=2',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`PagerDuty API error: ${response.statusText}`);
    }

    console.log(`PagerDuty incident acknowledged: ${incidentId}`);
    return true;
  } catch (error) {
    console.error('Failed to acknowledge PagerDuty incident:', error);
    return false;
  }
}

/**
 * Resolve PagerDuty incident
 *
 * Called when incident is resolved in Slack
 */
export async function resolvePagerDutyIncident(
  incidentId: string
): Promise<boolean> {
  const routingKey = process.env.PAGERDUTY_ROUTING_KEY;

  if (!routingKey) {
    return false;
  }

  const event: PagerDutyEvent = {
    routing_key: routingKey,
    event_action: 'resolve',
    payload: {
      summary: 'Incident resolved',
      severity: 'info',
      source: 'Roosevelt OPS Incident Bot',
    },
    dedup_key: incidentId,
  };

  try {
    const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pagerduty+json;version=2',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`PagerDuty API error: ${response.statusText}`);
    }

    console.log(`PagerDuty incident resolved: ${incidentId}`);
    return true;
  } catch (error) {
    console.error('Failed to resolve PagerDuty incident:', error);
    return false;
  }
}

/**
 * Get PagerDuty incident details
 *
 * Fetches current status of PagerDuty incident using REST API
 */
export async function getPagerDutyIncidentStatus(
  incidentId: string
): Promise<{
  status: 'triggered' | 'acknowledged' | 'resolved';
  html_url: string;
} | null> {
  const apiKey = process.env.PAGERDUTY_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    // Search for incident by dedup_key (which is our incident ID)
    const response = await fetch(
      `https://api.pagerduty.com/incidents?incident_key=${incidentId}`,
      {
        headers: {
          'Authorization': `Token token=${apiKey}`,
          'Accept': 'application/vnd.pagerduty+json;version=2',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`PagerDuty API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.incidents || data.incidents.length === 0) {
      return null;
    }

    const incident = data.incidents[0];
    return {
      status: incident.status,
      html_url: incident.html_url,
    };
  } catch (error) {
    console.error('Failed to get PagerDuty incident status:', error);
    return null;
  }
}

/**
 * Format PagerDuty status for Slack
 */
export function formatPagerDutyStatus(
  status: 'triggered' | 'acknowledged' | 'resolved' | null
): string {
  if (!status) return '';

  const statusEmoji = {
    triggered: '🔴',
    acknowledged: '🟡',
    resolved: '✅',
  };

  return `${statusEmoji[status]} PagerDuty: ${status}`;
}

/**
 * Get PagerDuty integration info for Slack message
 */
export async function getPagerDutySlackBlocks(incidentId: string) {
  const status = await getPagerDutyIncidentStatus(incidentId);

  if (!status) return [];

  return [
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `${formatPagerDutyStatus(status.status)} | <${status.html_url}|View in PagerDuty>`,
        },
      ],
    },
  ];
}
