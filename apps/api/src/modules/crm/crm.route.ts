import type { FastifyPluginAsync } from 'fastify'

interface CompanyRow {
  id: string
  name: string
  domain: string | null
  created_at: string
}

interface ContactRow {
  id: string
  first_name: string
  last_name: string
  email: string
  company_id: string | null
  created_at: string
}

interface OpportunityRow {
  id: string
  name: string
  stage: string
  amount: number | null
  company_id: string | null
  created_at: string
}

export const crmRoute: FastifyPluginAsync = async (fastify) => {
  // GET /api/crm/companies
  fastify.get('/companies', async (request, reply) => {
    const { orgId } = request.user

    const { data, error } = await fastify.supabase
      .from('crm_companies')
      .select('id, name, domain, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return reply.status(500).send({
        status: 'error',
        message: `Failed to fetch companies: ${error.message}`,
      })
    }

    const companies: CompanyRow[] = data ?? []
    return reply.send({ status: 'ok', data: companies })
  })

  // GET /api/crm/contacts
  fastify.get('/contacts', async (request, reply) => {
    const { orgId } = request.user

    const { data, error } = await fastify.supabase
      .from('crm_contacts')
      .select('id, first_name, last_name, email, company_id, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return reply.status(500).send({
        status: 'error',
        message: `Failed to fetch contacts: ${error.message}`,
      })
    }

    const contacts: ContactRow[] = data ?? []
    return reply.send({ status: 'ok', data: contacts })
  })

  // GET /api/crm/opportunities
  fastify.get('/opportunities', async (request, reply) => {
    const { orgId } = request.user

    const { data, error } = await fastify.supabase
      .from('crm_opportunities')
      .select('id, name, stage, amount, company_id, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return reply.status(500).send({
        status: 'error',
        message: `Failed to fetch opportunities: ${error.message}`,
      })
    }

    const opportunities: OpportunityRow[] = data ?? []
    return reply.send({ status: 'ok', data: opportunities })
  })

  // GET /api/crm/summary — aggregated stats
  fastify.get('/summary', async (request, reply) => {
    const { orgId } = request.user

    const [companiesResult, contactsResult, opportunitiesResult] = await Promise.all([
      fastify.supabase
        .from('crm_companies')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId),
      fastify.supabase
        .from('crm_contacts')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId),
      fastify.supabase
        .from('crm_opportunities')
        .select('id, amount, stage')
        .eq('organization_id', orgId),
    ])

    if (companiesResult.error || contactsResult.error || opportunitiesResult.error) {
      return reply.status(500).send({
        status: 'error',
        message: 'Failed to fetch CRM summary',
      })
    }

    const opportunities = (opportunitiesResult.data ?? []) as Array<{
      id: string
      amount: number | null
      stage: string
    }>
    const pipeline = opportunities.reduce(
      (acc: Record<string, { count: number; totalAmount: number }>, opp) => {
        const stage = opp.stage ?? 'unknown'
        const existing = acc[stage] ?? { count: 0, totalAmount: 0 }
        return {
          ...acc,
          [stage]: {
            count: existing.count + 1,
            totalAmount: existing.totalAmount + (opp.amount ?? 0),
          },
        }
      },
      {}
    )

    return reply.send({
      status: 'ok',
      data: {
        totalCompanies: companiesResult.count ?? 0,
        totalContacts: contactsResult.count ?? 0,
        totalOpportunities: opportunities.length,
        pipeline,
      },
    })
  })
}
