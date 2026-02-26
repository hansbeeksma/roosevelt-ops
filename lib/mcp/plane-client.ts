/**
 * Plane MCP Client
 *
 * Typed wrapper around Plane REST API operations for Roosevelt OPS.
 * Used by application code that needs to create or query Plane issues
 * programmatically (e.g. incident automation, postmortem tooling).
 *
 * For interactive agent usage, prefer the MCP tools directly:
 *   mcp__plane__create-issue, mcp__plane__update-issue, etc.
 *
 * See: docs/integrations/mcp-ecosystem.md
 */

// ── Project constants ─────────────────────────────────────────────────────────

export const PLANE_PROJECTS = {
  ROOSE: 'c7d0b955-a97f-40b6-be03-7c05c2d0b1c3',
} as const

export type PlaneProjectKey = keyof typeof PLANE_PROJECTS

export const PLANE_STATES = {
  ROOSE: {
    BACKLOG: 'e167edf7-d46e-48b4-ba76-31a33e5fb933',
    IN_PROGRESS: 'e7e9879e-f38c-4140-a1ec-79cec5d1cf00',
    DONE: 'c8bfdf86-913c-422a-873c-e7a09e6f2589',
  },
} as const satisfies Record<PlaneProjectKey, Record<string, string>>

export const PLANE_WORKSPACE = 'rooseveltdigital' as const

export const PLANE_BASE_URL = 'https://api.plane.so' as const

// ── Types ─────────────────────────────────────────────────────────────────────

export type PlanePriority = 'urgent' | 'high' | 'medium' | 'low' | 'none'

export interface PlaneIssueCreate {
  projectId: string
  title: string
  description?: string
  stateId?: string
  labelIds?: string[]
  priority?: PlanePriority
  estimate?: number
  parentId?: string
  targetDate?: string
}

export interface PlaneIssueUpdate {
  title?: string
  description?: string
  stateId?: string
  labelIds?: string[]
  priority?: PlanePriority
  estimate?: number
  targetDate?: string
}

export interface PlaneIssue {
  id: string
  sequence_id: number
  name: string
  description_html: string | null
  priority: PlanePriority
  state: string
  label_ids: string[]
  estimate_point: number | null
  created_at: string
  updated_at: string
}

export interface PlaneLabelCreate {
  name: string
  color?: string
}

export interface PlaneLabel {
  id: string
  name: string
  color: string
}

export interface PlaneCommentCreate {
  commentHtml: string
}

// ── Client configuration ──────────────────────────────────────────────────────

interface PlaneClientConfig {
  apiKey: string
  workspaceSlug?: string
  baseUrl?: string
}

function getConfig(): PlaneClientConfig {
  const apiKey = process.env.PLANE_API_KEY
  if (!apiKey) {
    throw new Error('PLANE_API_KEY environment variable is required')
  }
  return {
    apiKey,
    workspaceSlug: process.env.PLANE_WORKSPACE_SLUG ?? PLANE_WORKSPACE,
    baseUrl: process.env.PLANE_BASE_URL ?? PLANE_BASE_URL,
  }
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function planeRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { apiKey, baseUrl } = getConfig()
  const url = `${baseUrl}/api/v1${path}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Plane API ${response.status} ${response.statusText}: ${body}`)
  }

  return response.json() as Promise<T>
}

function workspacePath(projectId: string, resource: string): string {
  const { workspaceSlug } = getConfig()
  return `/workspaces/${workspaceSlug}/projects/${projectId}/${resource}/`
}

// ── Issue operations ──────────────────────────────────────────────────────────

/**
 * Create a new issue in a Plane project.
 *
 * Always validate that projectId exists before calling — use PLANE_PROJECTS
 * constants rather than hardcoded strings at call sites.
 */
