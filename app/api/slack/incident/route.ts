import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import {
  triggerPagerDutyIncident,
  resolvePagerDutyIncident,
  shouldTriggerPagerDuty,
} from '@/lib/integrations/pagerduty';

// Types
interface SlackCommandPayload {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  api_app_id: string;
  response_url: string;
  trigger_id: string;
}

interface IncidentData {
  id: string;
  title: string;
  severity: 'SEV-1' | 'SEV-2' | 'SEV-3' | 'SEV-4';
  status: 'active' | 'resolved';
  commander: string;
  channel_id: string;
  started_at: string;
  resolved_at?: string;
  description?: string;
}

/**
 * Verify Slack request signature
 * Security measure to ensure requests actually come from Slack
 */
function verifySlackSignature(
  request: NextRequest,
  body: string
): boolean {
  const signature = request.headers.get('x-slack-signature');
  const timestamp = request.headers.get('x-slack-request-timestamp');
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  if (!signature || !timestamp || !signingSecret) {
    return false;
  }

  // Prevent replay attacks (request older than 5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 60 * 5) {
    return false;
  }

  // Compute expected signature
  const sigBasestring = `v0:${timestamp}:${body}`;
  const hmac = crypto
    .createHmac('sha256', signingSecret)
    .update(sigBasestring)
    .digest('hex');
  const expectedSignature = `v0=${hmac}`;

  // Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Parse Slack slash command payload
 */
function parseSlackCommand(body: string): SlackCommandPayload {
  const params = new URLSearchParams(body);
  return {
    token: params.get('token') || '',
    team_id: params.get('team_id') || '',
    team_domain: params.get('team_domain') || '',
    channel_id: params.get('channel_id') || '',
    channel_name: params.get('channel_name') || '',
    user_id: params.get('user_id') || '',
    user_name: params.get('user_name') || '',
    command: params.get('command') || '',
    text: params.get('text') || '',
    api_app_id: params.get('api_app_id') || '',
    response_url: params.get('response_url') || '',
    trigger_id: params.get('trigger_id') || '',
  };
}

/**
 * Handle /incident start
 * Creates new incident, dedicated Slack channel, and Plane issue
 */
