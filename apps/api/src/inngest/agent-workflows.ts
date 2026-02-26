/**
 * Multi-agent workflow: New Client Onboarding
 *
 * Triggered when a CRM opportunity is marked as won.
 * Orchestrates Plane project creation, AI-generated scope, Slack notification
 * and welcome email via durable Inngest steps.
 */

import Anthropic from '@anthropic-ai/sdk'
import { Inngest } from 'inngest'

import { MODELS } from '@/lib/ai/model-config'

// ---------------------------------------------------------------------------
// Inngest client — shared across all workflow functions in this module
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

export interface OpportunityWonPayload {
  opportunityId: string
  clientName: string
  clientEmail: string
  projectType: string
  estimatedBudget: number
  description: string
  contactName: string
}

export interface PlaneProjectResult {
  projectId: string
  projectUrl: string
  identifier: string
}

export interface ScopeResult {
  summary: string
  deliverables: string[]
  milestones: string[]
  riskFactors: string[]
  estimatedWeeks: number
}

export interface SlackResult {
  channelId: string
  messageTs: string
}

export interface OnboardingResult {
  planeProject: PlaneProjectResult
  scope: ScopeResult
  slack: SlackResult
}

// ---------------------------------------------------------------------------
// Step helpers
// ---------------------------------------------------------------------------

async function createPlaneProject(payload: OpportunityWonPayload): Promise<PlaneProjectResult> {
  const apiKey = requireEnv('PLANE_API_KEY')
  const workspaceSlug = requireEnv('PLANE_WORKSPACE_SLUG')

  // Derive a short identifier from the client name (max 5 uppercase chars)
  const identifier = payload.clientName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 5)

  const body = JSON.stringify({
    name: payload.clientName,
    identifier,
    description: `Project for ${payload.clientName} — ${payload.projectType}`,
    network: 2, // Secret
  })

  const response = await fetch(
    `https://api.plane.so/api/v1/workspaces/${workspaceSlug}/projects/`,
    {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body,
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Plane project creation failed (${response.status}): ${error}`)
  }

  const project = (await response.json()) as { id: string; identifier: string }

  return {
    projectId: project.id,
    identifier: project.identifier,
    projectUrl: `https://app.plane.so/${workspaceSlug}/projects/${project.id}/issues/`,
  }
}

async function generateAiScope(payload: OpportunityWonPayload): Promise<ScopeResult> {
  const apiKey = requireEnv('ANTHROPIC_API_KEY')

  const client = new Anthropic({ apiKey })

  const prompt = `You are an experienced agency project manager at Roosevelt Digital.
A new client has been onboarded and you need to generate an initial project scope.

Client: ${payload.clientName}
Project type: ${payload.projectType}
Budget: €${payload.estimatedBudget.toLocaleString()}
Description: ${payload.description}

Generate a structured project scope as JSON with these exact fields:
{
  "summary": "one-paragraph executive summary",
  "deliverables": ["deliverable 1", "deliverable 2", ...],
  "milestones": ["milestone 1", "milestone 2", ...],
  "riskFactors": ["risk 1", "risk 2", ...],
  "estimatedWeeks": <number>
}

Be concise, professional, and realistic given the budget.`

  const message = await client.messages.create({
    model: MODELS.sonnet,
    max_tokens: 1_024,
    messages: [{ role: 'user', content: prompt }],
  })

  const textBlock = message.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude returned no text content for scope generation')
  }

  // Extract JSON from the response — Claude may wrap it in a code fence
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Could not extract JSON from Claude scope response')
  }

  const parsed = JSON.parse(jsonMatch[0]) as ScopeResult

  return parsed
}

async function sendSlackNotification(
  payload: OpportunityWonPayload,
  planeProject: PlaneProjectResult,
  scope: ScopeResult
): Promise<SlackResult> {
  const botToken = requireEnv('SLACK_BOT_TOKEN')
  const channelId = requireEnv('SLACK_NEW_CLIENTS_CHANNEL_ID')

  const text =
    `:tada: *New Client Onboarded: ${payload.clientName}*\n\n` +
    `*Project type:* ${payload.projectType}\n` +
    `*Budget:* €${payload.estimatedBudget.toLocaleString()}\n` +
    `*Contact:* ${payload.contactName} <${payload.clientEmail}>\n` +
    `*Plane project:* <${planeProject.projectUrl}|${planeProject.identifier}>\n\n` +
    `*Scope summary:* ${scope.summary}\n\n` +
    `*Estimated duration:* ${scope.estimatedWeeks} weeks\n` +
    `*Key deliverables:* ${scope.deliverables.slice(0, 3).join(' · ')}`

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel: channelId, text, unfurl_links: false }),
  })

  const result = (await response.json()) as { ok: boolean; ts: string; error?: string }

  if (!result.ok) {
    throw new Error(`Slack notification failed: ${result.error ?? 'unknown error'}`)
  }

  return { channelId, messageTs: result.ts }
}

// ---------------------------------------------------------------------------
// Inngest function
// ---------------------------------------------------------------------------

export const clientOnboardingWorkflow = inngest.createFunction(
  {
    id: 'client-onboarding',
    name: 'New Client Onboarding',
    retries: 3,
  },
  { event: 'crm/opportunity.won' },
  async ({ event, step }): Promise<OnboardingResult> => {
    const payload = event.data as OpportunityWonPayload

    // Step 1 — Create Plane project (durable, retried independently)
    const planeProject = await step.run('create-plane-project', async () =>
      createPlaneProject(payload)
    )

    // Step 2 — Generate AI project scope (runs in parallel after step 1)
    const scope = await step.run('generate-ai-scope', async () => generateAiScope(payload))

    // Step 3 — Notify #new-clients Slack channel
    const slack = await step.run('send-slack-notification', async () =>
      sendSlackNotification(payload, planeProject, scope)
    )

    return { planeProject, scope, slack }
  }
)
