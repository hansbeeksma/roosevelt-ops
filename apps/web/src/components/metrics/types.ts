export interface DoraCardProps {
  label: string
  value: number
  unit: string
  target: number
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'bad'
  /** Optional subtitle shown below the label */
  description?: string
}

export interface SpaceCardProps {
  /** Single letter dimension identifier: S, P, A, C, E */
  dimension: string
  /** Full dimension name */
  label: string
  /** Score on a 0–10 scale */
  score: number
  trend: 'up' | 'down' | 'stable'
  /** Optional subtitle */
  description?: string
}

export interface MetricsTrendPoint {
  date: string
  value: number
}

export interface MetricsTrendProps {
  data: MetricsTrendPoint[]
  label: string
  unit?: string
  color?: string
}

export interface MetricsSummaryResponse {
  dora: {
    deploymentFrequency: number
    leadTimeForChanges: number
    meanTimeToRecovery: number
    changeFailureRate: number
  }
  space: {
    satisfaction: number
    performance: number
    activity: number
    communication: number
    efficiency: number
  }
  period: string
  generatedAt: string
}
