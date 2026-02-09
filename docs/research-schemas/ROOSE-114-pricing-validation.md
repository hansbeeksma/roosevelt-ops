# ROOSE-114: Pricing & Unit Economics Validatie

**Plane Issue:** ROOSE-114 (sub van ROOSE-106)
**Type:** Research Schema
**Prioriteit:** High
**Budget:** €100-300 (survey tooling)
**Doorlooptijd:** 2-3 weken

---

## Doel

Valideer de prijsstrategie voor Roosevelt OPS via Van Westendorp Price Sensitivity Meter en Gabor-Granger methode. Bereken unit economics (LTV, CAC, payback period) en bepaal optimale pricing tiers.

---

## Methode 1: Van Westendorp Price Sensitivity Meter

### De 4 Vragen

Stel deze vragen aan minimaal 30-50 respondenten (pilot deelnemers + warme leads):

> **Context:** "Roosevelt OPS is een dashboard dat al je operationele metrics consolideert — performance, DORA metrics, team productiviteit — in één overzicht. Stel je voor dat dit beschikbaar is als maandelijks abonnement."

1. **Te goedkoop:** "Bij welke maandprijs zou je twijfelen aan de kwaliteit?"
   → €___/maand
2. **Goede deal:** "Bij welke maandprijs vind je het een goede deal?"
   → €___/maand
3. **Wordt duur:** "Bij welke maandprijs begint het duur te worden, maar zou je het nog overwegen?"
   → €___/maand
4. **Te duur:** "Bij welke maandprijs zou je het nooit kopen, ongeacht de kwaliteit?"
   → €___/maand

### Analyse

Plot de cumulatieve frequenties op een grafiek:

```
100% ┌────────────────────────────────────┐
     │                    ╲  Too Expensive│
     │          Expensive  ╲             │
 50% │    Good    ╲         ╲            │
     │   Deal╲     ╲        ╲           │
     │       ╲      ╳ OPP    ╲          │
     │        ╲    ╱          ╲         │
  0% │   Too  ╲╱               ╲        │
     │  Cheap                            │
     └──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┘
       €0 €25 €50 €75 €100 €150 €200 €300

     PMC = Point of Marginal Cheapness
     PME = Point of Marginal Expensiveness
     OPP = Optimal Price Point
     IDP = Indifference Price Point
```

### Interpretatie

| Metric | Definitie | Actie |
|--------|-----------|-------|
| **OPP** (Optimal Price Point) | Kruispunt "Te goedkoop" en "Te duur" | Prijspunt waar minste weerstand is |
| **IDP** (Indifference Point) | Kruispunt "Goede deal" en "Wordt duur" | Gemiddelde prijsverwachting |
| **Acceptable Range** | Tussen PMC en PME | Veilige prijszone |
| **Stress Point** | Waar "Te duur" stijl stijgt | Maximum prijs |

---

## Methode 2: Gabor-Granger (Directe WTP)

### Protocol

Presenteer 5-6 prijspunten in willekeurige volgorde:

> "Zou je Roosevelt OPS gebruiken als het €[X] per maand kost?"
> (Ja / Nee / Misschien)

| Prijspunt | Ja | Nee | Misschien |
|-----------|-----|-----|-----------|
| €29/mo | | | |
| €49/mo | | | |
| €79/mo | | | |
| €99/mo | | | |
| €149/mo | | | |
| €199/mo | | | |

### Analyse

Plot koopintentie vs. prijs → vind het punt waar revenue (prijs × koopintentie%) maximaal is.

```
Revenue = Prijs × Koopintentie%

€29 × 90% = €26.10
€49 × 80% = €39.20
€79 × 60% = €47.40  ← Revenue maximizing
€99 × 40% = €39.60
€149 × 20% = €29.80
€199 × 10% = €19.90
```

---

## Methode 3: Conjoint-Light (Feature-Based Pricing)

### Vraag

> "Welke features zijn voor jou het belangrijkst? Rangschik 1-5:"

