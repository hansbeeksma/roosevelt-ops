import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  getConfigForPath,
  rateLimitHeaders,
  resetStore,
  getStoreSize,
  RATE_LIMIT_CONFIGS,
} from "./rate-limiter";

describe("getConfigForPath", () => {
  it("returns slack config for slack routes", () => {
    const config = getConfigForPath("/api/slack/incident");
    expect(config.maxRequests).toBe(30);
    expect(config.windowSeconds).toBe(60);
  });

  it("returns api config for generic api routes", () => {
    const config = getConfigForPath("/api/example");
    expect(config.maxRequests).toBe(60);
    expect(config.windowSeconds).toBe(60);
  });

  it("returns default config for non-api routes", () => {
    const config = getConfigForPath("/some/page");
    expect(config).toEqual(RATE_LIMIT_CONFIGS.default);
  });

  it("matches most specific prefix first", () => {
    // /api/slack/ is more specific than /api/
    const config = getConfigForPath("/api/slack/commands");
    expect(config.maxRequests).toBe(30);
  });
});

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetStore();
  });

  it("allows requests within limit", () => {
    const result = checkRateLimit("192.168.1.1", "/api/test", {
      maxRequests: 5,
      windowSeconds: 60,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
  });

  it("tracks requests per identifier", () => {
    const config = { maxRequests: 2, windowSeconds: 60 };

    checkRateLimit("ip-1", "/api/test", config);
    checkRateLimit("ip-1", "/api/test", config);
    const result = checkRateLimit("ip-1", "/api/test", config);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("isolates different IPs", () => {
    const config = { maxRequests: 2, windowSeconds: 60 };

    checkRateLimit("ip-1", "/api/test", config);
    checkRateLimit("ip-1", "/api/test", config);

    // ip-2 should still be allowed
    const result = checkRateLimit("ip-2", "/api/test", config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("isolates different paths for same IP", () => {
    const config = { maxRequests: 1, windowSeconds: 60 };

    checkRateLimit("ip-1", "/api/route-a", config);

    // Same IP, different path should be allowed
    const result = checkRateLimit("ip-1", "/api/route-b", config);
    expect(result.allowed).toBe(true);
  });

  it("blocks requests exceeding limit", () => {
    const config = { maxRequests: 2, windowSeconds: 60 };

    checkRateLimit("ip-1", "/api/test", config);
    checkRateLimit("ip-1", "/api/test", config);
    const result = checkRateLimit("ip-1", "/api/test", config);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("does not increment counter when blocked", () => {
    const config = { maxRequests: 1, windowSeconds: 60 };

    checkRateLimit("ip-1", "/api/test", config);
    // This should be blocked
    checkRateLimit("ip-1", "/api/test", config);
    // remaining should still be 0 (not negative)
    const result = checkRateLimit("ip-1", "/api/test", config);
    expect(result.remaining).toBe(0);
  });

  it("provides correct resetAt timestamp", () => {
    const config = { maxRequests: 5, windowSeconds: 60 };
    const before = Date.now();

    const result = checkRateLimit("ip-1", "/api/test", config);

    // resetAt should be approximately now + 60s
    expect(result.resetAt).toBeGreaterThanOrEqual(before + 60_000);
    expect(result.resetAt).toBeLessThanOrEqual(before + 61_000);
  });

  it("increments store size for new keys", () => {
    const config = { maxRequests: 10, windowSeconds: 60 };

    expect(getStoreSize()).toBe(0);
    checkRateLimit("ip-1", "/api/a", config);
    expect(getStoreSize()).toBe(1);
    checkRateLimit("ip-2", "/api/a", config);
    expect(getStoreSize()).toBe(2);
  });

  it("uses path-based config when no override provided", () => {
    const result = checkRateLimit("ip-1", "/api/slack/incident");
    // Slack routes have 30 req/min limit
    expect(result.limit).toBe(30);
    expect(result.remaining).toBe(29);
  });
});

describe("rateLimitHeaders", () => {
  it("includes standard rate limit headers", () => {
    const headers = rateLimitHeaders({
      allowed: true,
      remaining: 58,
      resetAt: 1700000000000,
      limit: 60,
    });

    expect(headers["X-RateLimit-Limit"]).toBe("60");
    expect(headers["X-RateLimit-Remaining"]).toBe("58");
    expect(headers["X-RateLimit-Reset"]).toBe("1700000000");
  });

  it("does not include Retry-After when allowed", () => {
    const headers = rateLimitHeaders({
      allowed: true,
      remaining: 1,
      resetAt: Date.now() + 30_000,
      limit: 10,
    });

    expect(headers["Retry-After"]).toBeUndefined();
  });

  it("includes Retry-After when blocked", () => {
    const resetAt = Date.now() + 30_000;
    const headers = rateLimitHeaders({
      allowed: false,
      remaining: 0,
      resetAt,
      limit: 10,
    });

    expect(headers["Retry-After"]).toBeDefined();
    const retryAfter = Number(headers["Retry-After"]);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(31);
  });
});

describe("resetStore", () => {
  beforeEach(() => {
    resetStore();
  });

  it("clears all entries", () => {
    const config = { maxRequests: 10, windowSeconds: 60 };
    checkRateLimit("ip-1", "/api/a", config);
    checkRateLimit("ip-2", "/api/b", config);
    expect(getStoreSize()).toBe(2);

    resetStore();
    expect(getStoreSize()).toBe(0);
  });

  it("allows previously blocked IPs after reset", () => {
    const config = { maxRequests: 1, windowSeconds: 60 };
    checkRateLimit("ip-1", "/api/test", config);

    const blocked = checkRateLimit("ip-1", "/api/test", config);
    expect(blocked.allowed).toBe(false);

    resetStore();

    const afterReset = checkRateLimit("ip-1", "/api/test", config);
    expect(afterReset.allowed).toBe(true);
  });
});
