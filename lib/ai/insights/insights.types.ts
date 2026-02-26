import { z } from 'zod'

export const DailyInsightsInputSchema = z.object({
  organizationId: z.string().uuid(),
  date: z.string().datetime(),
  context: z.object({
    activeProjects: z.array(z.object({ name: z.string(), phase: z.string() })),
    teamUtilization: z.number().min(0).max(1),
    openIssues: z.number(),
    completedThisWeek: z.number(),
  }),
})

export type DailyInsightsInput = z.infer<typeof DailyInsightsInputSchema>

export const DailyInsightsOutputSchema = z.object({
  summary: z.string(),
  highlights: z.array(z.string()),
  risks: z.array(z.string()),
  recommendations: z.array(z.string()),
  utilization_status: z.enum(['optimal', 'overloaded', 'underutilized']),
})

export type DailyInsightsOutput = z.infer<typeof DailyInsightsOutputSchema>
