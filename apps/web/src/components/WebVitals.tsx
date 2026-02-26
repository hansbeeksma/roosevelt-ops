'use client'

/**
 * Web Vitals Component
 *
 * Client component that reports Core Web Vitals to Sentry RUM.
 * Must be a Client Component to access browser APIs.
 */

import { useEffect } from 'react'
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import { reportWebVitalsToSentry } from '@/lib/web-vitals'

export function WebVitals() {
  useEffect(() => {
    // Report all Core Web Vitals
    onCLS(reportWebVitalsToSentry)
    onFCP(reportWebVitalsToSentry)
    onINP(reportWebVitalsToSentry)
    onLCP(reportWebVitalsToSentry)
    onTTFB(reportWebVitalsToSentry)
  }, [])

  // This component doesn't render anything
  return null
}
