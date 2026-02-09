# ROOSE-115: Go/No-Go Review — Weighted Scoring Matrix

**Plane Issue:** ROOSE-115 (sub van ROOSE-106)
**Type:** Research Schema
**Prioriteit:** Urgent
**Budget:** €0 (intern review)
**Doorlooptijd:** 1-2 dagen (na afronding alle andere ROOSE-106 sub-issues)

---

## Doel

Neem een data-driven Go/No-Go beslissing over Roosevelt OPS als product, gebaseerd op alle verzamelde validatie data uit ROOSE-107 t/m ROOSE-114. Gebruik een weighted scoring matrix met duidelijke drempels.

---

## Timing

Deze review vindt plaats **na afronding van alle andere ROOSE-106 sub-issues**:

| Input | Bron | Status |
|-------|------|--------|
| Assumption validation | ROOSE-107 | [ ] |
| Contextual inquiry findings | ROOSE-108 | [ ] |
| JTBD interview insights | ROOSE-109 | [ ] |
| Competitive analysis | ROOSE-110 | [x] Done |
| Market sizing (TAM/SAM/SOM) | ROOSE-111 | [ ] |
| Pilot program results | ROOSE-112 + 113 | [ ] |
| Pricing validation | ROOSE-114 | [ ] |

---

## Weighted Scoring Matrix

### 8 Criteria met Gewichten

| # | Criterium | Gewicht | Score (1-5) | Weighted Score |
|---|-----------|---------|-------------|----------------|
| 1 | **Problem Validation** — Is er een echte, frequent ervaren pijn? | 20% | _ | _ |
| 2 | **Willingness to Pay** — Betalen prospects ≥€49/mo? | 15% | _ | _ |
| 3 | **Market Size** — SAM ≥€5M, SOM Y1 ≥€200K? | 10% | _ | _ |
| 4 | **Competitive Differentiation** — Duidelijke USP vs. alternatieven? | 10% | _ | _ |
| 5 | **Product-Market Fit Signal** — NPS ≥40, Sean Ellis ≥40%? | 20% | _ | _ |
| 6 | **Unit Economics** — LTV/CAC ≥3:1, payback <12mo? | 15% | _ | _ |
| 7 | **Technical Feasibility** — Kunnen we het bouwen met huidig team? | 5% | _ | _ |
| 8 | **Channel Viability** — Bereiken we de doelgroep effectief? | 5% | _ | _ |
| | **Totaal** | **100%** | | **/5.0** |

### Score Definities

| Score | Betekenis | Bewijs Niveau |
|-------|-----------|---------------|
| **5** | Sterk gevalideerd | Meerdere data punten bevestigen |
| **4** | Positief signaal | Meeste data wijst in juiste richting |
| **3** | Neutraal/gemengd | Evenveel positief als negatief |
| **2** | Negatief signaal | Meeste data wijst in verkeerde richting |
| **1** | Sterk ontkracht | Aanname duidelijk fout |

---

## Decision Rules

### Drempels

| Totaal Score | Beslissing | Actie |
|-------------|-----------|-------|
| **≥4.0** | **GO** | Proceed naar full development + launch |
| **3.5-3.9** | **CONDITIONAL GO** | Proceed mits specifieke risico's gemitigeerd |
| **2.5-3.4** | **PIVOT** | Herdefinieer value prop, target segment, of pricing |
| **<2.5** | **NO-GO** | Stop investering, archiveer learnings |

### Hard Vetoes (ongeacht totaalscore)

Een **NO-GO** wordt getriggerd als een van deze condities waar is:

| Veto | Criterium | Drempel |
|------|-----------|---------|
| **V1** | Problem Validation score | ≤2 |
| **V2** | Willingness to Pay score | ≤1 |
| **V3** | Market Size SAM | <€2M |
| **V4** | LTV/CAC ratio | <1.5:1 |
| **V5** | Nul pilot conversies | 0% pilot → paid |

---

## Viability Scorecard (LeanPivot Model)

Aanvullend op de weighted matrix, gebruik deze quick checks:

