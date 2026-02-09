import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isPlaneEnabled,
  createPlaneIncidentIssue,
  updatePlaneIncidentIssue,
  addPlaneIssueComment,
  createPostmortemActionItem,
  getPlaneIssueUrl,
} from "./plane";
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

// Helper to create a mock fetch that handles multiple sequential calls
function mockFetchSequence(responses: Array<{ ok: boolean; json: () => any }>) {
  let callIndex = 0;
  return vi.fn().mockImplementation(() => {
    const response = responses[callIndex] || responses[responses.length - 1];
    callIndex++;
    return Promise.resolve(response);
  });
}

describe("isPlaneEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns true when both API key and workspace slug are set", () => {
    vi.stubEnv("PLANE_API_KEY", "test-key");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "test-workspace");
    expect(isPlaneEnabled()).toBe(true);
  });

  it("returns false when API key is missing", () => {
    vi.stubEnv("PLANE_API_KEY", "");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "test-workspace");
    expect(isPlaneEnabled()).toBe(false);
  });

  it("returns false when workspace slug is missing", () => {
    vi.stubEnv("PLANE_API_KEY", "test-key");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "");
    expect(isPlaneEnabled()).toBe(false);
  });
});

describe("getPlaneIssueUrl", () => {
  it("returns correct Plane URL", () => {
    const url = getPlaneIssueUrl("issue-123");
    expect(url).toContain("/issues/issue-123");
    expect(url).toContain("app.plane.so");
  });
});

describe("createPlaneIncidentIssue", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("returns null when not configured", async () => {
    vi.stubEnv("PLANE_API_KEY", "");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "");
    const result = await createPlaneIncidentIssue(makeIncident());
    expect(result).toBeNull();
  });

  it("creates incident issue with correct priority mapping", async () => {
    vi.stubEnv("PLANE_API_KEY", "test-key");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "test-ws");
    vi.stubEnv("PLANE_PROJECT_ID", "proj-1");

    // Mock responses: 1) ensureLabelsExist (list labels), 2) getStateId (list states), 3) createIssue
    global.fetch = mockFetchSequence([
      // ensureLabelsExist - list existing labels
      {
        ok: true,
        json: () => [
          { name: "incident", id: "lbl-1" },
          { name: "p1", id: "lbl-2" },
          { name: "sev-2", id: "lbl-3" },
        ],
      },
      // getStateId - list states
      { ok: true, json: () => [{ name: "Backlog", id: "state-1" }] },
      // create issue
      { ok: true, json: () => ({ id: "plane-issue-1" }) },
    ]);

    const result = await createPlaneIncidentIssue(
      makeIncident({ severity: "SEV-2" }),
    );
    expect(result).toBe("plane-issue-1");

    // Verify the create issue call has correct priority
    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
    const createCall = calls.find(
      (c: any[]) => c[1]?.method === "POST" && c[0].includes("/issues/"),
    );
    expect(createCall).toBeTruthy();
    const body = JSON.parse(createCall![1].body);
    expect(body.name).toContain("[INCIDENT]");
    expect(body.priority).toBe("high");
  });

  it("includes slack channel URL in description when provided", async () => {
    vi.stubEnv("PLANE_API_KEY", "test-key");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "test-ws");

    global.fetch = mockFetchSequence([
      { ok: true, json: () => [] },
      { ok: true, json: () => [{ name: "Backlog", id: "state-1" }] },
      { ok: true, json: () => ({ id: "plane-issue-2" }) },
    ]);

    await createPlaneIncidentIssue(
      makeIncident(),
      "https://slack.com/channel/inc-001",
    );

    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
    const createCall = calls.find(
      (c: any[]) => c[1]?.method === "POST" && c[0].includes("/issues/"),
    );
    const body = JSON.parse(createCall![1].body);
    expect(body.description_html).toContain(
      "https://slack.com/channel/inc-001",
    );
  });

  it("returns null on API error", async () => {
    vi.stubEnv("PLANE_API_KEY", "test-key");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "test-ws");

    global.fetch = mockFetchSequence([
      { ok: true, json: () => [] },
      { ok: true, json: () => [{ name: "Backlog", id: "state-1" }] },
      { ok: false, json: () => ({ error: "Forbidden" }) },
    ]);

    const result = await createPlaneIncidentIssue(makeIncident());
    expect(result).toBeNull();
  });
});

