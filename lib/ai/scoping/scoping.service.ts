import Anthropic from '@anthropic-ai/sdk'
import { SCOPING_SYSTEM_PROMPT, buildScopingUserPrompt } from './scoping.prompts'
import { ScopingOutputSchema } from './scoping.types'
import type { ScopingInput, ScopingOutput } from './scoping.types'

const ANALYSIS_MODEL = 'claude-opus-4-5'
const EXTRACTION_MODEL = 'claude-haiku-4-5'

export class ScopingService {
  private client: Anthropic

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured')
    }
    this.client = new Anthropic({ apiKey })
  }

  async analyzeProjectBrief(input: ScopingInput): Promise<ScopingOutput> {
    const userPrompt = buildScopingUserPrompt(input)

    // Step 1: Deep analysis with Opus
    const analysisResponse = await this.client.messages.create({
      model: ANALYSIS_MODEL,
      max_tokens: 4096,
      system: SCOPING_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    const analysisText = this.extractText(analysisResponse)

    this.logUsage('analysis', ANALYSIS_MODEL, analysisResponse.usage)

    // Step 2: Structured extraction with Haiku to ensure clean JSON
    const extractionResponse = await this.client.messages.create({
      model: EXTRACTION_MODEL,
      max_tokens: 4096,
      system:
        'You are a JSON extractor. Extract the JSON object from the input and return ONLY valid JSON. No markdown, no prose, no code fences.',
      messages: [
        {
          role: 'user',
          content: `Extract the JSON from this scoping analysis:\n\n${analysisText}`,
        },
      ],
    })

    const extractedJson = this.extractText(extractionResponse)

    this.logUsage('extraction', EXTRACTION_MODEL, extractionResponse.usage)

    return this.parseAndValidate(extractedJson)
  }

  private extractText(response: Anthropic.Message): string {
    const block = response.content[0]
    if (!block || block.type !== 'text') {
      throw new Error('Unexpected response format from Claude API')
    }
    return block.text.trim()
  }

  private parseAndValidate(jsonText: string): ScopingOutput {
    let parsed: unknown

    try {
      parsed = JSON.parse(jsonText)
    } catch {
      throw new Error(`Failed to parse Claude response as JSON: ${jsonText.slice(0, 200)}`)
    }

    const result = ScopingOutputSchema.safeParse(parsed)

    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      throw new Error(`Claude response failed validation: ${issues}`)
    }

    return result.data
  }

  private logUsage(
    step: string,
    model: string,
    usage: { input_tokens: number; output_tokens: number }
  ): void {
    // TODO: Persist to ai_usage_log table in Supabase (deferred: lightweight-impl)
    console.log(
      JSON.stringify({
        event: 'ai_usage',
        step,
        model,
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        totalTokens: usage.input_tokens + usage.output_tokens,
        timestamp: new Date().toISOString(),
      })
    )
  }
}
