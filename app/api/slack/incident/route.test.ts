import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import crypto from "crypto";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock Supabase
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock integrations
vi.mock("@/lib/integrations/pagerduty", () => ({
  triggerPagerDutyIncident: vi.fn().mockResolvedValue(null),
  resolvePagerDutyIncident: vi.fn().mockResolvedValue(false),
  shouldTriggerPagerDuty: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/integrations/statuspage", () => ({
  createStatusPageIncident: vi.fn().mockResolvedValue(null),
  updateStatusPageIncident: vi.fn().mockResolvedValue(false),
  resolveStatusPageIncident: vi.fn().mockResolvedValue(false),
  detectAffectedComponents: vi.fn().mockResolvedValue([]),
  getStatusPageUrl: vi.fn().mockReturnValue(""),
}));

vi.mock("@/lib/integrations/plane", () => ({
  createPlaneIncidentIssue: vi.fn().mockResolvedValue(null),
  updatePlaneIncidentIssue: vi.fn().mockResolvedValue(false),
  addPlaneIssueComment: vi.fn().mockResolvedValue(false),
  getPlaneIssueUrl: vi.fn().mockReturnValue(""),
}));

import { createClient } from "@/lib/supabase/server";

const SIGNING_SECRET = "test-signing-secret";

function makeSlackBody(
  text: string,
  overrides: Record<string, string> = {},
): string {
  const params = new URLSearchParams({
    token: "test-token",
    team_id: "T123",
    team_domain: "testteam",
    channel_id: "C456",
    channel_name: "general",
    user_id: "U789",
    user_name: "alice",
    command: "/incident",
    text,
    api_app_id: "A001",
    response_url: "https://hooks.slack.com/response/test",
    trigger_id: "trig-1",
    ...overrides,
  });
  return params.toString();
}

function makeSignedRequest(body: string, timestampOffset = 0): NextRequest {
  const timestamp = String(Math.floor(Date.now() / 1000) + timestampOffset);
  const sigBasestring = `v0:${timestamp}:${body}`;
  const hmac = crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(sigBasestring)
    .digest("hex");
  const signature = `v0=${hmac}`;

  const request = new NextRequest("http://localhost/api/slack/incident", {
    method: "POST",
    body,
    headers: {
      "x-slack-signature": signature,
      "x-slack-request-timestamp": timestamp,
      "content-type": "application/x-www-form-urlencoded",
    },
  });

  return request;
}

