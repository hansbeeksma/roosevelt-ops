# Go/No-Go Review — Roosevelt OPS

Dit document beschrijft het Go/No-Go review proces voor Roosevelt OPS, gebaseerd op de weighted scoring matrix uit het validation playbook. Gebruik dit na elke validatie fase (1, 2, 3) om datagedreven beslissingen te nemen.

---

## 1. Review Overzicht

### Wanneer Uit Te Voeren

| Fase | Timing | Focus |
|------|--------|-------|
| **Fase 1** | Week 4 (na assumption mapping, interviews, competitive analysis) | Problem-Solution Fit |
| **Fase 2** | Week 8 (na landing page test, pricing validatie, pilot program) | Solution-Market Fit |
| **Fase 3** | Week 12+ (na channel tests, unit economics validatie) | Product-Market Fit |

### Wie Betrokken

**Verplicht:**
- Product owner / Founder
- Technisch lead

**Optioneel (aanbevolen):**
- Design lead (indien design-intensief product)
- Marketing lead (voor Fase 2/3 met channel validatie)
- Extern adviseur (onafhankelijke stem, vooral bij Fase 3 investment decision)

### Duur

**90 minuten** (strikte tijdlimiet om focus te behouden):
- 30 min: Evidence review
- 15 min: Individual scoring
- 30 min: Calibration & discussie
- 15 min: Beslissing & next steps

### Voorbereiding (1 dag voor meeting)

**Ieder teamlid individueel:**
1. Lees alle verzamelde evidence (interview notes, analytics, surveys)
2. Vul scoring matrix in (zonder overleg met anderen)
3. Noteer twijfels of vragen per criterium
4. Breng materiaal mee naar meeting (laptop/print)

---

## 2. Fase 1 Go/No-Go (Problem-Solution Fit)

### Evidence Checklist

**Voordat je de review doet, controleer of je hebt:**

- [ ] **Assumption Map** ingevuld met ICE scores en test resultaten
- [ ] **10-15 JTBD Interviews** afgerond (notes + Forces of Progress analyse)
- [ ] **Competitive Analysis** compleet (5-10 concurrenten, feature matrix, positioning map)
- [ ] **Market Sizing** berekend (TAM/SAM/SOM met bronvermelding, top-down + bottom-up)
- [ ] **Opportunity Statements** geformuleerd (top 3-5 pijnpunten/jobs)

**Minimaal vereist bewijs:**
- ≥10 interviews met target doelgroep
- ≥3 concurrenten geanalyseerd
- SOM berekening met duidelijke bronnen
- Top 5 aannames getest

### Scoring Matrix — Fase 1 Focus

**Focus criteria:** 1, 2, 3 (Problem Validation, Solution Fit, Market Size)

| # | Criterium | Gewicht | Score (1-5) | Gewogen Score | Bewijs |
|---|-----------|---------|-------------|---------------|--------|
| 1 | **Problem Validation** | 20% | _____ | _____ | **Bewijs uit interviews:**<br>- Hoeveel van de 10-15 geïnterviewden ervaart het probleem? (_____/15)<br>- Frequentie probleem: dagelijks / wekelijks / maandelijks<br>- Pijnintensiteit (1-5 scale): gemiddelde score _____<br>- Quote: "_____" |
| 2 | **Solution Fit** | 20% | _____ | _____ | **Bewijs uit interviews + assumptions:**<br>- Hoeveel geïnterviewden zien onze oplossingsrichting als logisch? (_____/15)<br>- Forces of Progress: push krachten > pull krachten? (ja/nee)<br>- Top aanname validatie: aanname X = _____ (validated/invalidated)<br>- Quote: "_____" |
| 3 | **Market Size** | 15% | _____ | _____ | **Bewijs uit market sizing:**<br>- TAM (Total Addressable Market): €_____ miljoen/jaar<br>- SAM (Serviceable Available Market): €_____ miljoen/jaar<br>- SOM (Serviceable Obtainable Market): €_____ miljoen/jaar<br>- SOM > €500K/jaar? (ja/nee)<br>- Bronnen: _____ |
| 4 | Willingness to Pay | 15% | _N/A_ | _N/A_ | *Fase 2 focus* |
| 5 | Competitive Advantage | 10% | _N/A_ | _N/A_ | *Fase 2 focus* |
| 6 | Channel Viability | 10% | _N/A_ | _N/A_ | *Fase 2 focus* |
| 7 | Team Fit | 5% | _____ | _____ | **Bewijs:**<br>- Hebben we de competenties om dit te bouwen? (ja/nee)<br>- Missende skills: _____<br>- Plan om skills te verkrijgen: _____ |
| 8 | Technical Feasibility | 5% | _____ | _____ | **Bewijs:**<br>- Kunnen we een MVP bouwen binnen 3 maanden? (ja/nee)<br>- Technische blokkades: _____<br>- Budget schatting MVP: €_____ |
|   | **TOTAAL (Fase 1 weighted)** | **45%** | | **_____** | |