async function handleIncidentStart(
  args: string[],
  userId: string,
  userName: string,
  channelId: string
): Promise<NextResponse> {
  const [severity, ...titleParts] = args;
  const title = titleParts.join(' ');

  // Validate severity
  if (!['SEV-1', 'SEV-2', 'SEV-3', 'SEV-4'].includes(severity)) {
    return NextResponse.json({
      response_type: 'ephemeral',
      text: `❌ Invalid severity. Use: SEV-1, SEV-2, SEV-3, or SEV-4\n\nExample: \`/incident start SEV-2 API timeout errors\``,
    });
  }

  if (!title) {
    return NextResponse.json({
      response_type: 'ephemeral',
      text: '❌ Incident title required\n\nExample: `/incident start SEV-2 API timeout errors`',
    });
  }

  try {
    // Create incident channel
    const channelName = `incident-${Date.now()}`;
    const channelResponse = await fetch('https://slack.com/api/conversations.create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        name: channelName,
        is_private: false,
      }),
    });

    const channelData = await channelResponse.json();
    if (!channelData.ok) {
      throw new Error(`Failed to create channel: ${channelData.error}`);
    }

    const incidentChannelId = channelData.channel.id;

    // Store incident in Supabase
    const supabase = await createClient();
    const { data: incident, error: dbError } = await supabase
      .from('incidents')
      .insert({
        title,
        severity,
        status: 'active',
        commander: userName,
        channel_id: incidentChannelId,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Post incident summary to channel
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        channel: incidentChannelId,
        text: `🚨 *Incident ${incident.id} Started*`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `🚨 ${severity}: ${title}`,
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
                text: `*Severity:*\n${severity}`,
              },
              {
                type: 'mrkdwn',
                text: `*Commander:*\n<@${userId}>`,
              },
              {
                type: 'mrkdwn',
                text: `*Started:*\n<!date^${Math.floor(Date.now() / 1000)}^{date_short_pretty} {time}|${new Date().toISOString()}>`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Next Steps:*\n• Post status updates with `/incident update <incident-id> <message>`\n• Resolve with `/incident resolve <incident-id>`',
            },
          },
        ],
      }),
    });

    // Trigger PagerDuty alert (SEV-1 and SEV-2 only)
    let pagerdutyIncidentId: string | null = null;
    if (shouldTriggerPagerDuty(severity as any)) {
      const slackChannelUrl = `https://app.slack.com/client/${process.env.SLACK_TEAM_ID}/${incidentChannelId}`;
      pagerdutyIncidentId = await triggerPagerDutyIncident(
        { ...incident, severity: severity as any },
        slackChannelUrl
      );

      // Update incident with PagerDuty ID if triggered
      if (pagerdutyIncidentId) {
        await supabase
          .from('incidents')
          .update({ pagerduty_incident_id: pagerdutyIncidentId })
          .eq('id', incident.id);

        // Post PagerDuty confirmation to channel
        await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          },
          body: JSON.stringify({
            channel: incidentChannelId,
            text: '📟 PagerDuty alert triggered - on-call engineer has been paged',
            blocks: [
              {
                type: 'context',
                elements: [
                  {
                    type: 'mrkdwn',
                    text: `📟 *PagerDuty alert triggered* - On-call engineer has been paged for ${severity} incident`,
                  },
                ],
              },
            ],
          }),
        });
      }
    }

    // Create Plane issue (if configured)
    if (process.env.PLANE_API_KEY) {
      // TODO: Implement Plane issue creation
      // This would use the Plane MCP tools to create an issue
    }

    // Respond to user
    return NextResponse.json({
      response_type: 'in_channel',
      text: `✅ Incident created: <#${incidentChannelId}>`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ *Incident ${incident.id} created*\n\n📋 *Title:* ${title}\n⚠️ *Severity:* ${severity}\n👤 *Commander:* <@${userId}>\n💬 *Channel:* <#${incidentChannelId}>`,
          },
        },
      ],
    });
  } catch (error) {
    console.error('Incident start error:', error);
    return NextResponse.json({
      response_type: 'ephemeral',
      text: `❌ Failed to start incident: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

/**
 * Handle /incident update
 * Posts status update to incident channel
 */
async function handleIncidentUpdate(
  args: string[],
  userId: string,
  userName: string
): Promise<NextResponse> {
  const [incidentId, ...messageParts] = args;
  const message = messageParts.join(' ');

  if (!incidentId || !message) {
    return NextResponse.json({
      response_type: 'ephemeral',
      text: '❌ Usage: `/incident update <incident-id> <status message>`',
    });
  }

  try {
    // Fetch incident from Supabase
    const supabase = await createClient();
    const { data: incident, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .single();

    if (error || !incident) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: `❌ Incident ${incidentId} not found`,
      });
    }

    if (incident.status === 'resolved') {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: `❌ Incident ${incidentId} is already resolved`,
      });
    }

    // Post update to incident channel
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        channel: incident.channel_id,
        text: `📢 Status Update from <@${userId}>`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `📢 *Status Update*\n\n${message}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Updated by <@${userId}> • <!date^${Math.floor(Date.now() / 1000)}^{time}|now>`,
              },
            ],
          },
        ],
      }),
    });

    return NextResponse.json({
      response_type: 'ephemeral',
      text: `✅ Status update posted to <#${incident.channel_id}>`,
    });
  } catch (error) {
    console.error('Incident update error:', error);
    return NextResponse.json({
      response_type: 'ephemeral',
      text: `❌ Failed to update incident: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

/**
 * Handle /incident resolve
 * Marks incident as resolved and archives channel
 */
async function handleIncidentResolve(
  args: string[],
  userId: string,
  userName: string
): Promise<NextResponse> {
  const [incidentId] = args;

  if (!incidentId) {
    return NextResponse.json({
      response_type: 'ephemeral',
      text: '❌ Usage: `/incident resolve <incident-id>`',
    });
  }

  try {
    // Fetch and update incident
    const supabase = await createClient();
    const { data: incident, error: fetchError } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .single();

    if (fetchError || !incident) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: `❌ Incident ${incidentId} not found`,
      });
    }

    if (incident.status === 'resolved') {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: `❌ Incident ${incidentId} is already resolved`,
      });
    }

    // Mark as resolved
    const { error: updateError } = await supabase
      .from('incidents')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', incidentId);

    if (updateError) throw updateError;

    // Post resolution message
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        channel: incident.channel_id,
        text: `✅ Incident Resolved`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '✅ Incident Resolved',
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Resolved by:*\n<@${userId}>`,
              },
              {
                type: 'mrkdwn',
                text: `*Duration:*\n${calculateDuration(incident.started_at, new Date().toISOString())}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Next Steps:*\n• Create postmortem (within 48 hours)\n• Archive this channel in 24 hours',
            },
          },
        ],
      }),
    });

    // Resolve PagerDuty incident (if it was triggered)
    if (incident.pagerduty_incident_id) {
      const pagerdutyResolved = await resolvePagerDutyIncident(incident.pagerduty_incident_id);

      if (pagerdutyResolved) {
        // Post PagerDuty confirmation to channel
        await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          },
          body: JSON.stringify({
            channel: incident.channel_id,
            text: '✅ PagerDuty incident resolved',
            blocks: [
              {
                type: 'context',
                elements: [
                  {
                    type: 'mrkdwn',
                    text: '✅ *PagerDuty incident resolved* - On-call engineer notified',
                  },
                ],
              },
            ],
          }),
        });
      }
    }

    // Archive channel after 24 hours (schedule job)
    // TODO: Implement channel archival scheduling

    return NextResponse.json({
      response_type: 'in_channel',
      text: `✅ Incident ${incidentId} resolved by <@${userId}>`,
    });
  } catch (error) {
    console.error('Incident resolve error:', error);
    return NextResponse.json({
      response_type: 'ephemeral',
      text: `❌ Failed to resolve incident: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

/**
 * Calculate incident duration
 */
function calculateDuration(start: string, end: string): string {
  const duration = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.floor(duration / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

/**
 * Main POST handler for /incident slash command
 */
export async function POST(request: NextRequest) {
  try {
    // Read request body
    const body = await request.text();

    // Verify Slack signature
    if (!verifySlackSignature(request, body)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse command
    const payload = parseSlackCommand(body);
    const [command, ...args] = payload.text.split(' ');

    // Route to handler
    switch (command) {
      case 'start':
        return handleIncidentStart(
          args,
          payload.user_id,
          payload.user_name,
          payload.channel_id
        );

      case 'update':
        return handleIncidentUpdate(
          args,
          payload.user_id,
          payload.user_name
        );

      case 'resolve':
        return handleIncidentResolve(
          args,
          payload.user_id,
          payload.user_name
        );

      default:
        return NextResponse.json({
          response_type: 'ephemeral',
          text: `❌ Unknown command: \`${command}\`\n\nAvailable commands:\n• \`/incident start <SEV-X> <title>\`\n• \`/incident update <incident-id> <message>\`\n• \`/incident resolve <incident-id>\``,
        });
    }
  } catch (error) {
    console.error('Slack incident command error:', error);
    return NextResponse.json(
      {
        response_type: 'ephemeral',
        text: '❌ Internal error processing command',
      },
      { status: 500 }
    );
  }
}
