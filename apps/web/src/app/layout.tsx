import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { WebVitals } from '@/components/WebVitals'
import { ExperimentTracker } from '@/components/ExperimentTracker'

export const metadata: Metadata = {
  title: 'Roosevelt OPS - Engineering Metrics',
  description: 'DORA + SPACE metrics dashboard for Roosevelt OPS',
}

/**
 * Clerk requires NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY at build time.
 * In CI builds without a real key, render without ClerkProvider
 * to allow static generation to succeed.
 */
const hasClerkKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 20

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const content = (
    <html lang="en">
      <body className="antialiased">
        <WebVitals />
        <ExperimentTracker />
        {children}
      </body>
    </html>
  )

  if (!hasClerkKey) {
    return content
  }

  return <ClerkProvider>{content}</ClerkProvider>
}