**Berekening gewogen score Fase 1:**
```
Gewogen score = (Criterium 1 × 0.20) + (Criterium 2 × 0.20) + (Criterium 3 × 0.15) + (Criterium 7 × 0.05) + (Criterium 8 × 0.05)

Totaal gewicht = 0.20 + 0.20 + 0.15 + 0.05 + 0.05 = 0.65 (65%)

Genormaliseerde score = Gewogen score / 0.65
```

### Minimum Thresholds — Fase 1

**Killer criteria (ongeacht totaalscore → NO-GO als niet gehaald):**

| Criterium | Minimum | Bewijs | Gehaald? |
|-----------|---------|--------|----------|
| **Problem Validation** | ≥ 3 | ≥60% van interviews bevestigt probleem + pijnintensiteit ≥3/5 | ⬜ Ja / ⬜ Nee |
| **Market Size (SOM)** | > €500K/jaar | SOM berekening met bronnen | ⬜ Ja / ⬜ Nee |

### Drempelwaarden — Fase 1

| Genormaliseerde Score | Beslissing | Actie |
|----------------------|-----------|-------|
| **≥ 3.5** | **GO naar Fase 2** | Probleem & oplossingsrichting validated. Start landing page tests + pilot. |
| **2.5 - 3.4** | **CONDITIONAL GO** | Aanvullend onderzoek nodig op zwakke punten (score <3). Herhaal interviews of test aannames opnieuw. Ga door als verbeteringen binnen 2 weken mogelijk. |
| **1.5 - 2.4** | **PIVOT** | Fundamentele mismatch. Overweeg:<br>- Andere doelgroep<br>- Andere oplossingsrichting<br>- Ander probleem binnen zelfde domein |
| **< 1.5** | **NO-GO** | Stop. Bewaar learnings. Ga naar volgend idee. |

### Beslissingslogica

```
IF Problem Validation < 3 OR Market Size < €500K:
    → NO-GO (killers niet gehaald)

ELSE IF Genormaliseerde Score ≥ 3.5:
    → GO naar Fase 2

ELSE IF Genormaliseerde Score 2.5-3.4:
    → CONDITIONAL GO
    → Identificeer criteria met score <3
    → Maak 2-weken plan om te verbeteren
    → Re-review na 2 weken

ELSE IF Genormaliseerde Score 1.5-2.4:
    → PIVOT
    → Brainstorm sessie: wat kunnen we aanpassen?
    → Nieuwe assumptie map maken
    → Start Fase 1 opnieuw (met pivot)

ELSE:
    → NO-GO
```

---

## 3. Fase 2 Go/No-Go (Solution-Market Fit)

### Evidence Checklist

**Voordat je de review doet, controleer of je hebt:**

- [ ] **Landing Page Test** resultaten (2-3 varianten, ≥100 bezoekers per variant)
- [ ] **Pricing Validatie** data (Van Westendorp analyse, ≥10 respondenten)
- [ ] **Pilot Program** rapport (3-5 bedrijven, 4 weken, NPS + WTP data)
- [ ] **Channel Experiment** resultaten (minimaal 1 kanaal getest, CAC berekend)
- [ ] **Competitive Positioning** update (feedback van pilot deelnemers over concurrenten)

**Minimaal vereist bewijs:**
- ≥300 bezoekers op landing page (100 per variant)
- ≥10 Van Westendorp responses
- ≥3 pilot deelnemers met exit interviews
- NPS ≥40 uit pilot

### Scoring Matrix — Fase 2 Focus

**Focus criteria:** 1, 2, 3, 4, 5, 6 (alle criteria behalve team/technical)

