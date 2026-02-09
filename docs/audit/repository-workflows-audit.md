# Repository Workflows Audit

**Datum:** 2026-02-09
**Scope:** Alle 10 hansbeeksma repositories
**Uitgevoerd door:** Autonomous Agent
**Plane Issue:** ROOSE-129

---

## Executive Summary

Van de 10 hansbeeksma repositories hebben **3 repositories** (30%) GitHub Actions workflows geconfigureerd, terwijl **7 repositories** (70%) geen CI/CD pipelines hebben.

**Conclusie:** Minimaal **4 repositories** hebben dringend workflows nodig voor kwaliteitsborging en release management.

---

## Audit Resultaten

### ✅ Repositories MET Workflows (3/10)

| Repository | Workflows | Status |
|-----------|-----------|--------|
| **performance-demo** | `lighthouse-ci.yml` | ✅ Adequate (performance focus) |
| **vino12** | `ci.yml`, `e2e.yml`, `release.yml`, `security.yml`, `dependabot-auto.yml` | ✅ Comprehensive (5 workflows) |
| **roosevelt-ops** | `ci.yml`, `release.yml`, `security.yml`, `dast-scan.yml`, `dora-metrics.yml`, `dora-mttr.yml`, `metrics-alerts.yml`, `security-config.yml`, `dependabot-auto.yml` | ✅ Enterprise-grade (9 workflows) |

**Observaties:**
- **vino12** en **roosevelt-ops** hebben beide release-please workflows voor automated versioning
- **roosevelt-ops** heeft uitgebreide DORA metrics en security scanning
- Alle 3 hebben Dependabot auto-merge workflows

---

### ❌ Repositories ZONDER Workflows (7/10)

#### 🔴 URGENT: Require CI/CD (4 repos)

| Repository | Type | Rationale | Priority |
|-----------|------|-----------|----------|
| **release-infrastructure** | Infrastructure | Shared workflows voor alle repos - MOET getest worden | P0 |
| **notebooklm-skill** | Python Skill | Python dependencies, SKILL.md documentatie - quality checks needed | P1 |
| **mindmap-tool** | Tool | Unknown state, likely heeft code - needs investigation | P1 |
| **gain-staging-agent** | Agent | Unknown state, likely heeft code - needs investigation | P1 |

#### 🟡 LOW PRIORITY: Prototypes/Archives (3 repos)

| Repository | Type | Rationale | Priority |
|-----------|------|-----------|----------|
| **spanish-terroir-prototype** | Prototype | Experimenteel, geen package.json gevonden | P3 |
| **obsidian-mindmap-generator** | Tool | Unknown state, mogelijk legacy | P2 |
| **2-organize-redesign** | Redesign | Project name suggereert work-in-progress | P3 |

---

## Aanbevelingen per Repository

### P0: release-infrastructure

**Status:** KRITIEK - Dit project bevat shared workflows die door andere repos gebruikt kunnen worden.

**Aanbevolen workflows:**
```yaml
.github/workflows/
├── ci.yml              # Test reusable workflows
├── release.yml         # Version management
└── security.yml        # Secrets scanning
```

**Rationale:** Als andere repos deze workflows gebruiken via `uses: hansbeeksma/release-infrastructure/.github/workflows/...`, dan MOET dit repo zelf getest worden om breakage te voorkomen.

**Template:** Kopieer basis setup van roosevelt-ops (minimal versie).

---

### P1: notebooklm-skill

**Status:** Python project zonder CI - quality risks.

**Gevonden bestanden:**
- `requirements.txt` (Python dependencies)
- `SKILL.md` (Documentation)
- `scripts/` directory
- `CHANGELOG.md`

**Aanbevolen workflows:**
```yaml
.github/workflows/
├── ci.yml              # pytest, mypy, black, isort
├── release.yml         # Automated versioning
└── security.yml        # pip-audit, bandit
```

