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

# Roosevelt OPS Design-to-Dev Handoff

> Workflow documentation for design implementation

---

## Token Source of Truth

| Layer | Source | Format | Status |
|-------|--------|--------|--------|
| Design | Figma (planned) | Variables | Planned |
| Code | Design tokens file (TBD) | TypeScript | Planned |
| Runtime | CSS / Tailwind | Config | Planned |

---

## Component Priority

### P0: Launch Requirements

| Component | Design | Dev | Status |
|-----------|:------:|:---:|--------|
| Navigation/Header | Needed | Planned | Not started |
| Hero Section | Needed | Planned | Not started |
| Service Card | Needed | Planned | Not started |
| Button (primary/secondary/ghost) | Needed | Planned | Not started |
| Contact Form | Needed | Planned | Not started |
| Footer | Needed | Planned | Not started |

### P1: Portfolio & Content

| Component | Design | Dev | Status |
|-----------|:------:|:---:|--------|
| Case Study Card | Needed | Planned | Not started |
| Blog Post Layout | Needed | Planned | Not started |
| Testimonial Card | Needed | Planned | Not started |

---

## Design QA Checklist

- [ ] Uses design tokens (no hardcoded values)
- [ ] Space Grotesk for headings, Inter for body
- [ ] Consistent border-radius (6px buttons, 8px cards)
- [ ] Shadow scale used correctly
- [ ] Responsive at 320px, 768px, 1024px+
- [ ] Keyboard navigation works
- [ ] Focus rings visible (2px electric blue)

---

## Figma Workflow Integration

**Design Generation:** Designs worden gegenereerd via Claude en direct naar Figma gepusht.

**Workflow:** See [05-figma-workflow.md](05-figma-workflow.md) for complete workflow.

### From Design Request to Implementation

```
Plane Issue → Claude Design → Figma → Code → Review → Merge
     ↓              ↓            ↓        ↓       ↓        ↓
  [ROOSE-XX]   HTML/CSS     Import    React   Design   Deploy
                                              Review
```

### Design Handoff Checklist

**Before handoff:**
- [ ] Design in Figma (Claude-Designs file)
- [ ] HTML artifact in `designs/generated/`
- [ ] Design tokens used (no hardcoded values)
- [ ] Responsive breakpoints tested (320px, 768px, 1024px+)
- [ ] Accessibility checks passed (WCAG AA minimum)
- [ ] Typography follows system (Space Grotesk + Inter)
- [ ] 8px grid spacing enforced

**During implementation:**
- [ ] Import design tokens from `lib/design-tokens.ts`
- [ ] Match Figma design pixel-perfect
- [ ] Test all breakpoints (mobile, tablet, desktop)
- [ ] Verify keyboard navigation (Tab order, focus rings)
- [ ] Test with screen reader
- [ ] Lighthouse accessibility score ≥ 90

**After implementation:**
- [ ] Screenshot comparison (Figma vs production)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Performance budget met (see lighthouserc.json)
- [ ] Design review approval in Plane
- [ ] Component documented in Storybook (if applicable)

---

*Template: ~/Development/shared/communicating-design/templates/04-design-dev-handoff.md*
