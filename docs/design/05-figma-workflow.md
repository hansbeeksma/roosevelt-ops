---
project: "Roosevelt OPS"
version: "2.0.0"
last_updated: "2026-02-16"
maturity: "active"
status: "production"
owner: "Sam Swaab"
figma_url: "https://figma.com/file/D9lhL1k3Hz3RuBXPyZ4zXJ/Claude-Designs"
---

# Roosevelt OPS Figma Workflow

> Claude → HTML → **Localhost Prototype** → Figma pipeline voor design generation

**Config:** `.figma-workflow.json` (project root)
**MCP Server:** `fig` (OAuth) + `htd` (fallback)
**Target File:** Claude-Designs (D9lhL1k3Hz3RuBXPyZ4zXJ)

---

## Quick Reference

| Actie | Command |
|-------|---------|
| Generate design | `/figma-workflow design "Button component"` |
| **Test locally** | `open designs/generated/{file}.html` of `python -m http.server 8000` |
| Push to Figma | Via htd MCP (after local approval) |
| Check config | `figma-workflow-config get` |
| Validate setup | `figma-workflow-config validate` |

---

## Workflow Steps

### 1. Design Request (Plane)

**Complex Design (eigen issue):**
```bash
# In Plane: Create issue
Project: ROOSE
Title: "Design authentication login page"
Labels: design, ui-design, p1
Priority: High
```

**Simple Design (subtask):**
```bash
# In Plane: Create subtask
Parent: ROOSE-XX (feature issue)
Title: "[ROOSE-XX] Design CTA button"
Labels: design
```

### 2. Claude Design Generation

```bash
# Automatic project detection
/figma-workflow design "Authentication login page with email/password fields"

# Workflow executes:
# 1. UX Analysis (figma-workflow skill)
# 2. HTML/CSS generation (design-standards validation)
# 3. Responsive breakpoints (mobile, tablet, desktop)
# 4. Save artifact: designs/generated/2026-02-16-auth-login.html
```

**Design System Integration:**
- Automatically imports tokens from `docs/design/01-design-system.md`
- Uses Space Grotesk (headings) + Inter (body)
- Applies 8px grid spacing
- Uses defined color palette (midnight, slate, cloud, electric)

### 3. **Localhost Prototype** (Rapid Iteration) 🆕

**⚡ Nieuwe fase voor snellere design keuzes**

Voordat het design naar Figma gaat, eerst lokaal testen voor snelle iteratie:

```bash
# Optie A: Direct in browser openen
open designs/generated/2026-02-16-auth-login.html

# Optie B: Via localhost server (aanbevolen voor responsive testing)
cd designs/generated
python -m http.server 8000
# Open: http://localhost:8000/2026-02-16-auth-login.html

# Optie C: Via npm (als Next.js/React project)
npm run dev
# Navigeer naar artifact in /public of /static
```

**Voordelen:**
- ⚡ **Instant feedback** - Zie wijzigingen direct in browser
- 🔄 **Snelle iteratie** - Edit HTML/CSS → Refresh → Herhaal
- 📱 **Responsive testing** - Test alle breakpoints (320px, 768px, 1024px+)
- 🎨 **Design keuzes** - Kleuren, spacing, typography tweaken zonder Figma
- 🖱️ **Interactie** - Hover states, transitions testen
- ♿ **Accessibility** - Screen reader, keyboard navigatie testen

**Iteratie Flow:**
```bash
# 1. Open in browser
open designs/generated/2026-02-16-auth-login.html

# 2. Maak aanpassingen
/figma-workflow iterate "Make button larger, change color to electric-dark"
# → Updates HTML file

# 3. Refresh browser (Cmd+R)
# → See changes instantly

# 4. Herhaal tot tevreden
# → Multiple iterations zonder Figma roundtrip

# 5. Klaar? Push naar Figma
# → Ga naar stap 4
```

**Design Feedback Checklist:**
- [ ] Logo/typography correct (Space Grotesk + Inter)
- [ ] Kleuren matchen design system (midnight, slate, cloud, electric)
- [ ] 8px grid spacing toegepast
- [ ] Responsive op alle breakpoints (320px, 768px, 1024px+)
- [ ] Hover states werkend
- [ ] Focus states zichtbaar (keyboard navigation)
- [ ] Contrast ratios WCAG AAA (7:1)
- [ ] No horizontal scroll op mobile

**Browser DevTools Tips:**
```javascript
// Toggle responsive mode: Cmd+Shift+M (Chrome/Firefox)
// Inspect element: Right-click → Inspect
// Edit CSS live: Styles panel → Edit values
// Test accessibility: Lighthouse → Accessibility audit
// Check contrast: DevTools → Color picker → Contrast ratio
```

