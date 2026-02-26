# Cross-Team Collaboration Framework

> Structured processes for design critique, review, handoff, and technical debt management

## 1. Design Critique Protocol

### Critique Session Template

```markdown
# Design Critique: [Feature/Component Name]

**Date:** YYYY-MM-DD
**Presenter:** [Name]
**Duration:** 30 min (15 present + 15 feedback)

## Context
- Problem being solved:
- User need:
- Business goal:

## What I'm Showing
- [ ] Wireframes / Low-fi
- [ ] High-fidelity mockups
- [ ] Prototype / Interaction
- [ ] Final for handoff

## Specific Feedback Requested
1. [Specific question about layout/hierarchy]
2. [Specific question about interaction]
3. [Specific question about accessibility]

## Constraints
- Technical: [Any technical limitations]
- Timeline: [Deadline]
- Brand: [Brand guidelines to follow]

---

## Feedback (filled during session)

### [Reviewer Name]
- Feedback:
- Severity: Critical / Important / Nice-to-have
- Action: [Suggested action]
```

### Critique Rules

| Rule | Description |
|------|-------------|
| **Be specific** | "The contrast on this button seems low" not "I don't like it" |
| **Reference principles** | Link feedback to design principles |
| **Suggest alternatives** | Don't just identify problems, propose solutions |
| **Respect scope** | Feedback within the stated constraints |
| **Written follow-up** | All feedback documented within 24h |

## 2. Design Review SLA Tracking

### SLA Definitions

| Review Type | SLA | Escalation |
|-------------|-----|------------|
| Component review | 2 business days | Design lead after 3 days |
| Page design review | 3 business days | Design lead after 4 days |
| Brand review | 5 business days | Brand owner after 7 days |
| Accessibility review | 3 business days | a11y lead after 4 days |
| Emergency (P0) | 4 hours | Immediate escalation |

### Tracking in Plane

```
Issue Labels:
- `design-review-pending` → Waiting for review
- `design-review-approved` → Review passed
- `design-review-changes` → Changes requested

Custom Fields:
- Review requested date
- Review completed date
- SLA status (on-track / at-risk / breached)
```

### SLA Dashboard Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Average review time | <2 days | Time from request to completion |
| SLA compliance | >90% | Reviews completed within SLA |
| Review iterations | <3 | Average rounds before approval |
| Blocked engineering time | <4h/week | Time engineers wait for design |

## 3. Handoff Quality Scorecard

### Handoff Checklist

| Category | Check | Weight |
|----------|-------|--------|
| **Specs** | All spacing/sizing documented | 20% |
| **Tokens** | Uses design system tokens only | 15% |
| **States** | All interactive states designed | 15% |
| **Responsive** | Mobile, tablet, desktop variants | 15% |
| **Accessibility** | WCAG AA contrast, focus states | 15% |
| **Content** | Real content (no lorem ipsum) | 10% |
| **Edge cases** | Empty, loading, error states | 10% |

### Quality Score Calculation

```
Score = Sum(check_passed * weight) / Sum(all_weights) * 100

Thresholds:
- 90-100%: Excellent - ready for development
- 70-89%:  Good - minor items to address
- 50-69%:  Needs work - significant gaps
- <50%:    Not ready - return to design
```

### Handoff Template (Figma → Code)

```markdown
# Handoff: [Component/Feature Name]

## Figma Link
[Link to Figma frame]

## Design Tokens Used
- Colors: midnight, electric, cloud
- Typography: heading/2xl, body/base
- Spacing: space-4, space-8

## Interactive States
- [ ] Default
- [ ] Hover
- [ ] Active/Pressed
- [ ] Focus
- [ ] Disabled
- [ ] Loading
- [ ] Error
- [ ] Empty

## Responsive Breakpoints
- Mobile (375px): [description]
- Tablet (768px): [description]
- Desktop (1280px): [description]

## Accessibility Notes
- Role: [ARIA role]
- Keyboard: [Tab behavior]
- Screen reader: [Announcements]

## Animation/Motion
- Type: [CSS transition / Framer Motion]
- Duration: [ms]
- Easing: [curve]

## Edge Cases
- Max content length: [chars]
- Truncation: [ellipsis / wrap / scroll]
- Empty state: [description]
```

## 4. Design Technical Debt Register

### Debt Categories

| Category | Description | Example |
|----------|-------------|---------|
| **Token debt** | Hardcoded values instead of tokens | `color: #333` instead of `tokens.slate` |
| **Component debt** | One-off components | Custom button instead of design system Button |
| **Pattern debt** | Inconsistent patterns | Different modal implementations |
| **Accessibility debt** | Missing a11y features | No focus management in dialog |
| **Documentation debt** | Missing or outdated docs | Component without Storybook story |

### Debt Tracking in Plane

```
Label: design-tech-debt
Priority levels:
- P0: Blocks other work or causes accessibility issues
- P1: Impacts consistency across products
- P2: Would improve developer experience
- P3: Nice to have, low impact

Fields:
- Debt type (token/component/pattern/a11y/docs)
- Estimated effort (hours)
- Impact score (1-5)
- Affected components
```

### Quarterly Debt Review

| Quarter | Target | Metric |
|---------|--------|--------|
| Q1 2026 | Establish baseline | Count all design debt |
| Q2 2026 | Reduce 20% | Close 20% of P0+P1 items |
| Q3 2026 | Reduce 20% | Close 20% of remaining P0+P1 |
| Q4 2026 | Prevent growth | New debt < resolved debt |
