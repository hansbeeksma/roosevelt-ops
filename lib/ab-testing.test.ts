import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  assignVariant,
  calculateSignificance,
  getExperimentUserId,
  type ExperimentConfig,
} from "./ab-testing";

const enabledExperiment: ExperimentConfig = {
  name: "test-experiment",
  description: "Test",
  trafficAllocation: 0.5,
  enabled: true,
};

const disabledExperiment: ExperimentConfig = {
  name: "disabled-experiment",
  description: "Disabled",
  trafficAllocation: 0.5,
  enabled: false,
};

describe("assignVariant", () => {
  it("returns treatment when experiment is disabled", () => {
    const variant = assignVariant("user-123", disabledExperiment);
    expect(variant).toBe("treatment");
  });

  it("returns deterministic variant for same user+experiment", () => {
    const variant1 = assignVariant("user-abc", enabledExperiment);
    const variant2 = assignVariant("user-abc", enabledExperiment);
    expect(variant1).toBe(variant2);
  });

  it("returns different variants for different users", () => {
    const variants = new Set<string>();
    // With enough users, we should get both variants
    for (let i = 0; i < 100; i++) {
      variants.add(assignVariant(`user-${i}`, enabledExperiment));
    }
    expect(variants.size).toBe(2);
    expect(variants.has("control")).toBe(true);
    expect(variants.has("treatment")).toBe(true);
  });

  it("respects traffic allocation", () => {
    const heavilyControlExperiment: ExperimentConfig = {
      name: "heavy-control",
      description: "Test",
      trafficAllocation: 0.9, // 90% control
      enabled: true,
    };

    let controlCount = 0;
    const total = 1000;
    for (let i = 0; i < total; i++) {
      if (assignVariant(`user-${i}`, heavilyControlExperiment) === "control") {
        controlCount++;
      }
    }

    // Should be roughly 90% control (with some tolerance)
    expect(controlCount / total).toBeGreaterThan(0.7);
    expect(controlCount / total).toBeLessThan(1.0);
  });

  it("produces different assignments for different experiment names", () => {
    const exp1: ExperimentConfig = { ...enabledExperiment, name: "alpha-test" };
    const exp2: ExperimentConfig = {
      ...enabledExperiment,
      name: "beta-test-variant",
    };

    // With sufficiently different names and enough users, hash should distribute differently
    let diffCount = 0;
    for (let i = 0; i < 500; i++) {
      const v1 = assignVariant(`uid-${i}-session`, exp1);
      const v2 = assignVariant(`uid-${i}-session`, exp2);
      if (v1 !== v2) diffCount++;
    }
    expect(diffCount).toBeGreaterThan(0);
  });
});

describe("calculateSignificance", () => {
  it("detects significant difference", () => {
    // Large sample, clear difference
    const result = calculateSignificance(50, 1000, 80, 1000);
    expect(result.significant).toBe(true);
    expect(result.pValue).toBeLessThan(0.05);
    expect(result.confidence).toBeGreaterThan(95);
  });

  it("detects non-significant difference", () => {
    // Small difference, similar rates
    const result = calculateSignificance(51, 1000, 52, 1000);
    expect(result.significant).toBe(false);
    expect(result.pValue).toBeGreaterThan(0.05);
  });

  it("returns pValue between 0 and 1", () => {
    const result = calculateSignificance(10, 100, 20, 100);
    expect(result.pValue).toBeGreaterThanOrEqual(0);
    expect(result.pValue).toBeLessThanOrEqual(1);
  });

  it("handles equal conversion rates", () => {
    const result = calculateSignificance(50, 1000, 50, 1000);
    expect(result.significant).toBe(false);
    expect(result.pValue).toBeCloseTo(1, 0);
  });

  it("confidence is 100 minus pValue percentage", () => {
    const result = calculateSignificance(30, 1000, 60, 1000);
    expect(result.confidence).toBeCloseTo((1 - result.pValue) * 100);
  });
});

describe("getExperimentUserId", () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns "server" when window is undefined', () => {
    vi.stubGlobal("window", undefined);
    expect(getExperimentUserId()).toBe("server");
  });

  it("creates and stores new user ID", () => {
    const userId = getExperimentUserId();
    expect(userId).toMatch(/^user_/);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "ab_test_user_id",
      userId,
    );
  });

  it("returns existing user ID from localStorage", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      "user_existing_123",
    );
    const userId = getExperimentUserId();
    expect(userId).toBe("user_existing_123");
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
