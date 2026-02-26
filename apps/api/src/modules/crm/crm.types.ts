export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface Contact {
  id: string
  organizationId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  role?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Opportunity {
  id: string
  organizationId: string
  title: string
  value?: number
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability?: number
  contactId?: string
  expectedCloseDate?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateContactDto {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  role?: string
  status?: 'active' | 'inactive'
}

export interface CreateOpportunityDto {
  title: string
  value?: number
  stage?: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability?: number
  contactId?: string
  expectedCloseDate?: string
  description?: string
}
