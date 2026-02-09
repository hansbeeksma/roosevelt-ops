import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getWebVitalRating,
  WEB_VITALS_THRESHOLDS,
  reportWebVitalsToSentry,
} from "./web-vitals";

vi.mock("@sentry/nextjs", () => ({
  setMeasurement: vi.fn(),
  captureMessage: vi.fn(),
}));

import * as Sentry from "@sentry/nextjs";

describe("WEB_VITALS_THRESHOLDS", () => {
  it("defines LCP thresholds", () => {
    expect(WEB_VITALS_THRESHOLDS.LCP.good).toBe(2500);
    expect(WEB_VITALS_THRESHOLDS.LCP.needsImprovement).toBe(4000);
  });

  it("defines CLS thresholds", () => {
    expect(WEB_VITALS_THRESHOLDS.CLS.good).toBe(0.1);
    expect(WEB_VITALS_THRESHOLDS.CLS.needsImprovement).toBe(0.25);
  });

  it("defines INP thresholds", () => {
    expect(WEB_VITALS_THRESHOLDS.INP.good).toBe(200);
    expect(WEB_VITALS_THRESHOLDS.INP.needsImprovement).toBe(500);
  });

  it("defines TTFB thresholds", () => {
    expect(WEB_VITALS_THRESHOLDS.TTFB.good).toBe(800);
    expect(WEB_VITALS_THRESHOLDS.TTFB.needsImprovement).toBe(1800);
  });
});

describe("getWebVitalRating", () => {
  it("returns good for values below threshold", () => {
    expect(getWebVitalRating("LCP", 1000)).toBe("good");
    expect(getWebVitalRating("CLS", 0.05)).toBe("good");
    expect(getWebVitalRating("INP", 100)).toBe("good");
    expect(getWebVitalRating("FCP", 1500)).toBe("good");
  });

  it("returns good for values exactly at threshold", () => {
    expect(getWebVitalRating("LCP", 2500)).toBe("good");
    expect(getWebVitalRating("CLS", 0.1)).toBe("good");
  });

  it("returns needs-improvement for values between thresholds", () => {
    expect(getWebVitalRating("LCP", 3000)).toBe("needs-improvement");
    expect(getWebVitalRating("CLS", 0.15)).toBe("needs-improvement");
    expect(getWebVitalRating("INP", 350)).toBe("needs-improvement");
  });

  it("returns needs-improvement for values exactly at upper threshold", () => {
    expect(getWebVitalRating("LCP", 4000)).toBe("needs-improvement");
    expect(getWebVitalRating("CLS", 0.25)).toBe("needs-improvement");
  });

  it("returns poor for values above upper threshold", () => {
    expect(getWebVitalRating("LCP", 5000)).toBe("poor");
    expect(getWebVitalRating("CLS", 0.5)).toBe("poor");
    expect(getWebVitalRating("INP", 600)).toBe("poor");
    expect(getWebVitalRating("TTFB", 2000)).toBe("poor");
  });

  it("works for all metric types", () => {
    const metrics = ["LCP", "FID", "INP", "CLS", "FCP", "TTFB"] as const;
    for (const metric of metrics) {
      const rating = getWebVitalRating(metric, 0);
      expect(rating).toBe("good");
    }
  });
});

describe("reportWebVitalsToSentry", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("reports metric as Sentry measurement", () => {
    const metric = {
      name: "LCP" as const,
      value: 1500,
      rating: "good" as const,
      navigationType: "navigate" as const,
      id: "v1-123",
      delta: 1500,
      entries: [],
    };

    reportWebVitalsToSentry(metric);

    expect(Sentry.setMeasurement).toHaveBeenCalledWith(
      "LCP",
      1500,
      "millisecond",
    );
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "Web Vital: LCP",
      expect.objectContaining({
        level: "info",
        tags: expect.objectContaining({
          webVital: "LCP",
          rating: "good",
        }),
      }),
    );
  });

  it("reports warning level for needs-improvement rating", () => {
    const metric = {
      name: "LCP" as const,
      value: 3500,
      rating: "needs-improvement" as const,
      navigationType: "navigate" as const,
      id: "v1-456",
      delta: 3500,
      entries: [],
    };

    reportWebVitalsToSentry(metric);

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "Web Vital: LCP",
      expect.objectContaining({ level: "warning" }),
    );
  });

  it("reports error level for poor rating", () => {
    const metric = {
      name: "CLS" as const,
      value: 0.5,
      rating: "poor" as const,
      navigationType: "navigate" as const,
      id: "v1-789",
      delta: 0.5,
      entries: [],
    };

    reportWebVitalsToSentry(metric);

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "Web Vital: CLS",
      expect.objectContaining({ level: "error" }),
    );
  });
});
