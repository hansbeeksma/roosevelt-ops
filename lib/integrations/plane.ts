/**
 * Plane Integration
 *
 * Automatically creates Plane issues for incident tracking and postmortem action items.
 * Links incidents to project management workflow.
 */

import { Incident, IncidentSeverity } from '@/lib/types/incidents';

// Plane project configuration
const PLANE_WORKSPACE_SLUG = process.env.PLANE_WORKSPACE_SLUG || 'rooseveltdigital';
const PLANE_PROJECT_ID = process.env.PLANE_PROJECT_ID || 'c7d0b955-a97f-40b6-be03-7c05c2d0b1c3'; // ROOSE project

/**
 * Map incident severity to Plane priority
 */
function mapSeverityToPriority(severity: IncidentSeverity): 'urgent' | 'high' | 'medium' | 'low' | 'none' {
  switch (severity) {
    case 'SEV-1':
      return 'urgent';
    case 'SEV-2':
      return 'high';
    case 'SEV-3':
      return 'medium';
    case 'SEV-4':
      return 'low';
  }
}

/**
 * Map incident severity to Plane labels
 */
function getSeverityLabels(severity: IncidentSeverity): string[] {
  const labels = ['incident'];

  switch (severity) {
    case 'SEV-1':
      labels.push('p0', 'sev-1');
      break;
    case 'SEV-2':
      labels.push('p1', 'sev-2');
      break;
    case 'SEV-3':
      labels.push('p2', 'sev-3');
      break;
    case 'SEV-4':
      labels.push('p3', 'sev-4');
      break;
  }

  return labels;
}

/**
 * Check if Plane integration is configured
 */
export function isPlaneEnabled(): boolean {
  return !!(process.env.PLANE_API_KEY && process.env.PLANE_WORKSPACE_SLUG);
}

/**
 * Get or create labels in Plane project
 *
 * Ensures required labels exist before creating issues
 */
async function ensureLabelsExist(labelNames: string[]): Promise<Map<string, string>> {
  const apiKey = process.env.PLANE_API_KEY!;
  const labelMap = new Map<string, string>();

  try {
    // Fetch existing labels
    const response = await fetch(
      `https://api.plane.so/api/v1/workspaces/${PLANE_WORKSPACE_SLUG}/projects/${PLANE_PROJECT_ID}/issue-labels/`,
      {
        headers: {
          'x-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Plane API error: ${response.statusText}`);
    }

    const existingLabels = await response.json();

    // Map existing labels
    existingLabels.forEach((label: any) => {
      if (labelNames.includes(label.name)) {
        labelMap.set(label.name, label.id);
      }
    });

    // Create missing labels
    for (const labelName of labelNames) {
      if (!labelMap.has(labelName)) {
        const createResponse = await fetch(
          `https://api.plane.so/api/v1/workspaces/${PLANE_WORKSPACE_SLUG}/projects/${PLANE_PROJECT_ID}/issue-labels/`,
          {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: labelName,
              color: getColorForLabel(labelName),
            }),
          }
        );

        if (createResponse.ok) {
          const newLabel = await createResponse.json();
          labelMap.set(labelName, newLabel.id);
        }
      }
    }

    return labelMap;
  } catch (error) {
    console.error('Failed to ensure labels exist:', error);
    return labelMap;
  }
}

/**
 * Get color for label based on name
 */
function getColorForLabel(labelName: string): string {
  const colorMap: Record<string, string> = {
    'incident': '#F44336', // Red
    'sev-1': '#D32F2F', // Dark Red
    'sev-2': '#FF9800', // Orange
    'sev-3': '#FFC107', // Amber
    'sev-4': '#4CAF50', // Green
    'p0': '#B71C1C', // Deep Red
    'p1': '#E65100', // Deep Orange
    'p2': '#F57C00', // Orange
    'p3': '#FBC02D', // Yellow
    'postmortem': '#9C27B0', // Purple
    'action-item': '#673AB7', // Deep Purple
  };

  return colorMap[labelName] || '#607D8B'; // Default: Blue Grey
}

