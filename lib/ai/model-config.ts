// Claude API model identifiers and configuration
// Used as the foundation for model selection across the AI layer

export const MODELS = {
  opus: 'claude-opus-4-6',
  sonnet: 'claude-sonnet-4-6',
  haiku: 'claude-haiku-4-5-20251001',
} as const

export type ModelId = (typeof MODELS)[keyof typeof MODELS]

export type Complexity = 'low' | 'medium' | 'high'

export interface ModelConfig {
  id: ModelId
  displayName: string
  maxTokens: number
  defaultMaxTokens: number
}

export const MODEL_CONFIG: Record<ModelId, ModelConfig> = {
  [MODELS.opus]: {
    id: MODELS.opus,
    displayName: 'Claude Opus 4.6',
    maxTokens: 32_000,
    defaultMaxTokens: 4_096,
  },
  [MODELS.sonnet]: {
    id: MODELS.sonnet,
    displayName: 'Claude Sonnet 4.6',
    maxTokens: 16_000,
    defaultMaxTokens: 2_048,
  },
  [MODELS.haiku]: {
    id: MODELS.haiku,
    displayName: 'Claude Haiku 4.5',
    maxTokens: 8_000,
    defaultMaxTokens: 1_024,
  },
}

/**
 * Select a model based on task complexity.
 * Low → Haiku, Medium → Sonnet, High → Opus.
 */
export function selectModel(complexity: Complexity): ModelId {
  const mapping: Record<Complexity, ModelId> = {
    low: MODELS.haiku,
    medium: MODELS.sonnet,
    high: MODELS.opus,
  }

  return mapping[complexity]
}
