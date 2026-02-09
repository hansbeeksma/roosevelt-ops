# Competitive Analysis — Roosevelt OPS

**Datum:** 2026-02-09
**Versie:** 1.0
**Status:** Concept

---

## 1. Executive Summary

Roosevelt OPS treedt toe tot een gefragmenteerde markt waar enterprise engineering productivity platforms (LinearB, Jellyfish, Faros AI) niet passen voor Nederlandse SMB founders en operationele managers. De markt toont drie duidelijke segmenten:

1. **Enterprise engineering platforms** ($20-45/dev/maand) — te technisch, te duur, focus op developers in plaats van ops managers
2. **Generieke project management tools** (Asana, Monday, ClickUp) — breed maar ondiep, missen operationele metrics en Dutch-first UX
3. **DIY spreadsheets + BI tools** (Metabase, Google Sheets) — flexibel maar niet schaalbaar, geen workflow automation

**Onze positie:** Specialist B2B operations platform voor Nederlandse SMB (10-100 FTE), met focus op ops managers in plaats van developers, tegen €19-29/seat/maand. Competitive moat: NL-first lokalisatie, SMB-geoptimaliseerde onboarding, en gerichte operationele metrics (niet developer productivity).

---

## 2. Concurrenten Overzicht

### 2.1 Direct Concurrenten

#### LinearB
- **Type:** Engineering productivity platform
- **Doelgroep:** Engineering teams 50+ developers
- **Pricing:** ~$20/dev/maand [1]
- **Features:** AI code reviews, DORA metrics, PR automation, workflow automation, developer burnout tracking
- **Strengths:** Diep geïntegreerd met developer tools (GitHub, Jira), sterke workflow automation, proven ROI (19% cycle time reductie eerste jaar) [2]
- **Weaknesses:** Developer-centric (niet ops-centric), enterprise pricing voor SMB, geen NL lokalisatie, complexe onboarding
- **Funding:** Venture-backed (exacte bedragen niet publiek 2026)

#### Jellyfish
- **Type:** Engineering management platform
- **Doelgroep:** Enterprise (100+ engineers)
- **Pricing:** Enterprise (contact sales) [3]
- **Features:** Strategic resource allocation, portfolio-level views, investment tracking, goal alignment, DORA/SPACE framework metrics
- **Strengths:** Enterprise-grade governance, strong alignment features, comprehensive engineering intelligence
- **Weaknesses:** Prohibitief duur voor SMB, overhead voor kleine teams, geen SMB-specifieke features
- **Funding:** Series C, $71M total raised [4]

#### Haystack
- **Type:** Engineering intelligence platform (acquired by OKX Feb 2025)
- **Doelgroep:** Mid-market engineering teams
- **Pricing:** Niet publiek beschikbaar (platform mogelijk discontinued na acquisitie)
- **Features:** Developer experience metrics, workflow analytics, team health tracking
- **Strengths:** Sterke developer experience focus
- **Weaknesses:** **Acquired status = onzekere toekomst**, niet SMB-gericht
- **Status:** Acquired Feb 2025 [5]

#### Faros AI
- **Type:** AI-infused SDLC insights platform
- **Doelgroep:** Enterprise engineering teams
- **Pricing:** Professional vanaf $29/contributor, Enterprise en Ultimate (hogere tiers) [6]
- **Features:** Telemetry-first approach, 100+ tool connectors, Lighthouse AI, productivity benchmarks, accurate org charts
- **Strengths:** AI-driven insights, real-time data, enterprise readiness
- **Weaknesses:** Developer-centric, complex setup, geen SMB focus

#### DX (nu Atlassian)
- **Type:** Developer productivity platform (acquired by Atlassian)
- **Doelgroep:** Enterprise engineering teams
- **Pricing:** Enterprise (contact sales)
- **Features:** Survey-centric developer sentiment, system metrics, developer experience tracking
- **Strengths:** Developer sentiment focus, Atlassian ecosysteem integratie
- **Weaknesses:** Survey-based bias, "nurtures leaders" maar geen actionable recommendations volgens concurrenten [7], acquisition = product roadmap onzeker

#### Sleuth
- **Type:** Software Engineering Intelligence (SEI) platform
- **Doelgroep:** Mid-market engineering teams
- **Pricing:** Niet publiek beschikbaar
- **Features:** Delivery progress tracking, execution quality metrics, alignment tracking, ease of adoption
- **Strengths:** Focus op alignment en goals, delivery progress tracking [8]
- **Weaknesses:** Developer-centric, geen SMB ops focus

