# RTL Layout System

> Logical CSS properties, BiDi text support, and icon mirroring

## CSS Logical Properties

Replace physical properties with logical equivalents for automatic RTL support:

### Property Mapping

| Physical (avoid) | Logical (use) | LTR Value | RTL Value |
|-------------------|---------------|-----------|-----------|
| `margin-left` | `margin-inline-start` | Left margin | Right margin |
| `margin-right` | `margin-inline-end` | Right margin | Left margin |
| `padding-left` | `padding-inline-start` | Left padding | Right padding |
| `padding-right` | `padding-inline-end` | Right padding | Left padding |
| `text-align: left` | `text-align: start` | Left-aligned | Right-aligned |
| `text-align: right` | `text-align: end` | Right-aligned | Left-aligned |
| `float: left` | `float: inline-start` | Float left | Float right |
| `float: right` | `float: inline-end` | Float right | Float left |
| `left` | `inset-inline-start` | Left position | Right position |
| `right` | `inset-inline-end` | Right position | Left position |
| `border-left` | `border-inline-start` | Left border | Right border |
| `border-right` | `border-inline-end` | Right border | Left border |
| `width` | `inline-size` | Horizontal size | Horizontal size |
| `height` | `block-size` | Vertical size | Vertical size |

### Tailwind CSS Configuration

```typescript
// tailwind.config.ts - Add RTL-aware utilities
import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  // ... existing config
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.ms-auto': { 'margin-inline-start': 'auto' },
        '.me-auto': { 'margin-inline-end': 'auto' },
        '.ps-4': { 'padding-inline-start': '1rem' },
        '.pe-4': { 'padding-inline-end': '1rem' },
        '.text-start': { 'text-align': 'start' },
        '.text-end': { 'text-align': 'end' },
        '.start-0': { 'inset-inline-start': '0' },
        '.end-0': { 'inset-inline-end': '0' },
      })
    }),
  ],
}

export default config
```

## BiDi Text Support

### Mixed Direction Content

```typescript
// components/ui/BiDiText.tsx

interface BiDiTextProps {
  children: React.ReactNode
  as?: 'span' | 'p' | 'div'
  direction?: 'auto' | 'ltr' | 'rtl'
  isolate?: boolean
}

function BiDiText({
  children,
  as: Tag = 'span',
  direction = 'auto',
  isolate = true,
}: BiDiTextProps) {
  if (isolate) {
    return (
      <bdi>
        <Tag dir={direction}>{children}</Tag>
      </bdi>
    )
  }

  return <Tag dir={direction}>{children}</Tag>
}

export { BiDiText }
```

### Unicode Direction Marks

```typescript
// lib/design-system/i18n/bidi-utils.ts

const LRM = '\u200E'   // Left-to-Right Mark
const RLM = '\u200F'   // Right-to-Left Mark
const LRE = '\u202A'   // Left-to-Right Embedding
const RLE = '\u202B'   // Right-to-Left Embedding
const PDF = '\u202C'   // Pop Directional Formatting

function wrapLTR(text: string): string {
  return `${LRE}${text}${PDF}`
}

function wrapRTL(text: string): string {
  return `${RLE}${text}${PDF}`
}

// For mixed content: numbers, URLs, code in RTL text
function isolateNeutral(text: string): string {
  return `${LRM}${text}${LRM}`
}

export { LRM, RLM, LRE, RLE, PDF, wrapLTR, wrapRTL, isolateNeutral }
```

## Icon Mirroring

### Mirroring Rules

| Icon Type | Mirror in RTL? | Examples |
|-----------|---------------|----------|
| Directional arrows | Yes | Back, forward, chevron |
| Text alignment | Yes | Align left/right, indent |
| Media controls | No | Play, pause, volume |
| Checkmarks | No | Check, close, plus |
| Objects | No | Home, settings, search |
| Bidirectional | No | Refresh, swap |

### Implementation

```typescript
// components/ui/Icon.tsx
import { useLocale } from '@/lib/design-system/i18n/locale-context'

interface IconProps {
  name: string
  size?: number
  mirror?: boolean   // Override auto-mirror behavior
  className?: string
}

// Icons that should be mirrored in RTL
const MIRRORED_ICONS = new Set([
  'arrow-left',
  'arrow-right',
  'chevron-left',
  'chevron-right',
  'arrow-back',
  'arrow-forward',
  'indent',
  'outdent',
  'text-align-left',
  'text-align-right',
  'reply',
  'forward-email',
  'undo',
  'redo',
  'external-link',
])

function Icon({ name, size = 24, mirror, className }: IconProps) {
  const { direction } = useLocale()
  const shouldMirror = mirror ?? (direction === 'rtl' && MIRRORED_ICONS.has(name))

  return (
    <svg
      width={size}
      height={size}
      className={className}
      style={{
        transform: shouldMirror ? 'scaleX(-1)' : undefined,
      }}
      aria-hidden="true"
      focusable="false"
    >
      <use href={`/icons/sprite.svg#icon-${name}`} />
    </svg>
  )
}

export { Icon, MIRRORED_ICONS }
```

## RTL Testing Checklist

### Automated Checks

- [ ] All CSS uses logical properties (no `left`/`right` except transforms)
- [ ] All flexbox/grid layouts render correctly in RTL
- [ ] All icons mirror appropriately
- [ ] No text overflow or clipping in RTL mode
- [ ] Form inputs align correctly
- [ ] Navigation order is correct

### Manual Testing Languages

| Language | Script | Direction | Testing Priority |
|----------|--------|-----------|-----------------|
| Arabic | Arabic | RTL | High |
| Hebrew | Hebrew | RTL | Medium |
| Persian | Arabic | RTL | Low |
| Urdu | Arabic | RTL | Low |

### Visual Regression for RTL

```yaml
# Add RTL stories to Chromatic visual regression
# .storybook/preview.ts
const preview = {
  parameters: {
    chromatic: {
      viewports: [375, 1440],
    },
  },
  globalTypes: {
    direction: {
      name: 'Direction',
      description: 'Text direction',
      defaultValue: 'ltr',
      toolbar: {
        items: [
          { value: 'ltr', title: 'LTR' },
          { value: 'rtl', title: 'RTL' },
        ],
      },
    },
  },
}
```