| # | Criterium | Gewicht | Score (1-5) | Gewogen Score | Bewijs |
|---|-----------|---------|-------------|---------------|--------|
| 1 | **Problem Validation** | 20% | _____ | _____ | **Bewijs uit Fase 1 + pilot feedback:**<br>- Fase 1 score: _____<br>- Pilot bevestiging: _____/5 deelnemers bevestigt probleem<br>- Update: _____ |
| 2 | **Solution Fit** | 20% | _____ | _____ | **Bewijs uit pilot:**<br>- NPS: _____ (target ≥40)<br>- Feature adoption: _____ % (target ≥60%)<br>- Actief gebruik: _____ x/week (target ≥3x)<br>- Time-to-value: _____ dagen (target ≤3)<br>- Quote: "_____" |
| 3 | **Market Size** | 15% | _____ | _____ | **Bewijs uit Fase 1 (update indien nodig):**<br>- SOM: €_____ miljoen/jaar<br>- Update obv pilot learnings: _____ |
| 4 | **Willingness to Pay** | 15% | _____ | _____ | **Bewijs uit pilot + pricing test:**<br>- WTP pilot: _____/5 "zou betalen"<br>- Van Westendorp optimaal prijspunt: €_____/maand<br>- Landing page conversie: _____ % (email signup)<br>- Pre-order interesse: _____ leads<br>- Quote: "_____" |
| 5 | **Competitive Advantage** | 10% | _____ | _____ | **Bewijs uit pilot interviews:**<br>- Wat zeiden deelnemers over concurrenten? "_____"<br>- Welke features/aanpak zijn uniek? _____<br>- Duurzaamheid voordeel: hoog / medium / laag<br>- Positioning: _____ |
| 6 | **Channel Viability** | 10% | _____ | _____ | **Bewijs uit channel experiment:**<br>- Getest kanaal: _____<br>- CAC (Customer Acquisition Cost): €_____<br>- Conversie rate: _____ %<br>- Payback period schatting: _____ maanden<br>- Referrals uit pilot: _____ (≥2 = mond-tot-mond werkt)<br>- Schaalbaar? (ja/nee) |
| 7 | **Team Fit** | 5% | _____ | _____ | **Bewijs:**<br>- Team competenties nog steeds toereikend? (ja/nee)<br>- Nieuwe skills verkregen sinds Fase 1? _____<br>- Missende skills: _____ |
| 8 | **Technical Feasibility** | 5% | _____ | _____ | **Bewijs:**<br>- MVP gebouwd/in ontwikkeling? (ja/nee)<br>- Technische schuld opgelopen tijdens pilot? (laag/medium/hoog)<br>- Budget binnen scope? (ja/nee) |
|   | **TOTAAL (Fase 2 weighted)** | **100%** | | **_____** | |

**Berekening gewogen score Fase 2:**
```
Gewogen score = (Criterium 1 × 0.20) + (Criterium 2 × 0.20) + ... + (Criterium 8 × 0.05)

Totaal gewicht = 1.00 (100%)
```

### Minimum Thresholds — Fase 2

**Killer criteria (ongeacht totaalscore → NO-GO als niet gehaald):**

| Criterium | Minimum | Bewijs | Gehaald? |
|-----------|---------|--------|----------|
| **Problem Validation** | ≥ 3 | Fase 1 + pilot bevestiging | ⬜ Ja / ⬜ Nee |
| **Willingness to Pay** | ≥ 2 | ≥40% pilot deelnemers "zou betalen" OF Van Westendorp optimaal prijspunt > €0 | ⬜ Ja / ⬜ Nee |
| **Market Size (SOM)** | > €500K/jaar | Fase 1 berekening, gevalideerd | ⬜ Ja / ⬜ Nee |

**Pilot-specifieke thresholds (voor high-confidence GO):**
| Metric | Minimum voor GO | Actual | Gehaald? |
|--------|----------------|--------|----------|
| NPS | ≥ 40 | _____ | ⬜ Ja / ⬜ Nee |
| WTP | ≥ 3/5 "zou betalen" | _____/5 | ⬜ Ja / ⬜ Noe |
| Feature adoption | ≥ 60% | _____% | ⬜ Ja / ⬜ Nee |

### Drempelwaarden — Fase 2

| Gewogen Score | Beslissing | Actie |
|--------------|-----------|-------|
| **≥ 3.5** | **GO naar Fase 3** | Solution-market fit validated. Start channel tests op grotere schaal + unit economics validatie. |
| **3.0 - 3.4** | **CONDITIONAL GO** | Pilots waren positief, maar enkele zwakke punten (score <3). Verbeter binnen 4 weken:<br>- Pricing optimalisatie<br>- Feature prioriteit aanpassing<br>- Channel experiment herhalen<br>Re-review na 4 weken. |
| **2.0 - 2.9** | **PIVOT** | Oplossing werkt deels, maar niet goed genoeg. Overweeg:<br>- Andere doelgroep (vertical pivot)<br>- Andere feature set (product pivot)<br>- Andere pricing model (business model pivot) |
| **< 2.0** | **NO-GO** | Stop. Pilot feedback was onvoldoende positief. Bewaar learnings. Ga naar volgend idee. |

### Beslissingslogica

```
IF Problem Validation < 3 OR Willingness to Pay < 2 OR Market Size < €500K:
    → NO-GO (killers niet gehaald)

ELSE IF Gewogen Score ≥ 3.5 AND (NPS ≥ 40 AND WTP ≥ 3/5 AND Feature Adoption ≥ 60%):
    → GO naar Fase 3

ELSE IF Gewogen Score 3.0-3.4:
    → CONDITIONAL GO
    → Identificeer criteria met score <3
    → Maak 4-weken improvement plan
    → Re-review na 4 weken

ELSE IF Gewogen Score 2.0-2.9:
    → PIVOT
    → Analyse: wat werkte wel/niet in pilot?
    → Pivot workshop (1 dag)
    → Nieuwe strategie formuleren
    → Fase 2 herhalen (met pivot)

ELSE:
    → NO-GO
```

