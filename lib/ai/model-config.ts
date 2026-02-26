export const MODEL_CONFIG = {
  // High quality, complex reasoning
  complex: 'claude-opus-4-6',
  // Balanced quality and speed
  standard: 'claude-sonnet-4-6',
  // Fast and cost-effective for high-frequency tasks
  fast: 'claude-haiku-4-5-20251001',
} as const

export type ModelTier = keyof typeof MODEL_CONFIG
export type ModelId = (typeof MODEL_CONFIG)[ModelTier]

// Task-based model selection
export function selectModel(task: 'scoping' | 'insights' | 'review' | 'routing'): ModelId {
  const mapping: Record<string, ModelId> = {
    scoping: MODEL_CONFIG.complex, // Needs best reasoning
    insights: MODEL_CONFIG.fast, // Runs daily, many orgs
    review: MODEL_CONFIG.standard, // Balance quality/cost
    routing: MODEL_CONFIG.fast, // Simple classification
  }
  return mapping[task] ?? MODEL_CONFIG.standard
}
