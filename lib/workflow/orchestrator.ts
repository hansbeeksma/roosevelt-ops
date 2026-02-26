/**
 * Workflow Orchestrator
 *
 * Central registry of all Inngest workflow IDs available in Roosevelt OPS.
 * Import WORKFLOWS to trigger events from anywhere in the codebase without
 * hardcoding string literals.
 */

// ---------------------------------------------------------------------------
// Workflow ID registry
// ---------------------------------------------------------------------------

export const WORKFLOWS = {
  /** Triggered when a CRM opportunity is marked as won */
  CLIENT_ONBOARDING: 'client-onboarding',

  /** Monthly cron: generate and send invoices for all active clients */
  INVOICE_AUTOMATION: 'invoice-automation',

  /** Daily cron: compile engagement metrics and post Slack digest */
  DAILY_INSIGHTS: 'daily-insights',

  /** Full deal-won pipeline: onboarding + capacity planning + CRM update */
  DEAL_WON_PIPELINE: 'deal-won-pipeline',
} as const

export type WorkflowId = (typeof WORKFLOWS)[keyof typeof WORKFLOWS]

// ---------------------------------------------------------------------------
// Inngest event names
// ---------------------------------------------------------------------------

export const WORKFLOW_EVENTS = {
  OPPORTUNITY_WON: 'crm/opportunity.won',
  INVOICE_REQUESTED: 'billing/invoice.requested',
  DAILY_DIGEST: 'ops/daily-digest.requested',
  DEAL_WON: 'crm/deal.won',
} as const

export type WorkflowEvent = (typeof WORKFLOW_EVENTS)[keyof typeof WORKFLOW_EVENTS]

// ---------------------------------------------------------------------------
// Workflow metadata
// ---------------------------------------------------------------------------

export interface WorkflowMeta {
  id: WorkflowId
  name: string
  event: WorkflowEvent | null
  cron: string | null
  description: string
}

export const WORKFLOW_REGISTRY: Record<WorkflowId, WorkflowMeta> = {
  [WORKFLOWS.CLIENT_ONBOARDING]: {
    id: WORKFLOWS.CLIENT_ONBOARDING,
    name: 'New Client Onboarding',
    event: WORKFLOW_EVENTS.OPPORTUNITY_WON,
    cron: null,
    description:
      'Creates a Plane project, generates an AI project scope, and sends a Slack notification when a CRM opportunity is won.',
  },
  [WORKFLOWS.INVOICE_AUTOMATION]: {
    id: WORKFLOWS.INVOICE_AUTOMATION,
    name: 'Monthly Invoice Automation',
    event: null,
    cron: '0 8 1 * *',
    description:
      'Fetches time entries for all active clients, calculates billable amounts, creates draft invoices, and emails them on the 1st of each month.',
  },
  [WORKFLOWS.DAILY_INSIGHTS]: {
    id: WORKFLOWS.DAILY_INSIGHTS,
    name: 'Daily Insights Digest',
    event: WORKFLOW_EVENTS.DAILY_DIGEST,
    cron: '0 7 * * 1-5',
    description:
      'Aggregates previous-day metrics (open issues, capacity, revenue) and posts a Slack digest to the ops channel on weekday mornings.',
  },
  [WORKFLOWS.DEAL_WON_PIPELINE]: {
    id: WORKFLOWS.DEAL_WON_PIPELINE,
    name: 'Deal Won Pipeline',
    event: WORKFLOW_EVENTS.DEAL_WON,
    cron: null,
    description:
      'Full pipeline triggered on deal close: client onboarding, capacity planning update, CRM stage transition, and team assignment.',
  },
}

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/**
 * Returns the workflow metadata for a given workflow ID.
 * Throws if the ID is not registered.
 */
export function getWorkflowMeta(id: WorkflowId): WorkflowMeta {
  const meta = WORKFLOW_REGISTRY[id]
  if (!meta) {
    throw new Error(`Unknown workflow ID: ${id}`)
  }
  return meta
}

/**
 * Returns all workflow IDs that are triggered by a specific event name.
 */
export function getWorkflowsByEvent(event: WorkflowEvent): WorkflowMeta[] {
  return Object.values(WORKFLOW_REGISTRY).filter((meta) => meta.event === event)
}

/**
 * Returns all workflow IDs that run on a cron schedule.
 */
export function getCronWorkflows(): WorkflowMeta[] {
  return Object.values(WORKFLOW_REGISTRY).filter((meta) => meta.cron !== null)
}
