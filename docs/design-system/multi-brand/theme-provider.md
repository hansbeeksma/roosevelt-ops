# Runtime Theme Switching

> React ThemeProvider, persistence, and SSR-safe theme loading

## ThemeProvider Component

```typescript
// lib/design-system/theme-provider.tsx
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

type ThemeId = string

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
  availableThemes: ThemeId[]
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeId
  availableThemes?: ThemeId[]
  storageKey?: string
  attribute?: string
}

function ThemeProvider({
  children,
  defaultTheme = 'default',
  availableThemes = ['default', 'roosevelt'],
  storageKey = 'theme',
  attribute = 'data-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeId>(defaultTheme)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize from storage
  useEffect(() => {
    const stored = getStoredTheme(storageKey)
    if (stored && availableThemes.includes(stored)) {
      setThemeState(stored)
    }
    setIsLoading(false)
  }, [storageKey, availableThemes])

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute(attribute, theme)

    // Update cookie for SSR
    document.cookie = `${storageKey}=${theme};path=/;max-age=31536000;SameSite=Lax`

    // Update localStorage for persistence
    try {
      localStorage.setItem(storageKey, theme)
    } catch {
      // localStorage not available (SSR or privacy mode)
    }
  }, [theme, attribute, storageKey])

  const setTheme = useCallback((newTheme: ThemeId) => {
    if (!availableThemes.includes(newTheme)) {
      console.warn(`Theme "${newTheme}" is not available. Available: ${availableThemes.join(', ')}`)
      return
    }
    setThemeState(newTheme)
  }, [availableThemes])

  const value = useMemo(
    () => ({ theme, setTheme, availableThemes, isLoading }),
    [theme, setTheme, availableThemes, isLoading]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

function getStoredTheme(key: string): string | null {
  // Try localStorage first
  try {
    const stored = localStorage.getItem(key)
    if (stored) return stored
  } catch {
    // localStorage not available
  }

  // Fall back to cookie
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${key}=`))
  return cookie ? cookie.split('=')[1] : null
}

export { ThemeProvider, useTheme }
export type { ThemeProviderProps, ThemeContextValue, ThemeId }
```

## Usage in App

```typescript
// app/layout.tsx
import { ThemeProvider } from '@/lib/design-system/theme-provider'
import { cookies } from 'next/headers'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value || 'default'

  return (
    <html lang="en" data-theme={theme} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider
          defaultTheme={theme}
          availableThemes={['default', 'roosevelt', 'vino12']}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

// Inline script to prevent flash of wrong theme
function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme')
                || document.cookie.split('; ').find(function(r) {
                    return r.startsWith('theme=')
                  })?.split('=')[1]
                || 'default';
              document.documentElement.setAttribute('data-theme', theme);
            } catch(e) {}
          })();
        `,
      }}
    />
  )
}
```

## Theme Switcher Component

```typescript
// components/ui/ThemeSwitcher.tsx
'use client'

import { useTheme } from '@/lib/design-system/theme-provider'

const THEME_LABELS: Record<string, string> = {
  default: 'Default',
  roosevelt: 'Roosevelt',
  vino12: 'VINO12',
}

export function ThemeSwitcher() {
  const { theme, setTheme, availableThemes } = useTheme()

  return (
    <div role="radiogroup" aria-label="Theme selection">
      {availableThemes.map(t => (
        <button
          key={t}
          role="radio"
          aria-checked={theme === t}
          onClick={() => setTheme(t)}
          style={{
            padding: 'var(--spacing-2) var(--spacing-4)',
            borderRadius: 'var(--radius-sm)',
            border: theme === t ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            background: theme === t ? 'var(--color-primary-light)' : 'transparent',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          {THEME_LABELS[t] || t}
        </button>
      ))}
    </div>
  )
}
```

## Smooth Theme Transitions

```css
/* lib/design-system/tokens/transitions.css */

/* Smooth transition between themes */
:root {
  --theme-transition-duration: 200ms;
  --theme-transition-easing: ease-in-out;
}

/* Apply transitions only to theme-dependent properties */
*,
*::before,
*::after {
  transition:
    background-color var(--theme-transition-duration) var(--theme-transition-easing),
    color var(--theme-transition-duration) var(--theme-transition-easing),
    border-color var(--theme-transition-duration) var(--theme-transition-easing),
    box-shadow var(--theme-transition-duration) var(--theme-transition-easing);
}

/* Disable transitions on initial load to prevent FOUC */
html:not([data-theme-ready]) * {
  transition: none !important;
}
```

## Performance Considerations

| Concern | Solution |
|---------|----------|
| Flash of unstyled content | Inline `<script>` in `<head>` sets theme before paint |
| Layout shift | Only color/shadow transitions, no geometry changes |
| Bundle size | Theme CSS loaded via CSS custom properties, no JS overhead |
| SSR mismatch | Cookie-based theme detection in server components |
| Theme switch latency | CSS variables update is <1ms, transition handles visual |