/**
 * Create Plane issue for incident tracking
 *
 * Creates issue in ROOSE project with incident details
 */
export async function createPlaneIncidentIssue(
  incident: Incident,
  slackChannelUrl?: string
): Promise<string | null> {
  if (!isPlaneEnabled()) {
    console.log('Plane integration not configured - skipping');
    return null;
  }

  const apiKey = process.env.PLANE_API_KEY!;

  try {
    // Get or create labels
    const labelNames = getSeverityLabels(incident.severity);
    const labelMap = await ensureLabelsExist(labelNames);
    const labelIds = Array.from(labelMap.values());

    // Build issue description
    const description = buildIncidentDescription(incident, slackChannelUrl);

    // Create issue
    const response = await fetch(
      `https://api.plane.so/api/v1/workspaces/${PLANE_WORKSPACE_SLUG}/projects/${PLANE_PROJECT_ID}/issues/`,
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `[INCIDENT] ${incident.title}`,
          description_html: description,
          priority: mapSeverityToPriority(incident.severity),
          labels: labelIds,
          state: await getStateId('Backlog'), // Start in Backlog
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Plane API error: ${JSON.stringify(errorData)}`);
    }

    const issue = await response.json();
    console.log(`Plane incident issue created: ${issue.id}`);

    return issue.id;
  } catch (error) {
    console.error('Failed to create Plane incident issue:', error);
    return null;
  }
}

/**
 * Build rich HTML description for Plane issue
 */
function buildIncidentDescription(incident: Incident, slackChannelUrl?: string): string {
  const sections = [
    '<h2>Incident Details</h2>',
    '<ul>',
    `<li><strong>Severity:</strong> ${incident.severity}</li>`,
    `<li><strong>Commander:</strong> ${incident.commander}</li>`,
    `<li><strong>Started:</strong> ${new Date(incident.started_at).toLocaleString()}</li>`,
    `<li><strong>Status:</strong> ${incident.status}</li>`,
  ];

  if (incident.resolved_at) {
    sections.push(`<li><strong>Resolved:</strong> ${new Date(incident.resolved_at).toLocaleString()}</li>`);
    if (incident.mttr_minutes) {
      sections.push(`<li><strong>MTTR:</strong> ${incident.mttr_minutes} minutes</li>`);
    }
  }

  sections.push('</ul>');

  if (incident.description) {
    sections.push('<h2>Description</h2>');
    sections.push(`<p>${incident.description}</p>`);
  }

  sections.push('<h2>Links</h2>');
  sections.push('<ul>');

  if (slackChannelUrl) {
    sections.push(`<li><a href="${slackChannelUrl}">Slack Incident Channel</a></li>`);
  }

  if (incident.pagerduty_incident_id) {
    sections.push(`<li>PagerDuty Incident ID: ${incident.pagerduty_incident_id}</li>`);
  }

  if (incident.statuspage_incident_id) {
    const statusPageUrl = `https://${process.env.STATUSPAGE_PAGE_ID}.statuspage.io/incidents/${incident.statuspage_incident_id}`;
    sections.push(`<li><a href="${statusPageUrl}">Public Status Page</a></li>`);
  }

  sections.push('</ul>');

  sections.push('<h2>Next Steps</h2>');
  sections.push('<ul>');
  sections.push('<li>Complete postmortem within 48 hours</li>');
  sections.push('<li>Identify action items to prevent recurrence</li>');
  sections.push('<li>Update runbooks if applicable</li>');
  sections.push('</ul>');

  return sections.join('\n');
}

/**
 * Get state ID for given state name
 */
async function getStateId(stateName: string): Promise<string | undefined> {
  const apiKey = process.env.PLANE_API_KEY!;

  try {
    const response = await fetch(
      `https://api.plane.so/api/v1/workspaces/${PLANE_WORKSPACE_SLUG}/projects/${PLANE_PROJECT_ID}/states/`,
      {
        headers: {
          'x-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Plane API error: ${response.statusText}`);
    }

    const states = await response.json();
    const state = states.find((s: any) => s.name === stateName);

    return state?.id;
  } catch (error) {
    console.error('Failed to get state ID:', error);
    return undefined;
  }
}

/**
 * Update Plane issue when incident is resolved
 */
export async function updatePlaneIncidentIssue(
  planeIssueId: string,
  incident: Incident
): Promise<boolean> {
  if (!isPlaneEnabled()) {
    return false;
  }

  const apiKey = process.env.PLANE_API_KEY!;

  try {
    // Move to Done state
    const doneStateId = await getStateId('Done');

    const updateData: any = {
      description_html: buildIncidentDescription(incident),
    };

    if (doneStateId) {
      updateData.state = doneStateId;
    }

    const response = await fetch(
      `https://api.plane.so/api/v1/workspaces/${PLANE_WORKSPACE_SLUG}/projects/${PLANE_PROJECT_ID}/issues/${planeIssueId}/`,
      {
        method: 'PATCH',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      throw new Error(`Plane API error: ${response.statusText}`);
    }

    console.log(`Plane incident issue updated: ${planeIssueId}`);
    return true;
  } catch (error) {
    console.error('Failed to update Plane incident issue:', error);
    return false;
  }
}

/**
 * Add comment to Plane issue
 */
export async function addPlaneIssueComment(
  planeIssueId: string,
  comment: string
): Promise<boolean> {
  if (!isPlaneEnabled()) {
    return false;
  }

  const apiKey = process.env.PLANE_API_KEY!;

  try {
    const response = await fetch(
      `https://api.plane.so/api/v1/workspaces/${PLANE_WORKSPACE_SLUG}/projects/${PLANE_PROJECT_ID}/issues/${planeIssueId}/comments/`,
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_html: `<p>${comment}</p>`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Plane API error: ${response.statusText}`);
    }

    console.log(`Comment added to Plane issue: ${planeIssueId}`);
    return true;
  } catch (error) {
    console.error('Failed to add Plane issue comment:', error);
    return false;
  }
}

/**
 * Create postmortem action item in Plane
 *
 * Called after postmortem to track follow-up work
 */
export async function createPostmortemActionItem(
  incidentId: string,
  actionItem: {
    title: string;
    description: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    owner?: string;
    dueDate?: Date;
  }
): Promise<string | null> {
  if (!isPlaneEnabled()) {
    return null;
  }

  const apiKey = process.env.PLANE_API_KEY!;

  try {
    // Get or create labels
    const labelMap = await ensureLabelsExist(['postmortem', 'action-item', actionItem.priority]);
    const labelIds = Array.from(labelMap.values());

    const issueData: any = {
      name: `[POSTMORTEM] ${actionItem.title}`,
      description_html: `<p>${actionItem.description}</p><p><em>Related to incident: ${incidentId}</em></p>`,
      priority: actionItem.priority,
      labels: labelIds,
      state: await getStateId('Todo'),
    };

    if (actionItem.dueDate) {
      issueData.target_date = actionItem.dueDate.toISOString().split('T')[0];
    }

    const response = await fetch(
      `https://api.plane.so/api/v1/workspaces/${PLANE_WORKSPACE_SLUG}/projects/${PLANE_PROJECT_ID}/issues/`,
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issueData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Plane API error: ${JSON.stringify(errorData)}`);
    }

    const issue = await response.json();
    console.log(`Postmortem action item created: ${issue.id}`);

    return issue.id;
  } catch (error) {
    console.error('Failed to create postmortem action item:', error);
    return null;
  }
}

/**
 * Get Plane issue URL
 */
export function getPlaneIssueUrl(issueId: string): string {
  return `https://app.plane.so/${PLANE_WORKSPACE_SLUG}/projects/${PLANE_PROJECT_ID}/issues/${issueId}`;
}
