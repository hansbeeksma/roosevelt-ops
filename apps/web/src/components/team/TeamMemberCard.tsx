'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TeamMember, roleColorMap } from '@/types/team'
import Image from 'next/image'

interface TeamMemberCardProps {
  member: TeamMember
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="p-4">
        {/* Header with avatar and role */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 flex-shrink-0">
              <Image
                src={member.avatarUrl}
                alt={member.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-gray-900">{member.name}</h3>
              <p className="truncate text-sm text-gray-600">{member.email}</p>
            </div>
          </div>
          <Badge className={roleColorMap[member.role]}>{member.role.replace('-', ' ')}</Badge>
        </div>

        {/* Projects section */}
        {member.currentProjects.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-700">
              Projects
            </p>
            <div className="flex flex-wrap gap-1">
              {member.currentProjects.map((project) => (
                <span
                  key={project}
                  className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
                >
                  {project}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Utilization section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Utilization</span>
            <span className="text-sm font-semibold text-gray-900">
              {Math.round(member.utilization * 100)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all ${
                member.utilization >= 0.8
                  ? 'bg-red-500'
                  : member.utilization >= 0.6
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${member.utilization * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">{member.hoursPerWeek} hours/week</p>
        </div>
      </div>
    </Card>
  )
}
