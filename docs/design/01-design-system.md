---
project: "Roosevelt OPS"
version: "2.0.0"
last_updated: "2026-02-16"
maturity: "foundation"
status: "active"
owner: "Sam Swaab"
figma_url: "https://figma.com/file/D9lhL1k3Hz3RuBXPyZ4zXJ/Claude-Designs"
design_tokens_path: "lib/design-tokens.ts"
---

# Roosevelt OPS Design System

> AI Strategie & Digital Product Development — Professional, Modern, Direct

---

## Design Principles

| # | Principle | Description | Application |
|---|-----------|-------------|-------------|
| 1 | **Architectuur Eerst** | Design reflects structured thinking — clean, systematic, purposeful | Grid-based layouts, consistent spacing, clear hierarchy |
| 2 | **Kwaliteit boven Snelheid** | Every pixel is intentional. No shortcuts, no placeholders. | High-quality typography, refined spacing, polished details |
| 3 | **Transparante Communicatie** | Design is open, readable, and honest — no decorative noise | Clear information hierarchy, minimal decoration |
| 4 | **Direct Access** | No layers between user and content. Clean, efficient interfaces. | Minimal navigation depth, progressive disclosure |

---

## Color System

### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `midnight` | `#0A0F1A` | Primary text, headers, dark backgrounds |
| `slate` | `#334155` | Secondary text, subtle elements |
| `cloud` | `#F8FAFC` | Page background, cards |
| `white` | `#FFFFFF` | Card backgrounds, contrast |

### Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `electric` | `#3B82F6` | Primary action, links, CTAs |
| `electric-dark` | `#1D4ED8` | Hover state |
| `electric-light` | `#DBEAFE` | Active/selected backgrounds |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#059669` | Positive feedback, active status |
| `error` | `#DC2626` | Errors, destructive actions |
| `warning` | `#D97706` | Caution states |
| `info` | `#3B82F6` | Informational (same as electric) |

### Contrast Ratios

| Combination | Ratio | WCAG |
|-------------|-------|------|
| `midnight` on `cloud` | ~16:1 | AAA |
| `midnight` on `white` | 17.4:1 | AAA |
| `electric` on `white` | 4.7:1 | AA |
| `white` on `electric` | 4.7:1 | AA |
| `slate` on `cloud` | ~7:1 | AAA |

---

## Typography

### Font Stack

| Role | Font | Fallback | Usage |
|------|------|----------|-------|
| **Display** | Space Grotesk | sans-serif | Headings, hero text, display |
| **Body** | Inter | sans-serif | Body text, UI elements, forms |

### Type Scale

Base: 16px, Scale: 1.25 (Major Third)

| Token | Size | Usage |
|-------|------|-------|
| `xs` | 12px | Fine print, metadata |
| `sm` | 14px | Labels, captions |
| `base` | 16px | Body text |
| `lg` | 20px | Large body, intro |
| `xl` | 25px | Small headings |
| `2xl` | 31px | Section headings |
| `3xl` | 39px | Page headings |
| `4xl` | 49px | Display |
| `5xl` | 61px | Hero |

### Heading Style

```css
font-family: 'Space Grotesk', sans-serif;
font-weight: 600;
letter-spacing: -0.02em;
line-height: 1.1;
```

---

## Spacing

### 8px Grid

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Inline spacing |
| `space-2` | 8px | Tight padding |
| `space-3` | 12px | Button padding |
| `space-4` | 16px | Standard padding |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Large padding |
| `space-12` | 48px | Section dividers |
| `space-16` | 64px | Page sections |
| `space-24` | 96px | Major sections |

---

## Grid

| Property | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Columns | 4 | 8 | 12 |
| Gutter | 16px | 24px | 32px |
| Margin | 16px | 32px | 64px |
| Max width | - | - | 1280px |

---

## Borders & Elevation

### Border Style

| Token | Value | Usage |
|-------|-------|-------|
| `border-default` | 1px solid #E2E8F0 | Card borders, dividers |
| `border-strong` | 1px solid #CBD5E1 | Input borders, emphasized |
| `border-radius-sm` | 6px | Buttons, badges |
| `border-radius-md` | 8px | Cards, inputs |
| `border-radius-lg` | 12px | Modals, large cards |

### Shadow Scale

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | Subtle lift |
| `shadow-md` | 0 4px 6px rgba(0,0,0,0.07) | Cards, dropdowns |
| `shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) | Modals, overlays |

---

## Component Inventory

Roosevelt OPS is primarily a documentation and operations hub. Components are minimal:

| Component | Status | Notes |
|-----------|--------|-------|
| Navigation | Planned | Header with logo + nav links |
| Footer | Planned | Links, copyright |
| Card | Planned | Service/product cards |
| Button | Planned | Primary, secondary, ghost variants |
| Hero Section | Planned | Landing page hero |
| Service Card | Planned | AI Strategy / Digital Product cards |
| Contact Form | Planned | Basic contact form |

---

## Figma Integration

**Design File:** [Claude-Designs on Figma](https://figma.com/file/D9lhL1k3Hz3RuBXPyZ4zXJ/Claude-Designs)

**Workflow:** See [05-figma-workflow.md](05-figma-workflow.md) voor de volledige Claude → Figma workflow.

**Design Tokens:**
- Source: Figma Variables (planned)
- Code: `lib/design-tokens.ts`
- Import: Via `figma-workflow` skill

### Token Export

Design tokens worden automatisch geëxporteerd van Figma naar TypeScript:

```typescript
// lib/design-tokens.ts (auto-generated)
export const tokens = {
  colors: {
    midnight: '#0A0F1A',
    slate: '#334155',
    cloud: '#F8FAFC',
    white: '#FFFFFF',
    electric: '#3B82F6',
    electricDark: '#1D4ED8',
    electricLight: '#DBEAFE',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#3B82F6',
  },
  typography: {
    fontFamilies: {
      heading: "'Space Grotesk', sans-serif",
      body: "'Inter', sans-serif",
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '20px',
      xl: '25px',
      '2xl': '31px',
      '3xl': '39px',
      '4xl': '49px',
      '5xl': '61px',
    },
  },
  spacing: {
    space1: '4px',
    space2: '8px',
    space3: '12px',
    space4: '16px',
    space6: '24px',
    space8: '32px',
    space12: '48px',
    space16: '64px',
    space24: '96px',
  },
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  },
}
```

### Usage in Components

```tsx
import { tokens } from '@/lib/design-tokens'

// Button component example
<button
  style={{
    backgroundColor: tokens.colors.electric,
    color: tokens.colors.white,
    fontFamily: tokens.typography.fontFamilies.body,
    fontSize: tokens.typography.fontSize.base,
    padding: `${tokens.spacing.space3} ${tokens.spacing.space6}`,
    borderRadius: tokens.borderRadius.sm,
    boxShadow: tokens.shadows.sm,
  }}
>
  Primary Button
</button>
```

---

*Template: ~/Development/shared/communicating-design/templates/01-design-system.md*
