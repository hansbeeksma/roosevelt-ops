import type { SpaceCardProps } from './types'

const SCORE_THRESHOLDS = {
  good: 7,
  warning: 4,
} as const

function deriveStatus(score: number): 'good' | 'warning' | 'bad' {
  if (score >= SCORE_THRESHOLDS.good) return 'good'
  if (score >= SCORE_THRESHOLDS.warning) return 'warning'
  return 'bad'
}

const STATUS_COLORS: Record<'good' | 'warning' | 'bad', string> = {
  good: 'bg-emerald-50 border-emerald-200',
  warning: 'bg-amber-50 border-amber-200',
  bad: 'bg-red-50 border-red-200',
}

const SCORE_FILL_COLORS: Record<'good' | 'warning' | 'bad', string> = {
  good: 'bg-emerald-400',
  warning: 'bg-amber-400',
  bad: 'bg-red-400',
}

const SCORE_TEXT_COLORS: Record<'good' | 'warning' | 'bad', string> = {
  good: 'text-emerald-700',
  warning: 'text-amber-700',
  bad: 'text-red-700',
}

const TREND_ICONS: Record<SpaceCardProps['trend'], string> = {
  up: '↑',
  down: '↓',
  stable: '→',
}

const TREND_COLORS: Record<SpaceCardProps['trend'], string> = {
  up: 'text-emerald-600',
  down: 'text-red-600',
  stable: 'text-slate-500',
}

export function SpaceCard({ dimension, label, score, trend, description }: SpaceCardProps) {
  const status = deriveStatus(score)
  const fillPct = (score / 10) * 100
  const borderColor = STATUS_COLORS[status]
  const fillColor = SCORE_FILL_COLORS[status]
  const textColor = SCORE_TEXT_COLORS[status]
  const trendIcon = TREND_ICONS[trend]
  const trendColor = TREND_COLORS[trend]

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md ${borderColor}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-700">{dimension}</span>
            <span className="text-sm text-slate-400">·</span>
            <span className="text-sm font-medium text-slate-600">{label}</span>
          </div>
          {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
        </div>
        <div className="flex items-baseline gap-1 ml-3">
          <span className={`text-2xl font-bold tabular-nums ${textColor}`}>{score.toFixed(1)}</span>
          <span className="text-xs text-slate-400">/10</span>
          <span className={`ml-1.5 text-base font-semibold ${trendColor}`}>{trendIcon}</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400">Score</span>
          <span className="text-xs font-medium text-slate-500">{fillPct.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${fillColor}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
