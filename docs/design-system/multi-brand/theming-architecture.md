# Theming Infrastructure

> Layered CSS Variables architecture for multi-brand support

## Token Layers

```
Layer 1: Global Tokens (primitive values)
  ├── --color-blue-500: #3B82F6
  ├── --color-gray-900: #0A0F1A
  └── --spacing-4: 16px

Layer 2: Semantic Tokens (intent-based, brand-overridable)
  ├── --color-primary: var(--color-blue-500)
  ├── --color-text: var(--color-gray-900)
  └── --spacing-section: var(--spacing-4)

Layer 3: Component Tokens (component-scoped)
  ├── --button-bg: var(--color-primary)
  ├── --button-text: var(--color-on-primary)
  └── --button-radius: var(--radius-sm)
```

## CSS Variables Foundation

```css
/* lib/design-system/tokens/global.css */
:root {
  /* ===== Layer 1: Global Tokens ===== */

  /* Colors - Blue */
  --color-blue-50: #EFF6FF;
  --color-blue-100: #DBEAFE;
  --color-blue-500: #3B82F6;
  --color-blue-600: #2563EB;
  --color-blue-700: #1D4ED8;

  /* Colors - Gray */
  --color-gray-50: #F8FAFC;
  --color-gray-100: #F1F5F9;
  --color-gray-200: #E2E8F0;
  --color-gray-300: #CBD5E1;
  --color-gray-500: #64748B;
  --color-gray-700: #334155;
  --color-gray-900: #0A0F1A;

  /* Colors - Semantic Raw */
  --color-green-500: #059669;
  --color-red-500: #DC2626;
  --color-amber-500: #D97706;

  /* Spacing Scale (8px base) */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-24: 96px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Typography */
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

```css
/* lib/design-system/tokens/semantic.css */
:root,
[data-theme="default"] {
  /* ===== Layer 2: Semantic Tokens (brand-overridable) ===== */

  /* Brand Colors */
  --color-primary: var(--color-blue-500);
  --color-primary-hover: var(--color-blue-600);
  --color-primary-active: var(--color-blue-700);
  --color-primary-light: var(--color-blue-100);
  --color-on-primary: #FFFFFF;

  /* Text */
  --color-text: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-700);
  --color-text-muted: var(--color-gray-500);
  --color-text-inverse: #FFFFFF;

  /* Background */
  --color-bg: var(--color-gray-50);
  --color-bg-card: #FFFFFF;
  --color-bg-elevated: #FFFFFF;

  /* Borders */
  --color-border: var(--color-gray-200);
  --color-border-strong: var(--color-gray-300);

  /* Semantic */
  --color-success: var(--color-green-500);
  --color-error: var(--color-red-500);
  --color-warning: var(--color-amber-500);
  --color-info: var(--color-blue-500);

  /* Component Defaults */
  --button-radius: var(--radius-sm);
  --card-radius: var(--radius-md);
  --input-radius: var(--radius-md);
}
```

## Brand Override Example

```css
/* lib/design-system/tokens/brands/vino12.css */
[data-theme="vino12"] {
  /* Override semantic tokens for VINO12 brand */
  --color-primary: #8B1A1A;           /* Wine red */
  --color-primary-hover: #6B1414;
  --color-primary-active: #4B0E0E;
  --color-primary-light: #FDE8E8;
  --color-on-primary: #FFFFFF;

  --color-text: #1A1A2E;
  --color-bg: #FEF7F0;
  --color-bg-card: #FFFFFF;

  --font-heading: 'Playfair Display', serif;
  --font-body: 'Source Sans Pro', sans-serif;

  --button-radius: var(--radius-full);
  --card-radius: var(--radius-lg);
}
```

## Theme JSON Configuration

```typescript
// lib/design-system/brand-schema.ts

interface BrandConfig {
  id: string
  name: string
  version: string
  tokens: {
    colors: {
      primary: string
      primaryHover: string
      primaryActive: string
      primaryLight: string
      onPrimary: string
      text: string
      textSecondary: string
      bg: string
      bgCard: string
      success: string
      error: string
      warning: string
    }
    typography: {
      fontHeading: string
      fontBody: string
      fontSizeBase: string
      lineHeightBase: number
    }
    spacing: {
      base: number     // Base unit in px
      scale: number[]  // Multipliers
    }
    borders: {
      radiusSm: string
      radiusMd: string
      radiusLg: string
    }
    shadows: {
      sm: string
      md: string
      lg: string
    }
  }
  assets: {
    logo: string
    favicon: string
    ogImage: string
  }
  meta: {
    createdAt: string
    updatedAt: string
    createdBy: string
  }
}
```

## SSR Theme Injection

```typescript
// For Next.js SSR: inject theme before hydration to prevent flash

// app/layout.tsx
import { cookies } from 'next/headers'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value || 'default'

  return (
    <html lang="en" data-theme={theme}>
      <head>
        {/* Inline critical theme CSS to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = document.cookie
                  .split('; ')
                  .find(row => row.startsWith('theme='))
                  ?.split('=')[1] || 'default';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```
