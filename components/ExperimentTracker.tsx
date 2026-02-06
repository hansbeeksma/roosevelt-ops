'use client'

/**
 * Experiment Tracker Component
 *
 * Automatically tracks user assignment to A/B test variants.
 * Place in app/layout.tsx to enable experiments.
 */

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  PERFORMANCE_EXPERIMENT,
  useExperiment,
  trackConversion,
  type Variant,
} from '@/lib/ab-testing'

export function ExperimentTracker() {
  const pathname = usePathname()
  const { variant, userId, experimentName } = useExperiment(PERFORMANCE_EXPERIMENT)

  useEffect(() => {
    // Track page view as engagement metric
    trackPageView(experimentName, variant, userId, pathname)

    // Track bounce (user leaves without interaction)
    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - performance.now()
      if (timeOnPage < 5000) {
        // Less than 5 seconds = bounce
        trackConversion(experimentName, variant, userId, 'bounce', 1)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [pathname, variant, userId, experimentName])

  // Track conversions (clicks, form submissions, etc.)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Track CTA clicks
      if (target.matches('[data-conversion]')) {
        const conversionType = target.getAttribute('data-conversion')
        trackConversion(experimentName, variant, userId, conversionType || 'click')
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [variant, userId, experimentName])

  return null // This component doesn't render anything
}

/**
 * Track page view
 */
function trackPageView(
  experimentName: string,
  variant: Variant,
  userId: string,
  pathname: string
) {
  trackConversion(experimentName, variant, userId, 'pageview', 1)
}

/**
 * Helper: Track custom conversion from anywhere
 */
export function trackCustomConversion(
  metric: string,
  value?: number
) {
  if (typeof window === 'undefined') return

  const userId = localStorage.getItem('ab_test_user_id') || 'unknown'
  const variant = localStorage.getItem('ab_test_variant') as Variant || 'treatment'

  trackConversion(PERFORMANCE_EXPERIMENT.name, variant, userId, metric, value)
}