export async function createIssue(input: PlaneIssueCreate): Promise<PlaneIssue> {
  const {
    projectId,
    title,
    description,
    stateId,
    labelIds,
    priority,
    estimate,
    parentId,
    targetDate,
  } = input

  const body: Record<string, unknown> = { name: title }
  if (description !== undefined) body.description_html = description
  if (stateId !== undefined) body.state = stateId
  if (labelIds !== undefined) body.label_ids = labelIds
  if (priority !== undefined) body.priority = priority
  if (estimate !== undefined) body.estimate_point = estimate
  if (parentId !== undefined) body.parent = parentId
  if (targetDate !== undefined) body.target_date = targetDate

  return planeRequest<PlaneIssue>(workspacePath(projectId, 'issues'), {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * Update an existing issue by its UUID.
 */
export async function updateIssue(
  projectId: string,
  issueId: string,
  update: PlaneIssueUpdate
): Promise<PlaneIssue> {
  const { title, description, stateId, labelIds, priority, estimate, targetDate } = update

  const body: Record<string, unknown> = {}
  if (title !== undefined) body.name = title
  if (description !== undefined) body.description_html = description
  if (stateId !== undefined) body.state = stateId
  if (labelIds !== undefined) body.label_ids = labelIds
  if (priority !== undefined) body.priority = priority
  if (estimate !== undefined) body.estimate_point = estimate
  if (targetDate !== undefined) body.target_date = targetDate

  return planeRequest<PlaneIssue>(
    workspacePath(projectId, `issues/${issueId}`).replace(/\/$/, '/'),
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  )
}

/**
 * Fetch a single issue by its UUID.
 */
export async function getIssue(projectId: string, issueId: string): Promise<PlaneIssue> {
  return planeRequest<PlaneIssue>(workspacePath(projectId, `issues/${issueId}`))
}

/**
 * List issues in a project, optionally filtered by state.
 */
export async function listIssues(
  projectId: string,
  filters?: { stateId?: string; labelId?: string; perPage?: number }
): Promise<PlaneIssue[]> {
  const params = new URLSearchParams()
  if (filters?.stateId) params.set('state', filters.stateId)
  if (filters?.labelId) params.set('label', filters.labelId)
  if (filters?.perPage) params.set('per_page', String(filters.perPage))

  const query = params.toString() ? `?${params.toString()}` : ''
  const path = workspacePath(projectId, 'issues') + query

  const response = await planeRequest<{ results: PlaneIssue[] }>(path)
  return response.results
}

// ── Comment operations ────────────────────────────────────────────────────────

/**
 * Add a comment to an issue.
 */
export async function addComment(
  projectId: string,
  issueId: string,
  input: PlaneCommentCreate
): Promise<void> {
  await planeRequest(workspacePath(projectId, `issues/${issueId}/comments`), {
    method: 'POST',
    body: JSON.stringify({ comment_html: input.commentHtml }),
  })
}

// ── Label operations ──────────────────────────────────────────────────────────

/**
 * List all labels for a project.
 */
export async function listLabels(projectId: string): Promise<PlaneLabel[]> {
  return planeRequest<PlaneLabel[]>(workspacePath(projectId, 'issue-labels'))
}

/**
 * Get or create a label by name.
 *
 * Implements idempotent label creation — safe to call multiple times
 * with the same name.
 */
export async function ensureLabel(projectId: string, input: PlaneLabelCreate): Promise<PlaneLabel> {
  const existing = await listLabels(projectId)
  const found = existing.find((l) => l.name === input.name)
  if (found) return found

  return planeRequest<PlaneLabel>(workspacePath(projectId, 'issue-labels'), {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      color: input.color ?? '#607D8B',
    }),
  })
}

// ── Convenience helpers ───────────────────────────────────────────────────────

/**
 * Build the Plane web UI URL for an issue.
 */
export function getIssueUrl(projectId: string, issueId: string): string {
  const { workspaceSlug } = getConfig()
  return `https://app.plane.so/${workspaceSlug}/projects/${projectId}/issues/${issueId}`
}

/**
 * Check whether Plane integration is configured in the current environment.
 */
export function isPlaneConfigured(): boolean {
  return !!(process.env.PLANE_API_KEY && process.env.PLANE_WORKSPACE_SLUG)
}
