import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import type {
  ApiResponse,
  Contact,
  Opportunity,
  CreateContactDto,
  CreateOpportunityDto,
} from './crm.types.js'

const createContactSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional().default('active'),
})

const createOpportunitySchema = z.object({
  title: z.string().min(1).max(200),
  value: z.number().positive().optional(),
  stage: z
    .enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])
    .optional()
    .default('lead'),
  probability: z.number().min(0).max(100).optional(),
  contactId: z.string().uuid().optional(),
  expectedCloseDate: z.string().datetime().optional(),
  description: z.string().max(1000).optional(),
})

export const crmRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/crm/contacts — List all contacts
  fastify.get<{ Reply: ApiResponse<Contact[]> }>('/contacts', async (request, reply) => {
    try {
      await request.jwtVerify()

      const { data, error } = await fastify.supabase
        .from('crm_contacts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return reply.status(500).send({ success: false, error: 'Failed to fetch contacts' })
      }

      return reply.send({ success: true, data: data ?? [] })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unauthorized'
      return reply.status(401).send({ success: false, error: message })
    }
  })

  // POST /api/crm/contacts — Create a contact
  fastify.post<{ Body: CreateContactDto; Reply: ApiResponse<Contact> }>(
    '/contacts',
    async (request, reply) => {
      try {
        await request.jwtVerify()

        const body = createContactSchema.parse(request.body)

        const { data, error } = await fastify.supabase
          .from('crm_contacts')
          .insert({
            first_name: body.firstName,
            last_name: body.lastName,
            email: body.email,
            phone: body.phone ?? null,
            company: body.company ?? null,
            role: body.role ?? null,
            status: body.status,
          })
          .select()
          .single()

        if (error) {
          return reply.status(500).send({ success: false, error: 'Failed to create contact' })
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

  // GET /api/crm/opportunities — List all opportunities
  fastify.get<{ Reply: ApiResponse<Opportunity[]> }>('/opportunities', async (request, reply) => {
    try {
      await request.jwtVerify()

      const { data, error } = await fastify.supabase
        .from('crm_opportunities')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return reply.status(500).send({ success: false, error: 'Failed to fetch opportunities' })
      }

      return reply.send({ success: true, data: data ?? [] })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unauthorized'
      return reply.status(401).send({ success: false, error: message })
    }
  })

  // POST /api/crm/opportunities — Create an opportunity
  fastify.post<{ Body: CreateOpportunityDto; Reply: ApiResponse<Opportunity> }>(
    '/opportunities',
    async (request, reply) => {
      try {
        await request.jwtVerify()

        const body = createOpportunitySchema.parse(request.body)

        const { data, error } = await fastify.supabase
          .from('crm_opportunities')
          .insert({
            title: body.title,
            value: body.value ?? null,
            stage: body.stage,
            probability: body.probability ?? null,
            contact_id: body.contactId ?? null,
            expected_close_date: body.expectedCloseDate ?? null,
            description: body.description ?? null,
          })
          .select()
          .single()

        if (error) {
          return reply.status(500).send({ success: false, error: 'Failed to create opportunity' })
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
