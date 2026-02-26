export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TeamRole =
  | 'owner'
  | 'admin'
  | 'pm'
  | 'designer'
  | 'developer'
  | 'account-manager'
  | 'freelancer'
  | 'client'

export interface Project {
  id: string
  organizationId: string
  name: string
  description?: string
  status: ProjectStatus
  priority: ProjectPriority
  startDate?: string
  endDate?: string
  budget?: number
  owner?: string
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  avatarUrl?: string
  currentProjects: string[]
  hoursPerWeek: number
  utilization: number
}

export interface CreateProjectDto {
  name: string
  description?: string
  status?: ProjectStatus
  priority?: ProjectPriority
  startDate?: string
  endDate?: string
  budget?: number
  owner?: string
}
