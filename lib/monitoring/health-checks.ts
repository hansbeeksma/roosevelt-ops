/**
 * Infrastructure Health Checks
 *
 * Defines health check interfaces and implementations for each external service
 * used by Roosevelt OPS. Each check performs a real network ping with a 5-second
 * timeout and returns a structured HealthStatus.
 *
 * Services monitored:
 *   - Supabase  (HTTP HEAD on REST API)
 *   - Slack     (GET auth.test)
 *   - Plane     (HTTP HEAD on workspaces endpoint)
 *   - GitHub    (HTTP HEAD on rate_limit endpoint)
 */

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  latencyMs: number
  message?: string
}

export interface HealthCheck {
  name: string
  check(): Promise<HealthStatus>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CHECK_TIMEOUT_MS = 5_000

/**
 * Wraps a fetch call with a hard 5-second timeout using AbortController.
 * Returns the Response on success; throws on timeout or network error.
 */
async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS)

  try {
    const response = await fetch(url, { ...init, signal: controller.signal })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Measures wall-clock time for an async operation and returns elapsed ms.
 */
async function measureLatency<T>(fn: () => Promise<T>): Promise<{ result: T; latencyMs: number }> {
  const start = performance.now()
  const result = await fn()
  const latencyMs = Math.round(performance.now() - start)
  return { result, latencyMs }
}

// ── Check implementations ─────────────────────────────────────────────────────

/**
 * Checks Supabase connectivity by issuing an HTTP HEAD on the REST root.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.
 */
export async function checkSupabase(): Promise<HealthStatus> {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return {
      status: 'unhealthy',
      latencyMs: 0,
      message: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured',
    }
  }

  try {
    const { result: response, latencyMs } = await measureLatency(() =>
      fetchWithTimeout(`${url}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      })
    )

    if (response.ok || response.status === 200) {
      return { status: 'healthy', latencyMs }
    }

    return {
      status: 'degraded',
      latencyMs,
      message: `Supabase returned HTTP ${response.status}`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const isTimeout = message.includes('abort') || message.includes('timeout')
    return {
      status: 'unhealthy',
      latencyMs: CHECK_TIMEOUT_MS,
      message: isTimeout
        ? 'Supabase health check timed out after 5s'
        : `Supabase unreachable: ${message}`,
    }
  }
}

/**
 * Checks Slack API reachability via GET auth.test.
 * Requires SLACK_BOT_TOKEN environment variable.
 */
export async function checkSlack(): Promise<HealthStatus> {
  const token = process.env.SLACK_BOT_TOKEN

  if (!token) {
    return {
      status: 'unhealthy',
      latencyMs: 0,
      message: 'SLACK_BOT_TOKEN not configured',
    }
  }

  try {
    const { result: response, latencyMs } = await measureLatency(() =>
      fetchWithTimeout('https://slack.com/api/auth.test', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    )

    if (!response.ok) {
      return {
        status: 'degraded',
        latencyMs,
        message: `Slack API returned HTTP ${response.status}`,
      }
    }

    const body = (await response.json()) as { ok: boolean; error?: string }

    if (body.ok) {
      return { status: 'healthy', latencyMs }
    }

    return {
      status: 'degraded',
      latencyMs,
      message: `Slack auth.test failed: ${body.error ?? 'unknown error'}`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const isTimeout = message.includes('abort') || message.includes('timeout')
    return {
      status: 'unhealthy',
      latencyMs: CHECK_TIMEOUT_MS,
      message: isTimeout
        ? 'Slack health check timed out after 5s'
        : `Slack unreachable: ${message}`,
    }
  }
}

/**
 * Checks Plane API reachability via HTTP HEAD on the projects endpoint.
 * Requires PLANE_API_KEY and PLANE_WORKSPACE_SLUG environment variables.
 */
export async function checkPlane(): Promise<HealthStatus> {
  const apiKey = process.env.PLANE_API_KEY
  const workspaceSlug = process.env.PLANE_WORKSPACE_SLUG
  const baseUrl = process.env.PLANE_BASE_URL ?? 'https://api.plane.so'

  if (!apiKey || !workspaceSlug) {
    return {
      status: 'unhealthy',
      latencyMs: 0,
      message: 'PLANE_API_KEY or PLANE_WORKSPACE_SLUG not configured',
    }
  }

  try {
    const { result: response, latencyMs } = await measureLatency(() =>
      fetchWithTimeout(`${baseUrl}/api/v1/workspaces/${workspaceSlug}/projects/`, {
        method: 'HEAD',
        headers: {
          'X-Api-Key': apiKey,
        },
      })
    )

    if (response.ok || response.status === 200 || response.status === 405) {
      // 405 Method Not Allowed means the endpoint exists — service is reachable
      return { status: 'healthy', latencyMs }
    }

    if (response.status === 401 || response.status === 403) {
      return {
        status: 'degraded',
        latencyMs,
        message: `Plane authentication failed: HTTP ${response.status}`,
      }
    }

    return {
      status: 'degraded',
      latencyMs,
      message: `Plane API returned HTTP ${response.status}`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const isTimeout = message.includes('abort') || message.includes('timeout')
    return {
      status: 'unhealthy',
      latencyMs: CHECK_TIMEOUT_MS,
      message: isTimeout
        ? 'Plane health check timed out after 5s'
        : `Plane unreachable: ${message}`,
    }
  }
}

/**
 * Checks GitHub API reachability via HTTP HEAD on rate_limit.
 * GITHUB_TOKEN is optional but recommended to avoid unauthenticated rate limits.
 */
export async function checkGitHub(): Promise<HealthStatus> {
  const token = process.env.GITHUB_TOKEN

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const { result: response, latencyMs } = await measureLatency(() =>
      fetchWithTimeout('https://api.github.com/rate_limit', {
        method: 'HEAD',
        headers,
      })
    )

    if (response.ok || response.status === 200) {
      return { status: 'healthy', latencyMs }
    }

    if (response.status === 401) {
      return {
        status: 'degraded',
        latencyMs,
        message: 'GitHub token invalid or expired',
      }
    }

    if (response.status === 429) {
      return {
        status: 'degraded',
        latencyMs,
        message: 'GitHub API rate limit exceeded',
      }
    }

    return {
      status: 'degraded',
      latencyMs,
      message: `GitHub API returned HTTP ${response.status}`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const isTimeout = message.includes('abort') || message.includes('timeout')
    return {
      status: 'unhealthy',
      latencyMs: CHECK_TIMEOUT_MS,
      message: isTimeout
        ? 'GitHub health check timed out after 5s'
        : `GitHub unreachable: ${message}`,
    }
  }
}

// ── Registry ──────────────────────────────────────────────────────────────────

/**
 * All registered health checks.
 * Add new checks here to include them in runAllChecks().
 */
export const healthChecks: HealthCheck[] = [
  { name: 'supabase', check: checkSupabase },
  { name: 'slack', check: checkSlack },
  { name: 'plane', check: checkPlane },
  { name: 'github', check: checkGitHub },
]

/**
 * Runs all registered health checks concurrently and returns a map of
 * service name → HealthStatus. Individual check failures are captured as
 * 'unhealthy' entries and do not throw.
 */
export async function runAllChecks(): Promise<Record<string, HealthStatus>> {
  const results = await Promise.allSettled(
    healthChecks.map(async (hc) => {
      const status = await hc.check()
      return { name: hc.name, status }
    })
  )

  return results.reduce<Record<string, HealthStatus>>((acc, result, index) => {
    const name = healthChecks[index]?.name ?? `check_${index}`

    if (result.status === 'fulfilled') {
      return { ...acc, [name]: result.value.status }
    }

    return {
      ...acc,
      [name]: {
        status: 'unhealthy',
        latencyMs: 0,
        message:
          result.reason instanceof Error ? result.reason.message : 'Check threw unexpectedly',
      } satisfies HealthStatus,
    }
  }, {})
}