#### Pluralsight Flow
- **Type:** Engineering intelligence platform (acquired by Appfire Feb 2025)
- **Doelgroep:** Engineering teams
- **Pricing:** Niet publiek beschikbaar
- **Features:** Cycle time tracking, deployment frequency (DORA), Git + Jira data [9]
- **Strengths:** DORA metrics focus
- **Weaknesses:** **Acquired status**, developer-only focus, geen operationele breadth

### 2.2 Indirect Concurrenten (Substituten)

#### Asana
- **Type:** Work management platform
- **Doelgroep:** Cross-functional teams 10-200 werknemers [10]
- **Pricing:** Personal (free), Starter ($10.99/user/maand), Advanced ($24.99/user/maand), Enterprise (custom) [11]
- **Features:** Universal reporting, goals tracking, workflows automation, 300+ integraties, AI features (paid plans)
- **Strengths:** Breed adoptie, sterke workflow automation, comprehensive integraties, universal reporting
- **Weaknesses:** Generic (niet ops-specific), beperkte operationele metrics in free/starter tiers, reporting complexity voor SMB

#### Monday.com (Monday Work Management)
- **Type:** Work OS platform
- **Doelgroep:** Scaling organizations 100-10,000+ users [12]
- **Pricing:** Individual (free, max 2 seats), Basic ($9/seat/maand), Standard ($12/seat/maand), Pro ($19/seat/maand), Enterprise (custom)
- **Features:** Multi-step automation, cross-board logic, customizable dashboards, 70+ integraties
- **Strengths:** Schaalbaar (100-10k users), sterke automation, flexibel platform
- **Weaknesses:** Prijspunt optimaal voor 100+, complexity overhead voor SMB 10-50, generic vs ops-specific

#### ClickUp
- **Type:** All-in-one work management
- **Doelgroep:** Fast-moving teams, SMB tot mid-market
- **Pricing:** Free, Unlimited ($7/user/maand), Business ($12/user/maand), Enterprise (custom)
- **Features:** Time tracking, workload view, custom fields, automation, 1000+ integraties, real-time reporting [13]
- **Strengths:** Hoge customization, sterk prijspunt, breed feature set
- **Weaknesses:** Complexity kan overweldigen, generic ops metrics, geen NL-first

#### Metabase
- **Type:** Open-source BI/analytics platform
- **Doelgroep:** Tech-savvy teams, self-service analytics
- **Pricing:** Open Source (free), Pro ($500/maand voor 10 users), Enterprise (custom)
- **Features:** Self-service dashboards, SQL query builder, embedding, 90+ data source connectors [14]
- **Strengths:** Open source optie, flexibel, diep analytics
- **Weaknesses:** Requires technical setup, geen workflow automation, geen operationele templates, self-hosting overhead

### 2.3 Potentiële Toetreders

- **Notion AI** — Kan business workspace uitbreiden naar ops metrics
- **Airtable** — Workflow automation richting ops management
- **Microsoft Viva** — Enterprise HR/ops analytics (MSFT ecosysteem)
- **Google Workspace add-ons** — Ops dashboards op basis van Google Sheets/Data Studio

### 2.4 Substituten (Huidige Status Quo)

- **Google Sheets + manual tracking** — 60-70% van SMB in NL [schatting obv marktonderzoek]
- **Email + Slack updates** — Informele ops tracking
- **Combinatie tools** (Jira voor engineering + Asana voor ops + Metabase voor BI) — Fragmented stack

---

## 3. Feature Matrix

