import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AARRRMetrics, MetricPeriod } from './types';

function periodToDays(period: MetricPeriod): number {
  const map: Record<MetricPeriod, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '365d': 365,
  };
  return map[period];
}

export class MetricsClient {
  private readonly supabase: SupabaseClient;
  private readonly eventsTable: string;
  private readonly metricsTable: string;

  constructor(config: {
    supabaseUrl: string;
    supabaseServiceKey: string;
    eventsTable?: string;
    metricsTable?: string;
  }) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    this.eventsTable = config.eventsTable ?? 'analytics_events';
    this.metricsTable = config.metricsTable ?? 'analytics_daily_metrics';
  }

  async getAARRR(period: MetricPeriod = '30d'): Promise<AARRRMetrics> {
    const days = periodToDays(period);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceISO = since.toISOString();

    const [acquisition, activation, retention, referral, revenue] =
      await Promise.all([
        this.countEvents('page_viewed', sinceISO),
        this.countEvents('checkout_completed', sinceISO),
        this.countReturningUsers(sinceISO),
        this.countEvents('referral_shared', sinceISO),
        this.sumRevenue(sinceISO),
      ]);

    return { acquisition, activation, retention, referral, revenue };
  }

  async getDailyMetrics(
    metricName: string,
    days: number = 30
  ): Promise<Array<{ date: string; value: number }>> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await this.supabase
      .from(this.metricsTable)
      .select('date, metric_value')
      .eq('metric_name', metricName)
      .gte('date', since.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Failed to get daily metrics: ${error.message}`);
    }

    return (data ?? []).map((row) => ({
      date: row.date,
      value: Number(row.metric_value),
    }));
  }

  async getConversionFunnel(
    sinceISO: string
  ): Promise<Array<{ step: string; count: number; rate: number }>> {
    const steps: Array<{ name: string; event: string }> = [
      { name: 'Visit', event: 'page_viewed' },
      { name: 'Product Viewed', event: 'product_viewed' },
      { name: 'Added to Cart', event: 'added_to_cart' },
      { name: 'Checkout Started', event: 'checkout_started' },
      { name: 'Checkout Completed', event: 'checkout_completed' },
    ];

    const counts = await Promise.all(
      steps.map((step) => this.countUniqueSessionEvents(step.event, sinceISO))
    );

    const firstCount = counts[0] || 1;

    return steps.map((step, i) => ({
      step: step.name,
      count: counts[i],
      rate: Math.round((counts[i] / firstCount) * 10000) / 100,
    }));
  }

  private async countEvents(
    eventName: string,
    sinceISO: string
  ): Promise<number> {
    const { count, error } = await this.supabase
      .from(this.eventsTable)
      .select('*', { count: 'exact', head: true })
      .eq('event_name', eventName)
      .gte('created_at', sinceISO);

    if (error) {
      throw new Error(`Failed to count ${eventName}: ${error.message}`);
    }

    return count ?? 0;
  }

  private async countUniqueSessionEvents(
    eventName: string,
    sinceISO: string
  ): Promise<number> {
    const { data, error } = await this.supabase
      .from(this.eventsTable)
      .select('session_id')
      .eq('event_name', eventName)
      .gte('created_at', sinceISO)
      .not('session_id', 'is', null);

    if (error) {
      throw new Error(
        `Failed to count unique sessions for ${eventName}: ${error.message}`
      );
    }

    const uniqueSessions = new Set((data ?? []).map((r) => r.session_id));
    return uniqueSessions.size;
  }

  private async countReturningUsers(sinceISO: string): Promise<number> {
    const { data, error } = await this.supabase
      .from(this.eventsTable)
      .select('user_id')
      .eq('event_name', 'checkout_completed')
      .gte('created_at', sinceISO)
      .not('user_id', 'is', null);

    if (error) {
      throw new Error(`Failed to count returning users: ${error.message}`);
    }

    const userCounts = new Map<string, number>();
    for (const row of data ?? []) {
      const uid = row.user_id as string;
      userCounts.set(uid, (userCounts.get(uid) ?? 0) + 1);
    }

    let returning = 0;
    for (const count of userCounts.values()) {
      if (count > 1) returning++;
    }

    return returning;
  }

  private async sumRevenue(sinceISO: string): Promise<number> {
    const { data, error } = await this.supabase
      .from(this.eventsTable)
      .select('properties')
      .eq('event_name', 'checkout_completed')
      .gte('created_at', sinceISO);

    if (error) {
      throw new Error(`Failed to sum revenue: ${error.message}`);
    }

    let total = 0;
    for (const row of data ?? []) {
      const props = row.properties as Record<string, unknown>;
      if (props && typeof props.totalCents === 'number') {
        total += props.totalCents;
      }
    }

    return total;
  }
}
