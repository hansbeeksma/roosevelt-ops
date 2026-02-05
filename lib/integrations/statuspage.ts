/**
 * Status Page Integration
 *
 * Automatically updates public status page when incidents occur.
 * Supports both Statuspage.io (Atlassian) and custom Next.js implementation.
 */

import { Incident, IncidentSeverity } from '@/lib/types/incidents';

/**
 * Statuspage.io API types
 */
interface StatusPageComponent {
  id: string;
  name: string;
  status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage' | 'under_maintenance';
}

interface StatusPageIncident {
  name: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'none' | 'minor' | 'major' | 'critical';
  body: string;
  component_ids?: string[];
  components?: Record<string, 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage'>;
}

interface StatusPageIncidentResponse {
  id: string;
  name: string;
  status: string;
  impact: string;
  shortlink: string;
}

/**
 * Map incident severity to Statuspage.io impact level
 */
function mapSeverityToImpact(severity: IncidentSeverity): 'none' | 'minor' | 'major' | 'critical' {
  switch (severity) {
    case 'SEV-1':
      return 'critical';
    case 'SEV-2':
      return 'major';
    case 'SEV-3':
      return 'minor';
    case 'SEV-4':
      return 'none';
  }
}

/**
 * Map incident severity to component status
 */
function mapSeverityToComponentStatus(
  severity: IncidentSeverity
): 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage' {
  switch (severity) {
    case 'SEV-1':
      return 'major_outage';
    case 'SEV-2':
      return 'partial_outage';
    case 'SEV-3':
      return 'degraded_performance';
    case 'SEV-4':
      return 'degraded_performance';
  }
}

/**
 * Check if Status Page integration is configured
 */
export function isStatusPageEnabled(): boolean {
  return !!(process.env.STATUSPAGE_API_KEY && process.env.STATUSPAGE_PAGE_ID);
}

/**
 * Create incident on Statuspage.io
 *
 * Posts new incident to public status page
 */
