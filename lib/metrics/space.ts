/**
 * SPACE Metrics Calculation
 *
 * Derives the five SPACE framework dimensions from GitHub API data:
 *   S – Satisfaction  (proxy: deploy success rate as team health signal)
 *   P – Performance   (deploy success rate, 0–10)
 *   A – Activity      (commits per calendar day, normalised to 0–10)
 *   C – Communication (PR review turnaround hours; lower = better, 0–10)
 *   E – Efficiency    (feature-to-bug ratio; higher = better, 0–10)
 *
 * All raw values are converted to a 0–10 scale so they can be displayed on a
 * consistent radar/gauge chart in the dashboard.
 */

export interface SpaceMetrics {
  /** 0–10: proxy satisfaction score derived from deployment success rate */
  satisfaction: number
  /** 0–10: deployment success rate (10 = 100 % success) */
  performance: number
  /** 0–10: normalised commit activity per day (10 ≈ 20+ commits/day) */
  activity: number
  /** 0–10: PR review turnaround (10 = reviews under 1 h; 0 = 24 h+) */
  communication: number
  /** 0–10: feature-to-bug ratio (10 = only features; 0 = all bugs) */
  efficiency: number
}

interface GitHubDeployment {
  id: number
  created_at: string
}

interface GitHubDeploymentStatus {
  state: string
}

interface GitHubCommit {
  sha: string
  commit: {
    author: {
      date: string
    }
  }
}

interface GitHubPullRequest {
  number: number
  merged_at: string | null
  created_at: string
}

interface GitHubReview {
  submitted_at: string | null
}

interface GitHubIssue {
  number: number
  labels: Array<{ name: string }>
  created_at: string
}

/** Build GitHub API headers (auth optional via GITHUB_TOKEN env var). */
function buildHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/** Follow GitHub pagination and collect all items. */
async function fetchAllPages<T>(url: string): Promise<T[]> {
  const results: T[] = []
  let nextUrl: string | null = url

  while (nextUrl) {
    const response = await fetch(nextUrl, { headers: buildHeaders() })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`GitHub API error ${response.status}: ${body}`)
    }

    const page: T[] = await response.json()
    results.push(...page)

    const linkHeader = response.headers.get('link')
    const nextMatch = linkHeader?.match(/<([^>]+)>;\s*rel="next"/)
    nextUrl = nextMatch ? nextMatch[1] : null
  }

  return results
}

/** Clamp a value between 0 and 10 (inclusive). */
function clamp10(value: number): number {
  return Math.max(0, Math.min(10, value))
}

/**
 * Fetch deployment success rate for the window.
 * Returns a value between 0 (all failed) and 1 (all succeeded).
 */
async function fetchDeploySuccessRate(org: string, repo: string, since: string): Promise<number> {
  const url =
    `https://api.github.com/repos/${org}/${repo}/deployments` +
    `?environment=production&per_page=100`
  const deployments = await fetchAllPages<GitHubDeployment>(url)
  const window = deployments.filter((d) => d.created_at >= since)

  if (window.length === 0) return 1 // no data → assume healthy

  let successes = 0

  for (const deployment of window) {
    const statusUrl = `https://api.github.com/repos/${org}/${repo}/deployments/${deployment.id}/statuses`
    const statuses = await fetchAllPages<GitHubDeploymentStatus>(statusUrl)
    const latest = statuses[0]?.state ?? 'unknown'
    if (latest === 'success') successes++
  }

  return successes / window.length
}

/**
 * Fetch commits within the window and return the average commits per day.
 */
async function fetchCommitsPerDay(
  org: string,
  repo: string,
  since: string,
  days: number
): Promise<number> {
  const url = `https://api.github.com/repos/${org}/${repo}/commits` + `?since=${since}&per_page=100`
  const commits = await fetchAllPages<GitHubCommit>(url)
  return commits.length / days
}

/**
 * Fetch merged PRs and compute average first-review turnaround in hours.
 */