---

## 4. Fase 3 Go/No-Go (Product-Market Fit)

### Evidence Checklist

**Voordat je de review doet, controleer of je hebt:**

- [ ] **Channel Tests** resultaten (≥2 kanalen, CAC berekend, conversie funnel data)
- [ ] **Unit Economics** berekend (LTV, CAC, LTV/CAC ratio, payback period, churn)
- [ ] **Cohort Analysis** (≥2 cohorten, retention tracking)
- [ ] **NPS/Retention** data uit live klanten (≥20 betalende klanten of extended pilot)
- [ ] **12-maanden P&L** model (revenue, costs, break-even projections)
- [ ] **Growth Projections** (90-dagen plan + 12-maanden forecast)

**Minimaal vereist bewijs:**
- ≥2 acquisition channels getest met CAC data
- LTV/CAC ratio berekend met minimum 3 maanden data
- ≥20 betalende klanten OF extended pilot met WTP commitment
- NPS ≥40 uit live klanten

### Scoring Matrix — Fase 3 (Volledig)

**Alle 8 criteria volledig gescoord.**

| # | Criterium | Gewicht | Score (1-5) | Gewogen Score | Bewijs |
|---|-----------|---------|-------------|---------------|--------|
| 1 | **Problem Validation** | 20% | _____ | _____ | **Bewijs uit Fase 1+2 + live klanten:**<br>- Fase 2 score: _____<br>- Live klant bevestiging: _____/20+ klanten bevestigt probleem<br>- Retention: _____% (maandelijks, target <5%)<br>- Update: _____ |
| 2 | **Solution Fit** | 20% | _____ | _____ | **Bewijs uit live klanten:**<br>- NPS: _____ (target ≥40)<br>- Feature adoption: _____ %<br>- Actief gebruik: _____ x/week<br>- Expansion revenue: _____% van klanten upgraden<br>- Quote: "_____" |
| 3 | **Market Size** | 15% | _____ | _____ | **Bewijs uit Fase 1+2 (validated):**<br>- SOM: €_____ miljoen/jaar<br>- Daadwerkelijke pipeline: €_____ (≥10% van SOM?)<br>- Update: _____ |
| 4 | **Willingness to Pay** | 15% | _____ | _____ | **Bewijs uit betalende klanten:**<br>- Betalende klanten: _____ (≥20)<br>- ARPU (Average Revenue Per User): €_____/maand<br>- Churn rate: _____% (target <5% B2C, <2% B2B)<br>- Payment conversion: _____% (van trial naar paid)<br>- Quote: "_____" |
| 5 | **Competitive Advantage** | 10% | _____ | _____ | **Bewijs uit klant feedback + markt analyse:**<br>- Waarom kiezen klanten voor ons vs. concurrent? "_____"<br>- Duurzaamheid voordeel: patent/netwerk effecten/data/brand?<br>- Churn naar concurrent: _____% (target <10%)<br>- Positioning: _____ |
| 6 | **Channel Viability** | 10% | _____ | _____ | **Bewijs uit channel tests:**<br>- Beste kanaal: _____<br>- CAC (best channel): €_____<br>- LTV/CAC ratio: _____ (target ≥3:1)<br>- Payback period: _____ maanden (target ≤12)<br>- Schaalbaar tot €100K MRR? (ja/nee)<br>- Tweede kanaal CAC: €_____ (diversificatie) |
| 7 | **Team Fit** | 5% | _____ | _____ | **Bewijs:**<br>- Team compleet voor schaal fase? (ja/nee)<br>- Key hires gedaan sinds Fase 2? _____<br>- Missende skills voor schaal: _____<br>- Plan om te verkrijgen: _____ |
| 8 | **Technical Feasibility** | 5% | _____ | _____ | **Bewijs:**<br>- Product stabiel genoeg voor schaal? (ja/nee)<br>- Technische schuld: laag / medium / hoog<br>- Scalability getest? (load tests, etc.)<br>- Infrastructure kosten onder controle? (ja/nee) |
|   | **TOTAAL (Fase 3 weighted)** | **100%** | | **_____** | |

**Berekening gewogen score Fase 3:**
```
Gewogen score = (Criterium 1 × 0.20) + (Criterium 2 × 0.20) + ... + (Criterium 8 × 0.05)
```

### Minimum Thresholds — Fase 3

**Killer criteria (ongeacht totaalscore → NO-GO als niet gehaald):**

