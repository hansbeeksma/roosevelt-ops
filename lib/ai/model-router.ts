import { type Complexity, type ModelId, MODELS, selectModel } from './model-config'

// Cost per 1M tokens (approximate USD)
const MODEL_COSTS: Record<ModelId, { input: number; output: number }> = {
  [MODELS.opus]: { input: 15, output: 75 },
  [MODELS.sonnet]: { input: 3, output: 15 },
  [MODELS.haiku]: { input: 0.25, output: 1.25 },
} as const

export interface RouterParams {
  complexity: Complexity
  latencySensitive: boolean
  estimatedInputTokens: number
  /** Optional hard budget ceiling in USD per request */
  budgetPerRequest?: number
}

export interface RouterDecision {
  model: ModelId
  reason: string
  /** Estimated cost in USD per 1000 requests */
  estimatedCostPer1kRequests: number
}

/**
 * Estimate USD cost per 1000 requests for a given model and token usage.
 * Assumes output tokens ≈ 30% of input tokens as a reasonable default.
 */
function estimateCostPer1kRequests(modelId: ModelId, inputTokens: number): number {
  const costs = MODEL_COSTS[modelId]
  const outputTokens = Math.round(inputTokens * 0.3)
  const inputCost = (inputTokens / 1_000_000) * costs.input
  const outputCost = (outputTokens / 1_000_000) * costs.output
  return (inputCost + outputCost) * 1_000
}

/**
 * Find the cheapest model whose per-request cost fits within the budget.
 * Preference order: haiku → sonnet → opus.
 */
function cheapestModelWithinBudget(budgetPerRequest: number, inputTokens: number): ModelId | null {
  const candidates: ModelId[] = [MODELS.haiku, MODELS.sonnet, MODELS.opus]

  for (const candidate of candidates) {
    const costs = MODEL_COSTS[candidate]
    const outputTokens = Math.round(inputTokens * 0.3)
    const perRequestCost =
      (inputTokens / 1_000_000) * costs.input + (outputTokens / 1_000_000) * costs.output

    if (perRequestCost <= budgetPerRequest) {
      return candidate
    }
  }

  return null
}

/**
 * Route to the optimal Claude model based on task complexity, latency
 * sensitivity, and an optional per-request budget constraint.
 *
 * Decision logic:
 * 1. If `budgetPerRequest` is set, use the cheapest model that fits.
 * 2. If `latencySensitive` is true, cap at Haiku (fastest response).
 * 3. Otherwise delegate to `selectModel(complexity)`.
 */
export function routeModel(task: string, params: RouterParams): RouterDecision {
  const { complexity, latencySensitive, estimatedInputTokens, budgetPerRequest } = params

  // Budget override: find cheapest viable model
  if (budgetPerRequest !== undefined) {
    const budgetModel = cheapestModelWithinBudget(budgetPerRequest, estimatedInputTokens)

    if (budgetModel !== null) {
      return {
        model: budgetModel,
        reason: `Budget constraint ($${budgetPerRequest} per request) — cheapest fitting model selected for task: ${task}`,
        estimatedCostPer1kRequests: estimateCostPer1kRequests(budgetModel, estimatedInputTokens),
      }
    }

    // All models exceed budget — fall through to complexity-based selection
    // and surface the overage in the reason string
  }

  // Latency-sensitive: always use Haiku regardless of complexity
  if (latencySensitive) {
    const model = MODELS.haiku
    return {
      model,
      reason: `Latency-sensitive task — Haiku selected for minimum response time: ${task}`,
      estimatedCostPer1kRequests: estimateCostPer1kRequests(model, estimatedInputTokens),
    }
  }

  // Default: complexity-driven selection
  const model = selectModel(complexity)
  return {
    model,
    reason: `Complexity '${complexity}' → ${model} selected for task: ${task}`,
    estimatedCostPer1kRequests: estimateCostPer1kRequests(model, estimatedInputTokens),
  }
}
