# Lazy Loading Strategy

> Code-splitting, dynamic imports, and progressive loading patterns

## Component Code-Splitting

### Heavy Components (Dynamic Import)

Components over 5KB gzipped should be dynamically imported:

```typescript
// Lazy-loaded heavy components
import dynamic from 'next/dynamic'

// Modal with focus trap (4.2KB gzip)
const Modal = dynamic(() => import('@/components/ui/Modal'), {
  loading: () => <div aria-busy="true" />,
})

// Chart components (heavy, Tremor)
const AreaChart = dynamic(
  () => import('@tremor/react').then(mod => ({ default: mod.AreaChart })),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded" /> }
)

// Rich text editor (if needed)
const RichEditor = dynamic(() => import('@/components/ui/RichEditor'), {
  ssr: false,
  loading: () => <textarea className="w-full h-32 border rounded p-2" />,
})
```

### Light Components (Static Import)

Components under 3KB gzipped should be statically imported:

```typescript
// Direct import for lightweight components
import { Button } from '@/components/ui/Button'     // 1.2KB
import { Badge } from '@/components/ui/Badge'        // 0.8KB
import { Input } from '@/components/ui/Input'        // 2.1KB
```

## Route-Based Code Splitting

Next.js App Router automatically code-splits by route. Optimize further with:

```typescript
// app/dashboard/layout.tsx
// Dashboard-specific imports only load when visiting /dashboard

// app/(marketing)/layout.tsx
// Marketing pages have separate bundle from dashboard
```

## Image Lazy Loading

### Default Configuration

```typescript
// All images lazy-loaded by default via next/image
import Image from 'next/image'

// Below-the-fold images (default behavior)
<Image
  src="/images/feature.webp"
  alt="Feature description"
  width={800}
  height={600}
  // loading="lazy" is default
  // placeholder="blur" for perceived performance
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Above-the-fold images (LCP candidates)
<Image
  src="/images/hero.webp"
  alt="Hero description"
  width={1920}
  height={1080}
  priority                  // Disables lazy loading, preloads
  sizes="100vw"
/>
```

### Responsive Images with srcSet

```typescript
<Image
  src="/images/product.webp"
  alt="Product photo"
  width={1200}
  height={800}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  quality={80}
/>
```

## Icon Sprite Lazy Loading

```typescript
// Load icon sprite on demand
// components/ui/Icon.tsx

function Icon({ name, size = 24 }: IconProps) {
  // The sprite SVG is cached after first load
  // Individual icons reference the sprite via <use>
  return (
    <svg width={size} height={size} aria-hidden="true">
      <use href={`/icons/sprite.svg#icon-${name}`} />
    </svg>
  )
}

// Preload sprite for critical icons
// app/layout.tsx
<link rel="preload" href="/icons/sprite.svg" as="image" type="image/svg+xml" />
```

## Intersection Observer Pattern

For components that should only load when visible:

```typescript
// lib/design-system/hooks/use-lazy-load.ts
'use client'

import { useEffect, useRef, useState } from 'react'

interface UseLazyLoadOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

function useLazyLoad(options: UseLazyLoadOptions = {}) {
  const { threshold = 0, rootMargin = '200px', triggerOnce = true } = options
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce])

  return { ref, isVisible }
}

export { useLazyLoad }
```

### Usage

```typescript
function HeavySection() {
  const { ref, isVisible } = useLazyLoad({ rootMargin: '400px' })

  return (
    <div ref={ref}>
      {isVisible ? (
        <ActualHeavyContent />
      ) : (
        <div className="h-96 animate-pulse bg-gray-100 rounded" />
      )}
    </div>
  )
}
```

## Loading Priority Map

| Priority | Content | Strategy |
|----------|---------|----------|
| **Critical** | Header, hero, above-fold text | Static import, preload |
| **High** | Navigation, main content | Static import |
| **Medium** | Below-fold sections | Intersection Observer |
| **Low** | Footer, modals, tooltips | Dynamic import on interaction |
| **Deferred** | Analytics, monitoring | `requestIdleCallback` |
