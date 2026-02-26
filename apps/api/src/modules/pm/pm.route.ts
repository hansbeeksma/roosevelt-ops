import type { FastifyPluginAsync } from 'fastify'

interface ProjectRow {
  id: string
  name: string
  status: string
  client_id: string | null
  created_at: string
}

interface MilestoneRow {
  id: string
  project_id: string
  name: string
  due_date: string | null
  completed: boolean
}

export const pmRoute: FastifyPluginAsync = async (fastify) => {
  // GET /api/pm/projects
  fastify.get('/projects', async (request, reply) => {
    const { orgId } = request.user

    const { data, error } = await fastify.supabase
      .from('projects')
      .select('id, name, status, client_id, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return reply.status(500).send({
        status: 'error',
        message: `Failed to fetch projects: ${error.message}`,
      })
    }

    const projects: ProjectRow[] = data ?? []
    return reply.send({ status: 'ok', data: projects })
  })

  // GET /api/pm/projects/:id/milestones
  fastify.get<{ Params: { id: string } }>('/projects/:id/milestones', async (request, reply) => {
    const { orgId } = request.user
    const { id } = request.params

    // Verify project belongs to user's organization
    const { data: project, error: projectError } = await fastify.supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single()

    if (projectError || !project) {
      return reply.status(404).send({
        status: 'error',
        message: 'Project not found',
      })
    }

    const { data, error } = await fastify.supabase
      .from('milestones')
      .select('id, project_id, name, due_date, completed')
      .eq('project_id', id)
      .order('due_date', { ascending: true })

    if (error) {
      return reply.status(500).send({
        status: 'error',
        message: `Failed to fetch milestones: ${error.message}`,
      })
    }

    const milestones: MilestoneRow[] = data ?? []
    return reply.send({ status: 'ok', data: milestones })
  })

  // GET /api/pm/summary — project status overview
  fastify.get('/summary', async (request, reply) => {
    const { orgId } = request.user

    const { data, error } = await fastify.supabase
      .from('projects')
      .select('id, name, status')
      .eq('organization_id', orgId)

    if (error) {
      return reply.status(500).send({
        status: 'error',
        message: `Failed to fetch project summary: ${error.message}`,
      })
    }

    const projects = (data ?? []) as Array<{ id: string; name: string; status: string }>
    const byStatus = projects.reduce((acc: Record<string, number>, project) => {
      const status = project.status ?? 'unknown'
      return { ...acc, [status]: (acc[status] ?? 0) + 1 }
    }, {})

    return reply.send({
      status: 'ok',
      data: {
        totalProjects: projects.length,
        byStatus,
      },
    })
  })
}
