'use client'

import { useState } from 'react'
import { TeamMember, TeamRole } from '@/types/team'
import { TeamMemberCard } from './TeamMemberCard'

const ROLES: TeamRole[] = [
  'owner',
  'admin',
  'pm',
  'designer',
  'developer',
  'account-manager',
  'freelancer',
  'client',
]

interface TeamGridProps {
  members: TeamMember[]
}

export function TeamGrid({ members }: TeamGridProps) {
  const [selectedRoles, setSelectedRoles] = useState<Set<TeamRole>>(new Set(ROLES))

  const toggleRole = (role: TeamRole) => {
    const newSelected = new Set(selectedRoles)
    if (newSelected.has(role)) {
      newSelected.delete(role)
    } else {
      newSelected.add(role)
    }
    setSelectedRoles(newSelected)
  }

  const filteredMembers = members.filter((member) => selectedRoles.has(member.role))

  const allRolesSelected = selectedRoles.size === ROLES.length

  return (
    <div className="space-y-6">
      {/* Filter pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Filter by role</h3>
          {!allRolesSelected && (
            <button
              onClick={() => setSelectedRoles(new Set(ROLES))}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Show all
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => toggleRole(role)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                selectedRoles.has(role)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {role.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Member grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => <TeamMemberCard key={member.id} member={member} />)
        ) : (
          <div className="col-span-full flex items-center justify-center rounded-lg bg-gray-50 py-12">
            <p className="text-sm text-gray-600">No team members found for the selected roles.</p>
          </div>
        )}
      </div>

      {/* Results count */}
      {filteredMembers.length > 0 && (
        <p className="text-xs text-gray-600">
          Showing {filteredMembers.length} of {members.length} team member
          {members.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
