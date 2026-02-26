import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import type { ApiResponse, TimeEntry, CreateTimeEntryDto } from './time.types.js'

const createTimeEntrySchema = z.object({
  projectId: z.string().uuid().optional(),
  description: z.string().min(1).max(500),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  durationMinutes: z.number().int().positive().max(1440, 'Duration cannot exceed 24 hours'),
  billable: z.boolean().optional().default(true),
})

export const timeRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/time/entries — List time entries for the authenticated user
  fastify.get<{
    Querystring: { date?: string; projectId?: string; limit?: number }
    Reply: ApiResponse<TimeEntry[]>
  }>('/entries', async (request, reply) => {
    try {
      await request.jwtVerify()

      const {
        date,
        projectId,
        limit = 50,
      } = request.query as {
        date?: string
        projectId?: string
        limit?: number
      }

      let query = fastify.supabase
        .from('time_entries')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      if (date) {
        query = query.eq('date', date)
      }

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query

      if (error) {
        return reply.status(500).send({ success: false, error: 'Failed to fetch time entries' })
      }

      return reply.send({ success: true, data: data ?? [] })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unauthorized'
      return reply.status(401).send({ success: false, error: message })
    }
  })

  // POST /api/time/entries — Create a time entry
  fastify.post<{ Body: CreateTimeEntryDto; Reply: ApiResponse<TimeEntry> }>(
    '/entries',
    async (request, reply) => {
      try {
        await request.jwtVerify()

        const body = createTimeEntrySchema.parse(request.body)

        const { data, error } = await fastify.supabase
          .from('time_entries')
          .insert({
            project_id: body.projectId ?? null,
            description: body.description,
            date: body.date,
            duration_minutes: body.durationMinutes,
            billable: body.billable,
            status: 'draft',
          })
          .select()
          .single()

        if (error) {
          return reply.status(500).send({ success: false, error: 'Failed to create time entry' })
        }

        return reply.status(201).send({ success: true, data })
      } catch (err) {
        if (err instanceof z.ZodError) {
          return reply
            .status(400)
            .send({ success: false, error: err.errors.map((e) => e.message).join(', ') })
        }
        const message = err instanceof Error ? err.message : 'Unauthorized'
        return reply.status(401).send({ success: false, error: message })
      }
    }
  )
}
