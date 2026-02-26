import Anthropic from '@anthropic-ai/sdk'
import { DailyInsightsOutputSchema } from './insights.types'
import type { DailyInsightsInput, DailyInsightsOutput } from './insights.types'

const MODEL = 'claude-haiku-4-5-20251001'

function buildPrompt(input: DailyInsightsInput): string {
  const { context } = input
  const utilizationPct = Math.round(context.teamUtilization * 100)
  const projectList = context.activeProjects.map((p) => `  - ${p.name} (${p.phase})`).join('\n')

  return `You are an operations intelligence assistant for a digital agency.
Analyze the following daily operations snapshot and produce a concise JSON report.

Date: ${input.date}
Active projects:
${projectList}
Team utilization: ${utilizationPct}%
Open issues: ${context.openIssues}
Completed this week: ${context.completedThisWeek}

Respond ONLY with valid JSON matching this exact shape:
{
  "summary": "<2-3 sentence overview of today's operational state>",
  "highlights": ["<positive development 1>", "<positive development 2>"],
  "risks": ["<risk or blocker 1>", "<risk or blocker 2>"],
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>"],
  "utilization_status": "<optimal|overloaded|underutilized>"
}

Rules:
- utilization_status is "optimal" for 60-85%, "overloaded" above 85%, "underutilized" below 60%
- highlights, risks and recommendations must each have 2-4 items
- Be specific and actionable; avoid generic statements
- Do not include any text outside the JSON object`
}

function buildClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required')
  }

  return new Anthropic({ apiKey })
}

export async function generateDailyInsights(
  input: DailyInsightsInput
): Promise<DailyInsightsOutput> {
  const client = buildClient()
  const prompt = buildPrompt(input)

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const textBlock = message.content.find((block) => block.type === 'text')

  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude returned no text content')
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(textBlock.text)
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${textBlock.text}`)
  }

  return DailyInsightsOutputSchema.parse(parsed)
}
