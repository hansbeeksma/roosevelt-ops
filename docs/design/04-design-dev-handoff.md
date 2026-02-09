---
project: "Roosevelt OPS"
version: "1.0.0"
last_updated: "2026-02-08"
maturity: "foundation"
status: "draft"
owner: "Sam Swaab"
figma_url: ""
design_tokens_path: ""
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

*Template: ~/Development/shared/communicating-design/templates/04-design-dev-handoff.md*
