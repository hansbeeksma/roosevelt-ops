# Pricing & Unit Economics — Roosevelt OPS

**Datum:** 9 februari 2026
**Status:** Concept
**Versie:** 1.0

---

## 1. Executive Summary

Roosevelt OPS richt zich op de Nederlandse SMB-markt (10-100 FTE) met een **hybrid pricing model** dat per-seat pricing combineert met usage-based componenten. Op basis van competitive benchmarks, marktanalyse en SaaS best practices bevelen we aan:

**Aanbevolen Pricing:**
- **Free Tier:** Tot 3 gebruikers, basis dashboards, 30 dagen data retentie
- **Starter:** €19/seat/maand (jaarlijks €16/seat) — voor kleine teams (10-30 FTE)
- **Professional:** €35/seat/maand (jaarlijks €29/seat) — voor groeiende bedrijven (30-70 FTE)
- **Business:** €59/seat/maand (jaarlijks €49/seat) — voor gevestigde SMB (70-100 FTE)

**Unit Economics Targets:**
- **LTV/CAC ratio:** 3,5:1 (boven benchmark 3:1)
- **Payback period:** 10-12 maanden (binnen SMB benchmark 12 maanden)
- **Gross margin:** 75-80% (SaaS standard)
- **NRR:** 110-115% (seat expansion + tier upgrades)
- **Monthly churn:** 3-4% (lager dan SMB benchmark 5%)

**Jaar 1 Revenue Target:** €350-500K MRR (50-70 klanten, blended ARPU €5.400-7.200/jaar)

---

## 2. Pricing Model Analyse

### 2.1 Model Vergelijking

| Model | Voordelen | Nadelen | Toepasbaarheid Roosevelt OPS |
|-------|-----------|---------|------------------------------|
| **Per-Seat (traditioneel)** | Voorspelbaar, simpel, makkelijk verkopen | Groei penalty (meer seats = duurder), limiteert adoptie binnen org | ⚠️ Basis, maar niet standalone |
| **Usage-Based** | Fair pricing (pay what je gebruikt), natuurlijke expansie | Onvoorspelbaar voor klant, complex billing, late value realisatie | ✅ Add-on voor API calls, workflows |
| **Flat-Rate** | Ultiem simpel, geen seat limits | Lastig schalen, laat revenue op tafel (bij grote teams) | ❌ Te simplistisch voor SMB growth |
| **Hybrid (Per-Seat + Usage)** | Balans tussen voorspelbaarheid en fairness, meerdere expansie routes | Complexer te communiceren, vereist goede dashboards | ✅✅ **AANBEVOLEN** |

**Markttrend (2025-2026):**
- 61% van SaaS bedrijven gebruikt nu hybrid pricing (stijging van 49% in 2024)[1][2]
- 43% combineert subscriptions met usage-based componenten[1]
- Bedrijven met hybrid models rapporteren **38% hogere revenue growth**[1]
- Per-seat dominance daalt: 57% gebruikt dit als primary model (van 64% in 2024)[1]

**Conclusie:** Hybrid model (per-seat basis + usage-based add-ons) biedt beste balans voor SMB operations tools.

### 2.2 Aanbevolen Pricing Structuur

#### Free Tier: "Foundation"

**Doel:** Product-led growth activation, self-serve onboarding, viral loop

**Inclusief:**
- ✅ Tot **3 gebruikers**
- ✅ Basis KPI dashboards (max 5 custom KPIs)
- ✅ 30 dagen data retentie
- ✅ Slack notificaties (basis)
- ✅ 1 workspace
- ❌ Geen workflow automation
- ❌ Geen advanced analytics
- ❌ Geen API access

**Rationale:**
- 3 gebruikers = founder + 2 ops leads (typisch decision making unit in SMB 10-25 FTE)
- Voldoende om waarde te ervaren, maar limiet dwingt upgrade bij team groei
- 30 dagen retentie = proof of concept mogelijk, maar niet voor historische analyse
- Benchmark: 2-5% freemium-to-paid conversie[3][4], target 4-6% door NL-first UX + founder network

#### Starter Tier: €19/seat/maand (€228/seat/jaar)

**Doelgroep:** Kleine teams 10-30 FTE, 5-8 actieve gebruikers

**Jaarlijks:** €16/seat/maand (€192/seat/jaar) — **16% korting**

**Inclusief:**
- ✅ Onbeperkt gebruikers
- ✅ Custom KPIs (max 25)
- ✅ 12 maanden data retentie
- ✅ Slack + email automation (basis templates)
- ✅ Multiple workspaces (max 3)
- ✅ Standard support (email, 48u response)
- ✅ 100 workflow automation runs/maand
- ❌ Geen API access
- ❌ Geen custom integrations
- ❌ Geen SSO

**Blended ARPU:** 6 gebruikers × €19 = **€114/maand** (€1.368/jaar bij maandelijks)

**Competitive Positioning:**
- Asana Starter: $10,99/user (€10/user)[5]
- Monday Basic: €9/seat[6]
- ClickUp Unlimited: $7/user (€6,50/user)[7]
- **Roosevelt Starter: €19/seat** — premium vs generics, maar **50% goedkoper dan enterprise platforms**

#### Professional Tier: €35/seat/maand (€420/seat/jaar)

**Doelgroep:** Groeiende bedrijven 30-70 FTE, 10-15 actieve gebruikers

**Jaarlijks:** €29/seat/maand (€348/seat/jaar) — **17% korting**

**Inclusief:**
- ✅ Alles van Starter
- ✅ Unlimited custom KPIs
- ✅ 36 maanden data retentie
- ✅ Advanced workflow automation (unlimited runs)
- ✅ Custom integrations (Zapier, webhooks)
- ✅ Priority support (chat, 24u response)
- ✅ Advanced analytics (predictive trends, anomaly detection)
- ✅ Multiple workspaces (unlimited)
- ✅ Role-based access control (RBAC)
- ✅ API access (10.000 calls/maand included, daarna €0,01/call)
- ❌ Geen SSO (SAML)
- ❌ Geen dedicated account manager

**Blended ARPU:** 12 gebruikers × €35 = **€420/maand** (€5.040/jaar bij maandelijks)

**Competitive Positioning:**
- Asana Advanced: $24,99/user (€23/user)[5]
- Monday Standard: €12/seat[6]
- Monday Pro: €19/seat[6]
- **Roosevelt Professional: €35/seat** — premium voor ops-specific features + NL compliance

**Decoy Effect:** Professional tier is "sweet spot" — beste value for money, meeste conversies verwacht

#### Business Tier: €59/seat/maand (€708/seat/jaar)

**Doelgroep:** Gevestigde SMB 70-100 FTE, 20-30 actieve gebruikers

**Jaarlijks:** €49/seat/maand (€588/seat/jaar) — **17% korting**

**Inclusief:**
- ✅ Alles van Professional
- ✅ SSO (SAML, OAuth)
- ✅ Dedicated account manager
- ✅ Unlimited API calls
- ✅ Advanced security (audit logs, IP whitelisting)
- ✅ Custom onboarding (2 dagen hands-on)
- ✅ SLA (99,9% uptime)
- ✅ White-label rapportage
- ✅ Advanced compliance (SOC2, ISO27001 ready)
- ✅ Priority feature requests

**Blended ARPU:** 25 gebruikers × €59 = **€1.475/maand** (€17.700/jaar bij maandelijks)

