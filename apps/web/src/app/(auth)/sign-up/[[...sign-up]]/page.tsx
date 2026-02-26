import { SignUp } from '@clerk/nextjs'

// Clerk components require runtime context (no static prerendering)
export const dynamic = 'force-dynamic'

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <SignUp />
    </main>
  )
}
