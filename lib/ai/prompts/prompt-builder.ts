import type Anthropic from '@anthropic-ai/sdk'

interface FewShotExample {
  input: string
  output: string
}

interface PromptContext {
  systemPrompt: string
  userMessage: string
  examples?: FewShotExample[]
}

interface OrganizationContext {
  name: string
  projectCount: number
  teamSize: number
}

export function buildPrompt(ctx: PromptContext): Anthropic.MessageCreateParams {
  const messages: Anthropic.MessageCreateParams['messages'] = []

  if (ctx.examples && ctx.examples.length > 0) {
    for (const example of ctx.examples) {
      messages.push({ role: 'user', content: example.input })
      messages.push({ role: 'assistant', content: example.output })
    }
  }

  messages.push({ role: 'user', content: ctx.userMessage })

  return {
    model: '',
    max_tokens: 1024,
    system: ctx.systemPrompt,
    messages,
  }
}

export function withOrganizationContext(prompt: string, org: OrganizationContext): string {
  return `Organization: ${org.name}
Active projects: ${org.projectCount}
Team size: ${org.teamSize} members

${prompt}`
}
