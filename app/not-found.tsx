/**
 * 404 Not Found Handler (ROOSE-96)
 * OWASP A10:2025 - Mishandling of Exceptional Conditions
 *
 * Secure 404 page:
 * - No directory listing
 * - No information disclosure
 * - User-friendly message
 */

import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '100px auto',
      padding: '40px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '72px',
        fontWeight: '700',
        color: '#d1d5db',
        marginBottom: '16px',
      }}>
        404
      </div>

      <h2 style={{
        margin: '0 0 16px 0',
        fontSize: '24px',
        fontWeight: '600',
        color: '#111827',
      }}>
        Page not found
      </h2>

      <p style={{
        margin: '0 0 32px 0',
        fontSize: '16px',
        color: '#6b7280',
        lineHeight: '1.5',
      }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/"
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: '#3b82f6',
          color: 'white',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '500',
          textDecoration: 'none',
        }}
      >
        Go back home
      </Link>
    </div>
  )
}
