# ROOSE-111: Market Sizing — NL SMB Ops Tooling (TAM/SAM/SOM)

**Plane Issue:** ROOSE-111 (sub van ROOSE-106)
**Type:** Research Schema
**Prioriteit:** Medium
**Budget:** €0-200 (data abonnementen)
**Doorlooptijd:** 1-2 weken

---

## Doel

Bereken TAM, SAM en SOM voor Roosevelt OPS als B2B ops tooling platform gericht op Nederlandse SMBs (10-200 medewerkers). Onderbouw met data van CBS, KVK en industry reports.

---

## Methodologie

### Twee Benaderingen (parallel uitvoeren)

| Methode | Aanpak | Betrouwbaarheid |
|---------|--------|-----------------|
| **Top-Down** | NL SaaS markt → segment → penetratie | Indicatief |
| **Bottom-Up** | Aantal target bedrijven × ARPU × conversie | Nauwkeuriger |

---

## Top-Down Sizing

### Stap 1: Nederlandse SaaS Markt

| Metric | Waarde | Bron |
|--------|--------|------|
| NL SaaS markt 2025 | ~€7 miljard | Statista |
| B2B aandeel | ~70% = **€4.9 miljard** | Statista |
| Ops/Infrastructure tooling segment | ~8-12% van B2B SaaS | Gartner |
| **TAM (NL Ops Tooling)** | **€390-590 miljoen** | Berekend |

### Stap 2: SMB Segment

| Filter | Waarde | Bron |
|--------|--------|------|
| SMB aandeel NL B2B SaaS | ~35% | McKinsey Digital |
| SMB Ops Tooling TAM | **€137-207 miljoen** | Berekend |

### Stap 3: Adresseerbaar (SAM)

| Filter | Reductie | Bron |
|--------|----------|------|
| Bedrijven 10-200 FTE (niet micro) | 60% | CBS |
| Tech-forward sectoren (IT, Prof Services, E-com) | 40% | Sector analyse |
| **SAM** | **€33-50 miljoen** | Berekend |

---

## Bottom-Up Sizing (nauwkeuriger)

### Stap 1: Target Bedrijven Tellen

| Criterium | Aantal | Bron |
|-----------|--------|------|
| NL bedrijven totaal | ~2.3 miljoen | KVK 2024 |
| Bedrijven 10-49 werknemers | ~65.000 | CBS StatLine |
| Bedrijven 50-199 werknemers | ~12.000 | CBS StatLine |
| **Subtotaal 10-199 werknemers** | **~77.000** | CBS |
| Tech-forward sectoren filter (40%) | **~30.800** | Sector analyse |
| Bedrijven die actief metrics tracken | **~15.400** (50%) | Schatting |

### Stap 2: ARPU Berekening

| Tier | Prijspunt/mo | Target Segment |
|------|-------------|----------------|
| Starter (10-25 FTE) | €49/mo = €588/jaar | 60% van target |
| Growth (25-100 FTE) | €149/mo = €1.788/jaar | 30% van target |
| Scale (100-200 FTE) | €299/mo = €3.588/jaar | 10% van target |
| **Weighted Average ARPU** | **€1.128/jaar** | Berekend |

### Stap 3: TAM/SAM/SOM

| Metric | Berekening | Resultaat |
|--------|-----------|-----------|
| **TAM** | 15.400 × €1.128 | **€17.4 miljoen** |
| **SAM** (30% awareness + fit) | 4.620 × €1.128 | **€5.2 miljoen** |
| **SOM** (Y1: 2% conversie) | 308 × €1.128 | **€347K** |
| **SOM** (Y3: 5% conversie) | 770 × €1.128 | **€869K** |

---

## Data Bronnen

### Primaire Bronnen (gratis)

| Bron | URL | Data |
|------|-----|------|
| CBS StatLine | opendata.cbs.nl | Bedrijven per grootteklasse, sector |
| KVK | kvk.nl/ook-interessant/feiten-en-cijfers | Nieuw opgerichte bedrijven, sectoren |
| CBS Businesses | cbs.nl/en-gb/participants-survey/businesses | Bedrijfsenquête data |

### Secundaire Bronnen (betaald/beperkt)

| Bron | Kosten | Data |
|------|--------|------|
| Statista | €39-199/mo | SaaS marktdata NL |
| Techleap State of Dutch Tech | Gratis rapport | NL tech ecosystem stats |
| Gartner | Enterprise license | IT spending by segment |
| Forrester | Enterprise license | B2B SaaS trends |

### Vergelijkbare Markten (voor validatie)

| Markt | SaaS penetratie | Relevantie |
|-------|-----------------|------------|
| UK | ~15% van SMBs gebruikt ops tooling | Benchmark |
| Duitsland | ~10% (Mittelstand conservatiever) | Conservative benchmark |
| Nordics | ~20% (tech-forward) | Optimistic benchmark |
| **NL (schatting)** | **~12-15%** | Tussen UK en Nordics |

---

## Concurrentie Landscape

| Concurrent | Segment | Pricing | NL Presence |
|-----------|---------|---------|-------------|
| Datadog | Enterprise | $15-23/host/mo | Sterk |
| Grafana Cloud | Dev teams | Free-$29/user/mo | Medium |
| New Relic | Enterprise | $0.30/GB/mo | Medium |
| Notion + Spreadsheets | SMB (DIY) | €8-15/user/mo | Sterk |
| Jira + Confluence | SMB-Enterprise | $7.75/user/mo | Sterk |
| **Gap: Ops-specifiek voor SMBs** | **Geen dominante speler** | **Roosevelt OPS kans** | - |

---

## Presentatie Format

### Voor Investeerders/Stakeholders

```
┌─────────────────────────────────────────────┐
│          MARKET SIZING SUMMARY              │
├─────────────────────────────────────────────┤
│                                             │
│  TAM (NL Ops Tooling SMB)     €17.4M        │
│  SAM (Aware + Fit)            €5.2M         │
│  SOM Year 1 (2% conv.)       €347K          │
│  SOM Year 3 (5% conv.)       €869K          │
│                                             │
│  Target Customers:  15,400 NL SMBs          │
│  Avg ARPU:          €1,128/jaar             │
│  Growth Rate:       ~15% CAGR (ops SaaS)    │
│                                             │
└─────────────────────────────────────────────┘
```

### Veelgemaakte Fouten

| Fout | Impact | Vermijden |
|------|--------|-----------|
| TAM = totale SaaS markt | 100x overschatting | Altijd segmenteren |
| Conversie overschatten | Unrealistisch SOM | Max 2% Y1 voor nieuwe B2B SaaS |
| Statische markt aannemen | Mist groei | Gebruik CAGR (15-20% voor ops SaaS) |
| Churn negeren | Netto overschat | Net revenue = nieuwe − churn |
| Single pricing tier | ARPU te laag/hoog | Weighted average per segment |

---

## Deliverables

1. Market sizing spreadsheet (top-down + bottom-up)
2. Executive summary (1 pager)
3. Concurrentie landscape matrix
4. CBS/KVK data extractie
5. Vergelijking met UK/DE/Nordics markten

## Referenties

- CBS StatLine: opendata.cbs.nl
- KVK Cijfers: kvk.nl
- Statista: [NL SaaS Market Forecast](https://www.statista.com/outlook/tmo/public-cloud/software-as-a-service/netherlands)
- Techleap: [State of Dutch Tech 2024](https://techleap.nl/report/state-of-dutch-tech-report-2024/)
