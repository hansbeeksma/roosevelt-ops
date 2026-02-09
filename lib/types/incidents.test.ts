import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isIncidentSLAViolated,
  formatIncidentDuration,
  getIncidentSlackBlocks,
  SEVERITY_SLA_TARGETS,
  SEVERITY_EMOJI,
  SEVERITY_DESCRIPTIONS,
  type Incident,
} from "./incidents";

function makeIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: "inc-001",
    title: "API Timeout",
    description: null,
    severity: "SEV-3",
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

describe("SEVERITY_SLA_TARGETS", () => {
  it("defines correct SLA targets", () => {
    expect(SEVERITY_SLA_TARGETS["SEV-1"]).toBe(5);
    expect(SEVERITY_SLA_TARGETS["SEV-2"]).toBe(15);
    expect(SEVERITY_SLA_TARGETS["SEV-3"]).toBe(120);
    expect(SEVERITY_SLA_TARGETS["SEV-4"]).toBe(Infinity);
  });
});

describe("SEVERITY_EMOJI", () => {
  it("maps each severity to an emoji", () => {
    expect(SEVERITY_EMOJI["SEV-1"]).toBe("🔴");
    expect(SEVERITY_EMOJI["SEV-2"]).toBe("🟠");
    expect(SEVERITY_EMOJI["SEV-3"]).toBe("🟡");
    expect(SEVERITY_EMOJI["SEV-4"]).toBe("🟢");
  });
});

describe("SEVERITY_DESCRIPTIONS", () => {
  it("has descriptions for all severities", () => {
    expect(SEVERITY_DESCRIPTIONS["SEV-1"]).toContain("Critical");
    expect(SEVERITY_DESCRIPTIONS["SEV-2"]).toContain("High");
    expect(SEVERITY_DESCRIPTIONS["SEV-3"]).toContain("Medium");
    expect(SEVERITY_DESCRIPTIONS["SEV-4"]).toContain("Low");
  });
});

describe("isIncidentSLAViolated", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true when resolved incident exceeds SLA", () => {
    const incident = makeIncident({
      severity: "SEV-1",
      status: "resolved",
      mttr_minutes: 10, // SLA is 5 minutes
    });
    expect(isIncidentSLAViolated(incident)).toBe(true);
  });

  it("returns false when resolved incident is within SLA", () => {
    const incident = makeIncident({
      severity: "SEV-1",
      status: "resolved",
      mttr_minutes: 3, // SLA is 5 minutes
    });
    expect(isIncidentSLAViolated(incident)).toBe(false);
  });

  it("returns true for active incident exceeding SLA", () => {
    vi.useFakeTimers();
    const started = new Date("2026-01-01T00:00:00Z");
    vi.setSystemTime(new Date("2026-01-01T00:30:00Z")); // 30 min later

    const incident = makeIncident({
      severity: "SEV-2", // SLA is 15 minutes
      status: "active",
      started_at: started.toISOString(),
    });
    expect(isIncidentSLAViolated(incident)).toBe(true);
  });

  it("returns false for active incident within SLA", () => {
    vi.useFakeTimers();
    const started = new Date("2026-01-01T00:00:00Z");
    vi.setSystemTime(new Date("2026-01-01T00:10:00Z")); // 10 min later

    const incident = makeIncident({
      severity: "SEV-2", // SLA is 15 minutes
      status: "active",
      started_at: started.toISOString(),
    });
    expect(isIncidentSLAViolated(incident)).toBe(false);
  });

  it("never violates SLA for SEV-4 (Infinity target)", () => {
    const incident = makeIncident({
      severity: "SEV-4",
      status: "resolved",
      mttr_minutes: 999999,
    });
    expect(isIncidentSLAViolated(incident)).toBe(false);
  });
});

describe("formatIncidentDuration", () => {
  it("formats minutes only", () => {
    expect(formatIncidentDuration(45)).toBe("45m");
  });

  it("formats hours and minutes", () => {
    expect(formatIncidentDuration(130)).toBe("2h 10m");
  });

  it("formats days, hours, and minutes", () => {
    expect(formatIncidentDuration(1530)).toBe("1d 1h 30m");
  });

  it("handles zero minutes", () => {
    expect(formatIncidentDuration(0)).toBe("0m");
  });

  it("handles exact hours", () => {
    expect(formatIncidentDuration(60)).toBe("1h 0m");
  });

  it("handles exact days", () => {
    expect(formatIncidentDuration(1440)).toBe("1d 0h 0m");
  });
});

describe("getIncidentSlackBlocks", () => {
  it("returns header and section blocks for active incident", () => {
    const incident = makeIncident({ severity: "SEV-2", status: "active" });
    const blocks = getIncidentSlackBlocks(incident);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe("header");
    expect(blocks[0].text.text).toContain("🚨");
    expect(blocks[0].text.text).toContain("🟠");
    expect(blocks[0].text.text).toContain("SEV-2");
    expect(blocks[0].text.text).toContain("API Timeout");
  });

  it("shows resolved emoji for resolved incident", () => {
    const incident = makeIncident({ status: "resolved" });
    const blocks = getIncidentSlackBlocks(incident);

    expect(blocks[0].text.text).toContain("✅");
  });

  it("includes incident metadata in section fields", () => {
    const incident = makeIncident({ id: "inc-042", commander: "bob" });
    const blocks = getIncidentSlackBlocks(incident);

    const fields = blocks[1].fields;
    expect(fields).toHaveLength(4);
    expect(fields[0].text).toContain("inc-042");
    expect(fields[2].text).toContain("bob");
  });
});
