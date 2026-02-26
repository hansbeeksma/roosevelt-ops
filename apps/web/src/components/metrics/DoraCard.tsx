import type { DoraCardProps } from './types'

const STATUS_COLORS: Record<DoraCardProps['status'], string> = {
  good: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  bad: 'bg-red-50 border-red-200 text-red-800',
}

const STATUS_VALUE_COLORS: Record<DoraCardProps['status'], string> = {
  good: 'text-emerald-700',
  warning: 'text-amber-700',
  bad: 'text-red-700',
}

const STATUS_BADGE_COLORS: Record<DoraCardProps['status'], string> = {
  good: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  bad: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<DoraCardProps['status'], string> = {
  good: 'On Target',
  warning: 'Near Target',
  bad: 'Below Target',
}

const TREND_ICONS: Record<DoraCardProps['trend'], string> = {
  up: '↑',
  down: '↓',
  stable: '→',
}

const TREND_COLORS: Record<DoraCardProps['trend'], string> = {
  up: 'text-emerald-600',
  down: 'text-red-600',
  stable: 'text-slate-500',
}

export function DoraCard({
  label,
  value,
  unit,
  target,
  trend,
  status,
  description,
}: DoraCardProps) {
  const borderColor = STATUS_COLORS[status]
  const valueColor = STATUS_VALUE_COLORS[status]
  const badgeColor = STATUS_BADGE_COLORS[status]
  const trendIcon = TREND_ICONS[trend]
  const trendColor = TREND_COLORS[trend]
  const statusLabel = STATUS_LABELS[status]

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md ${borderColor}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-600 truncate">{label}</p>
          {description && <p className="mt-0.5 text-xs text-slate-400 truncate">{description}</p>}
        </div>
        <span
          className={`ml-3 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${badgeColor}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`text-3xl font-bold tabular-nums ${valueColor}`}>
          {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}
        </span>
        <span className="text-sm text-slate-500">{unit}</span>
        <span className={`ml-auto text-lg font-semibold ${trendColor}`}>{trendIcon}</span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Target:{' '}
          <span className="font-medium text-slate-600">
            {target} {unit}
          </span>
        </span>
      </div>
    </div>
  )
}