| Criterium | Minimum | Bewijs | Gehaald? |
|-----------|---------|--------|----------|
| **Problem Validation** | ≥ 3 | Live klant retention <5% (B2C) of <2% (B2B) | ⬜ Ja / ⬜ Noe |
| **Willingness to Pay** | ≥ 3 | ≥20 betalende klanten + ARPU > €0 | ⬜ Ja / ⬜ Noe |
| **Market Size (SOM)** | > €500K/jaar | Validated + pipeline ≥10% SOM | ⬜ Ja / ⬜ Nee |
| **LTV/CAC Ratio** | ≥ 2:1 | Unit economics analyse | ⬜ Ja / ⬜ Noe |

**Unit economics thresholds (voor investment-ready GO):**
| Metric | Target | Actual | Gehaald? |
|--------|--------|--------|----------|
| **LTV/CAC ratio** | ≥ 3:1 (gezond) | _____ | ⬜ Ja / ⬜ Noe |
| **Payback period** | ≤ 12 maanden | _____ maanden | ⬜ Ja / ⬜ Nee |
| **Gross margin** | ≥ 50% (SaaS) | _____% | ⬜ Ja / ⬜ Noe |
| **Monthly churn** | ≤ 5% (B2C) / ≤ 2% (B2B) | _____% | ⬜ Ja / ⬜ Noe |
| **NPS** | ≥ 40 | _____ | ⬜ Ja / ⬜ Noe |

### Drempelwaarden — Fase 3

| Gewogen Score | Beslissing | Actie |
|--------------|-----------|-------|
| **≥ 4.0** | **GO — SCHAAL** | Product-market fit bereikt. Investeer en schaal:<br>- Funding ronde (indien extern kapitaal nodig)<br>- Hiring plan uitvoeren<br>- Marketing budget opschalen<br>- International expansion overwegen |
| **3.5 - 3.9** | **GO — VOORZICHTIG** | PMF is er, maar niet perfect. Ga door met specifieke verbeteringen:<br>- Optimaliseer kanalen (verlaag CAC)<br>- Verhoog retention (product verbeteringen)<br>- Schaal conservatief (bootstrapping voorkeur) |
| **3.0 - 3.4** | **CONDITIONAL GO** | Bijna PMF, maar kritieke gaten. 8-weken improvement plan:<br>- Fix criteria met score <3<br>- Re-run channel tests<br>- Pricing optimalisatie<br>Re-review na 8 weken. |
| **2.0 - 2.9** | **PIVOT** | Fundamentele issues. Laatste kans pivot:<br>- Niche down (smaller ICP)<br>- Business model pivot (pricing/packaging)<br>- Feature reset (kill 50%, double down op core)<br>8-12 weken voor pivot, dan finale review. |
| **< 2.0** | **NO-GO** | Stop. PMF niet bereikt na 12+ weken validatie. Bewaar alle learnings. Shut down gracefully:<br>- Communiceer met klanten (refunds indien nodig)<br>- Documenteer learnings<br>- Team debrief<br>- Volgende idee |

### Beslissingslogica

```
IF Problem Validation < 3 OR Willingness to Pay < 3 OR LTV/CAC < 2:1 OR Market Size < €500K:
    → NO-GO (killers niet gehaald)

ELSE IF Gewogen Score ≥ 4.0 AND (alle unit economics thresholds gehaald):
    → GO — SCHAAL
    → 90-dagen schaal plan maken
    → Funding/hiring starten

ELSE IF Gewogen Score 3.5-3.9:
    → GO — VOORZICHTIG
    → Identificeer zwakke punten
    → Conservatieve schaal strategie
    → Maandelijkse health checks

ELSE IF Gewogen Score 3.0-3.4:
    → CONDITIONAL GO
    → 8-weken improvement sprint
    → Focus op criteria <3
    → Re-review na 8 weken

ELSE IF Gewogen Score 2.0-2.9:
    → PIVOT (laatste kans)
    → 2-daagse pivot workshop
    → 8-12 weken om pivot te valideren
    → Finale review

ELSE:
    → NO-GO
    → Graceful shutdown
```

---

## 5. Review Meeting Agenda

### Voorbereiding (1 dag voor meeting)

**Individuele voorbereiding (60 min per persoon):**
1. Lees alle evidence documenten (pilot report, analytics, interviews)
2. Vul scoring matrix in (zonder overleg)
3. Noteer per criterium:
   - Score (1-5)
   - Belangrijkste bewijs (bullet points)
   - Twijfels/vragen
4. Sla je matrix op als `go-no-go-scoring-[JOUW NAAM]-fase[X].md`

**Facilitator voorbereiding:**
- Print/deel alle evidence documenten (via gedeelde folder)
- Bereid template scoring matrix voor (Excel/Google Sheets voor live scoring)
- Setup timer (strikte 90 min tijdlimiet)
- Bereid decision tree flowchart voor (visual aid)

---

### Meeting Agenda (90 minuten, strikte tijdlimiet)

#### **DEEL 1: Evidence Review (30 min)**

