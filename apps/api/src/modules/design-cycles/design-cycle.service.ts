import { createClient } from '@supabase/supabase-js'

type Phase = 'discover' | 'define' | 'develop' | 'deliver' | 'completed'

const PHASE_ORDER: Phase[] = ['discover', 'define', 'develop', 'deliver', 'completed']

const VALID_TRANSITIONS: Record<Phase, Phase[]> = {
  discover: ['define'],
  define: ['develop', 'discover'], // Kan terug naar discover
  develop: ['deliver', 'define'], // Kan terug bij herwerk
  deliver: ['completed', 'develop'],
  completed: [],
}

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export class DesignCycleService {
  async createCycle(projectId: string, organizationId: string, name: string) {
    const { data, error } = await supabase
      .from('design_cycles')
      .insert({
        project_id: projectId,
        organization_id: organizationId,
        name,
        current_phase: 'discover',
      })
      .select()
      .single()
    if (error) throw new Error(`Cycle aanmaken mislukt: ${error.message}`)
    return data
  }

  async transition(cycleId: string, toPhase: Phase, transitionedBy?: string, notes?: string) {
    const { data: cycle, error: fetchError } = await supabase
      .from('design_cycles')
      .select('*')
      .eq('id', cycleId)
      .single()

    if (fetchError || !cycle) throw new Error('Cycle niet gevonden')

    const currentPhase = cycle.current_phase as Phase
    const allowedNext = VALID_TRANSITIONS[currentPhase] ?? []

    if (!allowedNext.includes(toPhase)) {
      throw new Error(
        `Ongeldige transitie: ${currentPhase} → ${toPhase}. ` +
          `Toegestaan: ${allowedNext.join(', ') || 'geen'}`
      )
    }

    const { error: transitionError } = await supabase
      .from('design_cycle_transitions')
      .insert({
        cycle_id: cycleId,
        from_phase: currentPhase,
        to_phase: toPhase,
        transitioned_by: transitionedBy,
        notes,
      })

    if (transitionError) throw new Error(`Transitie loggen mislukt: ${transitionError.message}`)

    const { data: updated, error: updateError } = await supabase
      .from('design_cycles')
      .update({ current_phase: toPhase, phase_started_at: new Date(), updated_at: new Date() })
      .eq('id', cycleId)
      .select()
      .single()

    if (updateError) throw new Error(`Cycle updaten mislukt: ${updateError.message}`)
    return updated
  }

  async getCycleHistory(cycleId: string) {
    const { data } = await supabase
      .from('design_cycle_transitions')
      .select('*')
      .eq('cycle_id', cycleId)
      .order('transitioned_at', { ascending: true })
    return data ?? []
  }

  getValidNextPhases(currentPhase: Phase): Phase[] {
    return VALID_TRANSITIONS[currentPhase] ?? []
  }

  getPhaseProgress(currentPhase: Phase): number {
    const idx = PHASE_ORDER.indexOf(currentPhase)
    return idx >= 0 ? Math.round((idx / (PHASE_ORDER.length - 1)) * 100) : 0
  }
}
