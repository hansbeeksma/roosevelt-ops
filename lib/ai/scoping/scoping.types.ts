import { z } from 'zod'

export const ScopingInputSchema = z.object({
  projectBrief: z.string().min(50),
  projectType: z.enum(['website', 'webapp', 'mobile', 'api', 'design', 'other']),
  budgetIndication: z.number().optional(),
  deadlineDate: z.string().optional(),
})

export const HoursEstimateSchema = z.object({
  discipline: z.string(),
  minHours: z.number(),
  maxHours: z.number(),
  confidence: z.number().min(0).max(1),
})

export const ScopingOutputSchema = z.object({
  hoursPerDiscipline: z.array(HoursEstimateSchema),
  totalMinHours: z.number(),
  totalMaxHours: z.number(),
  recommendedTeam: z.array(z.object({ role: z.string(), fte: z.number() })),
  risks: z.array(
    z.object({
      risk: z.string(),
      severity: z.enum(['low', 'medium', 'high']),
      mitigation: z.string(),
    })
  ),
  timelineWeeks: z.object({ min: z.number(), max: z.number() }),
  confidenceScore: z.number().min(0).max(1),
  assumptions: z.array(z.string()),
})

export type ScopingInput = z.infer<typeof ScopingInputSchema>
export type ScopingOutput = z.infer<typeof ScopingOutputSchema>
