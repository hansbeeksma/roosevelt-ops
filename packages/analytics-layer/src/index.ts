/**
 * Roosevelt OPS Analytics Layer
 * Tracks operational events to Supabase analytics_events table.
 * Never throws — failures are logged silently to avoid disrupting the application.
 */

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  AnalyticsEvent,
  EventName,
  EventPropertyMap,
  TrackerConfig,
  PageViewProperties,
  FeatureUsedProperties,
  AiScopingStartedProperties,
  InvoiceGeneratedProperties,
  TeamMemberAddedProperties,
  ProjectCreatedProperties,
} from './types'

export * from './types'

const DEFAULT_TABLE = 'analytics_events'

// ============================================================================
// Internal Supabase client factory (lazy, singleton per config)
// ============================================================================

let _client: SupabaseClient | null = null
let _config: TrackerConfig | null = null

function getClient(config: TrackerConfig): SupabaseClient {
  if (
    _client &&
    _config?.supabaseUrl === config.supabaseUrl &&
    _config?.supabaseServiceKey === config.supabaseServiceKey
  ) {
    return _client
  }

  _client = createClient(config.supabaseUrl, config.supabaseServiceKey)
  _config = config
  return _client
}

// ============================================================================
// Core trackEvent function
// Gracefully fails — never throws, logs errors via console.error
// ============================================================================

export async function trackEvent<T extends EventName>(
  event: {
    eventType: T
    properties: EventPropertyMap[T]
    organizationId?: string
    userId?: string
  },
  config?: TrackerConfig
): Promise<void> {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? ''
  const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? ''

  const resolvedConfig: TrackerConfig = config ?? {
    supabaseUrl,
    supabaseServiceKey,
    enabled: process.env['ANALYTICS_ENABLED'] !== 'false',
  }

  if (!resolvedConfig.supabaseUrl || !resolvedConfig.supabaseServiceKey) {
    return
  }

  if (resolvedConfig.enabled === false) {
    return
  }

  const tableName = resolvedConfig.tableName ?? DEFAULT_TABLE

  const row: AnalyticsEvent = {
    event_type: event.eventType,
    properties: event.properties,
    organization_id: event.organizationId,
    user_id: event.userId,
  }

  try {
    const client = getClient(resolvedConfig)
    const { error } = await client.from(tableName).insert({
      event_type: row.event_type,
      properties: row.properties,
      organization_id: row.organization_id ?? null,
      user_id: row.user_id ?? null,
    })

    if (error) {
      console.error('[analytics] Failed to track event:', event.eventType, error.message)
    }
  } catch (err) {
    console.error('[analytics] Unexpected error tracking event:', event.eventType, err)
  }
}

// ============================================================================
// Convenience wrappers for each Roosevelt OPS event type
// ============================================================================

type TrackContext = {
  organizationId?: string
  userId?: string
  config?: TrackerConfig
}

export function trackPageView(
  properties: PageViewProperties,
  context?: TrackContext
): Promise<void> {
  return trackEvent(
    {
      eventType: 'page_view' as const,
      properties,
      organizationId: context?.organizationId ?? properties.organization_id,
      userId: context?.userId,
    },
    context?.config
  )
}

export function trackFeatureUsed(
  properties: FeatureUsedProperties,
  context?: TrackContext
): Promise<void> {
  return trackEvent(
    {
      eventType: 'feature_used' as const,
      properties,
      organizationId: context?.organizationId ?? properties.organization_id,
      userId: context?.userId,
    },
    context?.config
  )
}

export function trackAiScopingStarted(
  properties: AiScopingStartedProperties,
  context?: TrackContext
): Promise<void> {
  return trackEvent(
    {
      eventType: 'ai_scoping_started' as const,
      properties,
      organizationId: context?.organizationId ?? properties.organization_id,
      userId: context?.userId,
    },
    context?.config
  )
}

export function trackInvoiceGenerated(
  properties: InvoiceGeneratedProperties,
  context?: TrackContext
): Promise<void> {
  return trackEvent(
    {
      eventType: 'invoice_generated' as const,
      properties,
      organizationId: context?.organizationId ?? properties.organization_id,
      userId: context?.userId,
    },
    context?.config
  )
}

export function trackTeamMemberAdded(
  properties: TeamMemberAddedProperties,
  context?: TrackContext
): Promise<void> {
  return trackEvent(
    {
      eventType: 'team_member_added' as const,
      properties,
      organizationId: context?.organizationId ?? properties.organization_id,
      userId: context?.userId,
    },
    context?.config
  )
}

export function trackProjectCreated(
  properties: ProjectCreatedProperties,
  context?: TrackContext
): Promise<void> {
  return trackEvent(
    {
      eventType: 'project_created' as const,
      properties,
      organizationId: context?.organizationId ?? properties.organization_id,
      userId: context?.userId,
    },
    context?.config
  )
}
