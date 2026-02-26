import { FastifyInstance } from 'fastify'
import { DesignCycleService } from '../design-cycle.service'

const service = new DesignCycleService()

export async function registerDesignCycleRoutes(app: FastifyInstance) {
  app.post('/api/design-cycles', async (req, reply) => {
    const { projectId, organizationId, name } = req.body as {
      projectId: string
      organizationId: string
      name: string
    }
    const cycle = await service.createCycle(projectId, organizationId, name)
    return reply.status(201).send(cycle)
  })

  app.post('/api/design-cycles/:id/transition', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { toPhase, transitionedBy, notes } = req.body as {
      toPhase: string
      transitionedBy?: string
      notes?: string
    }
    const updated = await service.transition(
      id,
      toPhase as Parameters<DesignCycleService['transition']>[1],
      transitionedBy,
      notes
    )
    return reply.send(updated)
  })

  app.get('/api/design-cycles/:id/history', async (req, reply) => {
    const { id } = req.params as { id: string }
    const history = await service.getCycleHistory(id)
    return reply.send(history)
  })
}
