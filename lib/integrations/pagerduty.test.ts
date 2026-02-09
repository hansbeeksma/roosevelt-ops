import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  shouldTriggerPagerDuty,
  triggerPagerDutyIncident,
  acknowledgePagerDutyIncident,
  resolvePagerDutyIncident,
  getPagerDutyIncidentStatus,
  formatPagerDutyStatus,
} from "./pagerduty";
import type { Incident } from "@/lib/types/incidents";

function makeIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: "inc-001",
    title: "API Down",
    description: "API not responding",
    severity: "SEV-1",
    status: "active",
    commander: "alice",
    responders: null,
    channel_id: "C123",
    plane_issue_id: null,
    pagerduty_incident_id: null,
    statuspage_incident_id: null,
    started_at: new Date().toISOString(),
    resolved_at: null,
    mttr_minutes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("shouldTriggerPagerDuty", () => {
  it("returns true for SEV-1", () => {
    expect(shouldTriggerPagerDuty("SEV-1")).toBe(true);
  });

  it("returns true for SEV-2", () => {
    expect(shouldTriggerPagerDuty("SEV-2")).toBe(true);
  });

  it("returns false for SEV-3", () => {
    expect(shouldTriggerPagerDuty("SEV-3")).toBe(false);
  });

  it("returns false for SEV-4", () => {
    expect(shouldTriggerPagerDuty("SEV-4")).toBe(false);
  });
});

describe("formatPagerDutyStatus", () => {
  it("formats triggered status", () => {
    expect(formatPagerDutyStatus("triggered")).toBe("🔴 PagerDuty: triggered");
  });

  it("formats acknowledged status", () => {
    expect(formatPagerDutyStatus("acknowledged")).toBe(
      "🟡 PagerDuty: acknowledged",
    );
  });

  it("formats resolved status", () => {
    expect(formatPagerDutyStatus("resolved")).toBe("✅ PagerDuty: resolved");
  });

  it("returns empty string for null", () => {
    expect(formatPagerDutyStatus(null)).toBe("");
  });
});

describe("triggerPagerDutyIncident", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.stubEnv("PAGERDUTY_ROUTING_KEY", "test-routing-key");
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("returns null when routing key is not configured", async () => {
    vi.stubEnv("PAGERDUTY_ROUTING_KEY", "");
    const result = await triggerPagerDutyIncident(makeIncident());
    expect(result).toBeNull();
  });

  it("returns null for SEV-3 incidents", async () => {
    const result = await triggerPagerDutyIncident(
      makeIncident({ severity: "SEV-3" }),
    );
    expect(result).toBeNull();
  });

  it("sends trigger event for SEV-1 incident", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "success", dedup_key: "inc-001" }),
    });

    const result = await triggerPagerDutyIncident(
      makeIncident({ severity: "SEV-1" }),
    );

    expect(result).toBe("inc-001");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://events.pagerduty.com/v2/enqueue",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"event_action":"trigger"'),
      }),
    );
  });

  it("includes slack channel link when provided", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "success", dedup_key: "inc-001" }),
    });

    await triggerPagerDutyIncident(makeIncident(), "https://slack.com/channel");

    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.links).toEqual([
      {
        href: "https://slack.com/channel",
        text: "Open Slack Incident Channel",
      },
    ]);
  });

  it("returns null on API error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Invalid routing key" }),
    });

    const result = await triggerPagerDutyIncident(makeIncident());
    expect(result).toBeNull();
  });
});

describe("acknowledgePagerDutyIncident", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("returns false when routing key not configured", async () => {
    vi.stubEnv("PAGERDUTY_ROUTING_KEY", "");
    expect(await acknowledgePagerDutyIncident("inc-001")).toBe(false);
  });

  it("sends acknowledge event", async () => {
    vi.stubEnv("PAGERDUTY_ROUTING_KEY", "test-key");
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({}) });

    const result = await acknowledgePagerDutyIncident("inc-001");
    expect(result).toBe(true);

    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.event_action).toBe("acknowledge");
    expect(body.dedup_key).toBe("inc-001");
  });
});

describe("resolvePagerDutyIncident", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("returns false when routing key not configured", async () => {
    vi.stubEnv("PAGERDUTY_ROUTING_KEY", "");
    expect(await resolvePagerDutyIncident("inc-001")).toBe(false);
  });

  it("sends resolve event", async () => {
    vi.stubEnv("PAGERDUTY_ROUTING_KEY", "test-key");
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({}) });

    const result = await resolvePagerDutyIncident("inc-001");
    expect(result).toBe(true);

    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.event_action).toBe("resolve");
  });
});

describe("getPagerDutyIncidentStatus", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("returns null when API key not configured", async () => {
    vi.stubEnv("PAGERDUTY_API_KEY", "");
    expect(await getPagerDutyIncidentStatus("inc-001")).toBeNull();
  });

  it("returns incident status and URL", async () => {
    vi.stubEnv("PAGERDUTY_API_KEY", "test-api-key");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          incidents: [
            {
              status: "triggered",
              html_url: "https://pagerduty.com/incident/1",
            },
          ],
        }),
    });

    const result = await getPagerDutyIncidentStatus("inc-001");
    expect(result).toEqual({
      status: "triggered",
      html_url: "https://pagerduty.com/incident/1",
    });
  });

  it("returns null when no incidents found", async () => {
    vi.stubEnv("PAGERDUTY_API_KEY", "test-api-key");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ incidents: [] }),
    });

    expect(await getPagerDutyIncidentStatus("inc-001")).toBeNull();
  });
});
