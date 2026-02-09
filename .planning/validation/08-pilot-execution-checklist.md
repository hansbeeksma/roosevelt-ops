# Pilot Execution Checklist — Roosevelt OPS

Weekelijkse checklist met concrete actiepunten voor succesvolle pilot uitvoering.

---

## Pre-Pilot (2 weken voor start)

### Week -2: Recruitment & Planning

#### Deelnemer Werving
- [ ] Outreach lijst gemaakt (20-30 potentiële bedrijven)
- [ ] LinkedIn/email templates gepersonaliseerd
- [ ] 50+ outreach berichten verstuurd
- [ ] Calendly link gepubliceerd voor intake gesprekken
- [ ] Minimaal 8-10 intake gesprekken gepland (buffer voor afwijzingen)

#### Platform Voorbereiding
- [ ] Analytics tracking getest (PostHog events werken)
- [ ] Feature flags ingesteld voor pilot-specifieke features
- [ ] Support Slack kanaal aangemaakt + welcome message voorbereid
- [ ] Onboarding checklist in platform gebouwd
- [ ] Error monitoring actief (Sentry alerts configureren)

#### Documentatie
- [ ] Pilot agreement template finalized
- [ ] Training video opgenomen (15-20 min platform walkthrough)
- [ ] Quick start guide PDF gemaakt (max 2 pagina's)
- [ ] FAQ document voorbereid (10-15 meest voorkomende vragen)
- [ ] Interview templates klaar (intake, check-in, exit)

#### Team Alignment
- [ ] Intern team meeting: pilot goals en verwachtingen besproken
- [ ] Rollen toegewezen (wie doet intake, wie support, wie data analyse?)
- [ ] Weekly sync meetings gepland (intern team, elke vrijdag 30 min)
- [ ] Escalatie protocol afgesproken (blokkerende bugs → hoe snel fixen?)

---

### Week -1: Selectie & Setup

#### Deelnemer Selectie
- [ ] 8-10 intake gesprekken afgerond
- [ ] Selectie criteria checklist ingevuld per kandidaat
- [ ] 5-7 bedrijven geselecteerd (3-5 definitief + 2 backup)
- [ ] Pilot agreements verstuurd naar geselecteerde deelnemers
- [ ] 3-5 getekende agreements ontvangen
- [ ] Backup deelnemers geïnformeerd over wachtlijst status

#### Technical Setup
- [ ] Accounts aangemaakt voor alle deelnemers
- [ ] Unieke company codes toegewezen (P1, P2, P3, P4, P5)
- [ ] Dashboard templates voorbereid (1 per company, obv intake insights)
- [ ] API keys/data connecties getest (waar van toepassing)
- [ ] CSV upload templates gemaakt (fallback voor handmatige data entry)
- [ ] Team member invites klaar (indien multi-user pilots)

#### Baseline Metrics
- [ ] Pre-pilot survey verstuurd naar alle deelnemers
- [ ] Baseline data verzameld:
  - [ ] Huidige tijdsinvestering in dashboard updates (uren/week)
  - [ ] Aantal tools nu gebruikt voor ops metrics (aantal)
  - [ ] Update frequentie van metrics (dagelijks/wekelijks/maandelijks)
  - [ ] Team visibility score (1-5 scale)
  - [ ] Decision lag (tijd van vraag tot antwoord met data)

#### Scheduling
- [ ] Training sessies gepland (einde week 0, 30 min per deelnemer)
- [ ] Check-in meetings week 1-4 in kalender (alle deelnemers)
- [ ] Exit interviews voorlopig gepland (week 5, 60 min per deelnemer)
- [ ] Reminder emails voorbereid (1 dag voor elke meeting)

#### Risk Mitigation
- [ ] Beta test met 2 niet-pilot users uitgevoerd (catch critical bugs)
- [ ] Support SLA gecommuniceerd (2 uur response op blockers)
- [ ] Backup plan voor data integratie problemen gedocumenteerd
- [ ] Drop-out contingency plan (bij <3 deelnemers: recruit backup)

---

## Week 0: Onboarding

### Onboarding Activiteiten

#### Per Deelnemer
- [ ] **Company P1:**
  - [ ] Account setup compleet
  - [ ] Data connecties getest/geconfigureerd
  - [ ] Training sessie uitgevoerd (datum: _______)
  - [ ] First login bevestigd
  - [ ] Support kanaal toegang getest

- [ ] **Company P2:**
  - [ ] Account setup compleet
  - [ ] Data connecties getest/geconfigureerd
  - [ ] Training sessie uitgevoerd (datum: _______)
  - [ ] First login bevestigd
  - [ ] Support kanaal toegang getest

- [ ] **Company P3:**
  - [ ] Account setup compleet
  - [ ] Data connecties getest/geconfigureerd
  - [ ] Training sessie uitgevoerd (datum: _______)
  - [ ] First login bevestigd
  - [ ] Support kanaal toegang getest

- [ ] **Company P4:**
  - [ ] Account setup compleet
  - [ ] Data connecties getest/geconfigureerd
  - [ ] Training sessie uitgevoerd (datum: _______)
  - [ ] First login bevestigd
  - [ ] Support kanaal toegang getest

- [ ] **Company P5:**
  - [ ] Account setup compleet
  - [ ] Data connecties getest/geconfigureerd
  - [ ] Training sessie uitgevoerd (datum: _______)
  - [ ] First login bevestigd
  - [ ] Support kanaal toegang getest

#### Monitoring Setup
- [ ] Analytics dashboard actief voor alle 5 deelnemers
- [ ] Daily login tracking werkend
- [ ] Feature usage events firing correctly
- [ ] Support ticket tracking in Plane opgezet (label: `pilot-support`)

#### Communication
- [ ] Welcome email verstuurd naar alle deelnemers (met links naar support, docs, training video)
- [ ] Slack/WhatsApp support kanaal introductie bericht gepost
- [ ] Eerste reminder email voor week 1 check-in verstuurd

#### Internal Review
- [ ] Team debrief meeting: zijn alle deelnemers succesvol onboarded?
- [ ] Blokkerende issues geïdentificeerd en opgelost
- [ ] Week 1 plan bevestigd

---

## Week 1: First Value

### Doelen
- Alle deelnemers loggen minimaal 2x in
- Eerste "aha moment" bereikt
- Support vragen <24 uur beantwoord

### Daily Monitoring
- [ ] **Maandag:** Login check (hoeveel deelnemers zijn actief?)
- [ ] **Dinsdag:** Feature usage review (welke dashboards worden bekeken?)
- [ ] **Woensdag:** Support tickets review (blokkerende issues?)
- [ ] **Donderdag:** Engagement check (wie is niet actief? Outreach nodig?)
- [ ] **Vrijdag:** Week 1 data consolidatie voor check-ins

### Check-in Meetings (30 min per deelnemer)

- [ ] **Company P1 check-in:**
  - Datum: _______
  - Notes: _______
  - Key takeaways: _______
  - Action items: _______

- [ ] **Company P2 check-in:**
  - Datum: _______
  - Notes: _______
  - Key takeaways: _______
  - Action items: _______

- [ ] **Company P3 check-in:**
  - Datum: _______
  - Notes: _______
  - Key takeaways: _______
  - Action items: _______

- [ ] **Company P4 check-in:**
  - Datum: _______
  - Notes: _______
  - Key takeaways: _______
  - Action items: _______

- [ ] **Company P5 check-in:**
  - Datum: _______
  - Notes: _______
  - Key takeaways: _______
  - Action items: _______

### Support Tracking
- [ ] Alle support tickets deze week gelogd in Plane
- [ ] Response time <24 uur gehaald voor alle tickets (ja/nee: _____)
- [ ] Blokkerende bugs binnen 48 uur opgelost (aantal bugs: _____)
- [ ] Feature requests gedocumenteerd voor roadmap

### Data Collection
- [ ] Login frequency per company berekend (gemiddelde: _____ x/week)
- [ ] Feature adoption snapshot (% core features gebruikt: _____)
- [ ] Session duration data geëxporteerd (median: _____ min)
- [ ] Support ticket analyse (top 3 issues: _______)

### Internal Review (vrijdag)
- [ ] Team sync meeting uitgevoerd
- [ ] Week 1 successes & challenges besproken
- [ ] Engagement laggards geïdentificeerd (wie heeft <2x ingelogd?)
- [ ] Week 2 interventies gepland (extra support, feature demo's, etc.)
- [ ] Quick wins geïmplementeerd (kleine bugs/UX verbeteringen)

---

## Week 2: Adoption

### Doelen
- Alle deelnemers loggen minimaal 3x in
- Mid-pilot survey ingevuld door alle deelnemers
- Feature adoption ≥50% (baseline)

### Daily Monitoring
- [ ] **Maandag:** Weekend check (wie was actief in weekend?)
- [ ] **Dinsdag:** Feature funnel analyse (onboarding → core usage → advanced?)
- [ ] **Woensdag:** Mid-pilot survey uitnodiging verstuurd
- [ ] **Donderdag:** Survey responses check (reminders versturen)
- [ ] **Vrijdag:** Week 2 data consolidatie

### Check-in Meetings (30 min per deelnemer)

- [ ] **Company P1 check-in:**
  - Datum: _______
  - NPS score (0-10): _______
  - Feature priority ranking: _______
  - WTP signals (ja/misschien/nee): _______
  - Key insights: _______

- [ ] **Company P2 check-in:**
  - Datum: _______
  - NPS score (0-10): _______
  - Feature priority ranking: _______
  - WTP signals (ja/misschien/nee): _______
  - Key insights: _______

- [ ] **Company P3 check-in:**
  - Datum: _______
  - NPS score (0-10): _______
  - Feature priority ranking: _______
  - WTP signals (ja/misschien/nee): _______
  - Key insights: _______

- [ ] **Company P4 check-in:**
  - Datum: _______
  - NPS score (0-10): _______
  - Feature priority ranking: _______
  - WTP signals (ja/misschien/nee): _______
  - Key insights: _______

- [ ] **Company P5 check-in:**
  - Datum: _______
  - NPS score (0-10): _______
  - Feature priority ranking: _______
  - WTP signals (ja/misschien/nee): _______
  - Key insights: _______

### Mid-Pilot Survey
- [ ] Survey link verstuurd naar alle deelnemers (woensdag)
- [ ] Reminder emails verstuurd (vrijdag, voor non-responders)
- [ ] 100% response rate bereikt (ja/nee: _____)
- [ ] Survey data geanalyseerd:
  - Gemiddelde NPS: _____
  - Top 3 meest gebruikte features: _____
  - Top 3 feature requests: _____
  - Top 3 frustraties: _____

### Feature Introduction
- [ ] Geavanceerde feature geïdentificeerd voor demo (welke: _____)
- [ ] Demo voorbereid (video of live tijdens check-in)
- [ ] Feature intro gedaan tijdens check-ins
- [ ] Adoption tracking gestart voor nieuwe feature

### Data Collection
- [ ] Login frequency week 2 (gemiddelde: _____ x/week)
- [ ] Feature adoption week 2 (% core features: _____)
- [ ] Comparison week 1 vs week 2:
  - Login frequency: week 1 (___) vs week 2 (___)
  - Feature adoption: week 1 (___%) vs week 2 (___%)
  - Trend: 📈 stijgend / 📉 dalend / ➡️ stabiel

### Internal Review (vrijdag)
- [ ] Team sync meeting
- [ ] Mid-pilot insights besproken
- [ ] Feature roadmap bijgesteld obv feedback
- [ ] Week 3-4 plan finalized (advanced features, team rollout)
- [ ] Drop-out risk assessment (is iemand aan het afhaken?)

---

## Week 3: Deep Dive

### Doelen
- Advanced features geïntroduceerd
- Team rollout (indien relevant, minimaal 1 deelnemer met multi-user)
- Exit interview voorbereidingen starten

### Advanced Features Rollout

- [ ] **Custom Dashboard Builder:**
  - Demo voorbereid (video + hands-on tijdens check-in)
  - Deelnemers die interesse toonden: _____
  - Adoption tracking actief

- [ ] **Automated Alerts:**
  - Alert configuratie setup voor relevante deelnemers
  - Test alerts verstuurd en bevestigd
  - Feedback verzameld op alert format/frequency

- [ ] **Extra Data Integraties:**
  - Deelnemers met extra data bronnen: _____
  - Integraties gebouwd/getest: _____
  - Fallback: CSV templates verstrekt

### Team Rollout (indien van toepassing)

- [ ] Multi-user deelnemers geïdentificeerd (wie: _____)
- [ ] Team member accounts aangemaakt
- [ ] Team onboarding sessies gepland/uitgevoerd
- [ ] Collaboration features gedemo (commenting, sharing, permissions)
- [ ] Team usage tracking actief

### Check-in Meetings (30 min per deelnemer)

- [ ] **Company P1 check-in:**
  - Advanced feature demo done
  - Adoption barriers besproken
  - Exit interview gepland (datum: _____)
  - Key insights: _______

- [ ] **Company P2 check-in:**
  - Advanced feature demo done
  - Adoption barriers besproken
  - Exit interview gepland (datum: _____)
  - Key insights: _______

- [ ] **Company P3 check-in:**
  - Advanced feature demo done
  - Adoption barriers besproken
  - Exit interview gepland (datum: _____)
  - Key insights: _______

- [ ] **Company P4 check-in:**
  - Advanced feature demo done
  - Adoption barriers besproken
  - Exit interview gepland (datum: _____)
  - Key insights: _______

- [ ] **Company P5 check-in:**
  - Advanced feature demo done
  - Adoption barriers besproken
  - Exit interview gepland (datum: _____)
  - Key insights: _______

### Data Collection
- [ ] Login frequency week 3 (gemiddelde: _____ x/week)
- [ ] Feature adoption week 3 (% all features: _____)
- [ ] Advanced feature usage (adoption rate: ___%)
- [ ] Team usage metrics (indien van toepassing):
  - Aantal team members actief: _____
  - Team collaboration events: _____

### Internal Review (vrijdag)
- [ ] Team sync meeting
- [ ] Advanced feature adoption review
- [ ] Exit interview scripts finalized
- [ ] Pre-exit survey klaar voor verzending (week 4)
- [ ] Week 4 plan: consolidatie + exit prep

---

## Week 4: Evaluatie Prep

### Doelen
- Continue usage (≥3x/week gemiddelde)
- Pre-exit survey 100% ingevuld
- Exit interviews gepland en bevestigd

### Check-in Meetings (30 min per deelnemer) — LAATSTE CHECK-IN

- [ ] **Company P1 check-in:**
  - Reflectie op hele pilot
  - Grootste impact besproken
  - Time saved schatting: _____ uur/week
  - Pre-exit survey reminder gegeven
  - Exit interview bevestigd (datum: _____)

- [ ] **Company P2 check-in:**
  - Reflectie op hele pilot
  - Grootste impact besproken
  - Time saved schatting: _____ uur/week
  - Pre-exit survey reminder gegeven
  - Exit interview bevestigd (datum: _____)

- [ ] **Company P3 check-in:**
  - Reflectie op hele pilot
  - Grootste impact besproken
  - Time saved schatting: _____ uur/week
  - Pre-exit survey reminder gegeven
  - Exit interview bevestigd (datum: _____)

- [ ] **Company P4 check-in:**
  - Reflectie op hele pilot
  - Grootste impact besproken
  - Time saved schatting: _____ uur/week
  - Pre-exit survey reminder gegeven
  - Exit interview bevestigd (datum: _____)

- [ ] **Company P5 check-in:**
  - Reflectie op hele pilot
  - Grootste impact besproken
  - Time saved schatting: _____ uur/week
  - Pre-exit survey reminder gegeven
  - Exit interview bevestigd (datum: _____)

### Pre-Exit Survey
- [ ] Survey verstuurd naar alle deelnemers (maandag week 4)
- [ ] Reminder emails verstuurd (woensdag, vrijdag)
- [ ] 100% response rate bereikt (ja/nee: _____)
- [ ] Survey data geanalyseerd:
  - **NPS:** P1 (___), P2 (___), P3 (___), P4 (___), P5 (___) → Gemiddelde: _____
  - **Feature ranking:** Top 3 gewenste features: _____
  - **Van Westendorp pricing:**
    - Te goedkoop (median): €_____
    - Goedkoop (median): €_____
    - Duur (median): €_____
    - Te duur (median): €_____
    - **Optimaal prijspunt:** €_____ (intersectie goedkoop/duur)
  - **Continuatie interesse:** Ja (___), Misschien (___), Nee (___)

### Usage Data Consolidatie
- [ ] **Login frequency (week 1-4 trend):**
  - Week 1: _____ x/week
  - Week 2: _____ x/week
  - Week 3: _____ x/week
  - Week 4: _____ x/week
  - Overall average: _____ x/week
  - Target (≥3x): ✅ Gehaald / ❌ Niet gehaald

- [ ] **Feature adoption (overall):**
  - Core features: ____%
  - Advanced features: ____%
  - Target (≥60%): ✅ Gehaald / ❌ Niet gehaald

- [ ] **Session duration:**
  - Week 1-4 median: _____ min
  - Trend: 📈 stijgend / 📉 dalend / ➡️ stabiel

- [ ] **Support tickets totaal:** _____ (blokkerende: _____, feature requests: _____)

### Exit Interview Voorbereiding
- [ ] Exit interview scripts geprint/gedeeld met interviewers
- [ ] Usage data dashboards voorbereid per company (voor bespreking tijdens interview)
- [ ] Baseline vs. eindstand vergelijking grafiek gemaakt
- [ ] Van Westendorp pricing chart voorbereid (voor discussie)
- [ ] Recording setup getest (met toestemming deelnemer)

### Internal Review (vrijdag)
- [ ] Team sync meeting
- [ ] Pre-exit survey insights besproken
- [ ] Exit interview rol verdeling (wie interviewt welke deelnemer?)
- [ ] Go/No-Go voorbereidingen starten (data verzamelen voor Fase 2 review)
- [ ] Week 5 plan: exit interviews + analyse sprint

---

## Week 5: Exit & Analyse

### Exit Interviews (60 min per deelnemer)

- [ ] **Company P1 exit interview:**
  - Datum: _______
  - Interviewer: _______
  - Recording: ✅ Ja / ❌ Nee (met toestemming)
  - Notes bestand opgeslagen: _______
  - **Key Metrics:**
    - NPS: _____
    - WTP: Ja / Misschien / Nee
    - Van Westendorp prijzen: te goedkoop (___), goedkoop (___), duur (___), te duur (___)
    - Referrals: _____ bedrijven genoemd
    - Continuatie: Ja / Misschien / Nee
  - **Quotes:** "_____"
  - **Top 3 waarde:** _____, _____, _____
  - **Top 3 frustraties:** _____, _____, _____

- [ ] **Company P2 exit interview:**
  - Datum: _______
  - Interviewer: _______
  - Recording: ✅ Ja / ❌ Nee
  - Notes bestand opgeslagen: _______
  - **Key Metrics:** [zelfde structuur als P1]
  - **Quotes:** "_____"
  - **Top 3 waarde:** _____, _____, _____
  - **Top 3 frustraties:** _____, _____, _____

- [ ] **Company P3 exit interview:**
  - Datum: _______
  - Interviewer: _______
  - Recording: ✅ Ja / ❌ Nee
  - Notes bestand opgeslagen: _______
  - **Key Metrics:** [zelfde structuur]
  - **Quotes:** "_____"
  - **Top 3 waarde:** _____, _____, _____
  - **Top 3 frustraties:** _____, _____, _____

- [ ] **Company P4 exit interview:**
  - Datum: _______
  - Interviewer: _______
  - Recording: ✅ Ja / ❌ Nee
  - Notes bestand opgeslagen: _______
  - **Key Metrics:** [zelfde structuur]
  - **Quotes:** "_____"
  - **Top 3 waarde:** _____, _____, _____
  - **Top 3 frustraties:** _____, _____, _____

- [ ] **Company P5 exit interview:**
  - Datum: _______
  - Interviewer: _______
  - Recording: ✅ Ja / ❌ Nee
  - Notes bestand opgeslagen: _______
  - **Key Metrics:** [zelfde structuur]
  - **Quotes:** "_____"
  - **Top 3 waarde:** _____, _____, _____
  - **Top 3 frustraties:** _____, _____, _____

### Data Analyse Sprint

- [ ] **Kwantitatieve data:**
  - [ ] Login frequency totaal berekend (week 1-4 average per company)
  - [ ] Feature adoption matrix ingevuld (alle features, alle companies)
  - [ ] Session duration analyse (median, P90, trend)
  - [ ] Support ticket categorisatie (bugs, features, questions) + tijd tot oplossing
  - [ ] Usage heatmap gemaakt (welke dagen/uren meest actief?)

- [ ] **Kwalitatieve data:**
  - [ ] Exit interview notes getranscribeerd (indien opgenomen)
  - [ ] Thematische analyse (clustering van pijnpunten, waarde, feature requests)
  - [ ] Quote mining (top 10 meest impactvolle quotes)
  - [ ] Sentiment analyse per company (positief/neutraal/negatief)

- [ ] **Success Metrics Scorecard:**
  - [ ] Actief gebruik: _____ x/week (target ≥3x) → ✅ / ❌
  - [ ] NPS: _____ (target ≥40) → ✅ / ❌
  - [ ] Feature adoption: _____% (target ≥60%) → ✅ / ❌
  - [ ] WTP: _____/5 "zou betalen" (target ≥3/5) → ✅ / ❌
  - [ ] Referrals: _____ totaal (target ≥2) → ✅ / ❌
  - [ ] Time-to-value: _____ dagen (target ≤3) → ✅ / ❌

### Pilot Analyse Rapport

- [ ] **Executive Summary geschreven** (1 pagina):
  - Pilot overzicht (deelnemers, duur, format)
  - Success metrics scorecard
  - Top 3 learnings
  - Go/No-Go voorstel

- [ ] **Kwantitatieve sectie:**
  - Usage data dashboards
  - Feature adoption matrix
  - NPS breakdown (promoters/passives/detractors)
  - Van Westendorp pricing analyse met grafiek

- [ ] **Kwalitatieve sectie:**
  - Thematische analyse (pijnpunten, waarde, feature requests)
  - Top 10 quotes
  - Sentiment breakdown per company
  - Referral feedback

- [ ] **Learnings & Recommendations:**
  - Wat werkte goed (successen)
  - Wat werkte niet (failures)
  - Feature roadmap prioriteiten obv pilot feedback
  - Channel insights (hoe bereikten we deelnemers? Wat werkte?)
  - Pricing voorstel

- [ ] **Go/No-Go Data Input:**
  - Willingness to Pay criterium: score ___ (1-5), bewijs: _____
  - Solution Fit criterium: score ___ (1-5), bewijs: _____
  - Channel Viability criterium: score ___ (1-5), bewijs: _____

- [ ] **Rapport opgeslagen:** `roosevelt-ops/.planning/validation/pilot-report-[DATUM].md`

### Internal Review Meeting (90 min)

- [ ] **Deelnemers:** Founder, tech lead, (optioneel: design lead, adviseur)
- [ ] **Agenda:**
  1. Pilot analyse rapport doorlopen (30 min)
  2. Success metrics review (15 min)
  3. Learnings discussie (20 min)
  4. Go/No-Go input verzamelen (15 min)
  5. Next steps bepalen (10 min)
- [ ] **Output:** Go/No-Go review meeting gepland (week 6)

---

## Post-Pilot

### Follow-up met Deelnemers

- [ ] **Thank you emails** verstuurd naar alle deelnemers
- [ ] **Pilot rapport samenvatting** gedeeld (geanonimiseerd, indien deelnemer interesse)
- [ ] **Referrals opvolgen:**
  - [ ] Referral leads ontvangen: _____ (namen/bedrijven)
  - [ ] Outreach gedaan naar referrals
  - [ ] Intake gesprekken gepland met referrals

- [ ] **Continuatie gesprekken** (voor deelnemers die "ja" zeiden):
  - [ ] Company P1: Commercieel gesprek gepland (ja/nee)
  - [ ] Company P2: Commercieel gesprek gepland (ja/nee)
  - [ ] Company P3: Commercieel gesprek gepland (ja/nee)
  - [ ] Company P4: Commercieel gesprek gepland (ja/nee)
  - [ ] Company P5: Commercieel gesprek gepland (ja/nee)

### Product Updates obv Pilot

- [ ] **Quick wins geïmplementeerd** (kleine bugs/UX verbeteringen binnen 2 weken):
  - [ ] Bug 1: _____
  - [ ] Bug 2: _____
  - [ ] UX verbetering 1: _____

- [ ] **Feature roadmap bijgewerkt:**
  - [ ] Top 3 pilot feature requests toegevoegd aan backlog
  - [ ] Prioriteit scores bijgewerkt obv pilot feedback

- [ ] **Onboarding verbeterd:**
  - [ ] Training video updates (indien nodig)
  - [ ] Quick start guide revised
  - [ ] FAQ uitgebreid met pilot vragen

### Go/No-Go Review Voorbereiding

- [ ] **Go/No-Go review meeting gepland** (zie `09-go-no-go-review.md`)
  - Datum: _______
  - Deelnemers: _______
  - Locatie/link: _______

- [ ] **Fase 2 Go/No-Go data verzameld:**
  - [ ] Willingness to Pay bewijs (survey + interviews)
  - [ ] Competitive Advantage analyse (wat zeiden deelnemers over concurrenten?)
  - [ ] Channel Viability data (hoe vonden deelnemers ons? Via welk kanaal?)

- [ ] **Scoring matrix voorbereid:**
  - [ ] Evidence per criterium samengevat
  - [ ] Individual scoring sheets geprint (voor deelnemers review meeting)

### Data Archivering & Privacy

- [ ] **Data cleanup:**
  - [ ] Pilot accounts gearchiveerd (indien deelnemers niet doorgaan)
  - [ ] Persoonlijke data verwijderd (conform AVG, 6 maanden bewaren)
  - [ ] Geanonimiseerde data opgeslagen voor toekomstig gebruik

- [ ] **Documentatie archief:**
  - [ ] Alle interview notes opgeslagen in `/validation/pilot-interviews/`
  - [ ] Survey responses geëxporteerd naar CSV
  - [ ] Analytics dashboards gearchiveerd als screenshots

### Communicatie

- [ ] **Intern team debrief** (reflectie op pilot proces):
  - Wat ging goed in onze aanpak?
  - Wat kunnen we verbeteren voor volgende pilot (indien Phase 3)?
  - Learnings gedocumenteerd in `/validation/pilot-learnings.md`

- [ ] **Stakeholder update** (indien van toepassing):
  - Investors/adviseurs geïnformeerd over pilot resultaten
  - Summary email verstuurd met key metrics en next steps

---

## Metrics Dashboard (Template)

Kopieer deze template in een spreadsheet of Notion database voor real-time tracking tijdens de pilot.

```
PILOT METRICS TRACKER — Roosevelt OPS

┌────────────────────────────────────────────────────────────────┐
│  WEEK 1-4 OVERVIEW                                             │
├────────────────────────────────────────────────────────────────┤
│  Metric                Target    W1    W2    W3    W4   Status │
├────────────────────────────────────────────────────────────────┤
│  Login freq (avg)      ≥3x/wk   ___   ___   ___   ___   ⬜     │
│  Feature adoption      ≥60%     ___   ___   ___   ___   ⬜     │
│  Session duration      -        ___   ___   ___   ___   ⬜     │
│  Support tickets       <5/co    ___   ___   ___   ___   ⬜     │
│  Active companies      5/5      ___   ___   ___   ___   ⬜     │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  END-OF-PILOT METRICS                                          │
├────────────────────────────────────────────────────────────────┤
│  Metric                Target         Actual         Status    │
├────────────────────────────────────────────────────────────────┤
│  NPS                   ≥40            _____          ⬜         │
│  WTP (# "ja")          ≥3/5           _____/5        ⬜         │
│  Referrals             ≥2             _____          ⬜         │
│  Time-to-value         ≤3 days        _____ days    ⬜         │
│  Continuatie rate      ≥60%           _____%         ⬜         │
└────────────────────────────────────────────────────────────────┘

LEGEND: ✅ Target gehaald | ⚠️ Net niet gehaald | ❌ Niet gehaald | ⬜ TBD
```

---

## Volgende Stap

Na afronding van deze checklist:
→ Ga naar `09-go-no-go-review.md` voor Fase 2 Go/No-Go beslissing.

**Pilot eigenaar:** [Naam]
**Start datum:** [YYYY-MM-DD]
**Eind datum:** [YYYY-MM-DD]
