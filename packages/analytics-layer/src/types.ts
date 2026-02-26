/**
 * Roosevelt OPS Analytics Layer - Type Definitions
 * Operational event types specific to the Roosevelt OPS platform
 */

// ============================================================================
// Event names
// ============================================================================

export type EventName =
  | 'page_view'
  | 'feature_used'
  | 'ai_scoping_started'
  | 'invoice_generated'
  | 'team_member_added'
  | 'project_created'

// ============================================================================
// Base event property interface
// ============================================================================

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined
}

// ============================================================================
// Event-specific property interfaces
// ============================================================================

export interface PageViewProperties extends EventProperties {
  path: string
  title?: string
  referrer?: string
  organization_id?: string
}

export interface FeatureUsedProperties extends EventProperties {
  feature: string
  action?: string
  organization_id?: string
  project_id?: string
}

export interface AiScopingStartedProperties extends EventProperties {
  project_id?: string
  organization_id?: string
  input_type?: string
}

export interface InvoiceGeneratedProperties extends EventProperties {
  invoice_id: string
  amount_cents: number
  organization_id?: string
  project_id?: string
  currency?: string
}

export interface TeamMemberAddedProperties extends EventProperties {
  organization_id: string
  invited_user_id?: string
  role?: string
}

export interface ProjectCreatedProperties extends EventProperties {
  project_id: string
  organization_id: string
  template?: string
}

// ============================================================================
// Discriminated map: EventName -> Properties
// ============================================================================

export type EventPropertyMap = {
  page_view: PageViewProperties
  feature_used: FeatureUsedProperties
  ai_scoping_started: AiScopingStartedProperties
  invoice_generated: InvoiceGeneratedProperties
  team_member_added: TeamMemberAddedProperties
  project_created: ProjectCreatedProperties
}

// ============================================================================
// Analytics event shape (as stored in Supabase)
// ============================================================================

export interface AnalyticsEvent {
  event_type: EventName
  properties: EventProperties
  organization_id?: string
  user_id?: string
  created_at?: string
}

// ============================================================================
// Tracker configuration
// ============================================================================

export interface TrackerConfig {
  supabaseUrl: string
  supabaseServiceKey: string
  tableName?: string
  enabled?: boolean
}