### 4. Figma Import (After Local Approval)

**With fig MCP (OAuth):**
```bash
# Auto-executed by workflow:
1. mcp__fig__get_design_context(file_key: "D9lhL1k3Hz3RuBXPyZ4zXJ")
2. mcp__fig__create_page(name: "Auth Login - 2026-02-16")
3. mcp__htd__import-html(html: "...", name: "Auth Login")
4. mcp__fig__get_screenshot(verify import)
```

**Manual Fallback (htd only):**
```bash
# If fig OAuth unavailable:
1. Prompt: "Open Claude-Designs file in Figma"
2. Wait for user confirmation
3. mcp__htd__import-html(html: "...", name: "Auth Login")
4. Manual verification
```

### 5. Post-Import Actions

**Plane Integration:**
```javascript
// Auto-executed:
await mcp__plane__update_issue({
  project_id: "c7d0b955-a97f-40b6-be03-7c05c2d0b1c3",
  issue_id: issue_id,
  state_id: "e7e9879e-f38c-4140-a1ec-79cec5d1cf00"  // In Progress → In Review
})

await mcp__plane__create_issue_story({
  project_id: "c7d0b955-a97f-40b6-be03-7c05c2d0b1c3",
  issue_id: issue_id,
  comment: `Design generated and imported to Figma.

**Artifact:** designs/generated/2026-02-16-auth-login.html
**Figma:** https://figma.com/file/D9lhL1k3Hz3RuBXPyZ4zXJ/Claude-Designs?node-id=XXX

Ready for design review.`
})
```

**Git Commit:**
```bash
git add designs/generated/2026-02-16-auth-login.html
git commit -m "design(auth): Generate login page design

Generated HTML/CSS design for authentication login page.
Imported to Figma (Claude-Designs file).

Task: ROOSE-XX

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 6. Iteration

**Localhost Iteration (Recommended):**
```bash
# 1. Make changes locally first
/figma-workflow iterate "Make CTA button larger, change color to electric-dark"

# 2. Test in browser
open designs/generated/2026-02-16-auth-login.html

# 3. Satisfied? Push to Figma
# → Open Figma file
# → Run htd import again (replaces previous)
```

**Figma Direct Update (Alternative):**
```bash
# Get node ID from Figma
/figma-workflow design "Make CTA button larger, change color to electric-dark" \
  --update-node {NODE_ID}

