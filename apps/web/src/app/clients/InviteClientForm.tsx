'use client'

import { useState } from 'react'

interface InviteClientFormProps {
  projectOptions: { id: string; name: string }[]
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function InviteClientForm({ projectOptions }: InviteClientFormProps) {
  const [email, setEmail] = useState('')
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function toggleProject(id: string) {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || selectedProjectIds.length === 0) return

    setState('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/portal-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, projectIds: selectedProjectIds }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Uitnodiging verzenden mislukt')
      }

      setState('success')
      setEmail('')
      setSelectedProjectIds([])
    } catch (err) {
      setState('error')
      setErrorMessage(err instanceof Error ? err.message : 'Onbekende fout')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="client-email" className="block text-sm font-medium mb-1">
          E-mailadres klant
        </label>
        <input
          id="client-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="klant@bedrijf.nl"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <p className="block text-sm font-medium mb-2">Projecttoegang</p>
        <div className="space-y-2">
          {projectOptions.map((project) => (
            <label key={project.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProjectIds.includes(project.id)}
                onChange={() => toggleProject(project.id)}
                className="rounded"
              />
              {project.name}
            </label>
          ))}
        </div>
      </div>

      {state === 'success' && (
        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          Uitnodiging verzonden. De klant ontvangt een magic link via e-mail (geldig 24 uur).
        </p>
      )}

      {state === 'error' && (
        <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={state === 'loading' || !email || selectedProjectIds.length === 0}
        className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {state === 'loading' ? 'Verzenden...' : 'Uitnodiging verzenden'}
      </button>
    </form>
  )
}
