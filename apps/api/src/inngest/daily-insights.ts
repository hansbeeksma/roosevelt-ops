import { Inngest } from 'inngest'
import { createClient } from '@supabase/supabase-js'
import { generateDailyInsights } from '../../../../lib/ai/insights/insights.service.js'
import type { DailyInsightsInput } from '../../../../lib/ai/insights/insights.types.js'

const inngest = new Inngest({ id: 'roosevelt-ops' })

function buildSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  return createClient(url, key)
}

// Runs daily at 07:00 Amsterdam time (UTC+1/UTC+2 → cron in UTC = 06:00)
export const dailyInsightsFn = inngest.createFunction(
  { id: 'daily-insights', name: 'Generate Daily Insights' },
  { cron: '0 6 * * *' },
  async ({ step }) => {
    const supabase = buildSupabaseClient()

    const organizations = await step.run('fetch-active-organizations', async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('status', 'active')

      if (error) {
        throw new Error(`Failed to fetch organizations: ${error.message}`)
      }

      return data ?? []
    })

    const today = new Date().toISOString().split('T')[0]

    const results = await Promise.allSettled(
      organizations.map((org) =>
        step.run(`generate-insights-${org.id}`, async () => {
          const { data: projects } = await supabase
            .from('pm_projects')
            .select('name, status')
            .eq('organization_id', org.id)
            .in('status', ['planning', 'in_progress'])

          const { data: teamMembers } = await supabase
            .from('team_members')
            .select('utilization')
            .eq('organization_id', org.id)

          const { count: openIssues } = await supabase
            .from('pm_issues')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', org.id)
            .neq('status', 'completed')

          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          const { count: completedThisWeek } = await supabase
            .from('pm_issues')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', org.id)
            .eq('status', 'completed')
            .gte('updated_at', weekAgo)

          const avgUtilization =
            teamMembers && teamMembers.length > 0
              ? teamMembers.reduce((sum, m) => sum + (m.utilization ?? 0), 0) / teamMembers.length
              : 0

          const insightsInput: DailyInsightsInput = {
            organizationId: org.id,
            date: new Date().toISOString(),
            context: {
              activeProjects: (projects ?? []).map((p) => ({
                name: p.name,
                phase: p.status,
              })),
              teamUtilization: Math.min(1, Math.max(0, avgUtilization)),
              openIssues: openIssues ?? 0,
              completedThisWeek: completedThisWeek ?? 0,
            },
          }

          const insights = await generateDailyInsights(insightsInput)

          const { error: upsertError } = await supabase.from('daily_insights').upsert(
            {
              organization_id: org.id,
              date: today,
              summary: insights.summary,
              highlights: insights.highlights,
              risks: insights.risks,
              recommendations: insights.recommendations,
              utilization_status: insights.utilization_status,
            },
            { onConflict: 'organization_id,date' }
          )

          if (upsertError) {
            throw new Error(`Failed to save insights for org ${org.id}: ${upsertError.message}`)
          }

          return { organizationId: org.id, status: 'success' }
        })
      )
    )

    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return {
      date: today,
      organizationsProcessed: organizations.length,
      succeeded,
      failed,
    }
  }
)