| Feature | Rang | Meerprijs bereidheid |
|---------|------|---------------------|
| Geconsolideerd ops dashboard | _ | €___/mo extra |
| DORA metrics integratie | _ | €___/mo extra |
| AI-powered insights/alerts | _ | €___/mo extra |
| Team performance tracking | _ | €___/mo extra |
| Custom rapportages/exports | _ | €___/mo extra |
| Integraties (Jira, GitHub, etc.) | _ | €___/mo extra |

---

## Unit Economics Berekening

### Input Assumptions

| Metric | Conservatief | Realistisch | Optimistisch |
|--------|-------------|-------------|--------------|
| ARPU (maandelijks) | €49 | €99 | €149 |
| Monthly Churn | 5% | 3% | 2% |
| CAC | €800 | €500 | €300 |
| Gross Margin | 75% | 80% | 85% |

### LTV Berekening

```
LTV = ARPU × Gross Margin / Monthly Churn

Conservatief: €49 × 0.75 / 0.05 = €735
Realistisch:  €99 × 0.80 / 0.03 = €2,640
Optimistisch: €149 × 0.85 / 0.02 = €6,333
```

### LTV/CAC Ratio

| Scenario | LTV | CAC | LTV/CAC | Verdict |
|----------|-----|-----|---------|---------|
| Conservatief | €735 | €800 | 0.9:1 | Niet viable |
| Realistisch | €2,640 | €500 | 5.3:1 | Gezond |
| Optimistisch | €6,333 | €300 | 21:1 | Excellent |
| **Target** | **>€1,500** | **<€500** | **>3:1** | **Minimum viable** |

### Payback Period

```
Payback = CAC / (ARPU × Gross Margin)

Conservatief: €800 / (€49 × 0.75) = 21.8 maanden ❌
Realistisch:  €500 / (€99 × 0.80) = 6.3 maanden ✅
Optimistisch: €300 / (€149 × 0.85) = 2.4 maanden ✅
Target: < 12 maanden
```

---

## Pricing Tiers (Hypothese)

| Tier | Prijs/mo | Target Segment | Features |
|------|---------|----------------|----------|
| **Starter** | €49 | 10-25 FTE, 1-2 users | Core dashboard, 3 integraties, email reports |
| **Growth** | €149 | 25-100 FTE, 5 users | + DORA metrics, AI insights, custom reports |
| **Scale** | €299 | 100-200 FTE, onbeperkt | + API access, SSO, dedicated support |

### Validatie Vragen per Tier

Per tier aan prospects vragen:
1. "Welke tier past bij jouw bedrijf?"
2. "Welke features mis je in de tier die je kiest?"
3. "Wat is de reden als je een hogere tier niet kiest?"
4. "Is er een feature waarvoor je zou upgraden?"

---

## Segmentatie

**Belangrijk:** Segmenteer Van Westendorp resultaten per:

| Segment | Verwachte OPP | Rationale |
|---------|---------------|-----------|
| 10-25 FTE | €29-49 | Lager budget, minder complexiteit |
| 25-100 FTE | €79-149 | Meer behoefte, groter budget |
| 100-200 FTE | €149-299 | Enterprise-lite, meeste features nodig |

---

## Deliverables

1. Van Westendorp analyse met OPP en acceptable range
2. Gabor-Granger demand curve
3. Unit economics model (spreadsheet)
4. Pricing tier recommendation
5. Feature-value mapping per tier
6. Segmentatie analyse per bedrijfsgrootte

## Referenties

- B2B International: [Van Westendorp Pricing Model](https://www.b2binternational.com/research/methods/faq/van-westendorp-pricing-model/)
- OpinionX: [Van Westendorp Survey Guide](https://www.opinionx.co/blog/van-westendorp-pricing-guide)
- Development Corporate: [Gabor-Granger & Van Westendorp for SaaS](https://developmentcorporate.com/2025/09/15/how-to-run-a-gabor-granger-or-van-westendorp-pricing-test-for-your-saas/)
- Monetizely: [Van Westendorp for SaaS](https://www.getmonetizely.com/articles/the-fundamentals-of-van-westendorp-price-sensitivity-for-saas-businesses)
