'use client'

import { useEffect, useState } from 'react'
import { TeamMember, TeamStats } from '@/types/team'

interface UseTeamReturn {
  members: TeamMember[]
  stats: TeamStats | null
  loading: boolean
  error: Error | null
}

const MOCK_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@roosevelt.com',
    role: 'owner',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    currentProjects: ['Dashboard Redesign', 'Analytics Platform'],
    hoursPerWeek: 40,
    utilization: 0.85,
  },
  {
    id: '2',
    name: 'Marcus Chen',
    email: 'marcus.chen@roosevelt.com',
    role: 'developer',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    currentProjects: ['API Development', 'Database Optimization'],
    hoursPerWeek: 40,
    utilization: 0.9,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@roosevelt.com',
    role: 'designer',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    currentProjects: ['Design System', 'Mobile App UI'],
    hoursPerWeek: 40,
    utilization: 0.75,
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james.wilson@roosevelt.com',
    role: 'pm',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    currentProjects: ['Q1 Roadmap', 'Stakeholder Communication'],
    hoursPerWeek: 40,
    utilization: 0.65,
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@roosevelt.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-74ab5a4d4a30?w=400&h=400&fit=crop',
    currentProjects: ['Infrastructure', 'Team Management'],
    hoursPerWeek: 40,
    utilization: 0.7,
  },
  {
    id: '6',
    name: 'Alex Patel',
    email: 'alex.patel@roosevelt.com',
    role: 'account-manager',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    currentProjects: ['Client Relations', 'Contract Negotiations'],
    hoursPerWeek: 40,
    utilization: 0.55,
  },
  {
    id: '7',
    name: 'Sofia Martinez',
    email: 'sofia.martinez@roosevelt.com',
    role: 'freelancer',
    avatarUrl: 'https://images.unsplash.com/photo-1516228714891-0f64fcf4f3e6?w=400&h=400&fit=crop',
    currentProjects: ['Content Creation'],
    hoursPerWeek: 20,
    utilization: 0.45,
  },
  {
    id: '8',
    name: 'David Brown',
    email: 'david.brown@example.com',
    role: 'client',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    currentProjects: ['Brand Strategy'],
    hoursPerWeek: 10,
    utilization: 0.3,
  },
]

export function useTeam(): UseTeamReturn {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [stats, setStats] = useState<TeamStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/pm/team')

        if (!response.ok) {
          throw new Error(`Failed to fetch team data: ${response.statusText}`)
        }

        const data = await response.json()

        setMembers(data.members || MOCK_MEMBERS)

        const avgUtilization =
          data.members && data.members.length > 0
            ? data.members.reduce((sum: number, m: TeamMember) => sum + m.utilization, 0) /
              data.members.length
            : 0

        setStats({
          totalMembers: data.members?.length || MOCK_MEMBERS.length,
          averageUtilization: avgUtilization,
        })
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred')
        setError(error)

        setMembers(MOCK_MEMBERS)

        const avgUtilization =
          MOCK_MEMBERS.reduce((sum) => sum + MOCK_MEMBERS[0].utilization, 0) / MOCK_MEMBERS.length

        setStats({
          totalMembers: MOCK_MEMBERS.length,
          averageUtilization: avgUtilization,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [])

  return {
    members,
    stats,
    loading,
    error,
  }
}
