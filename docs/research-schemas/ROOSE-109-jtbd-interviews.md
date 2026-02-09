# ROOSE-109: JTBD Interviews — 10x Ops Managers/Founders

**Plane Issue:** ROOSE-109 (sub van ROOSE-106)
**Type:** Research Schema
**Prioriteit:** High
**Budget:** €750-1.500 (incentives + tools)
**Doorlooptijd:** 4-6 weken

---

## Doel

Voer 10 Jobs-to-be-Done interviews uit met ops managers en SMB founders in Nederland om de onderliggende "jobs" te ontdekken die ze proberen te vervullen met operationele tooling, en de forces die switching behavior bepalen.

---

## Methodologie

### Framework: Switch Interview (Bob Moesta / Chris Spiek)

Het Switch Interview reconstrueert het beslismoment waarop iemand een tool "inhuurde" of "ontsloeg". Focus op de vier krachten:

```
                    PUSH                          PULL
            (Pijn met huidige            (Aantrekkingskracht
             oplossing)                   nieuwe oplossing)
                  │                            │
                  ▼                            ▼
    ┌─────────────────────────────────────────────┐
    │              SWITCHING MOMENT                │
    │         (Beslissing om te veranderen)         │
    └─────────────────────────────────────────────┘
                  ▲                            ▲
                  │                            │
            HABIT                         ANXIETY
        (Gewoonte met                 (Angst voor het
         huidige tool)                 nieuwe/onbekende)
```

### 10-Stappen Interview Protocol (per Bob Moesta)

| Stap | Focus | Voorbeeldvragen |
|------|-------|-----------------|
| 1. **Setting the stage** | Maak het casual | "Dit is geen sales gesprek, ik wil leren hoe jij werkt" |
| 2. **Hun wereld begrijpen** | Context voor de aankoop/switch | "Vertel over hoe je nu operationele metrics bijhoudt" |
| 3. **First thought** | Trigger moment | "Wanneer dacht je voor het eerst: dit moet anders?" |
| 4. **De struggle** | Push away from current | "Wat was het specifieke moment dat het niet meer werkte?" |
| 5. **Alternatieven zoeken** | Consideration set | "Welke oplossingen heb je overwogen?" |
| 6. **Waarom deze keuze** | Pull toward new | "Wat trok je aan in [huidige tool]?" |
| 7. **Eerste ervaring** | Onboarding moment | "Hoe was de eerste week met de nieuwe tool?" |
| 8. **Evolutie van gebruik** | Adoption curve | "Hoe is je gebruik veranderd over tijd?" |
| 9. **Huidige pijnpunten** | Remaining gaps | "Wat mist er nog? Waar loop je tegenaan?" |
| 10. **Forces mapping** | Synthesize | Map antwoorden op Push/Pull/Anxiety/Habit |

---

## Interview Script (B2B Ops Tooling)

### Opening (5 min)

> "Bedankt voor je tijd. Ik doe onderzoek naar hoe bedrijven als [bedrijf] omgaan met operationele metrics en performance tracking. Er zijn geen goede of foute antwoorden — ik wil gewoon begrijpen hoe jij werkt."

### Timeline Reconstructie (30 min)

**Push-vragen (pijn met huidige situatie):**
- "Loop me door een typische week qua operationele rapportage"
- "Wanneer was het laatste moment dat je dacht: dit kost me te veel tijd?"
- "Wat ging er mis door gebrek aan operationeel inzicht?"
- "Hoeveel uur per week besteed je aan handmatige data verzameling?"
- "Wat is het gevolg als een KPI niet op tijd gemeten wordt?"

**Pull-vragen (aantrekkingskracht van nieuw):**
- "Als je morgen een perfecte oplossing had, hoe zou die eruit zien?"
- "Welke functionaliteit zou je overtuigen om te switchen?"
- "Wat voor inzichten zou je willen zien op je dashboard?"
- "Hoe zou je ideale werkdag eruitzien met betere tools?"

**Anxiety-vragen (angst voor verandering):**
- "Wat zou je tegenhouden om een nieuwe tool te proberen?"
- "Welke zorgen heb je bij het overstappen naar een nieuw systeem?"
- "Wat zijn de risico's als de migratie mislukt?"
- "Wie moet er nog meer overtuigd worden?"

**Habit-vragen (gewoonte met huidige):**
- "Wat werkt er wél goed aan je huidige aanpak?"
- "Welke onderdelen van je huidige workflow wil je absoluut behouden?"
- "Hoe lang gebruik je je huidige tools al?"

### Specifieke Ops Context (15 min)

