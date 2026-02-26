import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { eventSchemas } from './schemas';
import type {
  EventName,
  EventPropertyMap,
  AnalyticsEvent,
  TrackerConfig,
} from './types';

const DEFAULT_TABLE = 'analytics_events';

export class AnalyticsTracker {
  private readonly supabase: SupabaseClient;
  private readonly tableName: string;
  private readonly enabled: boolean;

  constructor(config: TrackerConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    this.tableName = config.tableName ?? DEFAULT_TABLE;
    this.enabled = config.enabled ?? true;
  }

  async trackEvent<T extends EventName>(
    eventName: T,
    properties: EventPropertyMap[T],
    context?: {
      sessionId?: string;
      userId?: string;
      pageUrl?: string;
      referrer?: string;
      userAgent?: string;
      country?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.enabled) {
      return { success: true };
    }

    const schema = eventSchemas[eventName];
    const parsed = schema.safeParse(properties);

    if (!parsed.success) {
      return {
        success: false,
        error: `Validation failed for ${eventName}: ${parsed.error.message}`,
      };
    }

    const event: AnalyticsEvent = {
      event_name: eventName,
      properties: parsed.data as Record<string, string | number | boolean | null | undefined>,
      session_id: context?.sessionId,
      user_id: context?.userId,
      page_url: context?.pageUrl,
      referrer: context?.referrer,
      user_agent: context?.userAgent,
      country: context?.country,
    };

    const { error } = await this.supabase.from(this.tableName).insert({
      event_name: event.event_name,
      properties: event.properties,
      session_id: event.session_id,
      user_id: event.user_id,
      page_url: event.page_url,
      referrer: event.referrer,
      user_agent: event.user_agent,
      country: event.country,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async trackBatch(
    events: Array<{
      eventName: EventName;
      properties: EventPropertyMap[EventName];
      context?: {
        sessionId?: string;
        userId?: string;
        pageUrl?: string;
      };
    }>
  ): Promise<{ success: boolean; error?: string; count: number }> {
    if (!this.enabled) {
      return { success: true, count: 0 };
    }

    const rows = [];

    for (const event of events) {
      const schema = eventSchemas[event.eventName];
      const parsed = schema.safeParse(event.properties);

      if (!parsed.success) {
        return {
          success: false,
          error: `Validation failed for ${event.eventName}: ${parsed.error.message}`,
          count: 0,
        };
      }

      rows.push({
        event_name: event.eventName,
        properties: parsed.data,
        session_id: event.context?.sessionId,
        user_id: event.context?.userId,
        page_url: event.context?.pageUrl,
      });
    }

    const { error } = await this.supabase.from(this.tableName).insert(rows);

    if (error) {
      return { success: false, error: error.message, count: 0 };
    }

    return { success: true, count: rows.length };
  }
}

let defaultTracker: AnalyticsTracker | null = null;

export function initTracker(config: TrackerConfig): AnalyticsTracker {
  defaultTracker = new AnalyticsTracker(config);
  return defaultTracker;
}

export function getTracker(): AnalyticsTracker {
  if (!defaultTracker) {
    throw new Error(
      'Analytics tracker not initialized. Call initTracker() first.'
    );
  }
  return defaultTracker;
}

export async function trackEvent<T extends EventName>(
  eventName: T,
  properties: EventPropertyMap[T],
  context?: {
    sessionId?: string;
    userId?: string;
    pageUrl?: string;
    referrer?: string;
    userAgent?: string;
    country?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  return getTracker().trackEvent(eventName, properties, context);
}
