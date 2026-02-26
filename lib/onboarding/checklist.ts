/**
 * Onboarding Checklist Definitions
 *
 * Canonical step definitions for client and team-member onboarding flows.
 * These are immutable templates — runtime state (completed, completedAt) is
 * persisted in the onboarding_checklists table and merged at query time.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OnboardingStep {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly automatable: boolean
  completed: boolean
  completedAt?: Date
}

export type ChecklistType = 'client' | 'team_member'

export interface OnboardingChecklist {
  readonly id: string
  readonly organisationId: string
  readonly type: ChecklistType
  readonly steps: OnboardingStep[]
  readonly completedSteps: number
  readonly totalSteps: number
  readonly completedAt: Date | null
  readonly createdAt: Date
}

// ---------------------------------------------------------------------------
// Client onboarding steps
// ---------------------------------------------------------------------------

export const CLIENT_ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    id: 'create-org',
    title: 'Create organisation',
    description: 'Set up client org in system',
    automatable: true,
    completed: false,
  },
  {
    id: 'plane-project',
    title: 'Create Plane project',
    description: 'Set up project tracker',
    automatable: true,
    completed: false,
  },
  {
    id: 'portal-access',
    title: 'Send portal access',
    description: 'Magic link invitation',
    automatable: true,
    completed: false,
  },
  {
    id: 'kickoff-meeting',
    title: 'Schedule kickoff',
    description: '45-min discovery call',
    automatable: false,
    completed: false,
  },
  {
    id: 'scope-doc',
    title: 'Generate scope doc',
    description: 'AI-assisted project scope',
    automatable: true,
    completed: false,
  },
] as const

// ---------------------------------------------------------------------------
// Team member onboarding steps
// ---------------------------------------------------------------------------

export const TEAM_MEMBER_ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    id: 'create-account',
    title: 'Create account',
    description: 'Set up team member account in system',
    automatable: true,
    completed: false,
  },
  {
    id: 'send-invite',
    title: 'Send workspace invite',
    description: 'Email invite with SSO link',
    automatable: true,
    completed: false,
  },
  {
    id: 'assign-role',
    title: 'Assign role & permissions',
    description: 'Set role-based access controls',
    automatable: false,
    completed: false,
  },
  {
    id: 'slack-channel',
    title: 'Add to Slack channels',
    description: 'Add to team and project channels',
    automatable: true,
    completed: false,
  },
  {
    id: 'onboarding-call',
    title: 'Schedule onboarding call',
    description: '30-min tool & process walkthrough',
    automatable: false,
    completed: false,
  },
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get the canonical step definitions for a checklist type.
 * Returns a deep copy to prevent accidental mutation.
 */
export function getStepDefinitions(type: ChecklistType): OnboardingStep[] {
  const source = type === 'client' ? CLIENT_ONBOARDING_STEPS : TEAM_MEMBER_ONBOARDING_STEPS

  return source.map((step) => ({ ...step }))
}

/**
 * Calculate progress percentage (0–100) from a list of steps.
 */
export function calculateProgress(steps: readonly OnboardingStep[]): number {
  if (steps.length === 0) return 0
  const completed = steps.filter((s) => s.completed).length
  return Math.round((completed / steps.length) * 100)
}

/**
 * Merge persisted step state (from DB) onto canonical step definitions.
 * Preserves ordering and description from the canonical template.
 */
export function mergeStepState(
  canonical: readonly OnboardingStep[],
  persisted: Array<{ id: string; completed: boolean; completedAt?: string }>
): OnboardingStep[] {
  const persistedMap = new Map(persisted.map((s) => [s.id, s]))

  return canonical.map((step) => {
    const saved = persistedMap.get(step.id)
    if (!saved) return { ...step }

    return {
      ...step,
      completed: saved.completed,
      completedAt: saved.completedAt ? new Date(saved.completedAt) : undefined,
    }
  })
}

/**
 * Mark a single step as complete and return a new steps array (immutable).
 */
export function completeStep(
  steps: readonly OnboardingStep[],
  stepId: string,
  completedAt: Date = new Date()
): OnboardingStep[] {
  return steps.map((step) =>
    step.id === stepId ? { ...step, completed: true, completedAt } : { ...step }
  )
}