- "Welke metrics track je dagelijks? Wekelijks? Maandelijks?"
- "Gebruik je DORA metrics of vergelijkbare engineering metrics?"
- "Hoe communiceer je operationele performance naar het team/board?"
- "Wat is je ideale reactietijd op een operationeel probleem?"

### Afsluiting (5 min)

- "Als ik je vandaag één tool kon geven, wat zou die moeten doen?"
- "Wie in je netwerk zou ik nog meer moeten spreken?"

---

## Recruitment

### Screening Criteria

| Criterium | Vereiste |
|-----------|---------|
| Rol | Ops manager, COO, CTO, founder met ops verantwoordelijkheid |
| Bedrijfsgrootte | 10-200 medewerkers |
| Locatie | Nederland |
| Beslissingsbevoegdheid | Budget authority voor tools (of directe invloed) |
| Ervaring | Minimaal 1 jaar in huidige rol |

### Recruitment Kanalen

1. **LinkedIn Sales Navigator** — "Operations Manager" OR "COO" + "Netherlands" + company size filter
2. **Persoonlijk netwerk** — Warm introductions (hoogste response rate: 40-60%)
3. **NLdigital / StartupAmsterdam** — Community outreach
4. **Meetups** — Ops/SaaS/Startup events (Meetup.com, Eventbrite)
5. **Cold outreach** — LinkedIn InMail (response rate ~5-10%)

### Outreach Template

> **Subject:** 30 min gesprek over operationele tooling — €75 vergoeding
>
> Hoi [naam],
>
> Ik doe onderzoek naar hoe NL bedrijven operationele metrics bijhouden en welke tools ze daarvoor gebruiken. Ik zoek ops managers/founders die 30-45 minuten willen praten over hun dagelijkse workflow.
>
> Geen sales pitch — puur research. Ter compensatie bied ik €75 of een gratis pilot van ons platform.
>
> Past [dag] of [dag] deze week?

### Incentives

| Optie | Bedrag | Verwacht Response |
|-------|--------|-------------------|
| Cash vergoeding | €75/sessie | 15-25% response |
| Bol.com cadeaubon | €50/sessie | 10-20% response |
| Gratis pilot access | Waarde ~€200 | 5-15% response |
| **Aanbevolen: Cash** | €75 × 10 = **€750** | Hoogste kwaliteit |

---

## Analyse Framework

### Na Elk Interview

1. **Forces Diagram** invullen per respondent
2. **Job Story** formuleren: "When [situatie], I want to [motivatie], so I can [gewenst resultaat]"
3. **Key quotes** vastleggen (verbatim)

### Na Alle Interviews

#### Clustering Methodologie

1. Schrijf alle job stories op post-its/kaarten
2. Cluster op gelijkenis (affinity mapping)
3. Identificeer 3-5 **primaire jobs**
4. Rank per job: frequentie × ernst × willingness-to-pay

#### Job Story Template

```
When [situatie/trigger],
I want to [motivatie/actie],
So I can [gewenst resultaat/progress].

Voorbeeld:
"When ik maandelijks moet rapporteren aan de board,
I want to automatisch een performance overzicht genereren,
So I can mijn voorbereidingstijd van 8 uur naar 30 minuten reduceren."
```

#### Saturatie Check

| Interviews | Verwachte nieuwe inzichten |
|-----------|---------------------------|
| 1-3 | 70% van alle thema's ontdekt |
| 4-6 | 85% ontdekt, patronen zichtbaar |
| 7-9 | 95% ontdekt, saturatie nadert |
| 10+ | <5% nieuwe inzichten per interview |

Research toont aan dat **8-12 interviews** voldoende zijn voor saturatie in B2B JTBD research (Griffin & Hauser, 1993).

---

## Deliverables

1. 10x Interview transcripties/samenvattingen
2. 10x Forces diagrams
3. Geconsolideerde job stories (3-5 primaire jobs)
4. Affinity diagram met alle inzichten
5. Priority matrix: job × frequentie × ernst × WTP
6. Executive summary met top 3 product implicaties

## Referenties

- Bob Moesta & Greg Engle, *Demand-Side Sales 101*
- June.so: [How to Run a JTBD Interview](https://www.june.so/blog/how-to-run-a-jtbd-interview-like-the-co-creator-of-the-framework)
- Forget The Funnel: [JTBD Interview Template](https://forgetthefunnel.com/resources/jobs-to-be-done-interview-questions-email-script)
- Business of Software: [JTBD Interview Guide](https://businessofsoftware.org/jtbd-how-to-be-a-good-interviewer-guide)