| Feature / Platform | Roosevelt OPS | LinearB | Jellyfish | Asana | Monday | ClickUp | Metabase |
|-------------------|:-------------:|:-------:|:---------:|:-----:|:------:|:-------:|:--------:|
| **Dashboard/KPI Tracking** | ✅ Ops-centric | ✅ Dev-centric | ✅ Enterprise | ✅ Generic | ✅ Generic | ✅ Generic | ✅ SQL-based |
| **Workflow Automation** | ✅ SMB-optimized | ✅ Dev workflows | 🔄 Limited | ✅ Strong | ✅ Advanced | ✅ Advanced | ❌ |
| **Slack Integration** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔄 |
| **Jira Integration** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **GitHub Integration** | 🔄 Planned | ✅ Deep | ✅ | 🔄 | 🔄 | 🔄 | 🔄 |
| **HRM System Integration** | ✅ NL-systemen | ❌ | 🔄 | ❌ | 🔄 | 🔄 | 🔄 |
| **Reporting & Analytics** | ✅ Ops metrics | ✅ DORA | ✅ Portfolio | ✅ Universal | ✅ Custom | ✅ Real-time | ✅ Advanced |
| **Team Analytics** | ✅ Ops teams | ✅ Dev teams | ✅ Engineering | 🔄 Generic | 🔄 Generic | 🔄 Generic | 🔄 Custom |
| **AI/ML Capabilities** | 🔄 Roadmap | ✅ AI reviews | ✅ Lighthouse | ✅ Paid plans | 🔄 Limited | 🔄 Limited | ❌ |
| **Self-Serve Onboarding** | ✅ SMB-optimized | 🔄 Complex | ❌ Enterprise | ✅ | ✅ | ✅ | 🔄 Technical |
| **NL/EU Data Compliance** | ✅ GDPR-first | 🔄 US-based | 🔄 US-based | ✅ EU regions | ✅ EU regions | ✅ EU regions | ✅ Self-hosted |
| **Dutch Localization** | ✅ Native | ❌ | ❌ | 🔄 Partial | 🔄 Partial | 🔄 Partial | ❌ |
| **Target Bedrijfsgrootte** | 10-100 FTE | 50+ devs | 100+ engineers | 10-200 | 100-10k | 10-500 | Tech teams |
| **Prijs (€/seat/maand)** | €19-29 | ~€18 (~$20) | Contact | €9-22 | €8-17 | €6-11 | €0-50+ |
| **Freemium Tier** | ✅ Planned | 🔄 Limited | ❌ | ✅ | ✅ | ✅ | ✅ OSS |

**Legenda:**
- ✅ Volledig ondersteund / sterke feature
- 🔄 Gedeeltelijk / in ontwikkeling / beperkt
- ❌ Niet ondersteund / zwakte

---

## 4. Positioning Map

```
                    Enterprise-Focus
                          │
                          │
        Jellyfish ●       │
                          │
        LinearB ●         │       ● Faros AI
                          │
    DX (Atlassian) ●      │
                          │
        Sleuth ●          │
─────────────────────────┼─────────────────────────
Niche/Specialist         │         Breed Platform
        ●                 │
    Roosevelt OPS         │       ● Asana
                          │       ● Monday
                          │       ● ClickUp
                          │
                          │       ● Metabase (DIY)
                          │
                          │
                     SMB-Focus
```

**Positionering analyse:**

- **Kwadrant 1 (Niche/Enterprise):** LinearB, Jellyfish, Faros AI, DX — specialist platforms voor grote engineering orgs, hoge prijs, dev-centric
- **Kwadrant 2 (Breed/Enterprise):** Geen duidelijke spelers (gap)
- **Kwadrant 3 (Breed/SMB):** Asana, Monday, ClickUp — generieke work management, breed maar ondiep voor ops
- **Kwadrant 4 (Niche/SMB):** **Roosevelt OPS** — specialist ops platform voor SMB, NL-first

**Whitespace opportunity:** Roosevelt OPS bezet de lege niche van **specialist operations platforms voor SMB** met focus op Nederlandse markt en ops managers (niet developers).

---

## 5. Competitive Moat Assessment

### 5.1 Mogelijke Moats voor Roosevelt OPS

| Moat Type | Sterkte | Implementatie | Tijdshorizon |
|-----------|---------|---------------|--------------|
| **Network Effects** | 🔄 Medium | User-generated benchmarks, industry metrics, best practices library | 18-24 maanden |
| **Switching Costs** | ✅ Hoog | Data migration complexity, workflow integraties, team training | 6-12 maanden |
| **Data Moat** | ✅ Medium-Hoog | NL SMB operations benchmarks, sector-specific KPIs | 12-18 maanden |
| **Brand/Lokalisatie** | ✅ Hoog | Dutch-first UX, NL customer support, local compliance | Vanaf dag 1 |
| **Ecosystem Lock-in** | 🔄 Medium | NL HRM integraties (AFAS, Visma, Exact), NL accounting systems | 9-15 maanden |
| **Cost Structure** | ✅ Hoog | SMB-optimized pricing vs enterprise platforms | Vanaf dag 1 |

**Sterkste moats:**
1. **Dutch-first lokalisatie** — Geen enkele concurrent biedt native NL UX + support + compliance
2. **SMB-optimized cost structure** — €19-29 vs $20-45 enterprise pricing (50-60% goedkoper)
3. **Switching costs** — Na 6-12 maanden gebruik: data, workflows, team adoption = hoog