**Competitive Positioning:**
- Asana Enterprise: custom pricing (vaak $30-50/user)[5]
- Monday Enterprise: custom pricing[6]
- LinearB: ~$20/dev (€18/user)[8]
- **Roosevelt Business: €59/seat** — enterprise features voor SMB pricing

### 2.3 Feature Gating Matrix

| Feature | Free | Starter | Professional | Business |
|---------|:----:|:-------:|:------------:|:--------:|
| **Core Functionaliteit** | | | | |
| Gebruikers | 3 | Unlimited | Unlimited | Unlimited |
| Custom KPIs | 5 | 25 | Unlimited | Unlimited |
| Data retentie | 30 dagen | 12 maanden | 36 maanden | Unlimited |
| Workspaces | 1 | 3 | Unlimited | Unlimited |
| **Integraties** | | | | |
| Slack notificaties | Basis | Basis | Advanced | Advanced |
| Email automation | ❌ | Basis | Advanced | Advanced |
| Webhooks/API | ❌ | ❌ | 10K calls/maand | Unlimited |
| Custom integraties (Zapier) | ❌ | ❌ | ✅ | ✅ |
| **Workflow Automation** | | | | |
| Automation runs/maand | ❌ | 100 | Unlimited | Unlimited |
| Conditional logic | ❌ | Basis | Advanced | Advanced |
| Multi-step workflows | ❌ | ❌ | ✅ | ✅ |
| **Analytics & Reporting** | | | | |
| Basis dashboards | ✅ | ✅ | ✅ | ✅ |
| Custom rapportage | ❌ | Limited | Unlimited | Unlimited |
| Predictive analytics | ❌ | ❌ | ✅ | ✅ |
| Anomaly detection | ❌ | ❌ | ✅ | ✅ |
| White-label exports | ❌ | ❌ | ❌ | ✅ |
| **Security & Compliance** | | | | |
| Role-based access | ❌ | ❌ | ✅ | ✅ |
| SSO (SAML/OAuth) | ❌ | ❌ | ❌ | ✅ |
| Audit logs | ❌ | ❌ | Basic | Advanced |
| IP whitelisting | ❌ | ❌ | ❌ | ✅ |
| SOC2/ISO27001 ready | ❌ | ❌ | ❌ | ✅ |
| **Support** | | | | |
| Response tijd | Community | 48u | 24u | 4u SLA |
| Kanaal | Forum/Docs | Email | Chat + Email | Phone + Dedicated AM |
| Onboarding | Self-serve | Self-serve | Priority | Custom (2 dagen) |

**Gating Strategie:**
- **Functionaliteit voor iedereen:** Basis dashboards, KPI tracking, Slack — laat de waarde zien
- **Schaalbaarheidslimiet:** Gebruikers (3 → unlimited), KPIs (5 → 25 → unlimited) — dwingt upgrade bij groei
- **Power user features:** Automation, API, advanced analytics — alleen voor betalende tiers
- **Enterprise governance:** SSO, audit logs, white-label — alleen Business tier

### 2.4 Pricing Psychologie

#### Anchoring Strategie

**Reference Price Points:**
- Enterprise platforms: LinearB €18/dev, Jellyfish (contact sales, vaak €30-50/user), Faros AI $29+/contributor[8][9]
- Generic tools: Asana €9-22, Monday €8-17, ClickUp €6-11[5][6][7]

**Roosevelt Anchor:**
> "Waar enterprise platforms €30-50/seat kosten en generieke tools €8-12/seat, biedt Roosevelt OPS specialist operations intelligence voor €19-59/seat — **enterprise functionaliteit tegen SMB pricing**."

**Pricing Page Layout:**
```
┌─────────────┬──────────────┬───────────────┬─────────────┐
│   Starter   │ Professional │   Business    │  Enterprise │
│   €19/seat  │   €35/seat   │   €59/seat    │  Custom     │
│             │  POPULAIR ⭐  │               │             │
│             │  Beste Waarde │               │             │
└─────────────┴──────────────┴───────────────┴─────────────┘
```

**Decoy Effect:**
- **Professional tier** is de decoy — prijs tussen Starter en Business, maar veel meer waarde dan Starter
- Meeste klanten converteren naar Professional (verwachting 60% van betalende klanten)
- Business tier lijkt "redelijk" in vergelijking met Professional (+€24/seat voor SSO + dedicated AM)

#### Loss Aversion

**Trial → Paid Conversie:**
- **14 dagen gratis trial** (all Professional features)
- Geen creditcard required (wrijving verlagen)
- **Day 10 email:** "Je hebt nog 4 dagen — hier is wat je zou missen na trial"
- **Day 13 email:** "Laatste dag — upgrade nu en behoud je configuratie + data"

**Upgrade Nudges:**
- Free tier: "Je hebt 24 van 25 KPIs gebruikt — upgrade naar Professional voor unlimited"
- Starter: "Je team is gegroeid naar 12 gebruikers — tijd voor Professional tier pricing?"
- Workflow hits: "Je hebt 95 van 100 automation runs gebruikt — upgrade naar unlimited?"

#### Jaarlijks vs Maandelijks

**Kortingen:**
- Starter: 16% korting jaarlijks (€19 → €16/seat/maand)
- Professional: 17% korting jaarlijks (€35 → €29/seat/maand)
- Business: 17% korting jaarlijks (€59 → €49/seat/maand)

**Benchmark:** EU SMB preferentie is **monthly billing** (72% vs 58% US)[10], maar jaarlijkse kortingen van 15-20% zijn effectief voor cash flow en churn reductie.

**Target:** 60% maandelijks, 40% jaarlijks in jaar 1 → shift naar 50/50 in jaar 2-3

---

## 3. Unit Economics Model

### 3.1 Revenue Model

#### ARPU per Tier (Gemiddelde Revenue per Gebruiker)

**Aannames:**
- Gemiddelde bedrijf heeft 35 FTE
- 40-50% van FTE is actieve gebruiker in ops platform (ops team + managers + founders)
- Free tier converteert niet direct naar revenue (maar wel naar paid trial)

| Tier | Seats per Klant | Maandelijks ARPU | Jaarlijks ARPU (40% jaarlijks) | Blended ARPU |
|------|-----------------|------------------|-------------------------------|--------------|
| **Free** | 2-3 | €0 | €0 | €0 |
| **Starter** | 6 | €114/mnd (€1.368/jr) | €96/mnd (€1.152/jr) | **€107/mnd (€1.284/jr)** |
| **Professional** | 12 | €420/mnd (€5.040/jr) | €348/mnd (€4.176/jr) | **€391/mnd (€4.694/jr)** |
| **Business** | 25 | €1.475/mnd (€17.700/jr) | €1.225/mnd (€14.700/jr) | **€1.375/mnd (€16.500/jr)** |

**Blended ARPU (over alle betalende klanten):**

Verwachte tier distributie (jaar 1):
- Starter: 40% van klanten (20-28 klanten)
- Professional: 50% van klanten (25-35 klanten)
- Business: 10% van klanten (5-7 klanten)

```
Blended ARPU = (0,40 × €1.284) + (0,50 × €4.694) + (0,10 × €16.500)
            = €514 + €2.347 + €1.650
            = €4.511/jaar
            ≈ €376/maand
```

**Conservatieve schatting voor forecasting:** €4.500-5.400/jaar per klant (€375-450/maand)