describe("updatePlaneIncidentIssue", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("returns false when not configured", async () => {
    vi.stubEnv("PLANE_API_KEY", "");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "");
    expect(await updatePlaneIncidentIssue("issue-1", makeIncident())).toBe(
      false,
    );
  });

  it("updates issue with Done state", async () => {
    vi.stubEnv("PLANE_API_KEY", "test-key");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "test-ws");

    global.fetch = mockFetchSequence([
      // getStateId - list states
      { ok: true, json: () => [{ name: "Done", id: "done-state" }] },
      // PATCH issue
      { ok: true, json: () => ({}) },
    ]);

    const incident = makeIncident({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      mttr_minutes: 15,
    });
    const result = await updatePlaneIncidentIssue("issue-1", incident);
    expect(result).toBe(true);

    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
    const patchCall = calls.find((c: any[]) => c[1]?.method === "PATCH");
    expect(patchCall).toBeTruthy();
    const body = JSON.parse(patchCall![1].body);
    expect(body.state).toBe("done-state");
  });

  it("returns false on API error", async () => {
    vi.stubEnv("PLANE_API_KEY", "test-key");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "test-ws");

    global.fetch = mockFetchSequence([
      { ok: true, json: () => [{ name: "Done", id: "done-state" }] },
      { ok: false, json: () => ({ error: "Not found" }) },
    ]);

    const result = await updatePlaneIncidentIssue("issue-1", makeIncident());
    expect(result).toBe(false);
  });
});

describe("addPlaneIssueComment", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("returns false when not configured", async () => {
    vi.stubEnv("PLANE_API_KEY", "");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "");
    expect(await addPlaneIssueComment("issue-1", "test comment")).toBe(false);
  });

  it("adds comment to issue", async () => {
    vi.stubEnv("PLANE_API_KEY", "test-key");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "test-ws");

    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({}) });

    const result = await addPlaneIssueComment(
      "issue-1",
      "Incident update: fix deployed",
    );
    expect(result).toBe(true);

    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.comment_html).toContain("Incident update: fix deployed");
  });

  it("returns false on API error", async () => {
    vi.stubEnv("PLANE_API_KEY", "test-key");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "test-ws");

    global.fetch = vi.fn().mockResolvedValue({ ok: false, json: () => ({}) });

    const result = await addPlaneIssueComment("issue-1", "comment");
    expect(result).toBe(false);
  });
});

describe("createPostmortemActionItem", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("returns null when not configured", async () => {
    vi.stubEnv("PLANE_API_KEY", "");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "");
    const result = await createPostmortemActionItem("inc-001", {
      title: "Add monitoring",
      description: "Set up alerts",
      priority: "high",
    });
    expect(result).toBeNull();
  });

  it("creates postmortem action item with correct fields", async () => {
    vi.stubEnv("PLANE_API_KEY", "test-key");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "test-ws");

    global.fetch = mockFetchSequence([
      // ensureLabelsExist - list labels
      {
        ok: true,
        json: () => [
          { name: "postmortem", id: "lbl-pm" },
          { name: "action-item", id: "lbl-ai" },
        ],
      },
      // ensureLabelsExist - create missing 'high' label
      { ok: true, json: () => ({ id: "lbl-high", name: "high" }) },
      // getStateId - list states
      { ok: true, json: () => [{ name: "Todo", id: "todo-state" }] },
      // create issue
      { ok: true, json: () => ({ id: "action-item-1" }) },
    ]);

    const result = await createPostmortemActionItem("inc-001", {
      title: "Add monitoring",
      description: "Set up alerts for API latency",
      priority: "high",
    });
    expect(result).toBe("action-item-1");

    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
    const createCall = calls.find(
      (c: any[]) => c[1]?.method === "POST" && c[0].includes("/issues/"),
    );
    const body = JSON.parse(createCall![1].body);
    expect(body.name).toContain("[POSTMORTEM]");
    expect(body.name).toContain("Add monitoring");
    expect(body.priority).toBe("high");
    expect(body.description_html).toContain("inc-001");
  });

  it("includes due date when provided", async () => {
    vi.stubEnv("PLANE_API_KEY", "test-key");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "test-ws");

    global.fetch = mockFetchSequence([
      { ok: true, json: () => [] },
      { ok: true, json: () => ({ id: "lbl-1", name: "postmortem" }) },
      { ok: true, json: () => ({ id: "lbl-2", name: "action-item" }) },
      { ok: true, json: () => ({ id: "lbl-3", name: "medium" }) },
      { ok: true, json: () => [{ name: "Todo", id: "todo-state" }] },
      { ok: true, json: () => ({ id: "action-item-2" }) },
    ]);

    const dueDate = new Date("2026-03-01");
    await createPostmortemActionItem("inc-001", {
      title: "Fix timeout",
      description: "Increase timeout to 30s",
      priority: "medium",
      dueDate,
    });

    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
    const createCall = calls.find(
      (c: any[]) => c[1]?.method === "POST" && c[0].includes("/issues/"),
    );
    const body = JSON.parse(createCall![1].body);
    expect(body.target_date).toBe("2026-03-01");
  });

  it("returns null on API error", async () => {
    vi.stubEnv("PLANE_API_KEY", "test-key");
    vi.stubEnv("PLANE_WORKSPACE_SLUG", "test-ws");

    global.fetch = mockFetchSequence([
      { ok: true, json: () => [] },
      { ok: true, json: () => [{ name: "Todo", id: "todo-state" }] },
      { ok: false, json: () => ({ error: "Server error" }) },
    ]);

    const result = await createPostmortemActionItem("inc-001", {
      title: "Fix it",
      description: "desc",
      priority: "low",
    });
    expect(result).toBeNull();
  });
});
