/**
 * Web Vitals Reporter for Sentry RUM
 *
 * Reports Core Web Vitals metrics to Sentry for Real User Monitoring.
 * Tracks: LCP, FID/INP, CLS, FCP, TTFB
 *
 * Usage: Import reportWebVitals in app layout
 */

import { Metric } from 'web-vitals'
import * as Sentry from '@sentry/nextjs'

/**
 * Report Web Vitals metric to Sentry
 *
 * Sends performance metrics as Sentry measurements for aggregation and analysis.
 */
export function reportWebVitalsToSentry(metric: Metric) {
  const { name, value, rating, navigationType } = metric

  // Report to Sentry as a measurement
  Sentry.setMeasurement(name, value, 'millisecond')

  // Send as Sentry event for detailed tracking
  Sentry.captureMessage(`Web Vital: ${name}`, {
    level: rating === 'good' ? 'info' : rating === 'needs-improvement' ? 'warning' : 'error',
    tags: {
      webVital: name,
      rating: rating,
      navigationType: navigationType,
    },
    contexts: {
      'web-vitals': {
        name,
        value,
        rating,
        navigationType,
        id: metric.id,
        delta: metric.delta,
      },
    },
  })

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vital] ${name}:`, {
      value: Math.round(value),
      rating,
      navigationType,
    })
  }
}

/**
 * Get Web Vitals thresholds for visualization
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: {
    good: 2500,
    needsImprovement: 4000,
    poor: Infinity,
  },
  FID: {
    good: 100,
    needsImprovement: 300,
    poor: Infinity,
  },
  INP: {
    good: 200,
    needsImprovement: 500,
    poor: Infinity,
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
    poor: Infinity,
  },
  FCP: {
    good: 1800,
    needsImprovement: 3000,
    poor: Infinity,
  },
  TTFB: {
    good: 800,
    needsImprovement: 1800,
    poor: Infinity,
  },
} as const

/**
 * Determine rating based on value and thresholds
 */
export function getWebVitalRating(
  name: keyof typeof WEB_VITALS_THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[name]

  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.needsImprovement) return 'needs-improvement'
  return 'poor'
}