# Workflow executes:
# 1. mcp__htd__import-html(..., intoNodeId: {NODE_ID})
# 2. Replaces existing design
# 3. Figma version history preserved
```

**Aanbevolen**: Gebruik localhost voor iteraties, push naar Figma alleen als finalized.

---

## Configuration

**Project Config:** `.figma-workflow.json`

```json
{
  "figma": {
    "fileKey": "D9lhL1k3Hz3RuBXPyZ4zXJ",
    "pageStrategy": "per-design"
  },
  "taskManager": "plane",
  "planeProject": "ROOSE",
  "output": {
    "artifactsDir": "designs/generated"
  }
}
```

**Edit config:**
```bash
figma-workflow-config set figma.fileKey "NEW_KEY"
figma-workflow-config set workflow.autoCommit true
```

---

## Design System Integration

**Automatic Token Import:**

Workflow automatically imports design tokens from:
- `docs/design/01-design-system.md` (documentation)
- `.figma-workflow.json` (designSystem.tokensPath)

**Generated HTML includes:**
```html
<style>
:root {
  /* Colors */
  --color-midnight: #0A0F1A;
  --color-slate: #334155;
  --color-cloud: #F8FAFC;
  --color-white: #FFFFFF;
  --color-electric: #3B82F6;
  --color-electric-dark: #1D4ED8;
  --color-electric-light: #DBEAFE;

  /* Typography */
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;

  /* Type Scale */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 20px;
  --text-xl: 25px;
  --text-2xl: 31px;
  --text-3xl: 39px;
  --text-4xl: 49px;
  --text-5xl: 61px;

  /* Spacing (8px grid) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-midnight);
  background-color: var(--color-cloud);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
</style>
```

---

## Plane Integration

### Label Management

**Required Labels:**
- `design` - All design work
- `ui-design` - UI-specific design
- `ux-research` - UX research

**Creation:**
```bash
# Automatic via plane-mcp-workflow.md
mcp__plane__create_label({
  project_id: "c7d0b955-a97f-40b6-be03-7c05c2d0b1c3",
  name: "design",
  color: "#E91E63"
})
```

### Issue Lifecycle

| State | Trigger |
|-------|---------|
| **Backlog** | Issue created |
| **In Progress** | `/figma-workflow design "..."` starts |
| **In Review** | Design imported to Figma |
| **Done** | Design approved + implemented |

### Complex vs Simple Designs

**Complex Design (Own Issue):**
- Full page designs (login, dashboard, landing)
- New component systems (navigation, cards)
- Major UI overhauls
- Multi-page flows

**Simple Design (Subtask):**
- Single component variants (button colors)
- Minor adjustments (spacing, padding)
- Copy changes with visual impact
- Icon updates

---

## Troubleshooting

### fig MCP OAuth Issues

**Problem:** OAuth token expired

**Fix:**
```bash
# Re-authenticate
open https://mcp.figma.com/

# Wait for redirect
# Token automatically refreshed
```

### htd Import Fails

**Problem:** "No active Figma canvas"

**Fix:**
1. Open Claude-Designs file in Figma browser/desktop
2. Ensure file is active (not just open in tab)
3. Retry import

### Design Tokens Mismatch

**Problem:** Generated HTML doesn't match design system

**Fix:**
```bash
# Validate config
figma-workflow-config validate

# Check design system path
figma-workflow-config get designSystem.docsPath

# Re-run with explicit token import
/figma-workflow design "..." --force-reload-tokens
```

### Plane State Not Updating

**Problem:** Issue stays in "Backlog" after import

**Fix:**
```bash
# Manual state update
mcp__plane__update_issue({
  project_id: "c7d0b955-a97f-40b6-be03-7c05c2d0b1c3",
  issue_id: "ISSUE_UUID",
  state_id: "e7e9879e-f38c-4140-a1ec-79cec5d1cf00"  // In Progress
})
```

**ROOSE State UUIDs:**
- Backlog: `e167edf7-d46e-48b4-ba76-31a33e5fb933`
- Todo: `9e20a25c-2f8c-4131-9fbf-7d4536d2288e`
- In Progress: `e7e9879e-f38c-4140-a1ec-79cec5d1cf00`
- Done: `c8bfdf86-913c-422a-873c-e7a09e6f2589`

---

## Examples

### Example 1: Button Component

**Request:**
```
Design a primary CTA button with hover/active states
```

**Output:**
- `designs/generated/2026-02-16-primary-cta-button.html`
- Figma page: "Primary CTA Button - 2026-02-16"
- States: default, hover, active, disabled
- Plane issue: ROOSE-XX → In Review

### Example 2: Hero Section

**Request:**
```
Hero section with heading, subtext, 2 CTAs, responsive mobile/tablet/desktop
```

**Output:**
- `designs/generated/2026-02-16-hero-section.html`
- Figma page: "Hero Section - 2026-02-16"
- Breakpoints: 320px, 768px, 1024px+
- Plane issue: ROOSE-XX → In Review

### Example 3: Login Page

**Request:**
```
Authentication login page with email/password fields, remember me checkbox, forgot password link
```

**Output:**
- `designs/generated/2026-02-16-auth-login.html`
- Figma page: "Auth Login - 2026-02-16"
- Components: Input fields, checkbox, links, primary button
- Plane issue: ROOSE-XX → In Review

### Example 4: Iteration

**Original:**
```
Design authentication login form
```

**Update:**
```
Make email field larger, add forgot password link
```

**Output:**
- Updated: `designs/generated/2026-02-16-auth-login.html`
- Figma: Same page, version 2
- Plane comment: "Design updated per feedback"

---

## Best Practices

### Do's ✅

- Always run from roosevelt-ops root directory
- Let workflow detect project config automatically
- Use design system tokens (no hardcoded values)
- Create Plane issue before design work
- Commit generated HTML to Git
- Update Plane issue state after import
- Test responsive breakpoints
- Follow 8px grid spacing

### Don'ts ❌

- Don't hardcode colors/fonts in design requests
- Don't skip Plane integration
- Don't manually edit generated HTML (iterate via workflow)
- Don't use generic design descriptions ("make it nice")
- Don't forget responsive breakpoints
- Don't ignore accessibility requirements
- Don't skip design review approval

---

## Related Documentation

- [Design System](01-design-system.md) - Complete design tokens
- [Design-Dev Handoff](04-design-dev-handoff.md) - Implementation workflow
- [Plane Workflow](~/.claude/rules/plane-mcp-workflow.md) - Plane MCP protocol
- [Global Figma WoW](~/.claude/docs/CLAUDE-TO-FIGMA-WOW.md) - Generic framework
- [README.md](../../README.md) - Project overview

---

*Last updated: 2026-02-16*
*Version: 1.0.0*
*Owner: Sam Swaab*
