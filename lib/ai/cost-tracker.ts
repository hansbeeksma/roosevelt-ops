import { createClient } from '@/lib/supabase/server'
import { type ModelId, MODEL_CONFIG, MODELS } from './model-config'

// Cost per 1M tokens (approximate USD) — kept local to avoid circular imports
const COST_PER_MILLION: Record<ModelId, { input: number; output: number }> = {
  [MODELS.opus]: { input: 15, output: 75 },
  [MODELS.sonnet]: { input: 3, output: 15 },
  [MODELS.haiku]: { input: 0.25, output: 1.25 },
} as const

export interface UsageRecord {
  model: ModelId
  inputTokens: number
  outputTokens: number
  task: string
  organizationId: string
  timestamp: Date
  estimatedCostUsd: number
}

export interface MonthlyReport {
  totalUsd: number
  byModel: Record<string, number>
}

const FLUSH_THRESHOLD = 50

function computeCost(model: ModelId, inputTokens: number, outputTokens: number): number {
  const rates = COST_PER_MILLION[model]
  if (!rates) {
    return 0
  }
  return (inputTokens / 1_000_000) * rates.input + (outputTokens / 1_000_000) * rates.output
}

function isValidModel(model: string): model is ModelId {
  return Object.values(MODEL_CONFIG).some((cfg) => cfg.id === model)
}

export class CostTracker {
  private buffer: UsageRecord[] = []

  /**
   * Record AI usage. Computes estimated cost and buffers the record.
   * Flushes to Supabase automatically when buffer reaches FLUSH_THRESHOLD.
   */
  async record(usage: Omit<UsageRecord, 'estimatedCostUsd'>): Promise<void> {
    const model = isValidModel(usage.model) ? usage.model : MODELS.haiku

    const record: UsageRecord = {
      ...usage,
      model,
      estimatedCostUsd: computeCost(model, usage.inputTokens, usage.outputTokens),
    }

    this.buffer = [...this.buffer, record]

    if (this.buffer.length >= FLUSH_THRESHOLD) {
      await this.flush()
    }
  }

  /**
   * Flush buffered records to Supabase ai_usage table.
   * Clears the buffer after a successful write.
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return
    }

    const toFlush = this.buffer
    this.buffer = []

    const rows = toFlush.map((r) => ({
      organization_id: r.organizationId,
      model: r.model,
      input_tokens: r.inputTokens,
      output_tokens: r.outputTokens,
      estimated_cost_usd: r.estimatedCostUsd,
      task: r.task,
      created_at: r.timestamp.toISOString(),
    }))

    const supabase = await createClient()
    const { error } = await supabase.from('ai_usage').insert(rows)

    if (error) {
      // Restore buffer so records are not lost on transient errors
      this.buffer = [...toFlush, ...this.buffer]
      throw new Error(`CostTracker flush failed: ${error.message}`)
    }
  }

  /**
   * Return a monthly usage report for an organization.
   * Queries the current calendar month.
   */
  async getMonthlyReport(organizationId: string): Promise<MonthlyReport> {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_usage')
      .select('model, estimated_cost_usd')
      .eq('organization_id', organizationId)
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd)

    if (error) {
      throw new Error(`CostTracker monthly report failed: ${error.message}`)
    }

    const rows = data ?? []

    const byModel = rows.reduce<Record<string, number>>((acc, row) => {
      const current = acc[row.model] ?? 0
      return {
        ...acc,
        [row.model]: current + (row.estimated_cost_usd ?? 0),
      }
    }, {})

    const totalUsd = Object.values(byModel).reduce((sum, v) => sum + v, 0)

    return { totalUsd, byModel }
  }
}
