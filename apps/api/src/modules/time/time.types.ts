export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export type TimeEntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface TimeEntry {
  id: string
  userId: string
  projectId?: string
  description: string
  date: string
  durationMinutes: number
  billable: boolean
  status: TimeEntryStatus
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTimeEntryDto {
  projectId?: string
  description: string
  date: string
  durationMinutes: number
  billable?: boolean
}

export interface TimeEntrySummary {
  totalMinutes: number
  billableMinutes: number
  entriesCount: number
  byProject: Array<{
    projectId: string
    projectName: string
    totalMinutes: number
  }>
}