| Criterium | Target | Bron |
|-----------|--------|------|
| Customer value ≥ 3× acquisition cost | LTV/CAC ≥ 3:1 | ROOSE-114 |
| Cash recovery < 12 maanden | Payback period | ROOSE-114 |
| Gross margin > 70% | SaaS benchmark | Unit economics |
| Path to profit < 24 maanden | Financieel model | Business plan |
| Technical complexity < 7/10 | Team assessment | ROOSE-110 |
| No unmitigated "Red Zone" risks | Risk register | Assumption map |
| Competitive advantage > 6/10 | Differentiation score | ROOSE-110 |

---

## Sean Ellis PMF Benchmark

De meest betrouwbare single metric voor product-market fit:

> "Hoe zou je je voelen als je Roosevelt OPS niet meer kon gebruiken?"

| Antwoord | % Respondenten | Interpretatie |
|----------|---------------|---------------|
| Zeer teleurgesteld | ___% | PMF signal (target: ≥40%) |
| Enigszins teleurgesteld | ___% | Improvement potential |
| Niet teleurgesteld | ___% | Non-fit segment |
| N.v.t. | ___% | Niet geactiveerd |

**Benchmark:** ≥40% "zeer teleurgesteld" = product-market fit signal (Sean Ellis, 2024)

---

## Review Format

### Deelnemers

| Rol | Bijdrage |
|-----|---------|
| Founder/CEO | Finale beslissing |
| Product Lead | Data presentatie, recommendation |
| Tech Lead | Feasibility assessment |
| Adviseur (extern) | Objectieve challenge |

### Agenda (2 uur)

| Tijd | Onderdeel | Duur |
|------|----------|------|
| 00:00 | Data presentatie per criterium | 45 min |
| 00:45 | Individuele scoring (stil) | 15 min |
| 01:00 | Score vergelijking en discussie | 30 min |
| 01:30 | Decision: Go/Conditional Go/Pivot/No-Go | 15 min |
| 01:45 | Next steps en actieplan | 15 min |

### Presentatie Per Criterium

Template per criterium:

```markdown
## Criterium [#]: [Naam]

**Data bronnen:** [ROOSE-### links]
**Key findings:**
1. [Finding 1 + data]
2. [Finding 2 + data]
3. [Finding 3 + data]

**Sterkste bewijs:** [...]
**Grootste risico:** [...]

**Score: [1-5]** — [Korte onderbouwing]
```

---

## Post-Decision Acties

### Bij GO

1. Definieer launch plan + timeline
2. Prioriteer feature roadmap op basis van pilot feedback
3. Stel pricing vast (gevalideerd via ROOSE-114)
4. Begin marketing/acquisition (gevalideerde kanalen)
5. Zet pilot klanten om naar betaald

### Bij CONDITIONAL GO

1. Identificeer specifieke risico's die gemitigeerd moeten worden
2. Definieer mitigatie plan met deadline (max 4 weken)
3. Herschedule Go/No-Go review na mitigatie
4. Ga door met development op laag risico features

### Bij PIVOT

1. Documenteer wat niet werkte en waarom
2. Identificeer alternatieve value propositions
3. Definieer nieuwe hypothese
4. Plan nieuwe validatie cyclus (terug naar ROOSE-107)

### Bij NO-GO

1. Documenteer alle learnings
2. Archiveer in ROOSE project
3. Informeer pilot klanten
4. Evalueer of onderdelen herbruikbaar zijn voor andere producten
5. Update project status naar ARCHIVED

---

## Deliverables

1. Ingevulde weighted scoring matrix
2. Viability scorecard
3. Sean Ellis PMF analyse
4. Decision document met onderbouwing
5. Actieplan (afhankelijk van beslissing)
6. Learnings document (ongeacht beslissing)

## Referenties

- LeanPivot: [Go/No-Go Decision Framework](https://www.leanpivot.ai/playbook-03-feasibility/go-no-go-decision/)
- GrowPredictably: [Achieving PMF in B2B SaaS](https://growpredictably.com/achieving-product-market-fit-in-b2b-saas)
- Digital Clarity: [PMF Measurement for B2B SaaS](https://digital-clarity.com/blog/product-market-fit-for-b2b-saas-a-ceos-guide-to-measurement-that-actually-works/)
- Sean Ellis: 40% "very disappointed" benchmark
