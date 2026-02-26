'use client'

/**
 * Onboarding Dashboard Page
 *
 * Displays onboarding checklist status per new client.
 * Shows a progress bar (steps 1–5), quick "Mark Complete" actions,
 * and a link to the client portal.
 */

import { useState } from 'react'
import {
  Card,
  Title,
  Text,
  ProgressBar,
  Badge,
  Button,
  Grid,
  Flex,
  List,
  ListItem,
} from '@tremor/react'
import {
  CLIENT_ONBOARDING_STEPS,
  calculateProgress,
  completeStep,
  type OnboardingStep,
} from '@/lib/onboarding/checklist'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClientOnboarding {
  id: string
  clientName: string
  clientEmail: string
  portalUrl: string
  planeProjectUrl: string | null
  steps: OnboardingStep[]
  createdAt: string
}

// ---------------------------------------------------------------------------
// Mock data — replaced by real Supabase query in production
// ---------------------------------------------------------------------------

const MOCK_CLIENTS: ClientOnboarding[] = [
  {
    id: 'org-001',
    clientName: 'Acme Corp',
    clientEmail: 'contact@acme.com',
    portalUrl: '/portal/acme-corp',
    planeProjectUrl: 'https://app.plane.so/rooseveltdigital/projects/acme',
    steps: CLIENT_ONBOARDING_STEPS.map((step, i) => ({
      ...step,
      completed: i < 2,
      completedAt: i < 2 ? new Date('2026-02-20') : undefined,
    })),
    createdAt: '2026-02-24',
  },
  {
    id: 'org-002',
    clientName: 'Beta Studio',
    clientEmail: 'hello@betastudio.nl',
    portalUrl: '/portal/beta-studio',
    planeProjectUrl: null,
    steps: CLIENT_ONBOARDING_STEPS.map((step) => ({ ...step })),
    createdAt: '2026-02-26',
  },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface StepRowProps {
  step: OnboardingStep
  onComplete: (stepId: string) => void
}

function StepRow({ step, onComplete }: StepRowProps) {
  const statusColor = step.completed ? 'emerald' : 'gray'

  return (
    <ListItem>
      <Flex justifyContent="between" alignItems="center">
        <Flex justifyContent="start" alignItems="center" className="gap-3">
          <Badge color={statusColor} size="sm">
            {step.completed ? 'Done' : step.automatable ? 'Auto' : 'Manual'}
          </Badge>
          <div>
            <Text className="font-medium">{step.title}</Text>
            <Text className="text-gray-500 text-xs">{step.description}</Text>
          </div>
        </Flex>

        {!step.completed && (
          <Button size="xs" variant="secondary" onClick={() => onComplete(step.id)}>
            Mark Complete
          </Button>
        )}

        {step.completed && step.completedAt && (
          <Text className="text-gray-400 text-xs">
            {step.completedAt.toLocaleDateString('nl-NL')}
          </Text>
        )}
      </Flex>
    </ListItem>
  )
}

interface ClientCardProps {
  client: ClientOnboarding
  onStepComplete: (clientId: string, stepId: string) => void
}

function ClientCard({ client, onStepComplete }: ClientCardProps) {
  const progress = calculateProgress(client.steps)
  const completedCount = client.steps.filter((s) => s.completed).length
  const totalCount = client.steps.length

  return (
    <Card>
      <Flex justifyContent="between" alignItems="start">
        <div>
          <Title>{client.clientName}</Title>
          <Text className="text-gray-500">{client.clientEmail}</Text>
        </div>
        <Badge color={progress === 100 ? 'emerald' : 'blue'}>
          {progress === 100 ? 'Complete' : 'In Progress'}
        </Badge>
      </Flex>

      {/* Progress bar */}
      <div className="mt-4">
        <Flex justifyContent="between" className="mb-1">
          <Text className="text-sm">
            {completedCount} / {totalCount} steps
          </Text>
          <Text className="text-sm font-medium">{progress}%</Text>
        </Flex>
        <ProgressBar value={progress} color={progress === 100 ? 'emerald' : 'blue'} />
      </div>

      {/* Step list */}
      <List className="mt-4">
        {client.steps.map((step) => (
          <StepRow
            key={step.id}
            step={step}
            onComplete={(stepId) => onStepComplete(client.id, stepId)}
          />
        ))}
      </List>

      {/* Footer links */}
      <Flex justifyContent="start" className="gap-3 mt-4">
        <Button size="xs" variant="light" onClick={() => window.open(client.portalUrl, '_blank')}>
          Client Portal
        </Button>
        {client.planeProjectUrl && (
          <Button
            size="xs"
            variant="light"
            onClick={() => window.open(client.planeProjectUrl!, '_blank')}
          >
            Plane Project
          </Button>
        )}
      </Flex>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const [clients, setClients] = useState<ClientOnboarding[]>(MOCK_CLIENTS)

  function handleStepComplete(clientId: string, stepId: string) {
    setClients((prev) =>
      prev.map((client) => {
        if (client.id !== clientId) return client
        return {
          ...client,
          steps: completeStep(client.steps, stepId),
        }
      })
    )
  }

  const totalInProgress = clients.filter((c) => calculateProgress(c.steps) < 100).length

  const totalComplete = clients.filter((c) => calculateProgress(c.steps) === 100).length

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Client Onboarding</Title>
      <Text>Track and manage new client onboarding progress</Text>

      {/* Summary cards */}
      <Grid numItemsMd={3} className="gap-4 mt-6">
        <Card>
          <Text>Total Clients</Text>
          <Title className="mt-1">{clients.length}</Title>
        </Card>
        <Card>
          <Text>In Progress</Text>
          <Title className="mt-1 text-blue-600">{totalInProgress}</Title>
        </Card>
        <Card>
          <Text>Completed</Text>
          <Title className="mt-1 text-emerald-600">{totalComplete}</Title>
        </Card>
      </Grid>

      {/* Per-client checklist cards */}
      <div className="mt-8 space-y-6">
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} onStepComplete={handleStepComplete} />
        ))}
      </div>
    </main>
  )
}
