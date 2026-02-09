import {
  AnalyticsTracker,
  MetricsClient,
  initTracker,
  getTracker,
  trackEvent,
} from "@rooseveltops/analytics-layer";
import type {
  EventName,
  EventPropertyMap,
  TrackerConfig,
} from "@rooseveltops/analytics-layer";

const ANALYTICS_TABLE = "analytics_events";
const METRICS_TABLE = "analytics_daily_metrics";

function getConfig(): TrackerConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      supabaseUrl: "",
      supabaseServiceKey: "",
      tableName: ANALYTICS_TABLE,
      enabled: false,
    };
  }

  return {
    supabaseUrl,
    supabaseServiceKey,
    tableName: ANALYTICS_TABLE,
    enabled: process.env.ANALYTICS_ENABLED !== "false",
  };
}

let tracker: AnalyticsTracker | null = null;
let metricsClient: MetricsClient | null = null;

export function getAnalyticsTracker(): AnalyticsTracker {
  if (!tracker) {
    tracker = initTracker(getConfig());
  }
  return tracker;
}

export function getMetricsClient(): MetricsClient {
  if (!metricsClient) {
    const config = getConfig();
    metricsClient = new MetricsClient({
      supabaseUrl: config.supabaseUrl,
      supabaseServiceKey: config.supabaseServiceKey,
      eventsTable: ANALYTICS_TABLE,
      metricsTable: METRICS_TABLE,
    });
  }
  return metricsClient;
}

export async function track<T extends EventName>(
  eventName: T,
  properties: EventPropertyMap[T],
  context?: {
    sessionId?: string;
    userId?: string;
    pageUrl?: string;
    referrer?: string;
    userAgent?: string;
    country?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  return getAnalyticsTracker().trackEvent(eventName, properties, context);
}

export { AnalyticsTracker, MetricsClient, trackEvent, getTracker, initTracker };
export type { EventName, EventPropertyMap, TrackerConfig };
