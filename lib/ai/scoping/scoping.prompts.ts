import type { ScopingInput } from './scoping.types'

export const SCOPING_SYSTEM_PROMPT = `You are an experienced project scoping specialist at a full-service digital agency.

The agency has the following disciplines:
- Design (UX/UI, visual design, prototyping)
- Frontend (React/Next.js, mobile-first implementation)
- Backend (API development, database design, integrations)
- DevOps (infrastructure, CI/CD, monitoring, security)
- PM (project management, client communication, QA coordination)

Your task is to analyze a project brief and produce a detailed, realistic scope estimate.

Guidelines:
- Provide estimates as ranges (min/max) to reflect uncertainty
- Base confidence scores on how much detail is in the brief (0.0 = no detail, 1.0 = fully specified)
- Identify concrete risks with actionable mitigations
- Recommend team composition as FTE fractions (e.g. 0.5 = half-time)
- Timeline should account for review cycles, revisions, and handoff time
- Be conservative: most projects run over estimate, not under
- Assumptions should surface what you're inferring from the brief

Respond ONLY with valid JSON matching the requested schema. Do not include markdown code fences or any prose outside the JSON.`

export function buildScopingUserPrompt(input: ScopingInput): string {
  const lines: string[] = [
    `PROJECT TYPE: ${input.projectType}`,
    '',
    `PROJECT BRIEF:`,
    input.projectBrief,
  ]

  if (input.budgetIndication !== undefined) {
    lines.push('', `BUDGET INDICATION: €${input.budgetIndication.toLocaleString('nl-NL')}`)
  }

  if (input.deadlineDate) {
    lines.push('', `DESIRED DEADLINE: ${input.deadlineDate}`)
  }

  lines.push(
    '',
    'Produce a JSON object with this exact structure:',
    '{',
    '  "hoursPerDiscipline": [',
    '    { "discipline": "Design", "minHours": number, "maxHours": number, "confidence": 0.0-1.0 },',
    '    { "discipline": "Frontend", "minHours": number, "maxHours": number, "confidence": 0.0-1.0 },',
    '    { "discipline": "Backend", "minHours": number, "maxHours": number, "confidence": 0.0-1.0 },',
    '    { "discipline": "DevOps", "minHours": number, "maxHours": number, "confidence": 0.0-1.0 },',
    '    { "discipline": "PM", "minHours": number, "maxHours": number, "confidence": 0.0-1.0 }',
    '  ],',
    '  "totalMinHours": number,',
    '  "totalMaxHours": number,',
    '  "recommendedTeam": [{ "role": string, "fte": number }],',
    '  "risks": [{ "risk": string, "severity": "low"|"medium"|"high", "mitigation": string }],',
    '  "timelineWeeks": { "min": number, "max": number },',
    '  "confidenceScore": 0.0-1.0,',
    '  "assumptions": [string]',
    '}'
  )

  return lines.join('\n')
}
