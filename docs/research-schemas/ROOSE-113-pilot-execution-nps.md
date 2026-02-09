# ROOSE-113: Pilot Execution + NPS Meting

**Plane Issue:** ROOSE-113 (sub van ROOSE-106)
**Type:** Research Schema
**Prioriteit:** High
**Budget:** €200-500 (survey tooling)
**Doorlooptijd:** 4 weken (parallel met pilot)

---

## Doel

Voer het pilot program uit (ontworpen in ROOSE-112), meet NPS en product-market fit signalen, en gebruik data voor Go/No-Go beslissing (ROOSE-115).

---

## NPS Methodologie

### Net Promoter Score Basis

**De Kernvraag:**
> "Hoe waarschijnlijk is het dat je Roosevelt OPS aanbeveelt aan een collega of zakenrelatie?"
> Schaal: 0 (zeer onwaarschijnlijk) — 10 (zeer waarschijnlijk)

**Categorisering:**
| Score | Categorie | Actie |
|-------|-----------|-------|
| 9-10 | **Promoters** | Referral vragen, case study |
| 7-8 | **Passives** | Doorvragen: wat mist er? |
| 0-6 | **Detractors** | Urgente follow-up: wat ging mis? |

**Berekening:** NPS = % Promoters − % Detractors

### B2B SaaS NPS Benchmarks (2024)

| Benchmark | Score | Bron |
|-----------|-------|------|
| Gemiddeld B2B SaaS | 30-40 | CustomerGauge 2023, Retently 2023 |
| Goed B2B SaaS | 40-50 | ClearlyRated 2024 |
| Excellent B2B SaaS | 50-70 | Industry leaders |
| World-class | 70+ | Top 5% |
| **B2B Services benchmark 2024** | **45** | ClearlyRated (+6 vs 2023) |

### Roosevelt OPS Pilot Targets

| Metric | Minimum Viable | Goed | No-Go Drempel |
|--------|---------------|------|---------------|
| NPS | 30 | 40+ | <20 |
| Sean Ellis Test | 30% | 40%+ | <25% |
| Weekly Active Rate | 50% | 70%+ | <30% |

---

## Survey Design

### Timing van Metingen

| Moment | Type Survey | Vragen |
|--------|-------------|--------|
| **Dag 7** | Quick pulse | NPS + 1 open vraag |
| **Dag 14** | Feature feedback | Feature satisfaction + missing features |
| **Dag 21** | Value assessment | Time saved + business impact |
| **Dag 28** | Exit survey | NPS + Sean Ellis + WTP + open vragen |

### Dag 7: Quick Pulse (2 min)

1. NPS vraag (0-10)
2. "Wat is de belangrijkste reden voor je score?" (open)
3. "Welke feature gebruik je het meest?" (multiple choice)

### Dag 14: Feature Feedback (5 min)

1. Per core feature: "Hoe tevreden ben je?" (1-5 sterren)
2. "Welke feature mis je het meest?" (open)
3. "Hoe vergelijkt dit met je vorige oplossing?" (beter/gelijk/slechter)
4. "Hoeveel tijd bespaar je per week met Roosevelt OPS?" (schatting)

### Dag 21: Value Assessment (5 min)

1. "Heeft Roosevelt OPS je geholpen een betere beslissing te nemen?" (ja/nee + voorbeeld)
2. "Heb je Roosevelt OPS aan een collega laten zien?" (ja/nee)
3. "Wat zou je missen als we het morgen uitschakelen?" (open)
4. CES (Customer Effort Score): "Hoe makkelijk was het om [kernactie] te doen?" (1-7)

### Dag 28: Exit Survey (10 min) — CRITICAL

1. **NPS** (0-10 + toelichting)
2. **Sean Ellis Test:** "Hoe zou je je voelen als je Roosevelt OPS niet meer kon gebruiken?"
   - Zeer teleurgesteld
   - Enigszins teleurgesteld
   - Niet teleurgesteld
   - N.v.t. — ik gebruik het niet meer
3. **WTP (Willingness to Pay):**
   - "Welk bedrag per maand zou je bereid zijn te betalen?" (open)
   - "Bij welk bedrag zou je twijfelen maar nog steeds betalen?" (open)
4. **Conversie intentie:**
   - "Wil je na de pilot doorgaan met een betaald abonnement?" (ja/nee/misschien)
   - Zo nee: "Wat zou je overtuigen?"
5. **Open feedback:** "Wat moeten we als eerste verbeteren?"

---

## Wekelijkse Check-in Protocol

### Format: 15 min Video Call

**Agenda:**
1. (2 min) Hoe gaat het met het gebruik?
2. (5 min) Wat ging goed deze week?
3. (5 min) Waar liep je tegenaan?
4. (3 min) Iets wat je graag anders zou zien?

### Check-in Template

```markdown
## Check-in Week [#] — [Bedrijf]

**Datum:** [datum]
**Deelnemer:** [naam]

### Usage This Week
- Logins: [#]
- Features gebruikt: [lijst]
- Data sources actief: [lijst]

### Positief
- [...]

### Friction Points
- [...]

### Feature Requests
- [...]

### Sentiment (1-5): [#]
### Conversie Signalen: [sterk/neutraal/zwak]
```

---

## Data Analyse

### Kwantitatieve Analyse

| Metric | Bron | Analyse |
|--------|------|---------|
| NPS trend (dag 7 → 28) | Surveys | Stijgt NPS over tijd? |
| Feature adoption funnel | Analytics | Welke features worden gedropt? |
| Session frequency | Analytics | Neemt gebruik toe of af? |
| Time-to-value | Analytics | Hoe snel eerste waardemoment? |
| Sean Ellis score | Exit survey | PMF signal |

### Kwalitatieve Analyse

1. **Verbatim quotes** categoriseren per thema
2. **Feature requests** ranken op frequentie
3. **Churn signals** identificeren (dalend gebruik, negatieve feedback)
4. **Expansion signals** identificeren (collega's uitgenodigd, feature requests)

### Decision Matrix (input voor ROOSE-115)

| Signal | Gewicht | Score (1-5) | Weighted |
|--------|---------|-------------|----------|
| NPS ≥ 40 | 20% | | |
| Sean Ellis ≥ 40% | 25% | | |
| Conversie intentie ≥ 60% | 20% | | |
| Weekly active ≥ 70% | 15% | | |
| Feature satisfaction ≥ 4.0 | 10% | | |
| Organic expansion | 10% | | |
| **Totaal** | **100%** | | **/5.0** |

---

## Deliverables

1. 4x weekly survey resultaten (geaggregeerd)
2. NPS trend rapport (dag 7 → 28)
3. Feature adoption rapport
4. Pilot summary per bedrijf
5. Geconsolideerd pilot rapport met PMF signalen
6. Decision matrix input voor Go/No-Go (ROOSE-115)

## Referenties

- ClearlyRated: [B2B NPS Benchmarks 2024](https://www.clearlyrated.com/industry-benchmark/nps-benchmarks-for-the-b2b-services-industry)
- Blitzllama: [Good NPS Score for SaaS](https://www.blitzllama.com/blog/nps-score-saas)
- GrowPredictably: [NPS in B2B SaaS](https://growpredictably.com/what-is-net-promoter-score-in-b2b-saas)
- Zoined: [NPS 2024 Results & Benchmarks](https://zoined.com/blog/zoined-nps-2024-b2b-saas-results-benchmarks)
