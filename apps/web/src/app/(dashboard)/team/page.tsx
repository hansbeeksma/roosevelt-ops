'use client'

import { Card } from '@/components/ui/card'
import { TeamGrid } from '@/components/team/TeamGrid'
import { useTeam } from '@/hooks/useTeam'

export default function TeamPage() {
  const { members, stats, loading } = useTeam()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Overview</h1>
        <p className="mt-2 text-gray-600">
          Manage team resources, track utilization, and monitor workload distribution
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Total Members</p>
              {loading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
              )}
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Average Utilization</p>
              {loading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(stats.averageUtilization * 100)}%
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Team Grid with Filters */}
      {loading ? (
        <div className="flex items-center justify-center rounded-lg bg-gray-50 py-12">
          <div className="space-y-4">
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <TeamGrid members={members} />
      )}
    </div>
  )
}