async function fetchAvgReviewTurnaroundHours(
  org: string,
  repo: string,
  since: string
): Promise<number> {
  const prsUrl =
    `https://api.github.com/repos/${org}/${repo}/pulls` +
    `?state=closed&sort=updated&direction=desc&per_page=100`
  const prs = await fetchAllPages<GitHubPullRequest>(prsUrl)
  const merged = prs.filter((pr) => pr.merged_at !== null && pr.merged_at >= since)

  const turnarounds: number[] = []

  for (const pr of merged) {
    const reviewsUrl = `https://api.github.com/repos/${org}/${repo}/pulls/${pr.number}/reviews`
    const reviews = await fetchAllPages<GitHubReview>(reviewsUrl)
    const firstReview = reviews
      .filter((r) => r.submitted_at !== null)
      .map((r) => new Date(r.submitted_at!).getTime())
      .sort((a, b) => a - b)[0]

    if (firstReview === undefined) continue

    const prCreated = new Date(pr.created_at).getTime()
    const hours = (firstReview - prCreated) / (1000 * 60 * 60)
    if (hours >= 0) turnarounds.push(hours)
  }

  if (turnarounds.length === 0) return 4 // assume 4 h when no data

  return turnarounds.reduce((sum, h) => sum + h, 0) / turnarounds.length
}

/**
 * Fetch issues to calculate the feature-to-bug ratio.
 * Feature issues are labelled "enhancement" or "feature"; bug issues "bug".
 */
async function fetchFeatureToBugRatio(org: string, repo: string, since: string): Promise<number> {
  const url =
    `https://api.github.com/repos/${org}/${repo}/issues` +
    `?state=closed&since=${since}&per_page=100`
  const issues = await fetchAllPages<GitHubIssue>(url)

  let features = 0
  let bugs = 0

  for (const issue of issues) {
    const labelNames = issue.labels.map((l) => l.name.toLowerCase())
    if (labelNames.some((l) => l === 'enhancement' || l === 'feature')) {
      features++
    } else if (labelNames.some((l) => l === 'bug')) {
      bugs++
    }
  }

  const total = features + bugs
  if (total === 0) return 0.8 // assume a healthy 80/20 ratio when no data

  return features / total
}

/**
 * Calculate SPACE metrics for a given GitHub repository over a rolling window.
 *
 * All returned scores are on a 0–10 scale.
 *
 * @param org  - GitHub organisation or user (e.g. 'rooseveltops')
 * @param repo - Repository name (e.g. 'main-app')
 * @param days - Rolling window in days (default: 30)
 */
export async function calculateSpaceMetrics(
  org: string,
  repo: string,
  days: number = 30
): Promise<SpaceMetrics> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const [successRate, commitsPerDay, avgReviewHours, featureToBugRatio] = await Promise.all([
    fetchDeploySuccessRate(org, repo, since),
    fetchCommitsPerDay(org, repo, since, days),
    fetchAvgReviewTurnaroundHours(org, repo, since),
    fetchFeatureToBugRatio(org, repo, since),
  ])

  // S – Satisfaction: uses deploy success rate as a team health proxy.
  // A consistently successful deploy pipeline correlates with team satisfaction.
  const satisfaction = clamp10(successRate * 10)

  // P – Performance: deploy success rate, directly mapped to 0–10.
  const performance = clamp10(successRate * 10)

  // A – Activity: normalise commits/day. Cap at 20 commits/day = score of 10.
  const activity = clamp10((commitsPerDay / 20) * 10)

  // C – Communication: review turnaround. 0 h → 10, 24 h+ → 0 (linear decay).
  const communicationRaw = Math.max(0, 10 - (avgReviewHours / 24) * 10)
  const communication = clamp10(communicationRaw)

  // E – Efficiency: feature-to-bug ratio 0–1, mapped to 0–10.
  const efficiency = clamp10(featureToBugRatio * 10)

  return {
    satisfaction,
    performance,
    activity,
    communication,
    efficiency,
  }
}
