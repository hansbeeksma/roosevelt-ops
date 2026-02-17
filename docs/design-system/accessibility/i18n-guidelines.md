# i18n Design Guidelines

> Internationalization patterns for the design system

## Text Expansion Patterns

Different languages require different amounts of space. Design components to accommodate text expansion:

| Source (EN) Length | Expansion Factor | Example Languages |
|-------------------|-----------------|-------------------|
| 1-10 chars | 200-300% | German, Finnish |
| 11-20 chars | 180-200% | French, Portuguese |
| 21-30 chars | 160-180% | Spanish, Italian |
| 31-50 chars | 140-160% | Dutch, Swedish |
| 51-70 chars | 130-140% | Japanese (shorter) |
| 71+ chars | 120-130% | Most languages |

### Design Rules

1. **Never use fixed widths** for text containers
2. **Use `min-width` instead of `width`** for buttons
3. **Allow text wrapping** by default
4. **Test with 200% expanded text** (worst case)
5. **Use flexible layouts** (CSS Grid/Flexbox)

### Testing Utility

```typescript
// lib/design-system/i18n/text-expansion.ts

function expandText(text: string, factor: number = 2.0): string {
  // Simulate text expansion for testing
  const length = text.length
  let expansionFactor = factor

  if (length <= 10) expansionFactor = 3.0
  else if (length <= 20) expansionFactor = 2.0
  else if (length <= 50) expansionFactor = 1.6
  else expansionFactor = 1.3

  const expanded = text.repeat(Math.ceil(expansionFactor))
  return expanded.slice(0, Math.ceil(text.length * expansionFactor))
}

// Use in Storybook for expansion testing
export { expandText }
```

## Number/Date/Currency Formatting

```typescript
// lib/design-system/i18n/formatters.ts

interface FormatOptions {
  locale: string
}

function formatNumber(value: number, options: FormatOptions): string {
  return new Intl.NumberFormat(options.locale).format(value)
}

function formatCurrency(
  value: number,
  currency: string,
  options: FormatOptions
): string {
  return new Intl.NumberFormat(options.locale, {
    style: 'currency',
    currency,
  }).format(value)
}

function formatDate(date: Date, options: FormatOptions): string {
  return new Intl.DateTimeFormat(options.locale, {
    dateStyle: 'medium',
  }).format(date)
}

function formatRelativeTime(date: Date, options: FormatOptions): string {
  const rtf = new Intl.RelativeTimeFormat(options.locale, {
    numeric: 'auto',
  })
  const diff = date.getTime() - Date.now()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))

  if (Math.abs(days) < 1) {
    const hours = Math.round(diff / (1000 * 60 * 60))
    return rtf.format(hours, 'hour')
  }
  return rtf.format(days, 'day')
}

export { formatNumber, formatCurrency, formatDate, formatRelativeTime }
```

## Locale-Aware Components

### Locale Context

```typescript
// lib/design-system/i18n/locale-context.tsx
'use client'

import { createContext, useContext, useMemo, useState } from 'react'

type Locale = string   // BCP 47 language tag
type Direction = 'ltr' | 'rtl'

interface LocaleContextValue {
  locale: Locale
  direction: Direction
  setLocale: (locale: Locale) => void
}

const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi'])

function getDirection(locale: Locale): Direction {
  const lang = locale.split('-')[0]
  return RTL_LOCALES.has(lang) ? 'rtl' : 'ltr'
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

function LocaleProvider({
  children,
  defaultLocale = 'en',
}: {
  children: React.ReactNode
  defaultLocale?: Locale
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)
  const direction = getDirection(locale)

  const value = useMemo(
    () => ({ locale, direction, setLocale }),
    [locale, direction]
  )

  return (
    <LocaleContext.Provider value={value}>
      <div dir={direction} lang={locale}>
        {children}
      </div>
    </LocaleContext.Provider>
  )
}

function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

export { LocaleProvider, useLocale, getDirection }
export type { Locale, Direction }
```

## Translation Workflow Integration

### react-i18next Setup

```typescript
// lib/design-system/i18n/config.ts

interface I18nConfig {
  defaultLocale: string
  supportedLocales: string[]
  namespaces: string[]
  fallbackLocale: string
  interpolation: {
    escapeValue: boolean
  }
}

const i18nConfig: I18nConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'nl', 'de', 'fr', 'es', 'ar', 'he'],
  namespaces: ['common', 'components', 'validation'],
  fallbackLocale: 'en',
  interpolation: {
    escapeValue: false,  // React already escapes
  },
}

export { i18nConfig }
```

### Translation File Structure

```
locales/
  ├── en/
  │   ├── common.json      # Shared strings
  │   ├── components.json   # Component-specific strings
  │   └── validation.json   # Form validation messages
  ├── nl/
  │   ├── common.json
  │   ├── components.json
  │   └── validation.json
  └── ar/
      ├── common.json
      ├── components.json
      └── validation.json
```

### Locale Switcher Component

```typescript
// components/ui/LocaleSwitcher.tsx
'use client'

import { useLocale } from '@/lib/design-system/i18n/locale-context'

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  nl: 'Nederlands',
  de: 'Deutsch',
  fr: 'Francais',
  es: 'Espanol',
  ar: 'العربية',
  he: 'עברית',
}

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      aria-label="Select language"
    >
      {Object.entries(LOCALE_LABELS).map(([code, label]) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  )
}
```
