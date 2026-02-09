# ROOSE-112: Pilot Program Design — 4 Weken, 3-5 Bedrijven

**Plane Issue:** ROOSE-112 (sub van ROOSE-106)
**Type:** Research Schema
**Prioriteit:** High
**Budget:** €500-2.000 (onboarding support + tooling)
**Doorlooptijd:** 2 weken design + 4 weken execution

---

## Doel

Ontwerp een gestructureerd pilot program voor Roosevelt OPS met 3-5 NL SMBs. Doel: valideer product-market fit, verzamel usage data, en converteer pilots naar betalende klanten.

---

## Pilot Design Principes

### Kernbeslissingen

| Beslissing | Aanbeveling | Rationale |
|-----------|-------------|-----------|
| **Betaald vs. gratis** | Betaald (€1-49/mo) | Gratis pilots converteren zelden; betaling = commitment |
| **Duur** | 4 weken (30 dagen) | B2B minimum voor meaningful data; langer dan 6 weken verliest urgentie |
| **Aantal bedrijven** | 3-5 | Genoeg voor patronen, beheersbaar voor hands-on support |
| **Ondersteuning** | High-touch (white-glove) | Maximaal leren, niet schalen |
| **Scope** | Core feature set only | Focus op kernwaarde, niet alle features |

---

## Pre-Pilot Checklist

### Must-Haves voor Launch

| Categorie | Item | Status |
|-----------|------|--------|
| **Product** | Core dashboard functioneel | [ ] |
| **Product** | Data import/integratie werkend (min. 1 bron) | [ ] |
| **Product** | Basic onboarding flow | [ ] |
| **Metrics** | Analytics/tracking geïmplementeerd | [ ] |
| **Legal** | Pilot agreement/Terms of Service | [ ] |
| **Legal** | Data Processing Agreement (AVG/GDPR) | [ ] |
| **Support** | Dedicated Slack/Teams channel per pilot | [ ] |
| **Support** | Wekelijkse check-in afspraken ingepland | [ ] |

### Pilot Agreement Template

Kernpunten:
- Duur: 30 dagen vanaf activatie
- Prijs: €[1-49]/maand (symboolprijs)
- Verwachting: minimaal 3x/week inloggen
- Feedback: wekelijks 15 min check-in + exit interview
- Data: wordt verwijderd na pilot tenzij conversie
- Conversie: automatische overgang naar betaald plan na pilot

---

## Pilot Structuur (4 Weken)

### Week 0: Onboarding (dag -7 tot dag 0)

| Dag | Activiteit | Verantwoordelijk |
|-----|-----------|------------------|
| -7 | Pilot agreement getekend | Beide |
| -5 | Account aangemaakt, data import gestart | Roosevelt OPS |
| -3 | Onboarding call (45 min) | Roosevelt OPS |
| -1 | Eerste dashboard geconfigureerd | Samen |
| 0 | **Pilot start** | - |

### Week 1: Activatie

| Metric | Target | Meting |
|--------|--------|--------|
| Eerste login | 100% dag 1 | Analytics |
| Dashboard bekeken | 100% dag 1-2 | Analytics |
| Eerste custom metric toegevoegd | 80% dag 3-5 | Analytics |
| Check-in call | 15 min | Calendly |

**Focus:** Zorg dat elke pilot gebruiker de kernwaarde ervaart in de eerste 3 dagen.

### Week 2: Engagement

| Metric | Target | Meting |
|--------|--------|--------|
| Inlogfrequentie | ≥3x/week | Analytics |
| Features gebruikt | ≥3 core features | Analytics |
| Data bronnen verbonden | ≥2 | Analytics |
| Feedback verzameld | Kwalitatief | Check-in |

**Focus:** Verdiep gebruik, identificeer friction points.

### Week 3: Value Realization

| Metric | Target | Meting |
|--------|--------|--------|
| "Aha moment" bereikt | 80% | Kwalitatief |
| Tijd bespaard vs. oude workflow | Meetbaar | Survey |
| Interne delen (collega uitgenodigd) | 40% | Analytics |
| Feature requests | Documenteer | Check-in |

**Focus:** Bewijs meetbare waarde die pilot kan rapporteren aan decision maker.

### Week 4: Evaluatie & Conversie

| Metric | Target | Meting |
|--------|--------|--------|
| NPS score | ≥40 | Survey (ROOSE-113) |
| Sean Ellis test | ≥40% "very disappointed" | Survey |
| Conversie intentie | ≥60% | Direct vragen |
| Exit interview | 100% | 30 min call |

**Focus:** Conversiebeslissing faciliteren, niet forceren.

---

## KPIs voor Pilot Succes

### Primary Success Metrics

| KPI | Minimum | Goed | Excellent |
|-----|---------|------|-----------|
| **Pilot → Paid conversie** | 40% | 60% | 80% |
| **Weekly active usage** | 2x/week | 3x/week | 5x/week |
| **NPS** | 30 | 40 | 50+ |
| **Sean Ellis ("very disappointed")** | 30% | 40% | 50%+ |
| **Time-to-value** | <7 dagen | <3 dagen | <1 dag |

### Secondary Metrics

| KPI | Meting |
|-----|--------|
| Feature adoption breadth | Unieke features gebruikt |
| Session duration | Gemiddelde sessieduur |
| Data freshness | Hoe vaak data geüpdatet |
| Support tickets | Aantal en type |
| Organic expansion | Collega's uitgenodigd |

---

## Pilot Recruitment

### Ideale Pilot Kandidaat

| Criterium | Gewicht | Rationale |
|-----------|---------|-----------|
| Bedrijfsgrootte 20-100 FTE | Must-have | Sweet spot voor ops tooling |
| Actief meerdere tools gebruikend | Must-have | Heeft consolidatie-behoefte |
| Budget authority bij contact | Must-have | Kan conversie beslissing nemen |
| Tech-forward sector | Nice-to-have | Hogere adoptie kans |
| Bereid tot wekelijkse feedback | Must-have | Data kwaliteit |

### Recruitment Funnel

```
Outreach (50 bedrijven)
    │ 20% response
    ▼
Screening call (10 bedrijven)
    │ 50% kwalificeren
    ▼
Pilot agreement (5 bedrijven)
    │ 80% starten
    ▼
Active pilots (4 bedrijven)
    │ 60% converteren
    ▼
Betalende klanten (2-3)
```

---

## Deliverables

1. Pilot program playbook (dit document, verfijnd)
2. Pilot agreement template (juridisch gereviewed)
3. Onboarding checklist per pilot
4. Weekly check-in template
5. Exit interview script
6. Conversion proposal template

## Referenties

- Headway.io: [How to Run a Software Pilot Program](https://www.headway.io/blog/how-to-run-a-software-pilot-program-b2b-dos-and-donts)
- Medium: [B2B SaaS Pilots: A Disciplined Approach](https://medium.com/@dipam.iitm/b2b-saas-pilots-a-disciplined-approach-d586e912063a)
- Federico Presicci: [Pilot Plan Template](https://federicopresicci.com/resources/pilot-plan-template/)
