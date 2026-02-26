import { NextRequest, NextResponse } from 'next/server'
import { ScopingInputSchema } from '@/lib/ai/scoping/scoping.types'
import { ScopingService } from '@/lib/ai/scoping/scoping.service'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Auth check via Supabase session (Clerk not installed, Supabase auth is the project standard)
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ScopingInputSchema.safeParse(body)

  if (!parsed.success) {
    const fieldErrors = parsed.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
    return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 })
  }

  try {
    const service = new ScopingService()
    const result = await service.analyzeProjectBrief(parsed.data)
    return NextResponse.json({ data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Scoping analysis failed', details: message },
      { status: 500 }
    )
  }
}