export async function createStatusPageIncident(
  incident: Incident,
  affectedComponents?: string[]
): Promise<string | null> {
  if (!isStatusPageEnabled()) {
    console.log('Status Page not configured - skipping');
    return null;
  }

  const apiKey = process.env.STATUSPAGE_API_KEY!;
  const pageId = process.env.STATUSPAGE_PAGE_ID!;

  const incidentData: StatusPageIncident = {
    name: incident.title,
    status: 'investigating',
    impact: mapSeverityToImpact(incident.severity),
    body: incident.description || 'We are investigating the issue and will provide updates shortly.',
    component_ids: affectedComponents,
  };

  // If components specified, set their status
  if (affectedComponents && affectedComponents.length > 0) {
    incidentData.components = {};
    affectedComponents.forEach((componentId) => {
      incidentData.components![componentId] = mapSeverityToComponentStatus(incident.severity);
    });
  }

  try {
    const response = await fetch(
      `https://api.statuspage.io/v1/pages/${pageId}/incidents`,
      {
        method: 'POST',
        headers: {
          'Authorization': `OAuth ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ incident: incidentData }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Statuspage.io API error: ${JSON.stringify(errorData)}`);
    }

    const data: StatusPageIncidentResponse = await response.json();
    console.log(`Status Page incident created: ${data.id}`);

    return data.id;
  } catch (error) {
    console.error('Failed to create Status Page incident:', error);
    return null;
  }
}

/**
 * Update incident on Statuspage.io
 *
 * Posts status update to existing incident
 */
export async function updateStatusPageIncident(
  statusPageIncidentId: string,
  message: string,
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
): Promise<boolean> {
  if (!isStatusPageEnabled()) {
    return false;
  }

  const apiKey = process.env.STATUSPAGE_API_KEY!;
  const pageId = process.env.STATUSPAGE_PAGE_ID!;

  try {
    const response = await fetch(
      `https://api.statuspage.io/v1/pages/${pageId}/incidents/${statusPageIncidentId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `OAuth ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incident: {
            status,
            body: message,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Statuspage.io API error: ${response.statusText}`);
    }

    console.log(`Status Page incident updated: ${statusPageIncidentId}`);
    return true;
  } catch (error) {
    console.error('Failed to update Status Page incident:', error);
    return false;
  }
}

/**
 * Resolve incident on Statuspage.io
 *
 * Marks incident as resolved and restores component status
 */
export async function resolveStatusPageIncident(
  statusPageIncidentId: string,
  resolutionMessage?: string
): Promise<boolean> {
  if (!isStatusPageEnabled()) {
    return false;
  }

  const apiKey = process.env.STATUSPAGE_API_KEY!;
  const pageId = process.env.STATUSPAGE_PAGE_ID!;

  const message = resolutionMessage || 'This incident has been resolved. All systems are operational.';

  try {
    const response = await fetch(
      `https://api.statuspage.io/v1/pages/${pageId}/incidents/${statusPageIncidentId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `OAuth ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incident: {
            status: 'resolved',
            body: message,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Statuspage.io API error: ${response.statusText}`);
    }

    console.log(`Status Page incident resolved: ${statusPageIncidentId}`);
    return true;
  } catch (error) {
    console.error('Failed to resolve Status Page incident:', error);
    return false;
  }
}

/**
 * Get available components from Statuspage.io
 *
 * Useful for mapping affected services to component IDs
 */
export async function getStatusPageComponents(): Promise<StatusPageComponent[]> {
  if (!isStatusPageEnabled()) {
    return [];
  }

  const apiKey = process.env.STATUSPAGE_API_KEY!;
  const pageId = process.env.STATUSPAGE_PAGE_ID!;

  try {
    const response = await fetch(
      `https://api.statuspage.io/v1/pages/${pageId}/components`,
      {
        headers: {
          'Authorization': `OAuth ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Statuspage.io API error: ${response.statusText}`);
    }

    const components: StatusPageComponent[] = await response.json();
    return components;
  } catch (error) {
    console.error('Failed to get Status Page components:', error);
    return [];
  }
}

/**
 * Detect affected components from incident title
 *
 * Simple keyword matching to auto-detect which services are affected
 */
export async function detectAffectedComponents(incidentTitle: string): Promise<string[]> {
  const components = await getStatusPageComponents();
  if (components.length === 0) return [];

  const titleLower = incidentTitle.toLowerCase();
  const affected: string[] = [];

  // Keyword mapping
  const keywords: Record<string, string[]> = {
    'api': ['api', 'endpoint', 'backend'],
    'database': ['database', 'db', 'postgres', 'supabase'],
    'website': ['website', 'frontend', 'web', 'ui'],
    'authentication': ['auth', 'login', 'signup', 'oauth'],
    'payments': ['payment', 'stripe', 'billing'],
  };

  components.forEach((component) => {
    const componentNameLower = component.name.toLowerCase();

    // Check if component name appears in title
    if (titleLower.includes(componentNameLower)) {
      affected.push(component.id);
      return;
    }

    // Check keywords
    const componentKeywords = keywords[componentNameLower] || [];
    if (componentKeywords.some((keyword) => titleLower.includes(keyword))) {
      affected.push(component.id);
    }
  });

  return affected;
}

/**
 * Custom Status Page Implementation (Next.js API route)
 *
 * For teams using custom status page instead of Statuspage.io
 */
export async function updateCustomStatusPage(
  incident: Incident,
  action: 'create' | 'update' | 'resolve',
  message?: string
): Promise<boolean> {
  const customStatusPageUrl = process.env.CUSTOM_STATUS_PAGE_URL;

  if (!customStatusPageUrl) {
    return false;
  }

  try {
    const response = await fetch(`${customStatusPageUrl}/api/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CUSTOM_STATUS_PAGE_TOKEN}`,
      },
      body: JSON.stringify({
        action,
        incident: {
          id: incident.id,
          title: incident.title,
          severity: incident.severity,
          status: incident.status,
          message: message || incident.description,
          started_at: incident.started_at,
          resolved_at: incident.resolved_at,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Custom Status Page error: ${response.statusText}`);
    }

    console.log(`Custom Status Page updated: ${action} for ${incident.id}`);
    return true;
  } catch (error) {
    console.error('Failed to update Custom Status Page:', error);
    return false;
  }
}

/**
 * Get Status Page public URL for incident
 */
export function getStatusPageUrl(statusPageIncidentId?: string): string {
  const pageId = process.env.STATUSPAGE_PAGE_ID;

  if (!pageId) {
    return process.env.CUSTOM_STATUS_PAGE_URL || '';
  }

  const baseUrl = `https://${pageId}.statuspage.io`;

  if (statusPageIncidentId) {
    return `${baseUrl}/incidents/${statusPageIncidentId}`;
  }

  return baseUrl;
}