**Doel:** Align op wat we weten en wat we NIET weten.

**Per criterium (3-4 min):**
1. Facilitator leest criterium voor
2. Team deelt key evidence (round-robin, max 1 min per persoon)
3. Noteer op whiteboard/Miro:
   - ✅ Wat we WETEN (met zekerheid)
   - ❓ Wat we NIET WETEN (gaps in evidence)

**Output:** Evidence overview per criterium (gedeeld document/whiteboard)

---

#### **DEEL 2: Individual Scoring (15 min)**

**Doel:** Onafhankelijke scoring zonder groepsdenken.

**Proces:**
1. Iedereen scoort alle 8 criteria STIL (geen discussie!)
2. Gebruik 1-5 schaal (zie scoring tabel hieronder)
3. Noteer kort bewijs per score (1-2 zinnen)
4. Bereken je gewogen totaal

**Scoring Schaal (reminder):**
| Score | Betekenis | Bewijs |
|-------|-----------|--------|
| **5** | Uitstekend | Sterk, kwantitatief bewijs, hoog vertrouwen (bijv. NPS 60+, LTV/CAC 5:1) |
| **4** | Goed | Consistent positief bewijs uit meerdere bronnen (bijv. NPS 40-60, pilot 80% positief) |
| **3** | Voldoende | Enig positief bewijs, maar niet overtuigend (bijv. NPS 30-40, pilot 60% positief) |
| **2** | Zwak | Anekdotisch, tegenstrijdig bewijs (bijv. NPS 10-30, pilot 50/50) |
| **1** | Onvoldoende | Geen bewijs of negatief bewijs (bijv. NPS <10, pilot negatief) |

**Tools:** Excel/Google Sheets template met formules (gewogen score auto-berekend)

---

#### **DEEL 3: Calibration (30 min)**

**Doel:** Vergelijk scores, bespreek afwijkingen, bepaal consensus.

**Proces:**

1. **Scores delen (5 min)**
   - Iedereen deelt hun totale gewogen score
   - Noteer op whiteboard: [Naam]: [Score]
   - Bereken gemiddelde + range

2. **Afwijkingen bespreken (20 min)**
   - Identificeer criteria met >1 punt verschil tussen teamleden
   - Per afwijking (max 5 min):
     * Hoogste scorer: waarom deze score?
     * Laagste scorer: waarom deze score?
     * Groep: welk bewijs is doorslaggevend?
     * Consensus score bepalen (stem indien nodig)

3. **Final score berekenen (5 min)**
   - Update matrix met consensus scores
   - Bereken finale gewogen totaal
   - Check minimum thresholds (killers)

**Tools:** Shared scoring sheet (live update tijdens meeting)

---

#### **DEEL 4: Decision (15 min)**

**Doel:** Neem beslissing en definieer concrete next steps.

**Proces:**

1. **Decision tree doorlopen (5 min)**
   - Check killers eerst (Problem Validation, WTP, Market Size, LTV/CAC)
   - Indien killers gehaald: kijk naar gewogen score + drempelwaarden
   - Bepaal beslissing: GO / CONDITIONAL GO / PIVOT / NO-GO

2. **Next steps definiëren (10 min)**
   - GO: 90-dagen plan maken (high-level, details later)
   - CONDITIONAL GO: Improvement plan (welke criteria, hoe, deadline)
   - PIVOT: Pivot workshop plannen (2 dagen, binnen 1 week)
   - NO-GO: Shutdown plan + learnings sessie plannen

**Output:**
- Beslissing: [GO / CONDITIONAL GO / PIVOT / NO-GO]
- Top 3 risico's (indien GO/CONDITIONAL)
- Next steps met owners en deadlines
- Meeting notes opslaan: `go-no-go-decision-fase[X]-[DATUM].md`

---

### Facilitatie Tips

**DO:**
- ✅ Strikte tijd bewaken (timer zichtbaar)
- ✅ Evidence-based discussie (geen meningen zonder bewijs)
- ✅ Iedereen laten spreken (round-robin)
- ✅ Afwijkingen bespreken (>1 punt verschil)
- ✅ Besluiten documenteren (wie, wat, wanneer)

**DON'T:**
- ❌ Overslaan van criteria (alle 8 bespreken!)
- ❌ Groepsdenken tijdens individual scoring
- ❌ Discussie zonder tijdslimiet (blijf hangen op 1 criterium)
- ❌ Beslissing uitstellen ("we kijken volgende week nog eens")
- ❌ Sunk cost fallacy ("we hebben al zoveel geïnvesteerd...")

---

## 6. Next Steps Template

### Bij GO Beslissing

**90-Dagen Plan (High-Level)**

