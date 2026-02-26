'use client'

import { useState } from 'react'
import type { ScopingInput, ScopingOutput } from '@/lib/ai/scoping/scoping.types'

type ProjectType = ScopingInput['projectType']

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  website: 'Website',
  webapp: 'Web applicatie',
  mobile: 'Mobile app',
  api: 'API / Backend',
  design: 'Design only',
  other: 'Anders',
}

const SEVERITY_COLORS: Record<'low' | 'medium' | 'high', string> = {
  low: 'bg-green-50 text-green-700 border-green-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-red-50 text-red-700 border-red-200',
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      <span className="ml-3 text-sm text-gray-500">AI analyseert project brief…</span>
    </div>
  )
}

function HoursTable({ rows }: { rows: ScopingOutput['hoursPerDiscipline'] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">Discipline</th>
            <th className="px-4 py-3 text-right">Min uren</th>
            <th className="px-4 py-3 text-right">Max uren</th>
            <th className="px-4 py-3 text-right">Zekerheid</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.discipline} className="bg-white hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{row.discipline}</td>
              <td className="px-4 py-3 text-right text-gray-700">{row.minHours}</td>
              <td className="px-4 py-3 text-right text-gray-700">{row.maxHours}</td>
              <td className="px-4 py-3 text-right">
                <span className="text-gray-600">{Math.round(row.confidence * 100)}%</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TeamTable({ team }: { team: ScopingOutput['recommendedTeam'] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">Rol</th>
            <th className="px-4 py-3 text-right">FTE</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {team.map((member) => (
            <tr key={member.role} className="bg-white hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{member.role}</td>
              <td className="px-4 py-3 text-right text-gray-700">{member.fte}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RisksList({ risks }: { risks: ScopingOutput['risks'] }) {
  return (
    <ul className="space-y-3">
      {risks.map((item, idx) => (
        <li key={idx} className={`rounded-lg border p-4 ${SEVERITY_COLORS[item.severity]}`}>
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium">{item.risk}</p>
            <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase">
              {item.severity}
            </span>
          </div>
          <p className="mt-1 text-sm opacity-80">{item.mitigation}</p>
        </li>
      ))}
    </ul>
  )
}

function ScopingResults({ result }: { result: ScopingOutput }) {
  return (
    <div className="mt-8 space-y-8">
      {/* Summary banner */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Samenvatting</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Min uren</p>
            <p className="text-2xl font-bold text-blue-900">{result.totalMinHours}</p>
          </div>
          <div>
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Max uren</p>
            <p className="text-2xl font-bold text-blue-900">{result.totalMaxHours}</p>
          </div>
          <div>
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Timeline</p>
            <p className="text-2xl font-bold text-blue-900">
              {result.timelineWeeks.min}–{result.timelineWeeks.max} wk
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Zekerheid</p>
            <p className="text-2xl font-bold text-blue-900">
              {Math.round(result.confidenceScore * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Hours per discipline */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Uren per discipline</h2>
        <HoursTable rows={result.hoursPerDiscipline} />
      </section>

      {/* Team composition */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Aanbevolen team</h2>
        <TeamTable team={result.recommendedTeam} />
      </section>

      {/* Risks */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Risico&apos;s</h2>
        <RisksList risks={result.risks} />
      </section>

      {/* Assumptions */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Aannames</h2>
        <ul className="space-y-1.5">
          {result.assumptions.map((assumption, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-gray-700">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-gray-200 text-xs flex items-center justify-center text-gray-500">
                {idx + 1}
              </span>
              {assumption}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-gray-400">
        Dit is een AI-gegenereerde schatting. Altijd valideren met het team voor definitieve
        offerte.
      </p>
    </div>
  )
}

export default function ScopingPage() {
  const [projectBrief, setProjectBrief] = useState('')
  const [projectType, setProjectType] = useState<ProjectType>('webapp')
  const [budgetIndication, setBudgetIndication] = useState('')
  const [deadlineDate, setDeadlineDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScopingOutput | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setIsLoading(true)

    const payload: ScopingInput = {
      projectBrief,
      projectType,
      ...(budgetIndication ? { budgetIndication: Number(budgetIndication) } : {}),
      ...(deadlineDate ? { deadlineDate } : {}),
    }

    try {
      const response = await fetch('/api/ai/scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await response.json()

      if (!response.ok) {
        setError(json.error ?? 'Er is een fout opgetreden')
        return
      }

      setResult(json.data as ScopingOutput)
    } catch {
      setError('Kon geen verbinding maken met de API')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">AI Project Scoping</h1>
        <p className="text-sm text-gray-500 mt-1">
          Analyseer een project brief en ontvang een uren-schatting, team samenstelling en risico
          analyse.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="projectBrief" className="block text-sm font-medium text-gray-700 mb-1">
            Project brief <span className="text-red-500">*</span>
          </label>
          <textarea
            id="projectBrief"
            value={projectBrief}
            onChange={(e) => setProjectBrief(e.target.value)}
            rows={8}
            placeholder="Beschrijf het project zo volledig mogelijk: doel, doelgroep, functionaliteiten, integraties, technische vereisten…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            minLength={50}
          />
          <p className="mt-1 text-xs text-gray-400">
            Minimaal 50 tekens voor een betrouwbare analyse
          </p>
        </div>

        <div>
          <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-1">
            Project type <span className="text-red-500">*</span>
          </label>
          <select
            id="projectType"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value as ProjectType)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {(Object.entries(PROJECT_TYPE_LABELS) as [ProjectType, string][]).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="budgetIndication"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Budget indicatie (€)
            </label>
            <input
              id="budgetIndication"
              type="number"
              value={budgetIndication}
              onChange={(e) => setBudgetIndication(e.target.value)}
              placeholder="bijv. 25000"
              min={0}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="deadlineDate" className="block text-sm font-medium text-gray-700 mb-1">
              Gewenste deadline
            </label>
            <input
              id="deadlineDate"
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || projectBrief.length < 50}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Analyseren…' : 'Analyseer project'}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading && <Spinner />}

      {result && !isLoading && <ScopingResults result={result} />}
    </div>
  )
}
