# Contributing to Roosevelt OPS Documentation

Guide voor het bijdragen aan de documentatie van Roosevelt OPS.

---

## Quick Start

1. **Branch aanmaken**: `git checkout -b docs/my-change`
2. **Documentatie schrijven/updaten** in `docs/`
3. **Vale linter draaien**: `vale docs/`
4. **Commit**: `git commit -m "docs: beschrijving van de wijziging"`
5. **PR aanmaken**: `gh pr create`

---

## Documentatie Structuur

```
docs/
  INDEX.md              # Navigatie hub
  CONTRIBUTING.md       # Dit bestand
  company/              # Bedrijfsinformatie
  operations/           # Standard Operating Procedures
  products/             # Product documentatie & case studies
  templates/            # Herbruikbare doc templates
templates/              # Business document templates
```

---

## Schrijfrichtlijnen

### Taal

- **Nederlands** voor interne documenten en operations
- **Engels** voor technische documentatie en code-gerelateerde docs
- Consistente taal binnen een document (niet mixen)

### Stijl

- **Actieve stem** gebruiken ("Configureer de monitor" ipv "De monitor wordt geconfigureerd")
- **Korte zinnen** voor duidelijkheid
- **Professioneel maar toegankelijk** - geen jargon zonder uitleg
- **Imperatief** voor instructies ("Open het dashboard", "Voeg de URL toe")

### Formatting

- **Headings**: Sentence case ("Setup instructions", niet "Setup Instructions")
- **Code blocks**: Gebruik triple backticks met language identifier
- **Links**: Relatieve paden voor interne docs (`../company/profile.md`)
- **Tabellen**: Voor vergelijkingen en gestructureerde data
- **Lijsten**: Voor stappen en opsommingen

### Verplichte Secties

Elk document moet minimaal bevatten:

```markdown
# Titel

Korte beschrijving van het document.

---

[inhoud]

---

*Last updated: YYYY-MM-DD*
```

---

## Doc Templates

Gebruik de juiste template als basis voor nieuwe documenten:

| Type | Template | Wanneer |
|------|----------|---------|
| **API Reference** | `docs/templates/api-reference.md` | API endpoint documentatie |
| **How-To Guide** | `docs/templates/how-to-guide.md` | Stap-voor-stap handleidingen |
| **Technical Spec** | `docs/templates/technical-specification.md` | Technische ontwerpen |
| **Project Brief** | `docs/templates/project-brief.md` | Nieuwe project scoping |
| **Meeting Notes** | `docs/templates/meeting-notes.md` | Vergaderverslagen |
| **Status Report** | `docs/templates/status-report.md` | Periodieke voortgang |

---

## Vale Linter

Documentatie wordt automatisch gecontroleerd met [Vale](https://vale.sh/).

### Lokaal draaien

```bash
# Installeer Vale (eenmalig)
brew install vale

# Sync style packages
vale sync

# Lint alle docs
vale docs/

# Lint specifiek bestand
vale docs/operations/client-onboarding.md
```

### Regels

| Rule | Level | Beschrijving |
|------|-------|-------------|
| **Roosevelt.Terminology** | warning | Gebruik volledige termen (repo -> repository) |
| **Roosevelt.Headings** | warning | Sentence case voor headings |
| **Roosevelt.TodoItems** | warning | Geen TODO/FIXME in docs (gebruik Plane) |
| **Roosevelt.Links** | error | Geen placeholder links |
| **Roosevelt.Freshness** | suggestion | "Last updated" datum verplicht |
| **Google.\*** | varies | Google developer documentation style |
| **write-good.\*** | suggestion | Schrijfkwaliteit checks |

### Regels negeren

```markdown
<!-- vale off -->
Dit stuk tekst wordt niet gecheckt door Vale.
<!-- vale on -->
```

---

## Doc Freshness

Documentatie moet minimaal elke 90 dagen worden gereviewed.

### Audit draaien

```bash
# Volledige audit
./scripts/doc-freshness-audit.sh

# Alleen stale docs
./scripts/doc-freshness-audit.sh --stale-only

# JSON output (voor CI)
./scripts/doc-freshness-audit.sh --json
```

### Stale docs updaten

1. Review het document op juistheid
2. Werk verouderde informatie bij
3. Update de "Last updated" datum onderaan
4. Commit met `docs: review [document naam]`

---

## Review Proces

### Pull Request Checklist

- [ ] Vale linter runt zonder errors
- [ ] Document heeft "Last updated" datum
- [ ] Interne links werken
- [ ] Taal is consistent (NL of EN)
- [ ] Template structuur gevolgd
- [ ] Geen TODO/FIXME items (track in Plane)

### Automatische Checks (CI)

Bij elke PR die `docs/**` wijzigt:
1. Vale linter draait automatisch
2. Link checker valideert URLs
3. Freshness audit rapporteert stale docs

---

*Last updated: 2026-02-09*