describe("POST /api/slack/incident", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.stubEnv("SLACK_SIGNING_SECRET", SIGNING_SECRET);
    vi.stubEnv("SLACK_BOT_TOKEN", "xoxb-test-token");
    vi.stubEnv("SLACK_TEAM_ID", "T123");

    // Default fetch mock for Slack API calls
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true, channel: { id: "C-INC-001" } }),
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  describe("signature verification", () => {
    it("rejects request without signature", async () => {
      const body = makeSlackBody("start SEV-1 Test");
      const request = new NextRequest("http://localhost/api/slack/incident", {
        method: "POST",
        body,
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it("rejects request with invalid signature", async () => {
      const body = makeSlackBody("start SEV-1 Test");
      // Use a valid-length but incorrect hex signature (64 hex chars for SHA256)
      const fakeHex = "a".repeat(64);
      const request = new NextRequest("http://localhost/api/slack/incident", {
        method: "POST",
        body,
        headers: {
          "x-slack-signature": `v0=${fakeHex}`,
          "x-slack-request-timestamp": String(Math.floor(Date.now() / 1000)),
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it("rejects stale requests (replay attack prevention)", async () => {
      const body = makeSlackBody("start SEV-1 Test");
      // 10 minutes old
      const request = makeSignedRequest(body, -600);

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });

  describe("command routing", () => {
    it("returns help for unknown command", async () => {
      const body = makeSlackBody("unknown");
      const request = makeSignedRequest(body);

      const response = await POST(request);
      const data = await response.json();

      expect(data.response_type).toBe("ephemeral");
      expect(data.text).toContain("Unknown command");
      expect(data.text).toContain("/incident start");
    });

    it("returns help for empty command", async () => {
      const body = makeSlackBody("");
      const request = makeSignedRequest(body);

      const response = await POST(request);
      const data = await response.json();

      expect(data.response_type).toBe("ephemeral");
    });
  });

  describe("start command", () => {
    it("rejects invalid severity", async () => {
      const body = makeSlackBody("start INVALID Test incident");
      const request = makeSignedRequest(body);

      const response = await POST(request);
      const data = await response.json();

      expect(data.response_type).toBe("ephemeral");
      expect(data.text).toContain("Invalid severity");
    });

    it("rejects missing title", async () => {
      const body = makeSlackBody("start SEV-1");
      const request = makeSignedRequest(body);

      const response = await POST(request);
      const data = await response.json();

      expect(data.response_type).toBe("ephemeral");
      expect(data.text).toContain("title required");
    });

    it("creates incident successfully", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: "inc-001",
                  title: "API Down",
                  severity: "SEV-2",
                  status: "active",
                  channel_id: "C-INC-001",
                  started_at: new Date().toISOString(),
                },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      };
      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockSupabase,
      );

      const body = makeSlackBody("start SEV-2 API Down");
      const request = makeSignedRequest(body);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.response_type).toBe("in_channel");
      expect(data.text).toContain("Incident");
    });
  });

  describe("update command", () => {
    it("rejects missing arguments", async () => {
      const body = makeSlackBody("update");
      const request = makeSignedRequest(body);

      const response = await POST(request);
      const data = await response.json();

      expect(data.response_type).toBe("ephemeral");
      expect(data.text).toContain("Usage");
    });

    it("rejects when incident not found", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
            }),
          }),
        }),
      };
      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockSupabase,
      );

      const body = makeSlackBody("update inc-999 some message");
      const request = makeSignedRequest(body);

      const response = await POST(request);
      const data = await response.json();

      expect(data.text).toContain("not found");
    });

    it("rejects update on resolved incident", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "inc-001", status: "resolved", channel_id: "C123" },
                error: null,
              }),
            }),
          }),
        }),
      };
      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockSupabase,
      );

      const body = makeSlackBody("update inc-001 status message");
      const request = makeSignedRequest(body);

      const response = await POST(request);
      const data = await response.json();

      expect(data.text).toContain("already resolved");
    });

    it("posts update successfully", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: "inc-001",
                  status: "active",
                  channel_id: "C123",
                  statuspage_incident_id: null,
                  plane_issue_id: null,
                },
                error: null,
              }),
            }),
          }),
        }),
      };
      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockSupabase,
      );

      const body = makeSlackBody("update inc-001 Fix is being deployed");
      const request = makeSignedRequest(body);

      const response = await POST(request);
      const data = await response.json();

      expect(data.text).toContain("Status update posted");
    });
  });

  describe("resolve command", () => {
    it("rejects missing incident ID", async () => {
      const body = makeSlackBody("resolve");
      const request = makeSignedRequest(body);

      const response = await POST(request);
      const data = await response.json();

      expect(data.response_type).toBe("ephemeral");
      expect(data.text).toContain("Usage");
    });

    it("rejects when incident not found", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
            }),
          }),
        }),
      };
      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockSupabase,
      );

      const body = makeSlackBody("resolve inc-999");
      const request = makeSignedRequest(body);

      const response = await POST(request);
      const data = await response.json();

      expect(data.text).toContain("not found");
    });

    it("rejects resolving already resolved incident", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "inc-001", status: "resolved", channel_id: "C123" },
                error: null,
              }),
            }),
          }),
        }),
      };
      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockSupabase,
      );

      const body = makeSlackBody("resolve inc-001");
      const request = makeSignedRequest(body);

      const response = await POST(request);
      const data = await response.json();

      expect(data.text).toContain("already resolved");
    });

    it("resolves incident successfully", async () => {
      const mockFrom = vi.fn();
      const mockSupabase = { from: mockFrom };

      // First call: select for fetch
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "inc-001",
                status: "active",
                channel_id: "C123",
                started_at: new Date(Date.now() - 3600000).toISOString(),
                pagerduty_incident_id: null,
                statuspage_incident_id: null,
                plane_issue_id: null,
              },
              error: null,
            }),
          }),
        }),
      });

      // Second call: update for resolve
      mockFrom.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });
      (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockSupabase,
      );

      const body = makeSlackBody("resolve inc-001");
      const request = makeSignedRequest(body);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.response_type).toBe("in_channel");
      expect(data.text).toContain("resolved");
    });
  });
});