```markdown
## 90-Dagen Schaal Plan — Roosevelt OPS

### Week 1-4: Consolidatie
- [ ] Product stabiliseren (bugs fixen, performance optimalisatie)
- [ ] Onboarding proces formaliseren (self-service waar mogelijk)
- [ ] Analytics/monitoring opzetten (dashboards voor health metrics)
- [ ] Eerste 10 betalende klanten onboarden

### Week 5-8: Schaal Voorbereiding
- [ ] Marketing funnel optimaliseren (CAC verlagen met 20%)
- [ ] Sales process documenteren (indien B2B)
- [ ] Hiring plan uitvoeren (eerste 2-3 hires)
- [ ] Funding gesprekken starten (indien extern kapitaal nodig)

### Week 9-12: Initiële Schaal
- [ ] Marketing budget opschalen (2x huidige spend)
- [ ] 50+ betalende klanten target
- [ ] Channel 2 activeren (diversificatie)
- [ ] Product roadmap Q2 plannen obv klant feedback

### Success Metrics (week 12)
- MRR: €_____ (target)
- CAC: €_____ (target ≤ huidige × 0.8)
- Churn: _____% (target ≤ current)
- NPS: _____ (target ≥ 40)
```

---

### Bij CONDITIONAL GO Beslissing

**Improvement Plan Template**

```markdown
## Improvement Plan — Fase [X] CONDITIONAL GO

### Criteria Met Score <3 (Te Verbeteren)

| Criterium | Huidige Score | Target Score | Bewijs Gap | Actie |
|-----------|---------------|--------------|------------|-------|
| [Naam criterium] | [1-2.9] | [≥3] | [Wat ontbreekt?] | [Hoe te verkrijgen?] |
| ... | ... | ... | ... | ... |

### Concrete Acties (4-8 weken)

**Week 1-2:**
- [ ] Actie 1 (owner: _____, deadline: _____)
- [ ] Actie 2 (owner: _____, deadline: _____)

**Week 3-4:**
- [ ] Actie 3 (owner: _____, deadline: _____)
- [ ] Actie 4 (owner: _____, deadline: _____)

**Week 5-8:** (indien 8 weken plan)
- [ ] Actie 5 (owner: _____, deadline: _____)

### Re-Review Meeting
- Datum: [YYYY-MM-DD, 4-8 weken na vandaag]
- Deelnemers: [Zelfde als originele review]
- Pre-work: Nieuwe evidence verzameld, matrix opnieuw ingevuld

### Success Criteria voor Re-Review
- Alle criteria met score <3 → ≥3
- Gewogen totaal ≥ [drempelwaarde voor GO]
```

---

### Bij PIVOT Beslissing

**Pivot Workshop Agenda (2 dagen)**

```markdown
## Pivot Workshop — Roosevelt OPS

### Dag 1: Diagnose (8 uur)

**09:00-10:30: Retrospective**
- Wat werkte WEL in validatie tot nu toe?
- Wat werkte NIET?
- Wat verraste ons?

**10:45-12:30: Root Cause Analysis**
- Waarom faalden we op criterium X?
- Welke aannames waren fout?
- Wat leerden we over de markt/klant?

**13:30-15:00: Pivot Opties Brainstorm**
- Customer segment pivot (andere doelgroep)
- Problem pivot (ander pijnpunt bij zelfde doelgroep)
- Solution pivot (andere aanpak voor zelfde probleem)
- Business model pivot (andere pricing/packaging)
- Technology pivot (andere tech stack/approach)

**15:15-17:00: Pivot Optie Selectie**
- ICE scoring op pivot opties (Impact, Confidence, Ease)
- Top 3 pivot opties selecteren
- Risk/reward analyse per optie

### Dag 2: Strategie (8 uur)

**09:00-10:30: Nieuwe Assumptions**
- Assumption map voor gekozen pivot
- ICE scoring op nieuwe aannames
- Top 10 RAT (Riskiest Assumption to Test)

**10:45-12:30: Experiment Design**
- Hoe testen we nieuwe aannames?
- Welke evidence hebben we nodig?
- Tijdlijn: 8-12 weken validatie

**13:30-15:00: Pivot Plan**
- Week-by-week plan (8-12 weken)
- Resource allocatie (tijd, budget, team)
- Success criteria voor pivot

**15:15-17:00: Go/No-Go Criteria Pivot**
- Welke score moet pivot halen om door te gaan?
- Minimum thresholds voor pivot
- Finale review datum plannen

### Output
- Pivot strategie document
- Nieuwe assumption map
- 8-12 weken experiment plan
- Go/No-Go criteria voor pivot review
```

---

### Bij NO-GO Beslissing

**Shutdown & Learnings Proces**

