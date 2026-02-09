---
project: "Roosevelt OPS"
version: "1.0.0"
last_updated: "2026-02-08"
maturity: "foundation"
status: "draft"
owner: "Sam Swaab"
wcag_target: "AA"
wcag_version: "2.2"
---

# Roosevelt OPS Accessibility

> WCAG 2.2 Level AA Baseline

---

## Conformance Target

| Standard | Target | Status |
|----------|--------|--------|
| WCAG 2.2 | Level AA | Planned |

---

## Color & Contrast

| Combination | Ratio | AA | AAA |
|-------------|-------|-----|-----|
| `midnight (#0A0F1A)` on `cloud (#F8FAFC)` | ~16:1 | Pass | Pass |
| `midnight (#0A0F1A)` on `white (#FFFFFF)` | 17.4:1 | Pass | Pass |
| `electric (#3B82F6)` on `white (#FFFFFF)` | 4.7:1 | Pass | Fail |
| `slate-700 (#334155)` on `cloud (#F8FAFC)` | ~7:1 | Pass | Pass |
| `white (#FFFFFF)` on `electric (#3B82F6)` | 4.7:1 | Pass | Fail |
| `white (#FFFFFF)` on `midnight (#0A0F1A)` | 17.4:1 | Pass | Pass |

All primary text combinations meet WCAG AAA. Accent colors (electric on white) meet AA for normal text and AAA for large text.

---

## Keyboard Navigation

### Focus Style

```css
:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Requirements

- [ ] Skip navigation link on all pages
- [ ] Logical tab order following DOM order
- [ ] Focus trapped in modals (Escape to close)
- [ ] No keyboard traps
- [ ] All interactive elements focusable

---

## Semantic HTML

### Required Landmarks

- `<header>` — Site header with navigation
- `<nav>` — Primary navigation
- `<main>` — Page content
- `<footer>` — Site footer

### Heading Hierarchy

- One `<h1>` per page
- No skipped levels
- Headings describe section content

---

## Testing Protocol

### Automated

| Tool | When |
|------|------|
| axe-core | Per PR (CI) |
| Lighthouse a11y | Per deploy |
| eslint-plugin-jsx-a11y | On save |

### Manual

| Test | Frequency |
|------|-----------|
| Keyboard navigation | Per feature |
| VoiceOver (Safari) | Per release |
| Zoom 200% | Per page |

---

*Template: ~/Development/shared/communicating-design/templates/07-accessibility.md*
*Full audit checklist: ~/Development/shared/communicating-design/checklists/accessibility-audit.md*
