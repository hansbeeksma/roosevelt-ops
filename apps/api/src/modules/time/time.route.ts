import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

interface TimeEntryRow {
  id: string
  user_id: string
  project_id: string | null
  description: string | null
  duration_minutes: number
  started_at: string
  ended_at: string | null
  billable: boolean
  created_at: string
}

const createTimeEntrySchema = z.object({
  project_id: z.string().optional(),
  task_id: z.string().optional(),
  description: z.string().max(500).optional(),
  duration_minutes: z.number().int().min(0).max(1440),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().optional(),
  billable: z.boolean().default(true),
})

const timeEntryQuerySchema = z.object({
  project_id: z.string().optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
})

export const timeRoute: FastifyPluginAsync = async (fastify) => {
  // GET /api/time/entries
  fastify.get('/entries', async (request, reply) => {
    const { orgId } = request.user

    const parsed = timeEntryQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send({
        status: 'error',
        message: `Invalid query params: ${parsed.error.message}`,
      })
    }

    const { project_id, from, to, limit } = parsed.data

    let query = fastify.supabase
      .from('time_entries')
      .select(
        'id, user_id, project_id, description, duration_minutes, started_at, ended_at, billable, created_at'
      )
      .eq('organization_id', orgId)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (project_id) {
      query = query.eq('project_id', project_id)
    }
    if (from) {
      query = query.gte('started_at', `${from}T00:00:00Z`)
    }
    if (to) {
      query = query.lte('started_at', `${to}T23:59:59Z`)
    }

    const { data, error } = await query

    if (error) {
      return reply.status(500).send({
        status: 'error',
        message: `Failed to fetch time entries: ${error.message}`,
      })
    }

    const entries: TimeEntryRow[] = data ?? []
    return reply.send({ status: 'ok', data: entries })
  })

  // POST /api/time/entries
  fastify.post('/entries', async (request, reply) => {
    const { userId, orgId } = request.user

    const parsed = createTimeEntrySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        status: 'error',
        message: `Validation failed: ${parsed.error.message}`,
      })
    }

    const { data, error } = await fastify.supabase
      .from('time_entries')
      .insert({
        ...parsed.data,
        user_id: userId,
        organization_id: orgId,
      } as Record<string, unknown>)
      .select()
      .single()

    if (error) {
      return reply.status(500).send({
        status: 'error',
        message: `Failed to create time entry: ${error.message}`,
      })
    }

    return reply.status(201).send({ status: 'ok', data })
  })

  // GET /api/time/summary — hours per project for a date range
  fastify.get('/summary', async (request, reply) => {
    const { orgId } = request.user

    const parsed = timeEntryQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send({
        status: 'error',
        message: `Invalid query params: ${parsed.error.message}`,
      })
    }

    const { from, to } = parsed.data

    let query = fastify.supabase
      .from('time_entries')
      .select('project_id, duration_minutes')
      .eq('organization_id', orgId)

    if (from) {
      query = query.gte('started_at', `${from}T00:00:00Z`)
    }
    if (to) {
      query = query.lte('started_at', `${to}T23:59:59Z`)
    }

    const { data, error } = await query

    if (error) {
      return reply.status(500).send({
        status: 'error',
        message: `Failed to fetch time summary: ${error.message}`,
      })
    }

    const entries = (data ?? []) as Array<{
      project_id: string | null
      duration_minutes: number
    }>
    const byProject = entries.reduce(
      (acc: Record<string, { totalMinutes: number; entryCount: number }>, entry) => {
        const pid = entry.project_id ?? 'unassigned'
        const existing = acc[pid] ?? { totalMinutes: 0, entryCount: 0 }
        return {
          ...acc,
          [pid]: {
            totalMinutes: existing.totalMinutes + (entry.duration_minutes ?? 0),
            entryCount: existing.entryCount + 1,
          },
        }
      },
      {}
    )

    const totalMinutes = Object.values(byProject).reduce(
      (sum: number, p) => sum + p.totalMinutes,
      0
    )

    return reply.send({
      status: 'ok',
      data: {
        totalMinutes,
        totalHours: Math.round((totalMinutes / 60) * 100) / 100,
        byProject,
      },
    })
  })
}