**Zwakste moats (te ontwikkelen):**
1. **Network effects** — Vereist critical mass (500+ klanten voor betekenisvolle benchmarks)
2. **Ecosystem lock-in** — NL HRM/accounting integraties bouwen duurt 9-15 maanden

### 5.2 Concurrenten Moats

**LinearB:**
- Ecosystem lock-in (GitHub, Jira, GitLab deep integraties)
- Data moat (developer productivity benchmarks van 1000+ orgs)
- Brand (bekende naam in enterprise dev productivity)

**Jellyfish:**
- Enterprise sales relationships
- DORA/SPACE framework thought leadership
- Data moat (portfolio-level engineering metrics)

**Asana/Monday:**
- Massive network effects (miljoenen gebruikers)
- Ecosystem (1000+ integraties)
- Brand recognition
- Switching costs (teams van 100+ users)

---

## 6. Competitive Response Plan

### Scenario 1: Asana/Monday lanceert "Ops voor SMB" feature set

**Waarschijnlijkheid:** Medium (12-24 maanden)

**Response:**
1. **Differentiatie versterken:** Focus op NL-first (taal, support, lokale integraties) die zij niet kunnen/willen matchen
2. **Snelheid:** Launch SMB-specifieke templates en workflows voordat zij het doen
3. **Community:** Bouw NL SMB ops manager community (netwerk voordeel dat zij niet hebben)
4. **Pricing:** Blijf onder hun €12-22/seat pricing met €19-29 (betere value for SMB)

**Escape routes:**
- Pivot naar vertical niches (bv. healthcare ops, retail ops) waar generieke platforms te breed zijn
- White-label platform voor NL consultancies/adviseurs

### Scenario 2: Enterprise platforms (LinearB/Jellyfish) introduceren SMB tier

**Waarschijnlijkheid:** Laag (enterprise DNA, cannibalisatie risico)

**Response:**
1. **SMB focus behouden:** Zij kunnen niet zonder enterprise overhead/complexity — onze simpliciteit is competitive advantage
2. **Snellere innovatie:** Zij hebben lange sales cycles, wij kunnen sneller itereren
3. **Lokalisatie:** Zij zullen NL markt niet prioriteren (te klein vs VS/UK)

**Escape routes:**
- Partner met hen (white-label voor EMEA SMB segment)
- Niche down naar specifieke ops use cases (supply chain ops, customer success ops)

### Scenario 3: Nieuwe NL startup target zelfde segment

**Waarschijnlijkheid:** Medium-Hoog (lage barriers to entry voor MVP)

**Response:**
1. **First-mover advantage:** Snelle GTM, klanten binnen 6-9 maanden (switching costs opbouwen)
2. **Feature velocity:** Sneller itereren op basis van klant feedback
3. **Partnerships:** Lock in strategic partnerships (NL HRM vendors, accounting platforms)
4. **Community:** Bouw ops manager community die moeilijk te repliceren is

**Escape routes:**
- Acquisitie door enterprise platform (exit)
- Merge met concurrent (consolidatie)

### Scenario 4: DIY blijft dominant (spreadsheets + Metabase)

**Waarschijnlijkheid:** Hoog (status quo bias)

**Response:**
1. **Migration templates:** Maak overstap van spreadsheets zo makkelijk mogelijk (import wizards)
2. **ROI calculator:** Toon cost of manual tracking (tijd, fouten, missed insights)
3. **Freemium aggressive:** Free tier moet beter zijn dan spreadsheets
4. **Education:** Content marketing over "spreadsheet hell" en alternatieven

**Escape routes:**
- Add-on/plugin voor Google Sheets (trojan horse strategie)
- Consultancy-led sales (adviseurs verkopen platform als onderdeel van ops optimalisatie)

---

## 7. Positioneringsstatement

**Template:**
> Voor [doelgroep] die [behoefte] hebben, is Roosevelt OPS een [categorie] dat [key benefit]. In tegenstelling tot [concurrenten], [unieke differentiator].

**Roosevelt OPS Positionering:**

> Voor **Nederlandse SMB founders en operations managers (bedrijven 10-100 FTE)** die **operationele chaos willen vervangen door gestructureerde metrics en workflows**, is Roosevelt OPS een **operationeel intelligence platform** dat **realtime inzicht geeft in team performance, workflow bottlenecks, en bedrijfsvoering KPIs zonder developer-jargon of enterprise complexity**. In tegenstelling tot **enterprise engineering platforms zoals LinearB en Jellyfish (te technisch, te duur)** en **generieke project management tools zoals Asana en Monday (breed maar ondiep)**, biedt Roosevelt OPS een **Nederlands-first, SMB-geoptimaliseerde oplossing met focus op operationele managers in plaats van developers, tegen 50-60% lagere kosten (€19-29 vs $20-45/seat)**.

