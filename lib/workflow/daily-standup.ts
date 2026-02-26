export interface StandupItem {
  id: string
  label: string
  completed: boolean
  category: 'ops' | 'development' | 'client'
}

export interface StandupState {
  items: StandupItem[]
  date: string
  completedAt: string | null
}

export const DEFAULT_STANDUP_ITEMS: StandupItem[] = [
  { id: 'check-incidents', label: 'Check incidents & uptime', completed: false, category: 'ops' },
  { id: 'review-plane', label: 'Review Plane board', completed: false, category: 'ops' },
  {
    id: 'check-email',
    label: 'Process email/Slack messages',
    completed: false,
    category: 'client',
  },
  { id: 'set-focus', label: 'Set daily focus task', completed: false, category: 'development' },
  { id: 'check-ci', label: 'Check CI/CD status', completed: false, category: 'development' },
]

const STORAGE_KEY = 'standup-state'

function todayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

export function loadStandupState(): StandupState {
  if (typeof window === 'undefined') {
    return createFreshState()
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createFreshState()

    const parsed: StandupState = JSON.parse(raw)

    if (parsed.date !== todayDateString()) {
      return createFreshState()
    }

    return parsed
  } catch {
    return createFreshState()
  }
}

export function saveStandupState(state: StandupState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function createFreshState(): StandupState {
  return {
    items: DEFAULT_STANDUP_ITEMS.map((item) => ({ ...item, completed: false })),
    date: todayDateString(),
    completedAt: null,
  }
}

export function toggleItem(state: StandupState, itemId: string): StandupState {
  const updatedItems = state.items.map((item) =>
    item.id === itemId ? { ...item, completed: !item.completed } : item
  )

  const allDone = updatedItems.every((item) => item.completed)

  return {
    ...state,
    items: updatedItems,
    completedAt: allDone ? new Date().toISOString() : null,
  }
}

export function resetStandup(state: StandupState): StandupState {
  return {
    ...state,
    items: state.items.map((item) => ({ ...item, completed: false })),
    completedAt: null,
  }
}

export function getCompletionRatio(state: StandupState): { done: number; total: number } {
  const done = state.items.filter((item) => item.completed).length
  return { done, total: state.items.length }
}

export function getItemsByCategory(
  state: StandupState
): Record<StandupItem['category'], StandupItem[]> {
  return state.items.reduce(
    (acc, item) => ({
      ...acc,
      [item.category]: [...(acc[item.category] ?? []), item],
    }),
    { ops: [], development: [], client: [] } as Record<StandupItem['category'], StandupItem[]>
  )
}
