/**
 * Client Onboarding Workflow
 *
 * Triggered when a new opportunity.won event arrives from Twenty CRM.
 * Each step is durable and independently retried by Inngest.
 *
 * Steps:
 * 1. Create organisation in Supabase
 * 2. Set up default project templates
 * 3. Send welcome Slack notification
 * 4. Create initial Plane project
 * 5. Schedule kickoff meeting reminder
 */

import { Inngest } from 'inngest'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Inngest client
// ---------------------------------------------------------------------------

export const inngest = new Inngest({ id: 'roosevelt-ops' })

// ---------------------------------------------------------------------------
// Environment guards
// ---------------------------------------------------------------------------

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OpportunityWonEvent {
  opportunityId: string
  clientName: string
  clientEmail: string
  projectType: string
  estimatedBudget: number
  description: string
  contactName: string
}

export interface OrganisationRecord {
  id: string
  name: string
  slug: string
  createdAt: string
}

export interface TemplateSetupResult {
  templateIds: string[]
  projectCount: number
}

export interface SlackNotificationResult {
  channelId: string
  messageTs: string
}

export interface PlaneProjectRecord {
  projectId: string
  identifier: string
  projectUrl: string
}

export interface KickoffReminderResult {
  scheduledAt: string
  reminderEventId: string
}

export interface ClientOnboardingResult {
  organisation: OrganisationRecord
  templates: TemplateSetupResult
  slack: SlackNotificationResult
  plane: PlaneProjectRecord
  kickoffReminder: KickoffReminderResult
}

// ---------------------------------------------------------------------------
// Step helpers
// ---------------------------------------------------------------------------

function buildSupabaseClient() {
  return createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'))
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

async function createOrganisation(payload: OpportunityWonEvent): Promise<OrganisationRecord> {
  const supabase = buildSupabaseClient()

  const slug = slugify(payload.clientName)

  const { data, error } = await supabase
    .from('organizations')
    .insert({
      name: payload.clientName,
      slug,
      contact_email: payload.clientEmail,
      contact_name: payload.contactName,
      project_type: payload.projectType,
      estimated_budget: payload.estimatedBudget,
      onboarding_status: 'in_progress',
    })
    .select('id, name, slug, created_at')
    .single()

  if (error) {
    throw new Error(`Failed to create organisation in Supabase: ${error.message}`)
  }

  return {
    id: data.id as string,
    name: data.name as string,
    slug: data.slug as string,
    createdAt: data.created_at as string,
  }
}

async function setupProjectTemplates(
  organisation: OrganisationRecord,
  payload: OpportunityWonEvent
): Promise<TemplateSetupResult> {
  const supabase = buildSupabaseClient()

  const DEFAULT_TEMPLATES = [
    { name: 'Discovery & Scoping', phase: 'discovery', sort_order: 1 },
    { name: 'Design & Prototyping', phase: 'design', sort_order: 2 },
    { name: 'Development', phase: 'development', sort_order: 3 },
    { name: 'QA & Testing', phase: 'qa', sort_order: 4 },
    { name: 'Launch & Handoff', phase: 'launch', sort_order: 5 },
  ]

  const rows = DEFAULT_TEMPLATES.map((template) => ({
    ...template,
    organization_id: organisation.id,
    project_type: payload.projectType,
    is_active: true,
  }))

  const { data, error } = await supabase.from('project_templates').insert(rows).select('id')

  if (error) {
    throw new Error(`Failed to set up project templates: ${error.message}`)
  }

  return {
    templateIds: (data ?? []).map((row: { id: string }) => row.id),
    projectCount: DEFAULT_TEMPLATES.length,
  }
}

async function sendSlackWelcomeNotification(
  payload: OpportunityWonEvent,
  organisation: OrganisationRecord
): Promise<SlackNotificationResult> {
  const botToken = requireEnv('SLACK_BOT_TOKEN')
  const channelId = requireEnv('SLACK_NEW_CLIENTS_CHANNEL_ID')

  const text =
    `:rocket: *New Client Onboarded: ${payload.clientName}*\n\n` +
    `*Contact:* ${payload.contactName} <${payload.clientEmail}>\n` +
    `*Project type:* ${payload.projectType}\n` +
    `*Budget:* €${payload.estimatedBudget.toLocaleString()}\n` +
    `*Org ID:* ${organisation.id}\n\n` +
    `Automated onboarding is in progress. Plane project and kickoff reminder coming up.`

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel: channelId, text, unfurl_links: false }),
  })

  const result = (await response.json()) as {
    ok: boolean
    ts: string
    error?: string
  }

  if (!result.ok) {
    throw new Error(`Slack welcome notification failed: ${result.error ?? 'unknown error'}`)
  }

  return { channelId, messageTs: result.ts }
}

