import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isStatusPageEnabled,
  createStatusPageIncident,
  updateStatusPageIncident,
  resolveStatusPageIncident,
  getStatusPageComponents,
  getStatusPageUrl,
} from "./statuspage";
import type { Incident } from "@/lib/types/incidents";

function makeIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: "inc-001",
    title: "API Down",
    description: "API not responding",
    severity: "SEV-2",
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

describe("isStatusPageEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns true when both API key and page ID are set", () => {
    vi.stubEnv("STATUSPAGE_API_KEY", "test-key");
    vi.stubEnv("STATUSPAGE_PAGE_ID", "test-page");
    expect(isStatusPageEnabled()).toBe(true);
  });

  it("returns false when API key is missing", () => {
    vi.stubEnv("STATUSPAGE_API_KEY", "");
    vi.stubEnv("STATUSPAGE_PAGE_ID", "test-page");
    expect(isStatusPageEnabled()).toBe(false);
  });

  it("returns false when page ID is missing", () => {
    vi.stubEnv("STATUSPAGE_API_KEY", "test-key");
    vi.stubEnv("STATUSPAGE_PAGE_ID", "");
    expect(isStatusPageEnabled()).toBe(false);
  });
});

describe("getStatusPageUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns statuspage.io URL with page ID", () => {
    vi.stubEnv("STATUSPAGE_PAGE_ID", "abc123");
    expect(getStatusPageUrl()).toBe("https://abc123.statuspage.io");
  });

  it("returns statuspage.io URL with incident ID", () => {
    vi.stubEnv("STATUSPAGE_PAGE_ID", "abc123");
    expect(getStatusPageUrl("inc-456")).toBe(
      "https://abc123.statuspage.io/incidents/inc-456",
    );
  });

  it("falls back to custom status page URL", () => {
    vi.stubEnv("STATUSPAGE_PAGE_ID", "");
    vi.stubEnv("CUSTOM_STATUS_PAGE_URL", "https://status.example.com");
    expect(getStatusPageUrl()).toBe("https://status.example.com");
  });

  it("returns empty string when nothing configured", () => {
    vi.stubEnv("STATUSPAGE_PAGE_ID", "");
    vi.stubEnv("CUSTOM_STATUS_PAGE_URL", "");
    expect(getStatusPageUrl()).toBe("");
  });
});

describe("createStatusPageIncident", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("returns null when not configured", async () => {
    vi.stubEnv("STATUSPAGE_API_KEY", "");
    vi.stubEnv("STATUSPAGE_PAGE_ID", "");
    const result = await createStatusPageIncident(makeIncident());
    expect(result).toBeNull();
  });

  it("creates incident with correct impact mapping", async () => {
    vi.stubEnv("STATUSPAGE_API_KEY", "test-key");
    vi.stubEnv("STATUSPAGE_PAGE_ID", "page-1");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ id: "sp-inc-1", shortlink: "https://stspg.io/abc" }),
    });

    const result = await createStatusPageIncident(
      makeIncident({ severity: "SEV-2" }),
    );
    expect(result).toBe("sp-inc-1");

    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.incident.impact).toBe("major");
    expect(body.incident.status).toBe("investigating");
  });

  it("sets component status when affected components provided", async () => {
    vi.stubEnv("STATUSPAGE_API_KEY", "test-key");
    vi.stubEnv("STATUSPAGE_PAGE_ID", "page-1");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "sp-inc-2" }),
    });

    await createStatusPageIncident(makeIncident({ severity: "SEV-1" }), [
      "comp-1",
      "comp-2",
    ]);

    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.incident.component_ids).toEqual(["comp-1", "comp-2"]);
    expect(body.incident.components["comp-1"]).toBe("major_outage");
  });

  it("returns null on API error", async () => {
    vi.stubEnv("STATUSPAGE_API_KEY", "test-key");
    vi.stubEnv("STATUSPAGE_PAGE_ID", "page-1");

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Unauthorized" }),
    });

    const result = await createStatusPageIncident(makeIncident());
    expect(result).toBeNull();
  });
});

describe("updateStatusPageIncident", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("returns false when not configured", async () => {
    vi.stubEnv("STATUSPAGE_API_KEY", "");
    vi.stubEnv("STATUSPAGE_PAGE_ID", "");
    expect(await updateStatusPageIncident("sp-1", "update", "identified")).toBe(
      false,
    );
  });

  it("updates incident with message and status", async () => {
    vi.stubEnv("STATUSPAGE_API_KEY", "test-key");
    vi.stubEnv("STATUSPAGE_PAGE_ID", "page-1");

    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({}) });

    const result = await updateStatusPageIncident(
      "sp-1",
      "Fix deployed",
      "monitoring",
    );
    expect(result).toBe(true);

    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.incident.status).toBe("monitoring");
    expect(body.incident.body).toBe("Fix deployed");
  });
});

describe("resolveStatusPageIncident", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("returns false when not configured", async () => {
    vi.stubEnv("STATUSPAGE_API_KEY", "");
    vi.stubEnv("STATUSPAGE_PAGE_ID", "");
    expect(await resolveStatusPageIncident("sp-1")).toBe(false);
  });

  it("resolves incident with default message", async () => {
    vi.stubEnv("STATUSPAGE_API_KEY", "test-key");
    vi.stubEnv("STATUSPAGE_PAGE_ID", "page-1");

    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({}) });

    const result = await resolveStatusPageIncident("sp-1");
    expect(result).toBe(true);

    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.incident.status).toBe("resolved");
  });

  it("resolves incident with custom message", async () => {
    vi.stubEnv("STATUSPAGE_API_KEY", "test-key");
    vi.stubEnv("STATUSPAGE_PAGE_ID", "page-1");

    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({}) });

    await resolveStatusPageIncident("sp-1", "Root cause identified and fixed");

    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.incident.body).toBe("Root cause identified and fixed");
  });
});

describe("getStatusPageComponents", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("returns empty array when not configured", async () => {
    vi.stubEnv("STATUSPAGE_API_KEY", "");
    vi.stubEnv("STATUSPAGE_PAGE_ID", "");
    expect(await getStatusPageComponents()).toEqual([]);
  });

  it("returns components from API", async () => {
    vi.stubEnv("STATUSPAGE_API_KEY", "test-key");
    vi.stubEnv("STATUSPAGE_PAGE_ID", "page-1");

    const components = [
      { id: "c1", name: "API", status: "operational" },
      { id: "c2", name: "Website", status: "operational" },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(components),
    });

    const result = await getStatusPageComponents();
    expect(result).toEqual(components);
  });
});