**Alternatieve korte versie:**
> Roosevelt OPS is het **enige operationele intelligence platform gebouwd specifiek voor Nederlandse SMB founders en ops managers**. Waar enterprise platforms te complex en duur zijn, en generieke tools te breed en ondiep, bieden wij **specialist ops metrics, Dutch-first UX, en SMB-vriendelijke pricing** (€19-29/seat).

---

## 8. Bronnen

[1] CodePulse (2025-01-15). "Jellyfish vs LinearB vs Swarmia: Full 2026 Comparison". https://codepulsehq.com/guides/engineering-analytics-tools-comparison

[2] LinearB (2025). "The AI productivity platform for engineering leaders". https://linearb.io/

[3] Jellyfish (2025-11-21). "The Intelligence Platform for AI-Integrated Engineering". https://jellyfish.co/

[4] Jellyfish funding information from Crunchbase and public sources (2024-2025).

[5] Jellyfish Blog (2025-12-13). "9 Best Pluralsight Flow Alternatives for Engineering Leaders in 2026". https://jellyfish.co/blog/pluralsight-flow-alternatives-competitors/

[6] Faros AI (2025). "Pricing - AI-Infused SDLC Insights for Your Organization". https://www.faros.ai/pricing

[7] Faros AI (2025). "Faros AI vs. DX: The Enterprise Choice for 2026". https://www.faros.ai/compare/faros-vs-dx

[8] Sleuth (2025-03-06). "Sleuth vs. LinearB vs. Jellyfish". https://www.sleuth.io/post/sleuth-jellyfish-linearb/

[9] Jellyfish Blog (2025-12-13). Pluralsight Flow details. https://jellyfish.co/blog/pluralsight-flow-alternatives-competitors/

[10] Deliberate Directions (2024-07-04). "Best Project Management Tools for SMB Teams". https://deliberatedirections.com/best-project-management-tools/

[11] ChartMogul (2025). "Asana Pricing - Repository". https://www.chargebee.com/pricing-repository/asana/

[12] Monday.com Blog (2026-01-30). "ClickUp vs Asana vs Monday Work Management Comparison 2027". https://monday.com/blog/project-management/clickup-vs-asana-vs-monday-work-management/

[13] Project Management (2023-01-31). "ClickUp Software: Overview – Features – Pricing". https://project-management.com/clickup-software-review/

[14] Metabase (2025). "Dashboards that actually get used. Insights, explained. Data your whole team can act on". https://www.metabase.com/features/analytics-dashboards

[15] Getmonetizely (2025-08-04). "Which is More Cost-Effective for Your Team: Linear vs Asana vs Monday Pricing Comparison". https://www.getmonetizely.com/articles/which-is-more-cost-effective-for-your-team-linear-vs-asana-vs-monday-pricing-comparison

[16] Getmonetizely (2025-12-22). "SaaS Pricing Benchmark Study 2025: Key Insights from 100+ Companies Analyzed". https://www.getmonetizely.com/articles/saas-pricing-benchmark-study-2025-key-insights-from-100-companies-analyzed

[17] Artisan Growth Strategies (2025-01-01). "B2B SaaS Pricing Models: Complete 2025 Guide". https://www.artisangrowthstrategies.com/blog/b2b-saas-pricing-models-complete-2025-guide

[18] Linear (2020-12-03). "Pricing". https://linear.app/pricing

[19] ChartMogul (2025). "A guide to SaaS pricing models". https://chartmogul.com/blog/saas-pricing-models/

[20] Asana (2025-03-28). "Choosing a Universal Reporting Tool for Team Leads [2025]". https://asana.com/nl/resources/reporting-tools

---

## 9. Volgende Stappen

1. **Valideer pricing positioning** — €19-29/seat testen met early access prospects
2. **Diepte-analyse top 3 concurrenten** — LinearB, Asana, Monday (feature teardown, user reviews, churn redenen)
3. **NL markt sizing** — Hoeveel SMB (10-100 FTE) in NL target sectors (SaaS, retail, healthcare)
4. **Differentiatie roadmap** — Welke features maken ons **onmisbaar** vs alternatieven binnen 12 maanden?
5. **Competitive monitoring setup** — Tooling om concurrent pricing, features, funding te tracken (Crunchbase, G2, ProductHunt)

---

*Laatste update: 2026-02-09*
*Volgende review: Q2 2026 (na eerste 10 pilot klanten)*
