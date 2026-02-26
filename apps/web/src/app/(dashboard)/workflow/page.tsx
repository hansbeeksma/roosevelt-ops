'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Grid, Flex, Badge, Button } from '@tremor/react'
import {
  loadStandupState,
  saveStandupState,
  toggleItem,
  resetStandup,
  getCompletionRatio,
  getItemsByCategory,
  type StandupState,
} from '@/lib/workflow/daily-standup'

const CATEGORY_LABELS: Record<string, string> = {
  ops: 'Operations',
  development: 'Development',
  client: 'Client',
}

const CATEGORY_COLORS: Record<string, string> = {
  ops: 'bg-blue-50 border-blue-200',
  development: 'bg-purple-50 border-purple-200',
  client: 'bg-green-50 border-green-200',
}

export default function WorkflowPage() {
  const [standup, setStandup] = useState<StandupState | null>(null)
  const [focusTask, setFocusTask] = useState<string>('No active focus — run: cleo focus set T###')

  useEffect(() => {
    const state = loadStandupState()
    setStandup(state)

    const stored = localStorage.getItem('workflow-focus-task')
    if (stored) setFocusTask(stored)
  }, [])

  useEffect(() => {
    if (standup) {
      saveStandupState(standup)
    }
  }, [standup])

  function handleToggle(itemId: string) {
    if (!standup) return
    setStandup((prev) => (prev ? toggleItem(prev, itemId) : prev))
  }

  function handleReset() {
    if (!standup) return
    setStandup((prev) => (prev ? resetStandup(prev) : prev))
  }

  function handleStartTimer() {
    alert('Timer started — integrate with your time tracking tool.')
  }

  function handleLogTime() {
    alert('Log time — integrate with Roosevelt OPS time entries.')
  }

  function handleCreateIssue() {
    window.open('https://app.plane.so', '_blank')
  }

  if (!standup) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Text>Loading workflow...</Text>
      </main>
    )
  }

  const { done, total } = getCompletionRatio(standup)
  const byCategory = getItemsByCategory(standup)
  const allDone = done === total
  const progressPercent = Math.round((done / total) * 100)

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Daily Workflow</Title>
      <Text>Solo dev agency operations hub</Text>

      <Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6">
        {/* Today's Focus */}
        <Card className="col-span-2 lg:col-span-2">
          <Flex alignItems="start">
            <div>
              <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Today&apos;s Focus
              </Text>
              <Title className="mt-1 text-lg">{focusTask}</Title>
            </div>
            <Badge color={allDone ? 'green' : 'blue'}>
              {allDone ? 'Standup Done' : `${done}/${total} standup`}
            </Badge>
          </Flex>
        </Card>

        {/* Quick Actions */}
        <Card>
          <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Quick Actions
          </Text>
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="primary" onClick={handleStartTimer}>
              Start Timer
            </Button>
            <Button size="sm" variant="secondary" onClick={handleLogTime}>
              Log Time
            </Button>
            <Button size="sm" variant="secondary" onClick={handleCreateIssue}>
              Create Issue
            </Button>
          </div>
        </Card>
      </Grid>

      {/* Daily Standup Checklist */}
      <div className="mt-8">
        <Flex className="mb-4">
          <div>
            <Title className="text-base">Morning Standup</Title>
            <Text className="text-sm">
              {progressPercent}% complete &middot; {done} of {total} items
            </Text>
          </div>
          <Button size="xs" variant="secondary" onClick={handleReset}>
            Reset
          </Button>
        </Flex>

        <div className="space-y-4">
          {(Object.entries(byCategory) as [string, typeof byCategory.ops][]).map(
            ([category, items]) => (
              <div
                key={category}
                className={`rounded-lg border p-4 ${CATEGORY_COLORS[category] ?? 'bg-gray-50 border-gray-200'}`}
              >
                <Text className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-3">
                  {CATEGORY_LABELS[category] ?? category}
                </Text>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={item.id}
                        checked={item.completed}
                        onChange={() => handleToggle(item.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                      />
                      <label
                        htmlFor={item.id}
                        className={`text-sm cursor-pointer select-none ${
                          item.completed ? 'line-through text-gray-400' : 'text-gray-800'
                        }`}
                      >
                        {item.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>

        {allDone && standup.completedAt && (
          <Card className="mt-4 bg-green-50 border border-green-200">
            <Flex>
              <Text className="text-green-700 font-medium">
                Standup complete at {new Date(standup.completedAt).toLocaleTimeString()}
              </Text>
              <Badge color="green">Done</Badge>
            </Flex>
          </Card>
        )}
      </div>

      {/* Upcoming Client Meetings */}
      <div className="mt-8">
        <Title className="text-base mb-4">Upcoming Client Meetings</Title>
        <Card>
          <Text className="text-gray-500 text-sm">
            No meetings scheduled — connect your calendar to show upcoming meetings here.
          </Text>
        </Card>
      </div>
    </main>
  )
}
