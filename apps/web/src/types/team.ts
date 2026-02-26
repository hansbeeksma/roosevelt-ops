export type TeamRole =
  | 'owner'
  | 'admin'
  | 'pm'
  | 'designer'
  | 'developer'
  | 'account-manager'
  | 'freelancer'
  | 'client'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  avatarUrl: string
  currentProjects: string[]
  hoursPerWeek: number
  utilization: number
}

export interface TeamStats {
  totalMembers: number
  averageUtilization: number
}

export const roleColorMap: Record<TeamRole, string> = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-purple-100 text-purple-800',
  pm: 'bg-blue-100 text-blue-800',
  designer: 'bg-pink-100 text-pink-800',
  developer: 'bg-green-100 text-green-800',
  'account-manager': 'bg-orange-100 text-orange-800',
  freelancer: 'bg-gray-100 text-gray-800',
  client: 'bg-teal-100 text-teal-800',
}
