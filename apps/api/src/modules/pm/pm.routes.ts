import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import type { ApiResponse, Project, TeamMember, CreateProjectDto } from './pm.types.js'

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  status: z
    .enum(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'])
    .optional()
    .default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().positive().optional(),
  owner: z.string().optional(),
})

export const pmRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/pm/projects — List all projects
  fastify.get<{ Reply: ApiResponse<Project[]> }>('/projects', async (request, reply) => {
    try {
      await request.jwtVerify()

      const { data, error } = await fastify.supabase
        .from('pm_projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return reply.status(500).send({ success: false, error: 'Failed to fetch projects' })
      }

      return reply.send({ success: true, data: data ?? [] })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unauthorized'
      return reply.status(401).send({ success: false, error: message })
    }
  })

  // POST /api/pm/projects — Create a project
  fastify.post<{ Body: CreateProjectDto; Reply: ApiResponse<Project> }>(
    '/projects',
    async (request, reply) => {
      try {
        await request.jwtVerify()

        const body = createProjectSchema.parse(request.body)

        const { data, error } = await fastify.supabase
          .from('pm_projects')
          .insert({
            name: body.name,
            description: body.description ?? null,
            status: body.status,
            priority: body.priority,
            start_date: body.startDate ?? null,
            end_date: body.endDate ?? null,
            budget: body.budget ?? null,
            owner: body.owner ?? null,
          })
          .select()
          .single()

        if (error) {
          return reply.status(500).send({ success: false, error: 'Failed to create project' })
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

  // GET /api/pm/team — List team members
  fastify.get<{ Reply: ApiResponse<TeamMember[]> }>('/team', async (request, reply) => {
    try {
      await request.jwtVerify()

      const { data, error } = await fastify.supabase
        .from('team_members')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        return reply.status(500).send({ success: false, error: 'Failed to fetch team members' })
      }

      return reply.send({ success: true, data: data ?? [] })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unauthorized'
      return reply.status(401).send({ success: false, error: message })
    }
  })
}