#### Expansion Revenue Potentieel

**Seat Growth:**
- SMB in 10-100 FTE range groeit gemiddeld 8-12% jaarlijks (headcount)
- Ops teams groeien 1,5x sneller dan bedrijf (meer data, meer complexiteit)
- **Verwacht:** +12-15% seats per klant per jaar

**Tier Upgrades:**
- 20-25% van Starter klanten upgrade naar Professional (jaar 1-2)
- 10-15% van Professional klanten upgrade naar Business (jaar 2-3)
- **Verwacht:** +5-8% revenue van tier migrations

**Usage Overages (API calls bij Professional tier):**
- 10.000 calls/maand included, daarna €0,01/call
- Verwacht: 15-20% van Professional klanten gebruikt >10K calls
- Gemiddelde overage: 5.000 extra calls/maand = €50/maand extra
- **Verwacht:** +2-3% revenue van usage fees

**Total Expansion Revenue:**
- Seat growth: +12-15%
- Tier upgrades: +5-8%
- Usage overages: +2-3%
- **Net Revenue Retention (NRR) target: 110-115%**

#### Net Revenue Retention (NRR)

**Berekening:**
```
NRR = (Starting ARR + Expansion - Churn - Downgrades) / Starting ARR

Jaar 2 cohort (jaar 1 = 50 klanten, €225K ARR):
Starting ARR: €225K
+ Seat expansion: €225K × 13% = +€29K
+ Tier upgrades: €225K × 6% = +€14K
+ Usage overages: €225K × 2,5% = +€6K
- Churn (4% annual): €225K × 4% = -€9K
- Downgrades (1%): €225K × 1% = -€2K

NRR = (€225K + €49K - €11K) / €225K = 117%
```

**Target NRR: 110-115%** (conservatief, rekening houdend met SMB volatiliteit)