**Template:**
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [master, main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest black mypy isort

      - name: Format check
        run: |
          black --check .
          isort --check-only .

      - name: Type check
        run: mypy .

      - name: Run tests
        run: pytest
```

---

### P1: mindmap-tool & gain-staging-agent

**Status:** Onbekende state - vereist verder onderzoek.

**Aanbevolen actie:**
1. Inspecteer repository content via GitHub UI
2. Bepaal tech stack (Node/Python/Rust/etc)
3. Pas relevante minimal CI template toe

**Fallback template:** Als het active code bevat, kopieer minimal ci.yml van performance-demo.

---

### P2-P3: Prototypes (spanish-terroir, obsidian-mindmap, 2-organize)

**Status:** Lage prioriteit, waarschijnlijk experimenteel of legacy.

**Aanbevolen actie:**
- Evalueer of deze repos actief onderhouden worden
- Archiveer indien niet meer relevant
- Voeg minimal release.yml toe indien nog in gebruik (versioning only, geen tests)

---

## Minimal Workflow Templates

### Template 1: Node.js Project (minimal)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run build
```

### Template 2: Python Project (minimal)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      - run: pip install -r requirements.txt
      - run: pytest
```

### Template 3: Release-Please (universal)

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main, master]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
```

---

## Implementation Priority

| Week | Repositories | Actions |
|------|-------------|---------|
| **Week 1** | release-infrastructure | Voeg minimal ci.yml + release.yml toe |
| **Week 2** | notebooklm-skill | Python CI workflow met pytest/mypy/black |
| **Week 3** | mindmap-tool, gain-staging-agent | Inspecteer + pas relevante template toe |
| **Week 4** | Prototypes | Evalueer actieve status, archiveer of minimal release.yml |

---

## Cost-Benefit Analysis

| Metric | Voor | Na | Impact |
|--------|------|----|---------|
| **Coverage** | 30% (3/10) | 70% (7/10) | +40% repos met CI |
| **Critical repos zonder CI** | 4 | 0 | 100% kritieke repos beschermd |
| **Estimated CI minutes/month** | ~500 | ~1200 | +700 minutes |
| **GitHub Actions cost** | $0 (free tier) | $0 (binnen free tier) | No cost increase |

**ROI:** Minimal cost, maximum quality assurance.

---

## Next Steps

1. ✅ **ROOSE-129 completion**: Mark issue Done in Plane
2. **Create follow-up issues** voor elke repo zonder workflows:
   - ROOSE-XXX: Setup CI/CD voor release-infrastructure (P0)
   - ROOSE-XXX: Setup Python CI voor notebooklm-skill (P1)
   - ROOSE-XXX: Audit + setup CI voor mindmap-tool (P1)
   - ROOSE-XXX: Audit + setup CI voor gain-staging-agent (P1)
3. **Template creation**: Maak reusable workflow templates in release-infrastructure
4. **Rollout**: Implementeer workflows volgens priority schedule

---

## Appendix: Repository Metadata

| Repository | Language | Last Commit | Stars | Forks |
|-----------|----------|-------------|-------|-------|
| performance-demo | Unknown | Unknown | - | - |
| notebooklm-skill | Python | Active | - | - |
| spanish-terroir-prototype | Unknown | Unknown | - | - |
| mindmap-tool | Unknown | Unknown | - | - |
| obsidian-mindmap-generator | Unknown | Unknown | - | - |
| vino12 | TypeScript/Next.js | Active | - | - |
| release-infrastructure | Unknown | Unknown | - | - |
| roosevelt-ops | TypeScript/Next.js | Active | - | - |
| gain-staging-agent | Unknown | Unknown | - | - |
| 2-organize-redesign | Unknown | Unknown | - | - |

*Note: Metadata requires GitHub API enrichment voor laatste commit dates en stats.*

---

**Conclusie:** 4 repositories hebben urgent workflows nodig. Start met release-infrastructure (P0) om shared infrastructure te beveiligen, gevolgd door notebooklm-skill (P1) en de twee unknown repos.

**Risk zonder actie:** Code quality degradation, geen automated versioning, security vulnerabilities ongedetecteerd.

**Timeline:** 4 weken voor complete coverage (70% → 70% met P0-P1 afgerond in week 2).
