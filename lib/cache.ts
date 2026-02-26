// Next.js revalidation tags for cache invalidation
export const CACHE_TAGS = {
  projects: 'projects',
  team: 'team',
  crm: 'crm',
  analytics: 'analytics',
  insights: 'daily-insights',
} as const

// Default revalidation times (seconds)
export const REVALIDATE = {
  static: false, // Never revalidate (fully static)
  slow: 3600, // 1 hour - team members, org settings
  medium: 300, // 5 minutes - project list, CRM data
  fast: 60, // 1 minute - dashboard metrics
  realtime: 0, // Always fresh - time entries, notifications
} as const

export function fetchWithCache<T>(
  url: string,
  tags: string[],
  revalidate: number | false = REVALIDATE.medium
): Promise<T> {
  return fetch(url, {
    next: { revalidate, tags },
  }).then((r) => {
    if (!r.ok) throw new Error(`Fetch failed: ${r.status}`)
    return r.json() as Promise<T>
  })
}
