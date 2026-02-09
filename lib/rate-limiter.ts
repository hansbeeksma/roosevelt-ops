/**
 * In-Memory Sliding Window Rate Limiter (ROOSE-40)
 *
 * Per-IP, per-endpoint rate limiting with configurable windows.
 * Uses sliding window algorithm for smooth rate limiting.
 *
 * Note: In-memory store works for single-instance deployments.
 * For multi-instance/serverless, swap to Redis adapter.
 */

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

interface WindowEntry {
  timestamps: number[];
  /** Tracks when we last pruned old entries */
  lastPruned: number;
}

/** Default rate limit configs per route pattern */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  "/api/slack/": { maxRequests: 30, windowSeconds: 60 },
  "/api/": { maxRequests: 60, windowSeconds: 60 },
  default: { maxRequests: 100, windowSeconds: 60 },
};

/**
 * In-memory rate limit store.
 * Keys: `${ip}:${routePattern}`
 */
const store = new Map<string, WindowEntry>();

/** Maximum store size to prevent memory exhaustion */
const MAX_STORE_SIZE = 10_000;

/** Cleanup interval: remove entries older than 2x window */
const CLEANUP_MULTIPLIER = 2;

/**
 * Get the rate limit config for a given path.
 * Matches the most specific prefix first.
 */
export function getConfigForPath(path: string): RateLimitConfig {
  // Sort by length descending so more specific paths match first
  const sortedKeys = Object.keys(RATE_LIMIT_CONFIGS)
    .filter((k) => k !== "default")
    .sort((a, b) => b.length - a.length);

  for (const prefix of sortedKeys) {
    if (path.startsWith(prefix)) {
      return RATE_LIMIT_CONFIGS[prefix];
    }
  }

  return RATE_LIMIT_CONFIGS.default;
}

/**
 * Check rate limit for a given identifier and path.
 *
 * @param identifier - Unique client identifier (IP address, API key, etc.)
 * @param path - Request path for config lookup
 * @param config - Optional override config
 * @returns Rate limit result with remaining count and reset time
 */
export function checkRateLimit(
  identifier: string,
  path: string,
  config?: RateLimitConfig,
): RateLimitResult {
  const effectiveConfig = config ?? getConfigForPath(path);
  const key = `${identifier}:${path}`;
  const now = Date.now();
  const windowMs = effectiveConfig.windowSeconds * 1000;
  const windowStart = now - windowMs;

  // Get or create entry
  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [], lastPruned: now };
    store.set(key, entry);
  }

  // Prune old timestamps (outside current window)
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
  entry.lastPruned = now;

  const currentCount = entry.timestamps.length;
  const allowed = currentCount < effectiveConfig.maxRequests;

  if (allowed) {
    entry.timestamps.push(now);
  }

  // Calculate reset time (when oldest entry in window expires)
  const oldestInWindow = entry.timestamps[0];
  const resetAt = oldestInWindow ? oldestInWindow + windowMs : now + windowMs;

  // Periodic cleanup of stale entries
  if (store.size > MAX_STORE_SIZE) {
    cleanupStaleEntries(windowMs);
  }

  return {
    allowed,
    remaining: Math.max(
      0,
      effectiveConfig.maxRequests - entry.timestamps.length,
    ),
    resetAt,
    limit: effectiveConfig.maxRequests,
  };
}

/**
 * Remove stale entries from the store to prevent memory exhaustion.
 */
function cleanupStaleEntries(windowMs: number): void {
  const cutoff = Date.now() - windowMs * CLEANUP_MULTIPLIER;

  for (const [key, entry] of store) {
    if (entry.lastPruned < cutoff && entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

/**
 * Build rate limit headers for the response.
 */
export function rateLimitHeaders(
  result: RateLimitResult,
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.allowed
      ? {}
      : {
          "Retry-After": String(
            Math.ceil((result.resetAt - Date.now()) / 1000),
          ),
        }),
  };
}

/**
 * Reset the rate limit store (for testing).
 */
export function resetStore(): void {
  store.clear();
}

/**
 * Get current store size (for monitoring).
 */
export function getStoreSize(): number {
  return store.size;
}
