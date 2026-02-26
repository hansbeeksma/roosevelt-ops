import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6">
      <h1 className="text-2xl font-bold">Roosevelt Client Portal</h1>
      <SignedOut>
        <p className="text-muted-foreground">Log in om je projecten te bekijken.</p>
        <SignInButton>
          <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            Inloggen
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <p className="text-muted-foreground">Welkom! Selecteer een project om te starten.</p>
        <a
          href="/projects"
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Mijn projecten
        </a>
      </SignedIn>
    </div>
  )
}
