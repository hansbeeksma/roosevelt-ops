import { NextRequest, NextResponse } from "next/server";
import { analyticsEventSchema } from "@rooseveltops/analytics-layer";
import { getAnalyticsTracker } from "@/lib/analytics";
import type {
  EventName,
  EventPropertyMap,
} from "@rooseveltops/analytics-layer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = analyticsEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid event data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { event_name, properties, session_id, user_id, page_url, referrer } =
      parsed.data;

    const tracker = getAnalyticsTracker();
    const result = await tracker.trackEvent(
      event_name as EventName,
      properties as EventPropertyMap[EventName],
      {
        sessionId: session_id,
        userId: user_id,
        pageUrl: page_url ?? request.headers.get("referer") ?? undefined,
        referrer: referrer ?? request.headers.get("referer") ?? undefined,
        userAgent: request.headers.get("user-agent") ?? undefined,
        country:
          request.headers.get("x-vercel-ip-country") ??
          request.headers.get("cf-ipcountry") ??
          undefined,
      },
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
