/**
 * Infrastructure Alerting
 *
 * Dispatches alerts to Slack and Sentry when service health status changes.
 * Only fires on status transitions to avoid alert fatigue (e.g. healthy →
 * degraded triggers an alert; remaining degraded on the next check does not).
 *
 * Channels:
 *   - Slack  : posts a Block Kit message to SLACK_ALERTS_CHANNEL_ID
 *   - Sentry : captures a message at the appropriate Sentry level
 */

import * as Sentry from '@sentry/nextjs'
import type { HealthStatus } from './health-checks.js'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Alert {
  level: 'info' | 'warning' | 'critical'
  service: string
  message: string
  timestamp: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Maps a HealthStatus to an Alert level.
 * healthy    → info
 * degraded   → warning
 * unhealthy  → critical
 */
function statusToAlertLevel(status: HealthStatus['status']): Alert['level'] {
  switch (status) {
    case 'healthy':
      return 'info'
    case 'degraded':
      return 'warning'
    case 'unhealthy':
      return 'critical'
  }
}

/**
 * Maps an Alert level to a Slack sidebar color for attachments.
 */
function alertLevelToSlackColor(level: Alert['level']): string {
  switch (level) {
    case 'info':
      return '#36a64f' // green
    case 'warning':
      return '#ffcc00' // yellow
    case 'critical':
      return '#d93025' // red
  }
}

/**
 * Maps an Alert level to the corresponding Sentry severity level.
 */
function alertLevelToSentryLevel(level: Alert['level']): Sentry.SeverityLevel {
  switch (level) {
    case 'info':
      return 'info'
    case 'warning':
      return 'warning'
    case 'critical':
      return 'error'
  }
}

// ── Alert dispatchers ─────────────────────────────────────────────────────────

/**
 * Posts an alert to the Slack channel configured via SLACK_ALERTS_CHANNEL_ID.
 * Uses the Slack Web API (chat.postMessage) with the bot token.
 *
 * Silently skips if SLACK_BOT_TOKEN or SLACK_ALERTS_CHANNEL_ID are not set.
 */
export async function sendSlackAlert(alert: Alert): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN
  const channel = process.env.SLACK_ALERTS_CHANNEL_ID

  if (!token || !channel) {
    return
  }

  const color = alertLevelToSlackColor(alert.level)
  const levelEmoji =
    alert.level === 'critical'
      ? ':red_circle:'
      : alert.level === 'warning'
        ? ':yellow_circle:'
        : ':large_green_circle:'

  const payload = {
    channel,
    text: `${levelEmoji} *${alert.level.toUpperCase()}* — ${alert.service}`,
    attachments: [
      {
        color,
        fields: [
          { title: 'Service', value: alert.service, short: true },
          { title: 'Level', value: alert.level, short: true },
          { title: 'Message', value: alert.message, short: false },
          { title: 'Timestamp', value: alert.timestamp, short: false },
        ],
        footer: 'Roosevelt OPS — Infrastructure Monitoring',
      },
    ],
  }

  try {
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Slack API returned HTTP ${response.status}`)
    }

    const body = (await response.json()) as { ok: boolean; error?: string }

    if (!body.ok) {
      throw new Error(`Slack chat.postMessage failed: ${body.error ?? 'unknown'}`)
    }
  } catch (error) {
    // Alert dispatching must never throw — capture to Sentry and continue
    Sentry.captureException(error, {
      tags: { component: 'alerting', channel: 'slack' },
    })
  }
}

/**
 * Captures an alert to Sentry at the appropriate severity level.
 * Synchronous — Sentry.captureMessage queues internally.
 */
export function sendSentryAlert(alert: Alert): void {
  const level = alertLevelToSentryLevel(alert.level)

  Sentry.captureMessage(`[${alert.service}] ${alert.message}`, {
    level,
    tags: {
      'monitoring.service': alert.service,
      'monitoring.level': alert.level,
    },
    extra: {
      service: alert.service,
      message: alert.message,
      timestamp: alert.timestamp,
    },
  })
}

// ── Transition logic ──────────────────────────────────────────────────────────

/**
 * Returns true when a health status transition warrants an alert.
 *
 * Alert rules:
 *   - healthy   → degraded   : warn (service degrading)
 *   - healthy   → unhealthy  : critical (service down)
 *   - degraded  → unhealthy  : critical (degradation became outage)
 *   - degraded  → healthy    : info (service recovered)
 *   - unhealthy → healthy    : info (service recovered)
 *   - unhealthy → degraded   : warning (partial recovery)
 *   - same → same            : no alert (no transition)
 */
export function shouldAlert(prev: HealthStatus, curr: HealthStatus): boolean {
  return prev.status !== curr.status
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

/**
 * Compares previous and current health results for all services and dispatches
 * alerts for any status transitions via both Slack and Sentry.
 *
 * @param prev - Results from the previous health check run
 * @param curr - Results from the current health check run
 */
export async function processHealthResults(
  prev: Record<string, HealthStatus>,
  curr: Record<string, HealthStatus>
): Promise<void> {
  const alertPromises: Promise<void>[] = []

  for (const [service, currStatus] of Object.entries(curr)) {
    const prevStatus = prev[service]

    // Skip on first run (no previous state)
    if (!prevStatus) {
      continue
    }

    if (!shouldAlert(prevStatus, currStatus)) {
      continue
    }

    const alert: Alert = {
      level: statusToAlertLevel(currStatus.status),
      service,
      message: buildAlertMessage(service, prevStatus, currStatus),
      timestamp: new Date().toISOString(),
    }

    sendSentryAlert(alert)
    alertPromises.push(sendSlackAlert(alert))
  }

  await Promise.allSettled(alertPromises)
}

/**
 * Builds a human-readable alert message describing a status transition.
 */
function buildAlertMessage(service: string, prev: HealthStatus, curr: HealthStatus): string {
  const transition = `${prev.status} → ${curr.status}`
  const latency = curr.latencyMs > 0 ? ` (${curr.latencyMs}ms)` : ''
  const detail = curr.message ? ` — ${curr.message}` : ''
  return `${service} changed from ${transition}${latency}${detail}`
}
