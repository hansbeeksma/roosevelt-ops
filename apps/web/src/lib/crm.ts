import { createClient } from '../../../../lib/supabase/server'

export interface CRMSummary {
  total_contacts: number
  total_companies: number
  open_opportunities: number
  won_ytd: number
}

export interface ActiveOpportunity {
  id: string
  organization_id: string
  opportunity_name: string
  stage: 'LEAD' | 'MEETING' | 'PROPOSAL' | 'NEGOTIATION'
  value: number | null
  currency: string
  close_date: string | null
  created_at: string
  updated_at: string
  company_id: string | null
  company_name: string | null
  company_domain: string | null
}

export interface ClientProject {
  opportunity_id: string
  organization_id: string
  project_name: string
  contract_value: number | null
  currency: string
  won_date: string | null
  created_at: string
  company_id: string | null
  company_name: string | null
  company_domain: string | null
}

export async function getCRMSummary(organizationId: string): Promise<CRMSummary> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_crm_summary', { org_id: organizationId })
  if (error) throw new Error(error.message)
  return data as CRMSummary
}

export async function getActiveOpportunities(organizationId: string): Promise<ActiveOpportunity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('v_active_opportunities')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as ActiveOpportunity[]
}

export async function getClientProjects(organizationId: string): Promise<ClientProject[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('v_client_projects')
    .select('*')
    .eq('organization_id', organizationId)
    .order('won_date', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as ClientProject[]
}
