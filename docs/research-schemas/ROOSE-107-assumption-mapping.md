# ROOSE-107: Assumption Mapping — Top 10 Riskiest Assumptions

**Plane Issue:** ROOSE-107 (sub van ROOSE-106)
**Type:** Research Schema
**Prioriteit:** High
**Budget:** €0 (intern werk)
**Doorlooptijd:** 3-5 dagen

---

## Doel

Identificeer en rangschik de top 10 riskantste aannames van Roosevelt OPS als B2B ops tooling platform. Valideer welke aannames het eerst getest moeten worden om verspilling van resources te voorkomen.

---

## Methodologie

### Framework: Assumptions Mapping (David J. Bland / Testing Business Ideas)

Gebruik de DFV-categorisering:

| Categorie | Vraag | Roosevelt OPS Voorbeelden |
|-----------|-------|---------------------------|
| **Desirability** | Willen klanten dit? | Hebben NL SMBs behoefte aan geconsolideerde ops metrics? |
| **Feasibility** | Kunnen wij dit bouwen? | Is realtime DORA metrics integratie technisch haalbaar? |
| **Viability** | Is dit financieel levensvatbaar? | Betalen SMBs €50-200/mo voor ops dashboards? |

### Stap 1: Assumptie Extractie

Gebruik het Lean Canvas als bron. Extraheer aannames uit elk blok:

| Lean Canvas Blok | Voorbeelden Aannames |
|------------------|----------------------|
| **Problem** | NL SMBs (10-200 FTE) missen operationeel inzicht |
| **Customer Segments** | Ops managers en founders zijn de primaire kopers |
| **Unique Value Prop** | Geconsolideerd dashboard is waardevoller dan losse tools |
| **Channels** | LinkedIn outreach werkt voor NL B2B ops tooling |
| **Revenue Streams** | SaaS subscription model is geaccepteerd in deze markt |
| **Cost Structure** | CAC < €500 is haalbaar via inbound |
| **Key Metrics** | DORA metrics zijn relevant buiten pure engineering teams |
| **Unfair Advantage** | AI-powered insights differentiëren van Datadog/Grafana |

### Stap 2: Impact × Onzekerheid Matrix

Plot elke aanname op een 2D grid:

```
Onzekerheid (hoe weinig bewijs)
     ▲
  10 │  ○ Pricing        ○ Buyer persona
     │  willingness        juist
   8 │
     │  ○ Integration     ○ DORA buiten
   6 │    behoefte          engineering
     │
   4 │  ○ Channel fit     ○ Team size
     │                      vereisten
   2 │  ○ Tech            ○ Hosting
     │    feasibility       kosten
   0 └─────────────────────────────► Impact
     0    2    4    6    8    10
```

**Focus:** Rechtsboven kwadrant (hoog impact + hoge onzekerheid) → TEST EERST

### Stap 3: Riskiest Assumption Test (RAT)

Per Ash Maurya (Leanstack) en de Theory of Constraints:
1. Identificeer de **constraint** (bottleneck) in het business model
2. Voor pre-traction: constraint = **acquisitie** (kun je klanten bereiken?)
3. Voor vroege traction: constraint = **activatie** (ervaren ze de value?)

### Stap 4: Prioritering via Scoring

| # | Aanname | DFV | Impact (1-10) | Onzekerheid (1-10) | Score | Test Methode |
|---|---------|-----|---------------|--------------------|----|--------------|
| 1 | NL SMBs (10-200) ervaren pijn bij operationeel inzicht | D | 10 | 9 | 90 | JTBD Interviews (ROOSE-109) |
| 2 | Ops managers/founders zijn de budget holders | D | 9 | 8 | 72 | Contextual Inquiry (ROOSE-108) |
| 3 | €50-200/mo is acceptabel prijspunt | V | 9 | 8 | 72 | Van Westendorp (ROOSE-114) |
| 4 | Geconsolideerd dashboard > losse tools | D | 8 | 7 | 56 | Pilot (ROOSE-112) |
| 5 | DORA metrics relevant buiten engineering | D | 7 | 8 | 56 | Contextual Inquiry (ROOSE-108) |
| 6 | LinkedIn/content marketing bereikt doelgroep | V | 8 | 6 | 48 | Channel Test |
| 7 | Integratie met bestaande tools (Jira, GitHub) is must-have | F | 7 | 6 | 42 | Contextual Inquiry (ROOSE-108) |
| 8 | Self-service onboarding werkt voor SMBs | F | 6 | 7 | 42 | Pilot (ROOSE-113) |
| 9 | NL markt groot genoeg (TAM/SAM) | V | 8 | 5 | 40 | Market Sizing (ROOSE-111) |
| 10 | AI-powered insights zijn differentiator | D | 6 | 6 | 36 | Pilot feedback (ROOSE-113) |

---

## Deliverables

1. **Assumption Board** (Notion/Miro) met alle aannames geplot op Impact × Onzekerheid matrix
2. **Top 10 lijst** met experiment design per aanname
3. **Experiment prioritering** gekoppeld aan ROOSE-106 sub-issues
4. **Tracking spreadsheet** voor validatie status (Validated / Invalidated / Inconclusive)

## Template: Assumptie Documentatie

Per aanname:

```markdown
### Aanname #X: [Titel]

**Categorie:** Desirability / Feasibility / Viability
**Stelling:** "Wij geloven dat [aanname], omdat [rationale]"
**Impact als fout:** [Wat gebeurt er als deze aanname niet klopt?]
**Huidige bewijs:** [Wat weten we al?]
**Test methode:** [Experiment type]
**Succes criterium:** [Meetbare drempel]
**Gekoppeld experiment:** [ROOSE-### issue link]
**Status:** Untested → Testing → Validated / Invalidated
```

## Referenties

- David J. Bland & Alex Osterwalder, *Testing Business Ideas* (2019)
- Ash Maurya, *Running Lean* (3rd ed.) - Riskiest Assumption Test
- Leanstack: [Lean Canvas Diagnostic Part 3](https://leanstack.com/articles/the-lean-canvas-diagnostic---part-3-of-7-identify-riskiest-assumptions)
- Clutch.co: [RAT vs MVP](https://clutch.co/resources/riskiest-assumption-test-vs-mvp-whats-the-difference)

## Benchmark

Volgens Lean Startup research: **60-70% van initiële business model aannames blijken incorrect** na systematische validatie. Dit onderstreept het belang van assumption mapping vóór grote investeringen.
