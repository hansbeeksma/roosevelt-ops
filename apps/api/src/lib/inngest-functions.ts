import { inngest } from './inngest.js'

// CRM sync: when a deal is won, create a project and notify via Slack
export const dealWonPipeline = inngest.createFunction(
  {
    id: 'deal-won-pipeline',
    retries: 3,
  },
  { event: 'pipeline/deal.won' },
  async ({ event, step }) => {
    const { opportunityId, companyId, organizationId, amount } = event.data

    // Step 1: Create project from deal
    const project = await step.run('create-project-from-deal', async () => {
      return {
        opportunityId,
        companyId,
        organizationId,
        amount,
        projectName: `Project for deal ${opportunityId}`,
        createdAt: new Date().toISOString(),
      }
    })

    // Step 2: Notify team via Slack
    await step.sendEvent('notify-team', {
      name: 'notification/slack.send',
      data: {
        channel: '#deals',
        message: `New deal won! Amount: €${amount}. Project "${project.projectName}" created.`,
        organizationId,
      },
    })

    return { status: 'completed', project }
  }
)

// CRM sync: process incoming webhook events from Twenty
export const crmWebhookSync = inngest.createFunction(
  {
    id: 'crm-webhook-sync',
    retries: 5,
  },
  [
    { event: 'crm/company.synced' },
    { event: 'crm/contact.synced' },
    { event: 'crm/opportunity.synced' },
  ],
  async ({ event, step }) => {
    await step.run('process-crm-event', async () => {
      return {
        eventName: event.name,
        action: event.data.action,
        organizationId: event.data.organizationId,
        processedAt: new Date().toISOString(),
      }
    })

    return { status: 'synced', event: event.name }
  }
)

export const inngestFunctions = [dealWonPipeline, crmWebhookSync]
