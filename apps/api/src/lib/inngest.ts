import { Inngest } from 'inngest'

// Event type definitions for Roosevelt OPS event-driven pipelines
export interface RooseveltEvents {
  // CRM sync events (Twenty → Supabase)
  'crm/company.synced': {
    data: {
      companyId: string
      organizationId: string
      action: 'created' | 'updated' | 'deleted'
    }
  }
  'crm/contact.synced': {
    data: {
      contactId: string
      organizationId: string
      action: 'created' | 'updated' | 'deleted'
    }
  }
  'crm/opportunity.synced': {
    data: {
      opportunityId: string
      organizationId: string
      stage: string
      action: 'created' | 'updated' | 'deleted'
    }
  }

  // Pipeline trigger events
  'pipeline/deal.won': {
    data: {
      opportunityId: string
      companyId: string
      organizationId: string
      amount: number
    }
  }

  // Time tracking events
  'time/entry.created': {
    data: {
      entryId: string
      projectId: string
      userId: string
      durationMinutes: number
    }
  }

  // Notification events
  'notification/slack.send': {
    data: {
      channel: string
      message: string
      organizationId: string
    }
  }
}

export const inngest = new Inngest({
  id: 'roosevelt-ops',
  schemas: new Map() as never,
})
