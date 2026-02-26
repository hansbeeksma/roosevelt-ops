import { NextResponse } from 'next/server'
import { calculateDoraMetrics } from '@/lib/metrics/dora'
import { calculateSpaceMetrics } from '@/lib/metrics/space'

const ORG = process.env.GITHUB_ORG ?? 'rooseveltops'
const REPO = process.env.GITHUB_REPO ?? 'main-app'
const WINDOW_DAYS = 30

export const revalidate = 3600 // re-fetch at most once per hour

export async function GET() {
  try {
    const [dora, space] = await Promise.all([
      calculateDoraMetrics(ORG, REPO, WINDOW_DAYS),
      calculateSpaceMetrics(ORG, REPO, WINDOW_DAYS),
    ])

    return NextResponse.json({
      dora,
      space,
      period: `${WINDOW_DAYS}d`,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch metrics'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