```markdown
## Graceful Shutdown Plan — Roosevelt OPS

### Week 1: Communicatie

**Klanten (indien van toepassing):**
- [ ] Email naar alle klanten (transparant over beslissing)
- [ ] Refund policy (indien pre-paid klanten)
- [ ] Data export mogelijkheid (AVG compliance)
- [ ] Alternatieve oplossingen aanbevelen (concurrenten)

**Team:**
- [ ] Team meeting: beslissing uitleggen
- [ ] Learnings sessie plannen (retrospective)
- [ ] Outplacement support (indien teamleden fulltime waren)

**Stakeholders:**
- [ ] Investors/adviseurs informeren
- [ ] Transparent shutdown blog post (optioneel, maar aanbevolen voor reputatie)

### Week 2-4: Operationeel

- [ ] Code repository archiveren (GitHub private, backup maken)
- [ ] Klant data verwijderen (AVG compliance, binnen 30 dagen)
- [ ] Subscriptions/services opzeggen (AWS, SaaS tools, etc.)
- [ ] Domain/trademark: parkeren of verkopen
- [ ] Financiële afwikkeling (laatste facturen, refunds)

### Learnings Sessie (halve dag)

**Agenda:**
1. Retrospective (60 min):
   - Wat leerden we over de markt?
   - Wat leerden we over onze aanpak?
   - Welke aannames waren fataal fout?
   - Wat zou je anders doen bij een volgende startup?

2. Documentatie (60 min):
   - Schrijf "What We Learned" document (5-10 pagina's)
   - Sectie's: Market, Customer, Product, Business Model, Team, Process
   - Bewaar in archief voor toekomstige ventures

3. Next Steps (30 min):
   - Volgende idee brainstorm (indien team doorgaat)
   - Career planning (indien team splitst)
   - Network/referenties delen

### Output
- Shutdown completion checklist (afgevinkt)
- "What We Learned" document
- Thank you notes naar supporters (klanten, adviseurs, partners)
```

---

## Appendix A: Scoring Matrix Template (Blank)

Kopieer deze template naar een Google Sheet/Excel voor live scoring tijdens meeting.

```markdown
| # | Criterium | Gewicht | Score Persoon 1 | Score Persoon 2 | Score Persoon 3 | Consensus Score | Gewogen Score | Bewijs |
|---|-----------|---------|-----------------|-----------------|-----------------|-----------------|---------------|--------|
| 1 | Problem Validation | 20% | | | | | | |
| 2 | Solution Fit | 20% | | | | | | |
| 3 | Market Size | 15% | | | | | | |
| 4 | Willingness to Pay | 15% | | | | | | |
| 5 | Competitive Advantage | 10% | | | | | | |
| 6 | Channel Viability | 10% | | | | | | |
| 7 | Team Fit | 5% | | | | | | |
| 8 | Technical Feasibility | 5% | | | | | | |
|   | **TOTAAL** | **100%** | | | | | **_____** | |
```

**Formules (voor Excel/Sheets):**
```
Gewogen Score (rij X) = Consensus Score × Gewicht
Totaal Gewogen Score = SUM(Gewogen Score rij 1-8)
```

---

## Appendix B: Decision Tree Flowchart

```
START: Go/No-Go Review Fase [X]
    │
    ▼
[1] Check Killers
    │
    ├─ Problem Validation < 3? ──YES──> NO-GO (killer)
    ├─ WTP < 2 (Fase 2) of < 3 (Fase 3)? ──YES──> NO-GO (killer)
    ├─ Market Size (SOM) < €500K? ──YES──> NO-GO (killer)
    └─ LTV/CAC < 2:1? (Fase 3 only) ──YES──> NO-GO (killer)
    │
    ▼ (alle killers OK)
    │
[2] Bereken Gewogen Score
    │
    ▼
[3] Check Drempelwaarden
    │
    ├─ Score ≥ 4.0 (Fase 3) of 3.5 (Fase 2) of 3.5 (Fase 1)? ──YES──> GO
    │       │
    │       └──> 90-dagen plan maken
    │
    ├─ Score 3.0-3.9 (Fase 2/3) of 2.5-3.4 (Fase 1)? ──YES──> CONDITIONAL GO
    │       │
    │       └──> Improvement plan (4-8 weken)
    │
    ├─ Score 2.0-2.9? ──YES──> PIVOT
    │       │
    │       └──> Pivot workshop (2 dagen)
    │
    └─ Score < 2.0? ──YES──> NO-GO
            │
            └──> Shutdown plan
```

---

## Volgende Stap

Na afronding van Go/No-Go review:

**Bij GO:** Maak 90-dagen schaal plan (zie template hierboven)
**Bij CONDITIONAL GO:** Vul improvement plan in, plan re-review meeting
**Bij PIVOT:** Plan pivot workshop binnen 1 week
**Bij NO-GO:** Start shutdown proces, plan learnings sessie

**Review eigenaar:** [Naam]
**Fase:** [1 / 2 / 3]
**Review datum:** [YYYY-MM-DD]
**Beslissing:** [GO / CONDITIONAL GO / PIVOT / NO-GO]
