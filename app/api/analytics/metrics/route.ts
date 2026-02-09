import { NextRequest, NextResponse } from "next/server";
import { getMetricsClient } from "@/lib/analytics";
import type { MetricPeriod } from "@rooseveltops/analytics-layer";

const VALID_PERIODS: MetricPeriod[] = ["7d", "30d", "90d", "365d"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") ?? "30d") as MetricPeriod;
    const type = searchParams.get("type") ?? "aarrr";

    if (!VALID_PERIODS.includes(period)) {
      return NextResponse.json(
        { error: `Invalid period. Use: ${VALID_PERIODS.join(", ")}` },
        { status: 400 },
      );
    }

    const client = getMetricsClient();

    if (type === "aarrr") {
      const metrics = await client.getAARRR(period);
      return NextResponse.json({ data: metrics, period });
    }

    if (type === "funnel") {
      const since = new Date();
      const days = parseInt(period.replace("d", ""), 10);
      since.setDate(since.getDate() - days);
      const funnel = await client.getConversionFunnel(since.toISOString());
      return NextResponse.json({ data: funnel, period });
    }

    if (type === "daily") {
      const metricName = searchParams.get("metric");
      if (!metricName) {
        return NextResponse.json(
          { error: "metric query parameter required for type=daily" },
          { status: 400 },
        );
      }
      const days = parseInt(period.replace("d", ""), 10);
      const daily = await client.getDailyMetrics(metricName, days);
      return NextResponse.json({ data: daily, period, metric: metricName });
    }

    return NextResponse.json(
      { error: "Invalid type. Use: aarrr, funnel, daily" },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
