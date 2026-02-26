import { DoraCard } from '@/components/metrics/DoraCard'
import { SpaceCard } from '@/components/metrics/SpaceCard'
import type {
  DoraCardProps,
  MetricsSummaryResponse,
  SpaceCardProps,
} from '@/components/metrics/types'

// Revalidate every hour — metrics data changes infrequently
export const revalidate = 3600

async function fetchMetricsSummary(): Promise<MetricsSummaryResponse | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/metrics/summary`, {
      next: { revalidate },
    })

    if (!res.ok) {
      return null
    }

    return res.json() as Promise<MetricsSummaryResponse>
  } catch {
    return null
  }
}

function deriveDoraStatus(
  key: keyof MetricsSummaryResponse['dora'],
  value: number
): DoraCardProps['status'] {
  switch (key) {
    case 'deploymentFrequency':
      // Elite: daily+, high: weekly, medium: monthly, low: <monthly
      if (value >= 7) return 'good'
      if (value >= 1) return 'warning'
      return 'bad'
    case 'leadTimeForChanges':
      // Elite: <1h, high: <24h, medium: <1 week, low: >1 week
      if (value <= 24) return 'good'
      if (value <= 168) return 'warning'
      return 'bad'
    case 'meanTimeToRecovery':
      // Elite: <1h, high: <24h, medium: <1 week, low: >1 week
      if (value <= 24) return 'good'
      if (value <= 168) return 'warning'
      return 'bad'
    case 'changeFailureRate':
      // Elite: 0–5%, high: 5–10%, medium/low: >15%
      if (value <= 0.05) return 'good'
      if (value <= 0.15) return 'warning'
      return 'bad'
    default:
      return 'warning'
  }
}

function deriveTrend(_value: number): DoraCardProps['trend'] {
  // In a real implementation this would compare to a previous period.
  // For now we return stable as a safe default — trend arrows update when
  // historical data is available via a separate endpoint.
  return 'stable'
}

function buildDoraCards(dora: MetricsSummaryResponse['dora']): DoraCardProps[] {
  return [
    {
      label: 'Deployment Frequency',
      value: dora.deploymentFrequency,
      unit: 'deploys/wk',
      target: 1,
      trend: deriveTrend(dora.deploymentFrequency),
      status: deriveDoraStatus('deploymentFrequency', dora.deploymentFrequency),
      description: 'Successful production deploys per week',
    },
    {
      label: 'Lead Time for Changes',
      value: dora.leadTimeForChanges,
      unit: 'hrs',
      target: 24,
      trend: deriveTrend(dora.leadTimeForChanges),
      status: deriveDoraStatus('leadTimeForChanges', dora.leadTimeForChanges),
      description: 'Commit to production (avg)',
    },
    {
      label: 'Mean Time to Recovery',
      value: dora.meanTimeToRecovery,
      unit: 'hrs',
      target: 24,
      trend: deriveTrend(dora.meanTimeToRecovery),
      status: deriveDoraStatus('meanTimeToRecovery', dora.meanTimeToRecovery),
      description: 'Incident open → close (avg)',
    },
    {
      label: 'Change Failure Rate',
      value: Math.round(dora.changeFailureRate * 100),
      unit: '%',
      target: 15,
      trend: deriveTrend(dora.changeFailureRate),
      status: deriveDoraStatus('changeFailureRate', dora.changeFailureRate),
      description: 'Failed deploys / total deploys',
    },
  ]
}

function buildSpaceCards(space: MetricsSummaryResponse['space']): SpaceCardProps[] {
  return [
    {
      dimension: 'S',
      label: 'Satisfaction',
      score: space.satisfaction,
      trend: deriveTrend(space.satisfaction),
      description: 'Team health proxy via deploy success rate',
    },
    {
      dimension: 'P',
      label: 'Performance',
      score: space.performance,
      trend: deriveTrend(space.performance),
      description: 'Deployment success rate (0–10)',
    },
    {
      dimension: 'A',
      label: 'Activity',
      score: space.activity,
      trend: deriveTrend(space.activity),
      description: 'Normalised commit activity per day',
    },
    {
      dimension: 'C',
      label: 'Communication',
      score: space.communication,
      trend: deriveTrend(space.communication),
      description: 'PR review turnaround speed',
    },
    {
      dimension: 'E',
      label: 'Efficiency',
      score: space.efficiency,
      trend: deriveTrend(space.efficiency),
      description: 'Feature-to-bug ratio',
    },
  ]
}

export default async function MetricsDashboardPage() {
  const summary = await fetchMetricsSummary()

  const doraCards = summary ? buildDoraCards(summary.dora) : null

  const spaceCards = summary ? buildSpaceCards(summary.space) : null

  const generatedAt = summary
    ? new Date(summary.generatedAt).toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Engineering Metrics</h1>
        <p className="mt-1 text-sm text-slate-500">
          DORA + SPACE framework · last 30 days
          {generatedAt && <span className="ml-2 text-slate-400">· refreshed {generatedAt}</span>}
        </p>
      </div>

      {/* Error / no-data state */}
      {!summary && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm font-medium text-slate-600">Metrics unavailable</p>
          <p className="mt-1 text-xs text-slate-400">
            Ensure <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">GITHUB_TOKEN</code>,{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">GITHUB_ORG</code> and{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">GITHUB_REPO</code>{' '}
            environment variables are set.
          </p>
        </div>
      )}

      {/* DORA Section */}
      {doraCards && (
        <section aria-labelledby="dora-heading">
          <div className="mb-4 flex items-baseline gap-3">
            <h2 id="dora-heading" className="text-lg font-semibold text-slate-800">
              DORA Metrics
            </h2>
            <span className="text-xs text-slate-400">DevOps Research &amp; Assessment</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {doraCards.map((card) => (
              <DoraCard key={card.label} {...card} />
            ))}
          </div>
        </section>
      )}

      {/* SPACE Section */}
      {spaceCards && (
        <section aria-labelledby="space-heading" className="mt-10">
          <div className="mb-4 flex items-baseline gap-3">
            <h2 id="space-heading" className="text-lg font-semibold text-slate-800">
              SPACE Framework
            </h2>
            <span className="text-xs text-slate-400">
              Satisfaction · Performance · Activity · Communication · Efficiency
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {spaceCards.map((card) => (
              <SpaceCard key={card.dimension} {...card} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
