/**
 * DORA Metrics Calculation
 *
 * Calculates the four DORA (DevOps Research and Assessment) metrics from
 * the GitHub API using native fetch (no external SDK dependency):
 *   - Deployment Frequency (deploys per week)
 *   - Lead Time for Changes (commit → production, in hours)
 *   - Mean Time to Recovery (incident open → close, in hours)
 *   - Change Failure Rate (failed deploys / total deploys, 0–1)
 */

export interface DoraMetrics {
  /** Number of successful production deployments per week */
  deploymentFrequency: number
  /** Average hours from first commit in a PR to it being deployed */
  leadTimeForChanges: number
  /** Average hours from incident open to incident close */
  meanTimeToRecovery: number
  /** Ratio of failed deployments to total deployments (0–1) */
  changeFailureRate: number
}

interface GitHubDeployment {
  id: number
  sha: string
  environment: string
  created_at: string
  updated_at: string
}

interface GitHubDeploymentStatus {
  state: string
  created_at: string
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
  head: {
    sha: string
  }
  base: {
    sha: string
  }
}

interface GitHubIssue {
  number: number
  title: string
  labels: Array<{ name: string }>
  created_at: string
  closed_at: string | null
  state: string
}

/**
 * Build a GitHub API request with auth header if token is set.
 */
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

/**
 * Fetch all pages of a GitHub API endpoint.
 */
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

    // Follow Link header for pagination
    const linkHeader = response.headers.get('link')
    const nextMatch = linkHeader?.match(/<([^>]+)>;\s*rel="next"/)
    nextUrl = nextMatch ? nextMatch[1] : null
  }

  return results
}

/**
 * Fetch deployment statuses for a single deployment.
 */
async function fetchDeploymentStatuses(
  org: string,
  repo: string,
  deploymentId: number
): Promise<GitHubDeploymentStatus[]> {
  const url = `https://api.github.com/repos/${org}/${repo}/deployments/${deploymentId}/statuses`
  return fetchAllPages<GitHubDeploymentStatus>(url)
}

/**
 * Fetch merged PRs within the window, then resolve first-commit timestamps.
 */
async function fetchLeadTimes(org: string, repo: string, since: string): Promise<number[]> {
  const prsUrl =
    `https://api.github.com/repos/${org}/${repo}/pulls` +
    `?state=closed&sort=updated&direction=desc&per_page=100`
  const prs = await fetchAllPages<GitHubPullRequest>(prsUrl)
  const merged = prs.filter((pr) => pr.merged_at !== null && pr.merged_at >= since)

  const leadTimes: number[] = []

  for (const pr of merged) {
    if (!pr.merged_at) continue

    // Fetch commits for this PR to find the earliest author date
    const commitsUrl = `https://api.github.com/repos/${org}/${repo}/pulls/${pr.number}/commits`
    const commits = await fetchAllPages<GitHubCommit>(commitsUrl)

    if (commits.length === 0) continue

    const firstCommitDate = commits
      .map((c) => new Date(c.commit.author.date).getTime())
      .sort((a, b) => a - b)[0]

    const mergedAtMs = new Date(pr.merged_at).getTime()
    const leadTimeHours = (mergedAtMs - firstCommitDate) / (1000 * 60 * 60)

    if (leadTimeHours >= 0) {
      leadTimes.push(leadTimeHours)
    }
  }

  return leadTimes
}

/**
 * Fetch closed incident issues (labelled "incident") in the window.
 */
async function fetchIncidentMttrs(org: string, repo: string, since: string): Promise<number[]> {
  const url =
    `https://api.github.com/repos/${org}/${repo}/issues` +
    `?state=closed&labels=incident&since=${since}&per_page=100`
  const issues = await fetchAllPages<GitHubIssue>(url)

  return issues
    .filter((issue) => issue.closed_at !== null && issue.closed_at >= since)
    .map((issue) => {
      const openedMs = new Date(issue.created_at).getTime()
      const closedMs = new Date(issue.closed_at!).getTime()
      return (closedMs - openedMs) / (1000 * 60 * 60)
    })
    .filter((hours) => hours >= 0)
}

/**
 * Calculate DORA metrics for a given GitHub repository over a rolling window.
 *
 * @param org  - GitHub organisation or user (e.g. 'rooseveltops')
 * @param repo - Repository name (e.g. 'main-app')
 * @param days - Rolling window in days (default: 30)
 */
export async function calculateDoraMetrics(
  org: string,
  repo: string,
  days: number = 30
): Promise<DoraMetrics> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const weeks = days / 7

  // ── 1. Deployments ──────────────────────────────────────────────────────────
  const deploymentsUrl =
    `https://api.github.com/repos/${org}/${repo}/deployments` +
    `?environment=production&per_page=100`
  const allDeployments = await fetchAllPages<GitHubDeployment>(deploymentsUrl)
  const windowDeployments = allDeployments.filter((d) => d.created_at >= since)

  // Classify each deployment as success or failure via its latest status
  let successCount = 0
  let failureCount = 0

  for (const deployment of windowDeployments) {
    const statuses = await fetchDeploymentStatuses(org, repo, deployment.id)
    // Statuses are returned newest-first by default
    const latestState = statuses[0]?.state ?? 'unknown'

    if (latestState === 'success') {
      successCount++
    } else if (latestState === 'failure' || latestState === 'error') {
      failureCount++
    }
  }

  const totalDeploys = successCount + failureCount
  const deploymentFrequency = totalDeploys / weeks
  const changeFailureRate = totalDeploys > 0 ? failureCount / totalDeploys : 0

  // ── 2. Lead Time for Changes ─────────────────────────────────────────────────
  const leadTimes = await fetchLeadTimes(org, repo, since)
  const leadTimeForChanges =
    leadTimes.length > 0 ? leadTimes.reduce((sum, h) => sum + h, 0) / leadTimes.length : 0

  // ── 3. Mean Time to Recovery ─────────────────────────────────────────────────
  const mttrs = await fetchIncidentMttrs(org, repo, since)
  const meanTimeToRecovery =
    mttrs.length > 0 ? mttrs.reduce((sum, h) => sum + h, 0) / mttrs.length : 0

  return {
    deploymentFrequency,
    leadTimeForChanges,
    meanTimeToRecovery,
    changeFailureRate,
  }
}