**Benchmark:** SMB SaaS NRR = 100-110%[11], ons target is **bovengemiddeld** door:
- Multi-user licensing (natuurlijke seat expansion)
- Target segment (groeiende SMB's, niet stagnerende)
- Workflow lock-in (switching costs na 6-12 maanden gebruik)

### 3.2 Customer Acquisition Cost (CAC)

#### CAC per Channel (Jaar 1)

**Assumptie:** Founder-led sales + content marketing + early founder network

| Channel | Budget (€) | Klanten | CAC | Conversie | Payback (mnd) |
|---------|-----------|---------|-----|-----------|---------------|
| **Content/SEO** | €30K | 15-20 | **€1.500-2.000** | 3-4% site → demo | 10-12 |
| **LinkedIn Ads (SMB founders)** | €40K | 12-15 | **€2.670-3.330** | 1,5% ad → demo | 14-16 |
| **Partnerships (HRM vendors)** | €20K | 8-10 | **€2.000-2.500** | 25% intro → paid | 8-10 |
| **Outbound Sales (founder-led)** | €35K | 10-15 | **€2.330-3.500** | 12% reach → paid | 12-14 |
| **Referrals (early adopters)** | €10K | 5-10 | **€1.000-2.000** | 40% referral → paid | 6-8 |
| **Total** | **€135K** | **50-70** | **€1.930-2.700 blended** | - | **10-14** |

**Channel Breakdown:**

**1. Content/SEO (€30K budget, 15-20 klanten)**
- Blog posts (2x/week): operations best practices, NL SMB case studies, compliance guides
- SEO focus: "operations dashboard NL", "SMB metrics tracking", "workflow automation Nederland"
- Webinars (1x/maand): "Ops 101 voor SMB founders"
- E-book/guide: "Operations playbook voor Nederlandse scale-ups"
- **Conversie funnel:** 10.000 site visitors → 300 demo requests (3%) → 60 trials → 18 paid (30% trial → paid)
- **CAC:** €30K ÷ 18 = €1.667

**2. LinkedIn Ads (€40K budget, 12-15 klanten)**
- Target: Nederlandse founders, ops managers, COOs bij bedrijven 10-100 FTE
- Ad creative: "Stop met spreadsheets — operationeel dashboard in 10 minuten"
- Landing page: demo video + trial signup
- **Conversie funnel:** 50.000 impressions → 750 clicks (1,5% CTR) → 75 demos (10% click → demo) → 45 trials → 14 paid (30%)
- **CAC:** €40K ÷ 14 = €2.857

**3. Partnerships (€20K budget, 8-10 klanten)**
- NL HRM vendors (AFAS, Visma, Exact): co-marketing, integration showcase
- Accountants/CFO advisors: referral program (10% recurring revenue share)
- Startup accelerators (Rockstart, YES!Delft): portfolio access
- **Conversie funnel:** 40 warm intros → 10 paid (25% close rate, hoogst van alle channels)
- **CAC:** €20K ÷ 10 = €2.000

**4. Outbound Sales (€35K budget, 10-15 klanten)**
- Founder-led outreach: LinkedIn + email sequences
- Target: 500 bedrijven (Amsterdam, Rotterdam, Utrecht tech hubs)
- Message: "We're building Roosevelt for NL founders — 30 min feedback call?"
- **Conversie funnel:** 500 outreach → 60 calls (12% response) → 25 demos → 12 paid (48% demo → paid, hoogst door warm approach)
- **CAC:** €35K ÷ 12 = €2.917

**5. Referrals (€10K budget, 5-10 klanten)**
- Early adopter referral program: 2 maanden gratis voor referee + referrer
- Founder network: personal intros
- **Conversie funnel:** 20 referrals → 8 paid (40% close rate)
- **CAC:** €10K ÷ 8 = €1.250

**CAC Payback Berekening:**

```
Blended CAC: €2.300 (gemiddelde over alle channels)
Blended ARPU: €4.500/jaar
Gross Margin: 78% (zie 3.4)

Payback = CAC / (ARPU × Gross Margin / 12)
        = €2.300 / (€4.500 × 0,78 / 12)
        = €2.300 / €292,50
        = 7,9 maanden ≈ 8 maanden
```

**Target:** <12 maanden payback (SMB benchmark)[11][12]
**Roosevelt:** **8-11 maanden** (afhankelijk van channel mix) → ✅ Binnen benchmark

#### CAC Evolutie (Jaar 1-3)

| Jaar | Blended CAC | Channel Mix Shift | Efficiency Driver |
|------|-------------|-------------------|-------------------|
| **Jaar 1** | €2.100-2.700 | Founder-led + ads | High touch, lage schaal |
| **Jaar 2** | €1.600-2.200 | Content/SEO groeit, referrals stijgen | Self-serve toeneemt, word-of-mouth |
| **Jaar 3** | €1.200-1.800 | PLG dominant, partnerships mature | Product verkoopt zichzelf, lagere CPA |

**Verwachte CAC daling:** -25% jaar 2, -40% jaar 3 (vs jaar 1)

**Drivers:**
- Content/SEO compounding (jaar 2-3 lagere CAC door SEO authority)
- Referrals stijgen (10% → 20% → 30% van nieuwe klanten)
- Self-serve onboarding verbetert (trial → paid conversie 30% → 35% → 40%)

### 3.3 Lifetime Value (LTV)

#### LTV Berekening per Tier

**Formule:**
```
LTV = ARPU × Gross Margin × (1 / Monthly Churn Rate)
    = ARPU × Gross Margin × Average Customer Lifetime (in months)
```

**Aannames:**
- Gross Margin: 78% (zie 3.4 voor breakdown)
- Monthly Churn: 0,33% (4% annual churn)
- Average Lifetime: 1 / 0,0033 = 303 maanden ≈ **25 jaar** (theoretisch, in praktijk gebruiken we 36-60 maanden voor SMB)

**Conservatieve LTV (36 maanden horizon):**

| Tier | ARPU/jaar | Gross Margin | Lifetime (mnd) | LTV |
|------|-----------|--------------|----------------|-----|
| **Starter** | €1.284 | 78% | 36 | €3.860 |
| **Professional** | €4.694 | 78% | 36 | €14.072 |
| **Business** | €16.500 | 78% | 36 | €49.464 |

**Blended LTV (gemiddeld over alle klanten):**

```
Tier distributie:
- Starter: 40% × €3.860 = €1.544
- Professional: 50% × €14.072 = €7.036
- Business: 10% × €49.464 = €4.946

Blended LTV = €1.544 + €7.036 + €4.946 = €13.526
```

**Conservatief voor forecasting:** **€12.000-15.000 LTV** (afhankelijk van tier mix)

#### LTV/CAC Ratio

```
LTV/CAC = €13.500 (blended LTV) / €2.300 (blended CAC jaar 1)
        = 5,87:1
```

**Target:** ≥3:1 (benchmark minimum)[11][13]
**Roosevelt:** **5,5-6:1** (jaar 1), improving naar **8-10:1** (jaar 3 door dalende CAC)

**Benchmark vergelijking:**
- Median B2B SaaS: 3,2:1[13]
- Best-in-class SMB SaaS: 5-7:1[13]
- **Roosevelt target: 5,87:1** → ✅ Best-in-class range

**Sensitivity:**
- Bij 6% churn (vs 4%): LTV daalt naar €11.250, LTV/CAC = 4,89:1 (nog steeds >3:1)
- Bij CAC €3.000 (vs €2.300): LTV/CAC = 4,5:1 (nog steeds gezond)
- Bij ARPU -15% (pricing pressure): LTV €11.475, LTV/CAC = 4,99:1 (acceptabel)

#### Payback Period

**Berekening:**
```
Payback = CAC / (Monthly ARPU × Gross Margin)

Blended payback:
= €2.300 / ((€4.500/12) × 0,78)
= €2.300 / €292,50
= 7,9 maanden ≈ 8 maanden
```

**Per Tier:**

| Tier | CAC (blended) | Monthly ARPU | Gross Margin | Payback (mnd) |
|------|---------------|--------------|--------------|---------------|
| **Starter** | €2.300 | €107 | 78% | 27,6 mnd |
| **Professional** | €2.300 | €391 | 78% | 7,5 mnd |
| **Business** | €2.300 | €1.375 | 78% | 2,1 mnd |

**Blended payback (gewogen naar tier mix):**
- (0,40 × 27,6) + (0,50 × 7,5) + (0,10 × 2,1) = **15 maanden**

**KRITIEK PUNT:** Starter tier heeft te lange payback (27 maanden > 12 maanden benchmark)

**Mitigatie:**
1. **Focus op Professional tier conversies** (50% → 60% van nieuwe klanten)
2. **Starter CAC verlagen** via self-serve onboarding (target €1.500 vs €2.300)
3. **Starter ARPU verhogen** via seat expansion nudges (6 seats → 8 seats gemiddeld)

**Aangepaste payback target:**
- **Professional/Business focus:** 8-10 maanden ✅
- **Blended (inclusief Starter):** 12-15 maanden ⚠️ (boven benchmark, maar acceptabel voor jaar 1)

**Benchmark:** <12 maanden SMB, <18 maanden Mid-Market[11][14]

### 3.4 Break-Even Analyse

#### Kostenstructuur

**Vaste Kosten (Maandelijks):**

| Categorie | Jaar 1 | Jaar 2 | Jaar 3 |
|-----------|--------|--------|--------|
| **Team** | | | |
| Founders (2x) | €12K | €15K | €18K |
| Engineer (1x → 2x) | €7K | €14K | €14K |
| CS/Sales (0 → 1x) | €0 | €5K | €5K |
| **Totaal Team** | **€19K** | **€34K** | **€37K** |
| **Tooling & Infra** | | | |
| AWS/Hosting | €2K | €4K | €6K |
| SaaS tools (Slack, Figma, etc.) | €1K | €1,5K | €2K |
| **Totaal Infra** | **€3K** | **€5,5K** | **€8K** |
| **Marketing & Sales** | | | |
| Content/Ads budget | €11K | €8K | €6K |
| Events/Partnerships | €2K | €3K | €4K |
| **Totaal Marketing** | **€13K** | **€11K** | **€10K** |
| **Overige** | | | |
| Legal/Accounting | €1K | €1,5K | €2K |
| Office/Misc | €1K | €1,5K | €2K |
| **Totaal Overige** | **€2K** | **€3K** | **€4K** |
| **TOTAAL VASTE KOSTEN** | **€37K/mnd** | **€53,5K/mnd** | **€59K/mnd** |
| | **(€444K/jaar)** | **(€642K/jaar)** | **(€708K/jaar)** |

**Variabele Kosten (per klant):**

| Kostenpost | Per Klant/Maand | Per Klant/Jaar |
|------------|-----------------|----------------|
| Hosting (storage, compute) | €15-25 | €180-300 |
| Support (email, chat) | €10-20 | €120-240 |
| Payment processing (2% + €0,25) | €8-12 (gemiddeld op €400 MRR) | €96-144 |
| **Totaal Variabel** | **€33-57** | **€396-684** |

**Blended variabele kosten:** €450/klant/jaar (conservatief)

**Gross Margin Berekening:**

```
Blended ARPU: €4.500/jaar
Variabele kosten: €450/klant/jaar
CAC (amortized over 3 jaar): €767/jaar

Gross Margin = (ARPU - Variabele Kosten) / ARPU
             = (€4.500 - €450) / €4.500
             = 90%

EBITDA Margin (inclusief CAC amortization):
= (ARPU - Variabele Kosten - CAC/3) / ARPU
= (€4.500 - €450 - €767) / €4.500
= 73%
```

**Gross Margin Target:** **78-82%** (SaaS standard 70-80%)[11]

#### Break-Even Klanten

**Break-Even Berekening:**

```
Vaste kosten per maand: €37K (jaar 1)
Contribution margin per klant: €4.500/jaar - €450/jaar = €4.050/jaar = €337,50/maand

Break-even klanten = Vaste kosten / Contribution margin
                   = €37.000 / €337,50
                   = 110 klanten

Break-even MRR = 110 klanten × €375 (blended ARPU/maand)
               = €41.250/maand
```

**Jaar 1 Target:** 50-70 klanten (€18.750-26.250 MRR) → **NIET break-even in jaar 1**

**Break-Even Tijdlijn:**

| Maand | Klanten (cumulatief) | MRR | Vaste Kosten | Variabele Kosten | Netto |
|-------|----------------------|-----|--------------|------------------|-------|
| **M3** | 10 | €3.750 | €37K | €375 | -€33.625 |
| **M6** | 25 | €9.375 | €37K | €938 | -€28.563 |
| **M9** | 40 | €15.000 | €37K | €1.500 | -€23.500 |
| **M12** | 60 | €22.500 | €37K | €2.250 | -€16.750 |
| **M15** | 85 | €31.875 | €40K | €3.188 | -€11.313 |
| **M18** | 110 | €41.250 | €43K | €4.125 | **-€5.875** ← Near break-even |
| **M24** | 150 | €56.250 | €53,5K | €5.625 | **-€2.875** ← Operationeel break-even |

**Break-Even Milestone:** **Maand 18-24** (110-150 klanten)

**Cash Runway Requirement:**
- Maand 1-12: -€300K cumulatief
- Maand 13-24: -€150K cumulatief
- **Total burn tot break-even: €450-550K**

**Funding Requirement:** €600-750K seed (12-18 maanden runway + buffer)

---

## 4. Financial Projections (12 Maanden)

### P&L Model (Maandelijks)

| Maand | Nieuwe Klanten | Churn | Totaal Klanten | MRR | Kosten (vast) | Kosten (variabel) | CAC (cash) | Netto |
|-------|----------------|-------|----------------|-----|---------------|-------------------|------------|-------|
| **M1** | 3 | 0 | 3 | €1.125 | €37K | €113 | €6.900 | -€42.888 |
| **M2** | 4 | 0 | 7 | €2.625 | €37K | €263 | €9.200 | -€43.838 |
| **M3** | 5 | 0 | 12 | €4.500 | €37K | €450 | €11.500 | -€44.450 |
| **M4** | 6 | 0 | 18 | €6.750 | €37K | €675 | €13.800 | -€44.725 |
| **M5** | 6 | 1 | 23 | €8.625 | €37K | €863 | €13.800 | -€43.038 |
| **M6** | 7 | 1 | 29 | €10.875 | €37K | €1.088 | €16.100 | -€43.313 |
| **M7** | 7 | 1 | 35 | €13.125 | €37K | €1.313 | €16.100 | -€41.288 |
| **M8** | 8 | 1 | 42 | €15.750 | €37K | €1.575 | €18.400 | -€41.225 |
| **M9** | 8 | 2 | 48 | €18.000 | €37K | €1.800 | €18.400 | -€39.200 |
| **M10** | 9 | 2 | 55 | €20.625 | €37K | €2.063 | €20.700 | -€39.138 |
| **M11** | 9 | 2 | 62 | €23.250 | €37K | €2.325 | €20.700 | -€36.775 |
| **M12** | 10 | 2 | 70 | €26.250 | €37K | €2.625 | €23.000 | -€36.375 |
| **TOTAAL** | **82** | **12** | **70** | **€26.250** | **€444K** | **€15.153** | **€188.600** | **-€496.253** |

**Jaar 1 Samenvatting:**
- **Nieuwe klanten:** 82 (70 netto na churn)
- **Churn:** 12 klanten (14,6% annual churn → 1,2%/maand gemiddeld, aflopend naar 0,33%)
- **MRR einde jaar:** €26.250 (70 klanten × €375 blended)
- **ARR einde jaar:** €315K
- **Total Revenue (incl. jaarlijkse upfronts):** €350K
- **Total CAC spend:** €188,6K (cash outflow)
- **Total burn:** €496K
- **Cash runway needed:** €500-600K

**Belangrijke aannames:**
- Nieuwe klanten accelereren: M1-3 (3-5/mnd) → M4-6 (6-7/mnd) → M7-12 (7-10/mnd)
- Churn start M5 (eerste klanten na 4-5 maanden), stabiliseert naar 0,33%/maand (4% annual)
- CAC betaald upfront (€2.300/klant gemiddeld), ARPU recognized monthly
- 40% van revenue is jaarlijkse upfront betaling (cash inflow boost)

### Scenario's

#### Conservative Scenario: 35 klanten, €160K ARR na 12 maanden

**Assumptie:** Langzamere groei, hogere churn (6% annual = 0,5%/maand)

| Metric | Waarde |
|--------|--------|
| Nieuwe klanten | 42 |
| Churn | 7 klanten (16,7% → convergeert naar 6% annual) |
| Netto klanten | 35 |
| MRR einde jaar | €13.125 |
| ARR | €157,5K |
| Total burn | €420K |

**Break-even:** Maand 30-36

#### Base Case: 70 klanten, €315K ARR na 12 maanden

**Assumptie:** Realistische groei, benchmark churn (4% annual)

| Metric | Waarde |
|--------|--------|
| Nieuwe klanten | 82 |
| Churn | 12 klanten (14,6% → convergeert naar 4% annual) |
| Netto klanten | 70 |
| MRR einde jaar | €26.250 |
| ARR | €315K |
| Total burn | €496K |

**Break-even:** Maand 18-24

#### Optimistic Scenario: 110 klanten, €495K ARR na 12 maanden

**Assumptie:** Sterke founder network traction, lagere churn (3% annual), betere conversie

| Metric | Waarde |
|--------|--------|
| Nieuwe klanten | 125 |
| Churn | 15 klanten (12% → convergeert naar 3% annual) |
| Netto klanten | 110 |
| MRR einde jaar | €41.250 |
| ARR | €495K |
| Total burn | €580K |

**Break-even:** Maand 15-18

---

## 5. Benchmark Vergelijking

### Roosevelt OPS Metrics vs SaaS Benchmarks

| Metric | Roosevelt OPS (Jaar 1) | SaaS Benchmark | Status | Bron |
|--------|------------------------|-----------------|--------|------|
| **Revenue Metrics** | | | | |
| ARPU (SMB) | €4.500/jaar | $4.800-10.000 (€4.400-9.200) | ✅ Midden range | [15] |
| Blended pricing | €19-59/seat | €8-22 (generics), $20-45 (enterprise) | ✅ Premium vs generics | [5][6][8] |
| Annual contract | 40% | 50-60% EU SMB | ⚠️ Lager (monthly preference) | [10] |
| **Unit Economics** | | | | |
| LTV/CAC | 5,87:1 | ≥3:1 (median 3,2:1) | ✅ Best-in-class | [13] |
| CAC Payback | 8-15 maanden | <12 maanden SMB | ⚠️ Blended boven (Starter drag) | [11][14] |
| Gross Margin | 78-82% | ≥70% | ✅ Gezond | [11] |
| **Retention** | | | | |
| Monthly Churn | 3-4% | ≤5% B2C / ≤2% B2B | ✅ Binnen SMB range | [16] |
| Annual Churn | 4% (target) | 5% SMB (median) | ✅ Beter dan benchmark | [16] |
| NRR | 110-115% | ≥110% (best-in-class) | ✅ Op target | [17] |
| **Growth** | | | | |
| Free→Paid Conversion | 4-6% (target) | 2-5% PLG | ✅ Hoog door NL-first | [3][4] |
| Trial→Paid Conversion | 30-35% | 20-25% (median) | ✅ Boven gemiddeld | [18] |
| Hybrid pricing adoption | 100% (by design) | 61% (2025-2026) | ✅ Ahead of curve | [1] |
| **Efficiency** | | | | |
| Revenue/FTE (jaar 3) | €167-375K | $200-400K | ✅ In line | [19] |
| CAC:LTV efficiency | 17% (CAC/LTV) | <33% (3:1 min) | ✅ Excellent (11%) | [13] |

**Conclusie:**
- ✅ **Sterke punten:** LTV/CAC ratio (5,87:1), NRR (110-115%), churn (4%), gross margin (78%)
- ✅ **Op target:** ARPU, free→paid conversie, hybrid pricing
- ⚠️ **Verbeterpunten:** CAC payback (Starter tier te lang), annual contract % (40% vs 50-60% benchmark)

**Actiepunten:**
1. **Verhoog annual conversie:** Bied 20% korting (vs 16%) voor jaarlijks, target 50% annual
2. **Starter tier CAC verlagen:** Meer self-serve, minder high-touch sales (target €1.500 vs €2.300)
3. **Focus Professional tier:** Shift tier mix naar 60% Professional (vs 50%), betere payback

---

## 6. Pricing Validatie Plan

### 6.1 Van Westendorp Survey Design

**Doel:** Bepaal optimale prijspunten voor Starter, Professional, Business tiers via price sensitivity analyse.

**Methode:** Van Westendorp Price Sensitivity Meter — 4 vragen per respondent[20][21]

**Sample Size:** 100-200 respondents uit target segment (NL SMB founders + ops managers, 10-100 FTE)[20]

**Survey Flow:**

**Context setting:**
> "Stel je voor: een operationeel intelligence platform voor Nederlandse SMB's dat realtime KPI dashboards, workflow automation, en Slack integraties biedt. Je kan je team performance, workflow bottlenecks, en bedrijfsvoering metrics tracken zonder developer-jargon."

**4 Van Westendorp Vragen:**

1. **"At what price would you consider this product to be so expensive that you would not consider buying it?"** (Too Expensive)
2. **"At what price would you consider this product to be priced so low that you would feel the quality couldn't be very good?"** (Too Cheap)
3. **"At what price would you consider the product to be starting to get expensive, so that it is not out of the question, but you would have to give some thought to buying it?"** (Expensive/High Side)
4. **"At what price would you consider this product to be a bargain—a great buy for the money?"** (Cheap/Good Value)

**Nederlandse vertaling (voor survey):**

1. **"Bij welke prijs (per gebruiker per maand) zou je dit product ZO DUUR vinden dat je het NIET zou overwegen?"** (Te Duur)
2. **"Bij welke prijs zou je dit product ZO GOEDKOOP vinden dat je zou twijfelen aan de kwaliteit?"** (Te Goedkoop)
3. **"Bij welke prijs begint dit product DUUR te worden, maar zou je het nog overwegen (met enige aarzeling)?"** (Aan de Dure Kant)
4. **"Bij welke prijs zou je dit product een KOOPJE vinden — uitstekende prijs-kwaliteit verhouding?"** (Goede Waarde)

**Respondent Segmentatie:**

| Segment | N | Criteria |
|---------|---|----------|
| **Micro SMB (10-30 FTE)** | 50 | Verwachte Starter tier klanten |
| **Mid SMB (30-70 FTE)** | 80 | Verwachte Professional tier klanten |
| **Upper SMB (70-100 FTE)** | 70 | Verwachte Business tier klanten |
| **TOTAAL** | **200** | |

**Distributie:**
- LinkedIn ads targeting (NL founders, ops managers)
- Email outreach via founder network
- Partnerships (accelerators, HRM vendors sturen naar eigen klanten)
- Incentive: €50 bol.com voucher + early access (eerste 200 respondents)

**Analyse Output:**

Van Westendorp plot genereert 4 kruispunten:
- **Point of Marginal Cheapness (PMC):** Laagste acceptabele prijs
- **Point of Marginal Expensiveness (PME):** Hoogste acceptabele prijs
- **Optimal Price Point (OPP):** Kruising "Too Expensive" en "Too Cheap"
- **Indifference Price Point (IPP):** Kruising "Expensive" en "Cheap"

**Verwachte Range (hypothese):**
- PMC: €12-15/seat
- OPP: €25-30/seat (Starter/Professional sweet spot)
- IPP: €35-40/seat
- PME: €65-75/seat (Business tier max)

**Decision Framework:**

| VW Output | Aanbevolen Actie |
|-----------|------------------|
| OPP €25-30 | ✅ Valideer Starter €19, Professional €35 (bracket OPP) |
| OPP €35-40 | ⚠️ Overweeg Starter €29, Professional €45 (hogere willingness) |
| OPP <€20 | ❌ Pivot naar lower-tier pricing (€12-16 Starter, €25 Professional) |
| PME >€70 | ✅ Business €59 is safe, ruimte voor premium tier €79-99 |

**Timeline:** 4 weken (week 1-2: survey launch, week 3: data analyse, week 4: pricing finalisatie)

### 6.2 A/B Test Plan (Pricing Page)

**Doel:** Test pricing presentatie en conversie impact.

**Test Variants:**

| Variant | Starter | Professional | Business | Hypothese |
|---------|---------|--------------|----------|-----------|
| **A (Control)** | €19/seat | €35/seat | €59/seat | Current proposal |
| **B (Higher)** | €25/seat | €45/seat | €69/seat | Higher WTP test |
| **C (Value Anchor)** | €19/seat | €35/seat ⭐ POPULAIR | €59/seat | Decoy effect test |

**Metrics:**

| Metric | Target | Decision Rule |
|--------|--------|---------------|
| Demo signup rate | >5% | Variant met hoogste signup wins |
| Trial signup rate | >15% | Minimum 15% voor proceed |
| Pricing page time | >45s | Engagement check |
| Exit rate op pricing | <40% | Max 40% bounce |

**Sample Size:** 300 visitors per variant (900 totaal) — 80% power, 5% significance[22]

**Traffic Split:** 33/33/33 via feature flag (Optimizely/Growthbook)

**Duration:** 2-3 weken (tot statistical significance)

**Go/No-Go Decision:**

```
IF Variant B (higher pricing) signup rate > 80% van Control
   AND demo→trial conversion rate ≥ Control
THEN adopt higher pricing (€25-45-69)

ELSE stick with Control (€19-35-59)
```

### 6.3 Early Access Pricing Strategie

**Founder's Tier (First 50 klanten):**

**Lifetime Discount:**
- Professional tier: €29/seat/maand (vs €35 regulier) — **17% korting voor altijd**
- Business tier: €49/seat/maand (vs €59 regulier) — **17% korting voor altijd**
- Geen Starter tier discount (al laag geprijsd)

**Rationale:**
- Reward early adopters met permanent lagere prijs
- Generates social proof + case studies
- Locks in eerste 50 klanten (switching costs door lifetime discount)

**Voorwaarde:**
- "Become a Founder's Tier member: eerste 50 betalende klanten krijgen lifetime discount. Claim je plek."

**Communicatie:**
- Landing page: "37 van 50 Founder's Tier plekken over" (urgency)
- Email drip: "Laatste kans — Founder's Tier sluit over 2 weken"

### 6.4 Timeline voor Pricing Validatie

| Week | Activiteit | Output |
|------|-----------|--------|
| **Week 1-2** | Van Westendorp survey (200 respondents) | Price sensitivity data |
| **Week 3** | Analyse VW data, adjust pricing hypothese | Pricing ranges PMC-PME-OPP-IPP |
| **Week 4** | A/B test setup (pricing page variants) | Test design doc |
| **Week 5-7** | Run A/B test (900 visitors, 300/variant) | Signup & conversion data |
| **Week 8** | Finaliseer pricing, launch Founder's Tier | Go-to-market pricing |

**Total Duration:** 8 weken voor complete pricing validatie

**Milestone Gates:**

| Gate | Criteria | Acties |
|------|----------|--------|
| **Week 3** | VW survey N ≥ 150 | Proceed to analysis |
| **Week 4** | OPP binnen €20-40 range | Proceed to A/B test |
| **Week 7** | A/B test N ≥ 800 visitors | Analyse resultaten |
| **Week 8** | Demo signup rate ≥4% | Launch met gevalideerde pricing |

---

## 7. Risico's & Sensitiviteit

### 7.1 Top 5 Pricing Risico's

#### 1. **Starter Tier Cannibalisation Risk** (Probability: 60%, Impact: Medium)

**Risico:** 70% van klanten kiest Starter (€19/seat) in plaats van Professional (€35/seat), terwijl Starter lagere gross margin heeft door hogere support costs.

**Impact:**
- Blended ARPU daalt van €4.500 naar €3.200/jaar (-29%)
- LTV/CAC ratio daalt van 5,87:1 naar 4,1:1 (nog steeds >3:1, maar minder buffer)
- Break-even schuift van M18-24 naar M28-36

**Mitigatie:**
1. **Feature gating versterken:** Automation limit 100 runs/maand (Starter) voelbaar maken — nudge bij 80% usage
2. **Trial defaultt naar Professional:** 14-dagen trial geeft Professional features, downgrade naar Starter vereist actie
3. **Starter pricing verhogen:** Overweeg €25/seat (na VW validatie) om gap met Professional te verkleinen
4. **Upsell automation:** Bij 10+ seats in Starter, automatische sales touch "Je zou €60/maand besparen op Professional jaarlijks contract"

#### 2. **Churn Higher Than Benchmark (6-8% vs 4% target)** (Probability: 50%, Impact: High)

**Risico:** SMB churn is volatiel — bedrijven falen, budgets krimpen, switching costs niet hoog genoeg.

**Impact:**
- NRR daalt van 112% naar 95-100% (expansion revenue geannuleerd door churn)
- LTV daalt van €13.500 naar €9.000 (-33%)
- LTV/CAC ratio daalt van 5,87:1 naar 3,9:1 (nog acceptabel, maar tight)

**Sensitivity:**

| Churn | LTV | LTV/CAC | Break-Even |
|-------|-----|---------|------------|
| 4% (target) | €13.500 | 5,87:1 | M18-24 |
| 6% | €11.250 | 4,89:1 | M24-30 |
| 8% | €9.000 | 3,91:1 | M30-36 |

**Mitigatie:**
1. **Onboarding excellence:** First 30 days = critical, dedicated CS check-ins (automated email sequence + founder call)
2. **Usage tracking:** Identify "at-risk" klanten (login frequency <1x/week, 0 workflows created) → proactive outreach
3. **Annual contracts incentiveren:** Verhoog jaarlijkse korting naar 20% (vs 16%), target 60% annual contracts (vs 40%)
4. **Workflow lock-in:** Push automation adoption — klanten met >5 active workflows hebben <2% churn vs >8% zonder automation

#### 3. **CAC Inflation (Paid Channels Onderperformen)** (Probability: 40%, Impact: Medium)

**Risico:** LinkedIn ads, outbound sales kosten 50% meer dan verwacht (€3.000-4.500 CAC vs €2.300 target).

**Impact:**
- Blended CAC stijgt van €2.300 naar €3.450
- LTV/CAC ratio daalt van 5,87:1 naar 3,91:1 (nog >3:1, maar marge verkleint)
- Payback periode stijgt van 8 naar 12 maanden (bij benchmark limit)

**Sensitivity:**

| CAC | LTV/CAC | Payback (mnd) | Break-Even |
|-----|---------|---------------|------------|
| €2.300 (target) | 5,87:1 | 8 | M18-24 |
| €3.000 | 4,5:1 | 10,3 | M20-26 |
| €3.450 | 3,91:1 | 11,8 | M22-28 |
| €4.000 | 3,38:1 | 13,7 | M24-30 |

**Mitigatie:**
1. **Double down op organic channels:** Content/SEO (CAC €1.500), referrals (CAC €1.200) — shift budget van ads (€2.850) naar content
2. **Partnerships prioriteren:** HRM vendor co-marketing (CAC €2.000), accountant referrals (€1.500) — lagere CAC dan ads
3. **Freemium als acquisition channel:** Free tier → viral loop, 4-6% conversie naar paid = effectief €0 CAC voor top-of-funnel
4. **Founder-led sales optimaliseren:** Script testing, objection handling playbook — verhoog demo→paid van 30% naar 40% (CAC daalt 25%)

#### 4. **Competitive Pressure (Pricing War)** (Probability: 30%, Impact: Medium)

**Risico:** Asana/Monday.com lanceert "Ops voor SMB" feature set tegen €12-15/seat, of nieuwe NL startup undercut ons met €15/seat.

**Impact:**
- Gedwongen pricing verlaging: Professional €35 → €25/seat (-29% ARPU)
- Blended ARPU daalt van €4.500 naar €3.200/jaar
- LTV/CAC ratio daalt van 5,87:1 naar 4,1:1
- Margin compression: moeten kosten verlagen of CAC drukken

**Mitigatie:**
1. **Differentiatie versterken:** NL-first compliance (GDPR, NIS2), locale support, HRM integraties (AFAS, Visma) — "Asana is Engels, wij zijn Nederlands"
2. **Value-based pricing benadrukken:** ROI calculator op pricing page — "Bespaar 15 uur/week ops overhead = €6.000/maand waarde voor €420/maand"
3. **Premium positioning:** We zijn geen commodity — specialist ops platform vs generieke project management tools
4. **Lock-in versnellen:** Push workflow automation adoption — switching costs door 50+ geautomatiseerde workflows = sticky
5. **Niche down:** Als pricing war escaleert, pivot naar vertical (bijv. "Roosevelt voor Healthcare Ops") waar we premium kunnen handhaven

#### 5. **Annual Contract Adoption Too Low (20% vs 40% target)** (Probability: 50%, Impact: Low-Medium)

**Risico:** EU SMB preferentie voor monthly billing (72% monthly vs 58% US)[10] — annual adoption slechts 20% vs target 40%.

**Impact:**
- Cashflow impact: €140K less upfront cash jaar 1 (40% annual = €140K upfront, 20% annual = €70K)
- Runway pressure: need extra €100-150K seed funding
- Churn slightly hoger: monthly contracts hebben 1,5x hogere churn dan annual (5% vs 3,3%)

**Mitigatie:**
1. **Verhoog annual discount:** 20% korting (vs 16%) — "Save €840/year op Professional tier met jaarlijks contract"
2. **Payment flexibility:** Offer quarterly billing (compromise tussen monthly en annual) — 10% korting, 4x upfront payments
3. **Annual-only features:** Bepaalde premium features (bijv. white-label rapportage, advanced compliance) alleen op annual contracts
4. **Cashflow bridge:** Factoring/financing voor monthly ARR (bijv. Pipe, Capchase) — convert MRR naar upfront cash
5. **Acceptance:** If annual blijft <30%, adjust financial model — verhoog seed funding ask met €150K voor cashflow buffer

### 7.2 Sensitivity Analyse

#### Scenario Matrix: Churn vs CAC Impact

| Churn ↓ / CAC → | €2.300 (base) | €3.000 (+30%) | €4.000 (+74%) |
|-----------------|---------------|---------------|---------------|
| **4% (base)** | LTV/CAC 5,87:1 ✅ | 4,5:1 ✅ | 3,38:1 ✅ |
| **6% (+50%)** | 4,89:1 ✅ | 3,75:1 ✅ | 2,81:1 ⚠️ |
| **8% (+100%)** | 3,91:1 ✅ | 3,0:1 ⚠️ | 2,25:1 ❌ |

**Conclusion:** LTV/CAC blijft >3:1 in alle scenarios behalve "worst case" (8% churn + €4K CAC) — zelfs dan 2,25:1 is niet fataal, maar vereist funding extension.

#### Break-Even Sensitivity

**Variables:** Churn, CAC, ARPU

| Scenario | Churn | CAC | ARPU | Break-Even (maanden) |
|----------|-------|-----|------|----------------------|
| **Base Case** | 4% | €2.300 | €4.500 | 18-24 |
| **Optimistic** | 3% | €1.800 | €5.400 | 12-15 |
| **Conservative** | 6% | €3.000 | €4.000 | 28-36 |
| **Worst Case** | 8% | €4.000 | €3.200 | 40-48 |

**Funding Implications:**

| Scenario | Burn tot Break-Even | Seed Funding Need |
|----------|---------------------|-------------------|
| Optimistic | €300K | €400-500K (6-12mnd runway post-break-even) |
| Base Case | €550K | €650-750K (12mnd runway post-break-even) |
| Conservative | €850K | €1M+ (óf cost reduction, óf Series A pre-break-even) |
| Worst Case | €1,2M+ | Not viable zonder pivot/cost cuts |

**Decision Framework:**

- **IF** jaar 1 churn >6% AND CAC >€3.000 → **THEN** trigger mitigaties (cost reduction, pricing increase, or pivot naar annual-only)
- **IF** LTV/CAC <3:1 voor 2 achtereenvolgende quarters → **THEN** pause growth spend, fix unit economics first

---

## 8. Bronnen

**Pricing Models & Benchmarks:**
1. [Medium - The Future of SaaS Pricing in 2026](https://medium.com/@aymane.bt/the-future-of-saas-pricing-in-2026-an-expert-guide-for-founders-and-leaders-a8d996892876)
2. [Get Monetizely - SaaS Pricing Benchmark Study 2025](https://www.getmonetizely.com/articles/saas-pricing-benchmark-study-2025-key-insights-from-100-companies-analyzed)
3. [ProductLed - Product-Led Growth Benchmarks](https://productled.com/blog/product-led-growth-benchmarks)
4. [First Page Sage - SaaS Freemium Conversion Rates 2026](https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/)
5. [ChartMogul - Asana Pricing Repository](https://www.chargebee.com/pricing-repository/asana/)
6. [Monday.com - ClickUp vs Asana vs Monday Comparison 2027](https://monday.com/blog/project-management/clickup-vs-asana-vs-monday-work-management/)
7. [Project Management - ClickUp Software Review](https://project-management.com/clickup-software-review/)
8. [CodePulse - Jellyfish vs LinearB vs Swarmia 2026 Comparison](https://codepulsehq.com/guides/engineering-analytics-tools-comparison) (Referenced in 02-competitive-analysis.md)
9. [Faros AI - Pricing](https://www.faros.ai/pricing) (Referenced in 02-competitive-analysis.md)
10. [Get Monetizely - Europe vs USA SaaS Pricing Expectations](https://www.getmonetizely.com/articles/europe-vs-usa-adapting-your-saas-pricing-to-regional-expectations)

**CAC, LTV & Unit Economics:**
11. [Meet Your Market - European SaaS Benchmark 2023](https://www.meetyourmarket.fr/wp-content/uploads/2023/10/European-saas-benchmark-2023.pdf)
12. [Usermaven - Average Customer Acquisition Cost by Industry 2026](https://usermaven.com/blog/average-customer-acquisition-cost)
13. [Optifai - B2B SaaS LTV Benchmarks & LTV:CAC Ratio 2025](https://optif.ai/learn/questions/b2b-saas-ltv-benchmark/)
14. [Maxio - 2025 B2B SaaS Benchmarks Report](https://www.maxio.com/resources/2025-saas-benchmarks-report)
15. [Velaris - B2B SaaS Benchmarks 2025](https://www.velaris.io/articles/b2b-saas-benchmarks-key-metrics)
16. [We Are Founders - SaaS Churn Rates by Industry 2025](https://www.wearefounders.uk/saas-churn-rates-and-customer-acquisition-costs-by-industry-2025-data/)
17. [GP Bullhound - European SaaS Survey 2024](https://www.gpbullhound.com/articles/european-saas-survey-2024/)
18. [Userpilot - SaaS Average Free Trial Conversion Rate Benchmarks](https://userpilot.com/blog/saas-average-conversion-rate/)
19. [High Alpha - SaaS Benchmarks 2025](https://www.highalpha.com/saas-benchmarks)

**Van Westendorp & Pricing Research:**
20. [Get Monetizely - Van Westendorp Price Sensitivity Meter for SaaS](https://www.getmonetizely.com/articles/how-to-implement-van-westendorp-price-sensitivity-meter-for-saas-research)
21. [Get Monetizely - Van Westendorp Fundamentals for SaaS](https://www.getmonetizely.com/articles/the-fundamentals-of-van-westendorp-price-sensitivity-for-saas-businesses)
22. [Get Monetizely - Van Westendorp vs Gabor-Granger](https://www.getmonetizely.com/articles/van-westendorp-vs-gabor-granger-for-saas-which-pricing-methodology-to-choose)

**Market Sizing (Cross-referenced):**
23. [Salesforce Europe - SaaS in Netherlands 2025](https://salesforceeurope.com/blog/selling-saas-in-the-netherlands-your-guide-to-europes-digital-gateway) (Referenced in 03-market-sizing.md)
24. [Antom - Europe SaaS Landscape 2025](https://knowledge.antom.com/europes-saas-landscape-a-mature-market-entering-its-next-growth-phase) (Referenced in 03-market-sizing.md)
25. [BMF Advices - NL SME Statistics 2024](https://www.bmfadvices.com/there-are-approximately-1-5-million-small-and-medium-sized-enterprises-smes-in-the-netherlands) (Referenced in 03-market-sizing.md)

**Competitive Analysis (Cross-referenced):**
26. [Deliberate Directions - Best Project Management Tools for SMB Teams](https://deliberatedirections.com/best-project-management-tools/) (Referenced in 02-competitive-analysis.md)
27. [Asana - Choosing a Universal Reporting Tool 2025](https://asana.com/nl/resources/reporting-tools) (Referenced in 02-competitive-analysis.md)

---

**Volgende Stappen:**
1. **Execute Van Westendorp survey** (week 1-3) — 200 respondents via LinkedIn + founder network
2. **Run pricing page A/B test** (week 4-7) — 3 variants, 900 visitors total
3. **Launch Founder's Tier** (week 8) — eerste 50 klanten lifetime 17% discount
4. **Monitor unit economics** (maandelijks) — churn, CAC, LTV tracking vanaf dag 1
5. **Quarterly pricing review** — adjust tiers/pricing op basis van actual vs forecast

---

*Laatste update: 9 februari 2026*
*Volgende review: Q2 2026 (na eerste 20 betalende klanten)*