async function createPlaneProject(
  payload: OpportunityWonEvent,
  organisation: OrganisationRecord
): Promise<PlaneProjectRecord> {
  const apiKey = requireEnv('PLANE_API_KEY')
  const workspaceSlug = requireEnv('PLANE_WORKSPACE_SLUG')

  const identifier = payload.clientName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 5)

  const response = await fetch(
    `https://api.plane.so/api/v1/workspaces/${workspaceSlug}/projects/`,
    {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: payload.clientName,
        identifier,
        description:
          `Client project for ${payload.clientName} — ${payload.projectType}.\n` +
          `Organisation ID: ${organisation.id}`,
        network: 2, // Secret
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Plane project creation failed (${response.status}): ${errorText}`)
  }

  const project = (await response.json()) as { id: string; identifier: string }

  // Persist plane_project_id back to the organisation record
  const supabase = buildSupabaseClient()
  await supabase
    .from('organizations')
    .update({ plane_project_id: project.id })
    .eq('id', organisation.id)

  return {
    projectId: project.id,
    identifier: project.identifier,
    projectUrl: `https://app.plane.so/${workspaceSlug}/projects/${project.id}/issues/`,
  }
}

async function scheduleKickoffReminder(
  payload: OpportunityWonEvent,
  organisation: OrganisationRecord
): Promise<KickoffReminderResult> {
  // Schedule the reminder 3 business days from now via Inngest send-event
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000
  const scheduledAt = new Date(Date.now() + THREE_DAYS_MS).toISOString()

  await inngest.send({
    name: 'onboarding/kickoff.reminder',
    data: {
      organisationId: organisation.id,
      clientName: payload.clientName,
      contactEmail: payload.clientEmail,
      contactName: payload.contactName,
    },
    ts: Date.now() + THREE_DAYS_MS,
  })

  return {
    scheduledAt,
    reminderEventId: `kickoff-reminder-${organisation.id}`,
  }
}

// ---------------------------------------------------------------------------
// Inngest function
// ---------------------------------------------------------------------------

export const clientOnboardingWorkflow = inngest.createFunction(
  {
    id: 'client-onboarding-v2',
    name: 'Client Onboarding: opportunity.won',
    retries: 3,
  },
  { event: 'crm/opportunity.won' },
  async ({ event, step }): Promise<ClientOnboardingResult> => {
    const payload = event.data as OpportunityWonEvent

    // Step 1 — Create organisation in Supabase
    const organisation = await step.run('create-organisation', async () =>
      createOrganisation(payload)
    )

    // Step 2 — Set up default project templates
    const templates = await step.run('setup-project-templates', async () =>
      setupProjectTemplates(organisation, payload)
    )

    // Step 3 — Send welcome Slack notification
    const slack = await step.run('send-slack-welcome', async () =>
      sendSlackWelcomeNotification(payload, organisation)
    )

    // Step 4 — Create Plane project
    const plane = await step.run('create-plane-project', async () =>
      createPlaneProject(payload, organisation)
    )

    // Step 5 — Schedule kickoff meeting reminder (3 days out)
    const kickoffReminder = await step.run('schedule-kickoff-reminder', async () =>
      scheduleKickoffReminder(payload, organisation)
    )

    return { organisation, templates, slack, plane, kickoffReminder }
  }
)
