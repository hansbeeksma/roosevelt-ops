'use client'

/**
 * Page-Level Error Handler (ROOSE-96)
 * OWASP A10:2025 - Mishandling of Exceptional Conditions
 *
 * Handles errors in specific routes/pages
 */

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    // Send to Sentry
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: {
          errorBoundary: 'page',
          digest: error.digest,
        },
      })
    }

    // Development logging
    if (isDevelopment) {
      console.error('[Page Error]', error)
    }
  }, [error, isDevelopment])

  return (
    <div style={{
      maxWidth: '600px',
      margin: '100px auto',
      padding: '40px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <h2 style={{
        margin: '0 0 16px 0',
        fontSize: '20px',
        fontWeight: '600',
        color: '#111827',
      }}>
        Something went wrong
      </h2>
      <p style={{
        margin: '0 0 24px 0',
        fontSize: '16px',
        color: '#6b7280',
        lineHeight: '1.5',
      }}>
        {isDevelopment
          ? error.message
          : 'An unexpected error occurred. Please try again.'}
      </p>

      {error.digest && (
        <div style={{
          padding: '12px 16px',
          background: '#f3f4f6',
          borderRadius: '6px',
          marginBottom: '24px',
        }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#6b7280',
          }}>
            <strong>Error ID:</strong>{' '}
            <code style={{
              padding: '2px 6px',
              background: '#e5e7eb',
              borderRadius: '3px',
              fontSize: '13px',
              fontFamily: 'monospace',
            }}>
              {error.digest}
            </code>
          </p>
        </div>
      )}

      {/* Stack trace ONLY in development */}
      {isDevelopment && error.stack && (
        <details style={{ marginBottom: '24px' }}>
          <summary style={{
            cursor: 'pointer',
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '8px',
          }}>
            Stack Trace (Development Only)
          </summary>
          <pre style={{
            margin: 0,
            padding: '16px',
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: '6px',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '300px',
          }}>
            {error.stack}
          </pre>
        </details>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={reset}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            padding: '10px 20px',
            background: '#f3f4f6',
            color: '#111827',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Go home
        </a>
      </div>
    </div>
  )
}
