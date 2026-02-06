/**
 * A/B Testing Library for Performance Experiments
 *
 * Lightweight implementation using feature flags + Sentry analytics.
 * For full-featured A/B testing platform, see follow-up issue.
 */

import * as Sentry from '@sentry/nextjs'

export type Variant = 'control' | 'treatment'

export interface ExperimentConfig {
  name: string
  description: string
  trafficAllocation: number // 0-1 (0.5 = 50% to each variant)
  enabled: boolean
}

export interface ExperimentResult {
  variant: Variant
  userId: string
  experimentName: string
}

/**
 * Performance Optimization Experiment Config
 */
export const PERFORMANCE_EXPERIMENT: ExperimentConfig = {
  name: 'performance-optimization-v1',
  description: 'Test impact of performance optimizations (LCP, FCP, CLS improvements)',
  trafficAllocation: 0.5, // 50/50 split
  enabled: process.env.NEXT_PUBLIC_AB_TEST_ENABLED === 'true',
}

/**
 * Assign user to experiment variant
 * Uses deterministic hashing for consistent assignment
 */
export function assignVariant(
  userId: string,
  experiment: ExperimentConfig
): Variant {
  if (!experiment.enabled) {
    return 'treatment' // Default to optimized version when not testing
  }

  // Simple hash function for deterministic assignment
  const hash = hashString(userId + experiment.name)
  const normalized = hash / 2147483647 // Normalize to 0-1

  return normalized < experiment.trafficAllocation ? 'control' : 'treatment'
}

/**
 * Track experiment exposure (user saw variant)
 */
export function trackExperiment(result: ExperimentResult) {
  // Send to Sentry as custom event
  Sentry.captureMessage('AB Test Exposure', {
    level: 'info',
    tags: {
      experiment: result.experimentName,
      variant: result.variant,
      userId: result.userId,
    },
    contexts: {
      experiment: {
        name: result.experimentName,
        variant: result.variant,
        userId: result.userId,
        timestamp: new Date().toISOString(),
      },
    },
  })
}

/**
 * Track business metric conversion
 */
export function trackConversion(
  experimentName: string,
  variant: Variant,
  userId: string,
  metricName: string,
  value?: number
) {
  Sentry.captureMessage('AB Test Conversion', {
    level: 'info',
    tags: {
      experiment: experimentName,
      variant: variant,
      metric: metricName,
      userId: userId,
    },
    contexts: {
      conversion: {
        experiment: experimentName,
        variant: variant,
        metric: metricName,
        value: value,
        userId: userId,
        timestamp: new Date().toISOString(),
      },
    },
  })
}

/**
 * Simple hash function (DJB2)
 */
function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return Math.abs(hash)
}

/**
 * Get or create user ID for experiment
 * Stores in localStorage for consistency
 */
export function getExperimentUserId(): string {
  if (typeof window === 'undefined') return 'server'

  let userId = localStorage.getItem('ab_test_user_id')

  if (!userId) {
    userId = generateUserId()
    localStorage.setItem('ab_test_user_id', userId)
  }

  return userId
}

/**
 * Generate random user ID
 */
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Hook for using A/B test in components
 */
export function useExperiment(experiment: ExperimentConfig): ExperimentResult {
  const userId = getExperimentUserId()
  const variant = assignVariant(userId, experiment)

  const result: ExperimentResult = {
    variant,
    userId,
    experimentName: experiment.name,
  }

  // Track exposure on mount
  if (typeof window !== 'undefined') {
    trackExperiment(result)
  }

  return result
}

/**
 * Calculate statistical significance
 * Two-proportion z-test
 */
export function calculateSignificance(
  controlConversions: number,
  controlSample: number,
  treatmentConversions: number,
  treatmentSample: number
): { pValue: number; significant: boolean; confidence: number } {
  const p1 = controlConversions / controlSample
  const p2 = treatmentConversions / treatmentSample
  const pPooled = (controlConversions + treatmentConversions) / (controlSample + treatmentSample)

  const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / controlSample + 1 / treatmentSample))
  const z = (p2 - p1) / se
  const pValue = 2 * (1 - normalCDF(Math.abs(z)))

  return {
    pValue,
    significant: pValue < 0.05, // 95% confidence
    confidence: (1 - pValue) * 100,
  }
}

/**
 * Normal cumulative distribution function (approximation)
 */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989423 * Math.exp(-x * x / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return x > 0 ? 1 - p : p
}
