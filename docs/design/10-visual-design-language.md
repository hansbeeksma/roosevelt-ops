---
project: "Roosevelt OPS"
version: "1.0.0"
last_updated: "2026-02-08"
maturity: "foundation"
status: "draft"
owner: "Sam Swaab"
---

# Roosevelt OPS Visual Design Language

> Color, Typography, Spacing, Grid, Elevation

---

## Color System

### Primary Palette

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `midnight` | `#0A0F1A` | 10, 15, 26 | Primary text, dark backgrounds |
| `slate-700` | `#334155` | 51, 65, 85 | Secondary text |
| `slate-500` | `#64748B` | 100, 116, 139 | Muted text, placeholders |
| `slate-300` | `#CBD5E1` | 203, 213, 225 | Borders, dividers |
| `slate-100` | `#F1F5F9` | 241, 245, 249 | Subtle backgrounds |
| `cloud` | `#F8FAFC` | 248, 250, 252 | Page background |
| `white` | `#FFFFFF` | 255, 255, 255 | Card backgrounds |

### Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `electric-50` | `#EFF6FF` | Lightest accent background |
| `electric-100` | `#DBEAFE` | Selected/active background |
| `electric-500` | `#3B82F6` | Primary action, links |
| `electric-600` | `#2563EB` | Hover state |
| `electric-700` | `#1D4ED8` | Active/pressed |
| `electric-900` | `#1E3A8A` | Dark accent |

### Semantic Colors

| Token | Light | Usage |
|-------|-------|-------|
| `success` | `#059669` | Positive, active, completed |
| `success-light` | `#D1FAE5` | Success background |
| `error` | `#DC2626` | Errors, destructive |
| `error-light` | `#FEE2E2` | Error background |
| `warning` | `#D97706` | Caution, attention |
| `warning-light` | `#FEF3C7` | Warning background |

---

## Typography

### Space Grotesk (Display)

```css
font-family: 'Space Grotesk', sans-serif;
```

| Style | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| `display-hero` | clamp(2.5rem, 5vw, 4rem) | 700 | 1.05 | -0.03em | Landing hero |
| `heading-xl` | 39px (2.441rem) | 600 | 1.1 | -0.02em | Page titles |
| `heading-lg` | 31px (1.953rem) | 600 | 1.15 | -0.02em | Section titles |
| `heading-md` | 25px (1.563rem) | 600 | 1.2 | -0.01em | Subsections |
| `heading-sm` | 20px (1.25rem) | 600 | 1.25 | -0.01em | Card titles |

### Inter (Body)

```css
font-family: 'Inter', sans-serif;
```

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `body-lg` | 20px | 400 | 1.6 | Intro paragraphs |
| `body-md` | 16px | 400 | 1.6 | Default body text |
| `body-sm` | 14px | 400 | 1.5 | Captions, metadata |
| `body-xs` | 12px | 400 | 1.5 | Fine print |
| `label` | 14px | 500 | 1.2 | Form labels, navigation |
| `button` | 14px | 500 | 1 | Button text |

---

## Spacing

### 8px Base Grid

| Token | Value | Usage |
|-------|-------|-------|
| `1` | 4px | Inline gaps, icon spacing |
| `2` | 8px | Tight padding, list gaps |
| `3` | 12px | Button padding-y, input padding |
| `4` | 16px | Card padding, standard gap |
| `5` | 20px | Between related elements |
| `6` | 24px | Section sub-gaps |
| `8` | 32px | Section padding |
| `12` | 48px | Between sections |
| `16` | 64px | Page sections (mobile) |
| `24` | 96px | Page sections (desktop) |

### Component Spacing

| Component | Padding | Gap |
|-----------|---------|-----|
| Button (sm) | 8px 16px | - |
| Button (md) | 12px 24px | - |
| Button (lg) | 16px 32px | - |
| Card | 24px | 16px |
| Section | 64px 0 (mobile) / 96px 0 (desktop) | 24-32px |
| Input | 12px 16px | - |

---

## Grid

| Property | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Columns | 4 | 8 | 12 |
| Gutter | 16px | 24px | 32px |
| Margin | 16px | 32px | 64px |
| Max width | 100% | 100% | 1280px |

---

## Elevation

### Shadow Scale

| Level | Value | Usage |
|-------|-------|-------|
| 0 | none | Flat elements |
| 1 | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift (buttons, badges) |
| 2 | `0 4px 6px rgba(0,0,0,0.07)` | Cards, raised panels |
| 3 | `0 10px 15px rgba(0,0,0,0.1)` | Dropdowns, popovers |
| 4 | `0 20px 25px rgba(0,0,0,0.15)` | Modals, dialogs |

### Z-Index

| Layer | Value | Usage |
|-------|-------|-------|
| Base | 0 | Default |
| Sticky | 10 | Sticky header |
| Dropdown | 20 | Dropdowns, menus |
| Overlay | 30 | Backdrop overlays |
| Modal | 40 | Modals, dialogs |
| Toast | 50 | Notifications |

---

## Borders

| Token | Value | Usage |
|-------|-------|-------|
| `default` | 1px solid #E2E8F0 | Cards, dividers |
| `strong` | 1px solid #CBD5E1 | Inputs, emphasized |
| `focus` | 2px solid #3B82F6 | Focus rings |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 6px | Buttons, badges, tags |
| `md` | 8px | Cards, inputs |
| `lg` | 12px | Large cards, modals |
| `xl` | 16px | Hero sections |
| `full` | 9999px | Avatars, pills |

---

*Template: ~/Development/shared/communicating-design/templates/10-visual-design-language.md*
