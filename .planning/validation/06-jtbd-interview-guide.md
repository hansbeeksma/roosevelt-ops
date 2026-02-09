# JTBD Interview Guide — Roosevelt OPS

> **Laatste update:** 2026-02-09
> **Versie:** 1.0
> **Doel:** Ontdekken welke "jobs" Nederlandse SMB founders en ops managers proberen te doen rondom operationeel management, en welke krachten (push/pull/anxiety/habit) hun beslissingen drijven.

---

## 1. Onderzoeksdoel

### Primaire Vraag
Welke "jobs" proberen Nederlandse SMB founders en operations managers te doen rondom operationeel management?

### Secundaire Vragen
1. Welke tools en processen gebruiken ze nu voor operationeel management?
2. Wat frustreert hen het meest in hun huidige aanpak?
3. Wat zou hun werkdag fundamenteel veranderen?
4. Welke beslissingen hebben ze uitgesteld of vermeden?
5. Waarom zijn ze niet al overgestapt naar een betere oplossing?

### Hypotheses om te Testen

| # | Hypothese | Wat we zoeken |
|---|-----------|---------------|
| H1 | **Spreadsheet-chaos:** Founders beheren operationele KPI's in Excel/Sheets maar verliezen overzicht bij groei | Frustratie over manuele consolidatie, versiebeheer, gebrek aan real-time inzicht |
| H2 | **Versnipperde tools:** Ops managers gebruiken 5+ losse tools (Slack, Sheets, Notion, etc.) zonder centrale overzicht | Tijd verloren aan schakelen tussen tools, data inconsistentie, beslissingen op verouderde data |
| H3 | **Te laat signaleren:** Teams merken problemen (churn, voorraad, bottlenecks) pas dagen/weken later | Gemiste kansen, firefighting, reactiviteit i.p.v. proactiviteit |
| H4 | **Rapportage-overhead:** Maandelijkse rapportage kost meerdere dagen handmatig werk | Frustratie over repetitief werk, fouten in rapporten, tijdverspilling |
| H5 | **Gebrek aan context:** Cijfers zonder verhaal — data is er, maar de 'waarom' ontbreekt | Beslissingen op basis van gevoel i.p.v. bewijs, langzame root-cause analyse |
| H6 | **Team alignment gap:** Niet iedereen kijkt naar dezelfde cijfers, leidend tot verkeerde prioritering | Verkeerde focus, wrijving tussen teams, dubbel werk |
| H7 | **Implementatie-angst:** Eerdere pogingen om BI/analytics tools te implementeren zijn mislukt (te complex, te duur, niet aangenomen) | Angst voor nieuwe tools, vertrouwen in spreadsheets, "beter de duivel die je kent" |

---

## 2. Doelgroep & Werving

### Ideaal Deelnemersprofiel

| Segment | Functietitel | Bedrijfsgrootte | Verantwoordelijkheden | Typische Pijnpunten |
|---------|-------------|-----------------|----------------------|---------------------|
| **1. Founders/CEO's** | Oprichter, CEO, Managing Director | 10-30 FTE | - Alle operationele KPI's zelf bijhouden<br>- Maandelijks management rapport<br>- Dagelijks vuur blussen<br>- Budget/groei bewaken | - Te veel tijd aan handmatig datawerk<br>- Onvolledig beeld van de business<br>- Kan niet delegeren zonder overzicht te verliezen<br>- Reactief i.p.v. strategisch bezig |
| **2. Ops Managers/COOs** | Operations Manager, COO, Head of Operations | 30-70 FTE | - Centrale operationele dashboards beheren<br>- Cross-functionele bottlenecks identificeren<br>- Rapportage naar C-level<br>- Process optimization | - Consolideren van data uit meerdere afdelingen<br>- Tools spreken niet met elkaar<br>- Rapporten zijn verouderd bij oplevering<br>- Root-cause analyse is handmatig graven |
| **3. Team Leads** | Finance Manager, Sales Manager, Product Manager | 70-100 FTE | - Eigen team KPI's rapporteren<br>- Bijdragen aan management rapportage<br>- Eigen team optimaliseren<br>- Bottlenecks signaleren | - Eigen systemen vs. centrale rapportage<br>- Dubbel werk (twee versies van waarheid)<br>- Te laat inzicht in trends<br>- Veel tijd aan Excel acrobatiek |

### Wervingsstrategie

#### LinkedIn Outreach Template

```
Onderwerp: Korte vraag over operationele rapportage (15 min)

Hoi [Naam],

Ik zag dat je Operations Manager bent bij [Bedrijf]. Ik doe onderzoek naar hoe Nederlandse scale-ups (10-100 FTE) hun operationele dashboards en KPI's managen.

Zou je 30-45 minuten tijd hebben voor een gesprek over jouw ervaring? Geen pitch — ik ben oprecht nieuwsgierig hoe jullie dit nu aanpakken en waar je tegenaan loopt.

Als dank krijg je een €50 bol.com bon + early access tot ons onderzoek (welke tools andere bedrijven gebruiken).

Interesse? Laat weten welke week je beschikbaar bent.

Groet,
[Naam]
```

#### Email Uitnodiging Template

```
Onderwerp: Uitnodiging: 45-min interview over operationeel management (€50 cadeaubon)

Beste [Naam],

Bedankt voor je interesse!

**Waar gaat het over?**
Ik onderzoek hoe Nederlandse scale-ups (10-100 medewerkers) hun operationele data en KPI's managen. Geen verkooppraatje — ik wil leren van jouw ervaring.

**Wat is je rol?**
Je deelt hoe je nu werkt, waar je tegenaan loopt, en wat je al hebt geprobeerd. Er zijn geen goede of foute antwoorden.

**Wat krijg je ervoor?**
- €50 bol.com cadeaubon
- Early access tot onderzoeksrapport (toolstack benchmarks van 20+ bedrijven)
- Optioneel: gratis pilot access tot Roosevelt OPS (als relevant)

**Praktisch:**
- 45 minuten (video of in-person)
- Ik neem het gesprek op (audio, alleen voor analyse)
- Alle data is anoniem (geen bedrijfsnaam in rapporten)

Beschikbaar voor een gesprek? Kies hieronder een moment:
[Calendly link]

Vragen? Stuur gerust een berichtje.

Groet,
[Naam]
[Functie]
[Telefoonnummer]
```

#### Screener Vragen (kwalificatie)

Stel deze vragen VOORDAT je het interview inplant:

1. **Wat is je huidige functie?** (verwacht: COO, Ops Manager, Founder, Team Lead)
2. **Hoeveel mensen werken er bij jullie bedrijf?** (target: 10-100 FTE)
3. **Ben je betrokken bij operationele rapportage of KPI tracking?** (moet: ja)
4. **Welke tools gebruik je nu voor operationele dashboards?** (verwacht: Excel, Sheets, Notion, Metabase, Looker, etc.)
5. **Hoe vaak maak je operationele rapporten of bekijk je KPI's?** (verwacht: dagelijks/wekelijks)
6. **Ervaar je frustraties met je huidige aanpak?** (moet: ja — anders geen push-force)
7. **Ben je de afgelopen 6 maanden actief op zoek geweest naar een betere oplossing?** (ideaal: ja — sterker signaal)

**Kwalificatie-criteria:**
- ✅ JA op vragen 3, 6
- ✅ 10-100 FTE bedrijf
- ✅ Rol: decision-maker of heavy user van operationele data

### Incentive Opties

| Optie | Kosten | Voordeel | Nadeel |
|-------|--------|----------|--------|
| **€50 bol.com bon** | €50 | Laagdrempelig, breed geaccepteerd | Geen product-binding |
| **Gratis pilot (3 mnd)** | €0 (ARR opportunity) | Bindt deelnemer aan product, levert gebruiksdata | Alleen relevant voor ready-to-switch segment |
| **Onderzoeksrapport** | €0 | Waardevol voor doelgroep, positioneert ons als expert | Vereist schrijfwerk achteraf |

**Aanbeveling:** Combinatie van €50 bon + onderzoeksrapport + optionele pilot voor sterk geïnteresseerden.

### Doelstelling

| Segment | Doel | Reden |
|---------|------|-------|
| Founders/CEO's (10-30 FTE) | 4-5 interviews | Grootste pijnpunten, hoogste decision-making power |
| Ops Managers/COOs (30-70 FTE) | 4-5 interviews | Primary users, diepste product inzicht nodig |
| Team Leads (70-100 FTE) | 2-3 interviews | Invloed op adoptie, maar niet primary buyer |
| **TOTAAL** | **10-15 interviews** | Voldoende voor patroonherkenning, haalbaar in 3 weken |

---

## 3. Interview Script

> **Belangrijke noten vooraf:**
> - Dit script is een **gids**, geen strak script. Laat het gesprek natuurlijk verlopen.
> - Gebruik **doorvragen** om vaag antwoord concreet te maken: "Kun je daar een voorbeeld van geven?"
> - **Luister meer dan je praat** (80/20 verhouding).
> - **Neem het op** (met toestemming) — je kunt niet goed luisteren én typen.

---

### Opening (5 min)

**Letterlijke tekst (Nederlands):**

```
"Hoi [Naam], super bedankt dat je tijd hebt gemaakt. Ik ben [jouw naam],
ik werk aan Roosevelt OPS, maar vandaag ben ik hier puur om te leren.

Het doel van dit gesprek is om te begrijpen hoe jij en je team operationele
data en KPI's beheren. Ik ga je vragen stellen over hoe jullie het nu doen,
waar je tegenaan loopt, en wat je al hebt geprobeerd.

Er zijn geen goede of foute antwoorden — ik ben gewoon nieuwsgierig naar
jouw ervaring.

Twee praktische dingen:
1. Ik wil graag het gesprek opnemen (alleen audio, puur voor mijn analyse).
   Alles blijft anoniem. Is dat oké?
2. We hebben 45 minuten ingepland. Als we eerder klaar zijn, helemaal prima.

Zullen we beginnen?"
```

**Als ze vragen over je product:**
```
"Straks vertel ik er graag meer over, maar ik wil eerst echt begrijpen
hoe jullie het nu doen — zonder dat ik je beïnvloed met mijn ideeën.
Deal?"
```

---

### Deel 1: Timeline — Het Beslismoment (15 min)

**Doel:** Reconstrueer een specifieke situatie waarin ze een operationele beslissing namen of een probleem moesten oplossen.

#### Openvraag (start van timeline)

**Q1:** "Vertel me eens, wanneer heb je voor het laatst een operationeel probleem moeten oplossen — iets waar je data of KPI's voor nodig had?"

**Doorvragen:**
- "Wanneer was dat precies? Deze week, vorige maand?"
- "Waar was je toen? Op kantoor, thuis, onderweg?"
- "Wat was de aanleiding? Hoe kwam het probleem aan het licht?"

---

#### Context van de situatie

**Q2:** "Loop me door die dag heen. Wat was er aan de hand?"

**Doorvragen:**
- "Wie merkte het probleem als eerst op?"
- "Was er een deadline of urgentie?"
- "Hoe lang had dit probleem al gespeeld voordat je het ontdekte?"

---

**Q3:** "Welke data of cijfers had je nodig om het op te lossen?"

**Doorvragen:**
- "Waar kwam die data vandaan? Welke systemen?"
- "Moest je iemand anders vragen om data aan te leveren?"
- "Hoe lang duurde het om alle data bij elkaar te krijgen?"

---

**Q4:** "Hoe zag je proces eruit om tot een beslissing te komen?"

**Doorvragen:**
- "Welke tools gebruikte je? (Excel, Sheets, BI tool?)"
- "Moest je data handmatig consolideren of transformeren?"
- "Hoe presenteerde je het uiteindelijk? (Slide deck, spreadsheet, dashboard?)"

---

**Q5:** "Wie waren er nog meer bij betrokken? Met wie moest je afstemmen?"

**Doorvragen:**
- "Waren jullie het snel eens, of was er discussie?"
- "Had iedereen dezelfde data, of moesten jullie eerst uitzoeken waarom cijfers niet klopten?"

---

**Q6:** "Hoe lang duurde het hele proces — van 'we hebben een probleem' tot 'we hebben een beslissing'?"

**Doorvragen:**
- "Was dat sneller of langzamer dan je had gehoopt?"
- "Waar ging de meeste tijd in zitten?"

---

**Q7:** "Als je terugkijkt, wat zou je anders hebben gedaan?"

**Doorvragen:**
- "Wat had het proces sneller kunnen maken?"
- "Welke informatie had je graag eerder gehad?"

---

**Q8:** "Hoe vaak komt dit soort situatie voor? Wekelijks, maandelijks, ad-hoc?"

**Doorvragen:**
- "Is dit een eenmalige crisis geweest, of zie je patronen terugkomen?"

---

### Deel 2: Push — De Frustratie (10 min)

**Doel:** Begrijp wat hen wegduwt van hun huidige aanpak. Wat is zo frustrerend dat ze actief op zoek zijn naar iets beters?

---

**Q1:** "Je vertelde net over [situatie uit deel 1]. Wat was het meest frustrerende deel van dat proces?"

**Doorvragen:**
- "Hoe vaak ervaar je die frustratie?"
- "Hoe lang speelt dit al?"
- "Heb je dit met je team of collega's besproken?"

---

**Q2:** "Als je niks zou doen aan dit probleem, wat zijn dan de gevolgen?"

**Doorvragen:**
- "Hoe ziet het ergste scenario eruit?"
- "Is dit al een keer misgegaan? Wat gebeurde er toen?"

---

**Q3:** "Op een schaal van 1 tot 10, hoe frustrerend is je huidige manier van werken?"

**Doorvragen:**
- "Wat maakt het een [score] en geen 10?"
- "Wat zou er moeten veranderen om naar een 3 of lager te gaan?"

---

**Q4:** "Waar verlies je de meeste tijd aan in je huidige proces?"

**Doorvragen:**
- "Hoeveel uur per week ben je kwijt aan handmatig datawerk?"
- "Wat zou je doen met die tijd als het geautomatiseerd was?"

---

**Q5:** "Welke fouten maak je door je huidige aanpak?"

**Doorvragen:**
- "Data inconsistenties, verkeerde cijfers in rapporten, gemiste signalen?"
- "Hoe vaak ontdek je achteraf dat je naar verkeerde data keek?"

---

**Q6:** "Hoe vertrouw je de data die je nu gebruikt?"

**Doorvragen:**
- "Check je altijd dubbel voordat je een beslissing neemt?"
- "Gebeurt het dat verschillende teamleden andere cijfers hebben voor hetzelfde KPI?"

---

**Q7:** "Wat is het gevaarlijkste aan je huidige aanpak?"

**Doorvragen:**
- "Blind spots, te late signalering, gebrek aan context?"

---

**Q8:** "Als je baas (of investeerder) zou vragen 'Hoe weet je zeker dat dit de juiste beslissing is?', hoe makkelijk kun je dat onderbouwen met data?"

**Doorvragen:**
- "Heb je weleens een beslissing moeten verdedigen zonder goede data?"

---

### Deel 3: Pull — De Aantrekkingskracht (10 min)

**Doel:** Begrijp wat hen aantrekt naar een betere oplossing. Wat is de ideale situatie?

---

**Q1:** "Als je een toverstaf had en je operationele data/KPI's perfect geregeld waren, hoe zou dat eruitzien?"

**Doorvragen:**
- "Welke data zou je zien als je 's ochtends inlogt?"
- "Hoe vaak zou je het checken? Dagelijks, real-time?"

---

**Q2:** "Wat zou er fundamenteel veranderen in je werkdag?"

**Doorvragen:**
- "Welke vergaderingen zouden sneller gaan?"
- "Welke taken zou je niet meer hoeven doen?"
- "Hoeveel tijd zou je vrijmaken?"

---

**Q3:** "Wie zou er nog meer baat bij hebben, naast jou?"

**Doorvragen:**
- "Welke teams zouden hierdoor beter samenwerken?"
- "Zou het besluitvorming versnellen?"

---

**Q4:** "Als dit probleem opgelost was, wat zou je team dan kunnen bereiken dat nu niet lukt?"

**Doorvragen:**
- "Betere groei, minder churn, lagere kosten?"
- "Meer proactief i.p.v. reactief?"

---

**Q5:** "Welke andere oplossingen heb je al geprobeerd of bekeken?"

**Doorvragen:**
- "Waarom heb je die wel/niet geïmplementeerd?"
- "Wat beviel je wel? Wat niet?"

---

**Q6:** "Heb je weleens een BI-tool, dashboard tool, of analytics platform overwogen?"

**Doorvragen (als JA):**
- "Welke tools heb je bekeken? (Metabase, Looker, Tableau, Power BI?)"
- "Waarom is het niet doorgegaan?"
- "Te duur, te complex, team wilde niet switchen?"

**Doorvragen (als NEE):**
- "Waarom niet? Te overweldigend, te duur, niet nodig geacht?"

---

**Q7:** "Stel je zou morgen een perfecte oplossing hebben, wat zou de eerste use case zijn die je ermee zou doen?"

**Doorvragen:**
- "Is dat een bestaand rapport dat je nu handmatig maakt?"
- "Of een nieuw inzicht dat je nu mist?"

---

**Q8:** "Hoeveel zou het waard zijn voor je bedrijf als dit probleem permanent opgelost was?"

**Doorvragen:**
- "In tijd, geld, betere beslissingen?"
- "Zou je er budget voor vrijmaken? Hoeveel ongeveer?"

---

### Deel 4: Anxiety — De Twijfel (10 min)

**Doel:** Begrijp wat hen tegenhoudt om te switchen naar een nieuwe oplossing. Wat zijn de barrières?

---

**Q1:** "Stel, morgen komt er een oplossing voorbij die alles zou oplossen. Waarom zou je *niet* meteen switchen?"

**Doorvragen:**
- "Waar zou je je zorgen over maken?"
- "Wat zou er mis kunnen gaan?"

---

**Q2:** "Heb je eerder een nieuwe tool of systeem geïntroduceerd in je bedrijf? Hoe ging dat?"

**Doorvragen (als SLECHT):**
- "Wat ging er mis? Adoptie, complexiteit, kosten?"
- "Hoe lang duurde het voordat je team het opgaf?"

**Doorvragen (als GOED):**
- "Wat maakte het succesvol? Wat zou je opnieuw doen?"

---

**Q3:** "Hoeveel tijd zou je realistisch hebben om een nieuwe tool te implementeren?"

**Doorvragen:**
- "Zou je er zelf tijd voor hebben, of zou iemand anders het moeten oppakken?"
- "Heb je een IT-team, of is het aan jou?"

---

**Q4:** "Wat zijn de grootste barrières voor je team om een nieuw systeem te adopteren?"

**Doorvragen:**
- "Moeten ze iets nieuws leren? Verandert hun workflow?"
- "Zijn ze loyaal aan Excel/hun huidige manier?"

---

**Q5:** "Waar zou je baas (of CFO) zich zorgen over maken als je met een nieuwe tool aan kwam zetten?"

**Doorvragen:**
- "Kosten, ROI, lock-in, veiligheid?"
- "Hoe makkelijk is het om budget vrij te krijgen voor dit soort tools?"

---

**Q6:** "Zou je data moeten migreren? Hoe zit dat nu geregeld?"

**Doorvragen:**
- "Waar staat je data nu? (Sheets, SQL database, ERP?)"
- "Is dat makkelijk te exporteren, of zit het in silo's?"

---

**Q7:** "Wat zou je moeten opgeven als je switchte?"

**Doorvragen:**
- "Custom Excel sheets, bestaande processen, bekende workflows?"

---

**Q8:** "Als je dit aan je team zou voorstellen, wie zou er waarschijnlijk tegenstribbelen?"

**Doorvragen:**
- "Waarom? Verandering-aversie, gebrek aan vertrouwen, te druk?"

---

### Deel 5: Habit — De Gewoonte (5 min)

**Doel:** Begrijp de kracht van bestaand gedrag. Wat werkt er wél aan hun huidige aanpak?

---

**Q1:** "Loop me door je huidige proces heen, van begin tot eind. Hoe maak je nu een operationeel rapport?"

**Doorvragen:**
- "Welke tools open je?"
- "Waar haal je data vandaan?"
- "Hoe lang duurt het?"

---

**Q2:** "Hoe lang doe je het al op deze manier?"

**Doorvragen:**
- "Heb je het zelf opgezet, of heb je het zo overgenomen?"

---

**Q3:** "Wat werkt er *wél* goed aan je huidige aanpak?"

**Doorvragen:**
- "Flexibiliteit, controle, bekendheid?"
- "Waar vertrouw je op in je huidige systeem?"

---

**Q4:** "Hoeveel tijd en geld besteed je er nu per week/maand aan?"

**Doorvragen:**
- "Eigen tijd + team tijd?"
- "Toolkosten (als je iets betaald gebruikt)?"

---

**Q5:** "Als je huidige toolstack morgen weg zou zijn, wat zou je het meest missen?"

**Doorvragen:**
- "Zou je het vervangen met hetzelfde, of iets nieuws proberen?"

---

**Q6:** "Hoe makkelijk zou het zijn voor iemand anders om over te nemen wat jij nu doet?"

**Doorvragen:**
- "Is het gedocumenteerd, of zit het vooral in jouw hoofd?"

---

### Afsluiting (5 min)

---

**Q1:** "Is er iets dat ik niet gevraagd heb, maar dat je denkt dat ik zou moeten weten?"

---

**Q2:** "Ken je nog iemand (collega, oud-collega, in je netwerk) die ook met dit soort uitdagingen worstelt?"

**Doorvragen:**
- "Zou je me kunnen introduceren? Ik zou graag ook hun perspectief horen."

---

**Q3 (Commitment Escalation):** "Ik ben bezig met het bouwen van een oplossing voor dit probleem. Als ik over 2-3 weken een vroege versie heb, zou je dan 15 minuten tijd hebben om ernaar te kijken en feedback te geven?"

**Alternatief (als ze zeer geïnteresseerd lijken):**
"We starten binnenkort een pilot met een paar bedrijven. Zou je interesse hebben om mee te doen? Je krijgt 3 maanden gratis toegang, en je helpt ons het product vorm te geven."

---

**Bedanken:**
```
"Super bedankt voor je tijd en openheid, [Naam]. Dit was echt waardevol.
Ik stuur je binnen een week de €50 bol.com bon + het onderzoeksrapport
zodra ik alle interviews heb afgerond.

En als je nog vragen hebt of iets bedenkt, stuur gerust een berichtje!"
```

---

## 4. Mom Test Cheatsheet

### Rode Vlaggen (onbetrouwbare signalen)

| # | Rode Vlag | Probleem | Wat te doen |
|---|-----------|----------|-------------|
| 1 | "Dat is een geweldig idee!" | Compliment, geen data | Negeer, vraag door: "Hoe doe je het nu?" |
| 2 | "Ik zou het zeker gebruiken" | Hypothetisch, kost niets | Vraag: "Wat gebruik je nu? Waarom ben je daar niet tevreden mee?" |
| 3 | "Ja, dat zou ik betalen" | Niet bindend | Test commitment: "We hebben early access voor €X/maand, wil je je nu aanmelden?" |
| 4 | "Stuur maar als het klaar is" | Passief, laag commitment | Vraag: "Mag ik je over 2 weken bellen om feedback te geven op een prototype?" |
| 5 | Geen specifieke details | Generaliseert, geen echte ervaring | Vraag: "Wanneer was de laatste keer dat dit gebeurde? Loop me erdoorheen." |
| 6 | Ze praten meer over toekomst dan verleden | Fantasie, geen feiten | Reset: "Laten we even terug naar hoe je het nu doet." |
| 7 | Ze vragen niet naar prijs of implementatie | Geen echte koopintentie | Breng het zelf ter sprake: "Als dit er zou zijn, wat zou je ervoor over hebben?" |
| 8 | Ze stellen jou geen vragen | Beleefd luisteren, niet geïnteresseerd | Test: "Heb je zelf vragen over hoe dit zou werken?" |
| 9 | Veel vaagheid ("meestal", "soms", "we proberen wel") | Geen echte pijn, lage prioriteit | Doorvragen: "Hoe vaak precies? Hoeveel tijd kost dat?" |
| 10 | Ze willen features voorstellen zonder context | Feature-fokus, geen probleem-fokus | Redirect: "Interessant — waarom zou je dat willen?" |

---

### Groene Vlaggen (betrouwbare signalen)

| # | Groene Vlag | Waarom betrouwbaar |
|---|-------------|-------------------|
| 1 | Ze beschrijven specifieke gebeurtenissen met data/tijden | Echte ervaring, geen fantasie |
| 2 | Ze noemen concrete bedragen (tijd/geld) | Kwantificeerbaar pijnpunt |
| 3 | Ze hebben al alternatieven geprobeerd (en gefaald) | Actief zoekend, gemotiveerd |
| 4 | Ze stellen jou vragen over hoe het werkt | Echt geïnteresseerd, evalueren fit |
| 5 | Ze bieden ongevraagd intro's aan bij collega's/peers | Herkennen probleem bij anderen, vertrouwen in jou |
| 6 | Ze vragen wanneer het beschikbaar is | Urgentie, willen het nu |
| 7 | Ze delen interne/gevoelige details (budgetten, frustraties met C-level) | Vertrouwen + hoge relevantie |
| 8 | Ze committen aan vervolgstap (intro, pilot, betalen) | Huidinvestering (tijd/reputatie/geld) |
| 9 | Ze onderbreken met "Ja, precies!" tijdens je vraag | Herkenning van pijnpunt |
| 10 | Ze gebruiken emotionele taal ("Ik word gek van...", "Elke maand weer dat gedoe") | Echte frustratie, niet rationele observatie |

---

### 5 Fouten om te Vermijden

| # | Fout | Waarom Schadelijk | Oplossing |
|---|------|------------------|-----------|
| 1 | **Pitchen tijdens interview** | Jij praat 70%, zij 30% → je leert niets | Stel jezelf een regel: 80% luisteren, 20% vragen |
| 2 | **Leiden met suggestieve vragen** ("Zou het niet handig zijn als...") | Ze zeggen "ja" uit beleefdheid, geen echte mening | Vraag: "Hoe los je dit nu op?" i.p.v. "Zou je dit willen?" |
| 3 | **Toekomstvragen stellen** ("Zou je dit gebruiken?") | Hypothetisch, kost niets om "ja" te zeggen | Vraag: "Wat heb je al geprobeerd? Waarom werkte dat niet?" |
| 4 | **Te korte interviews** (<30 min) | Geen tijd om door facade heen te breken | Plan 45-60 min, maak tijd voor doorvragen |
| 5 | **Niet doorvragen op vaagheid** | Accepteren van "meestal", "soms" als antwoord | Elke keer vragen: "Kun je daar een voorbeeld van geven?" |

---

### Commitment Escalation Ladder

Test commitment met toenemende investering. Elk "ja" op een hoger niveau is sterker bewijs van echte interesse.

| Niveau | Investering | Vraag | Wat het betekent |
|--------|-------------|-------|------------------|
| **1. Tijd** | 15-30 min | "Mag ik je over 2 weken bellen om een prototype te laten zien?" | Bereid om tijd te investeren, maar nog geen huidinvestering |
| **2. Reputatie** | Intro's | "Kun je me introduceren bij je CFO/collega die hier ook mee bezig is?" | Stelt reputatie op het spel door jou te endorsen |
| **3. Geld** | Pre-order/deposit | "We hebben early access voor €X/maand, wil je je nu aanmelden?" | Financiële commitment, sterkste signaal (behalve actie) |
| **4. Actie** | Data delen, pilot starten | "Kun je me toegang geven tot jullie huidige dashboard, zodat ik kan zien hoe we het kunnen verbeteren?" | Investeert tijd + moeite, zeer sterk signaal |

**Gebruik tijdens interview:** Start laag (niveau 1), escaleer als ze positief reageren. Stop bij eerste "nee" — dat geeft je hun echte commitment level.

---

## 5. Forces of Progress Analyse Template

Vul dit in **direct na elk interview** (terwijl het vers is).

---

### Deelnemer Info

| Veld | Waarde |
|------|--------|
| **Naam** | [Anoniem: P001, P002, etc.] |
| **Functie** | [bijv. COO, Founder, Ops Manager] |
| **Bedrijfsgrootte** | [FTE] |
| **Industrie** | [bijv. SaaS, E-commerce, Consultancy] |
| **Interview Datum** | [YYYY-MM-DD] |
| **Interviewer** | [Naam] |

---

### Job Statement (in één zin)

> **Format:** "Help me [doel] zodat ik [gewenst resultaat]"

**Voorbeeld:**
> "Help me operationele bottlenecks proactief signaleren zodat ik problemen oplos voordat ze escaleren."

**Hun job:**
> [Vul in op basis van interview]

---

### Forces Scoring (1-10)

| Force | Score (1-10) | Bewijs uit Interview |
|-------|--------------|----------------------|
| **PUSH** (frustratie met huidig) | [X/10] | Citaten die frustratie tonen |
| **PULL** (aantrekkingskracht nieuw) | [X/10] | Citaten over ideale situatie |
| **ANXIETY** (angst voor switch) | [X/10] | Citaten over barrières/twijfel |
| **HABIT** (comfort met oud) | [X/10] | Citaten over wat werkt aan huidig |

**Switching Likelihood:**
- Push + Pull > Anxiety + Habit = **WAARSCHIJNLIJK SWITCH**
- Push + Pull ≈ Anxiety + Habit = **OP HET RANDJE**
- Push + Pull < Anxiety + Habit = **BLIJFT BIJ HUIDIG**

**Conclusie voor deze deelnemer:** [WAARSCHIJNLIJK SWITCH / OP HET RANDJE / BLIJFT BIJ HUIDIG]

---

### Key Quotes (letterlijk overnemen)

**PUSH (frustraties):**
- "..."
- "..."

**PULL (ideale toekomst):**
- "..."
- "..."

**ANXIETY (barrières):**
- "..."
- "..."

**HABIT (wat werkt nu):**
- "..."
- "..."

---

### Bestaande Toolstack

| Tool/Systeem | Gebruikt Voor | Frustratie |
|--------------|---------------|------------|
| [bijv. Google Sheets] | [KPI tracking] | [Handmatige consolidatie] |
| ... | ... | ... |

---

### Commitment Level Bereikt

| Niveau | Ja/Nee | Details |
|--------|--------|---------|
| **Tijd** (vervolgafspraak) | [ ] | [Datum/actie] |
| **Reputatie** (intro's) | [ ] | [Wie] |
| **Geld** (pilot/pre-order) | [ ] | [Bedrag/duur] |
| **Actie** (data delen) | [ ] | [Wat] |

**Hoogst bereikte niveau:** [Tijd / Reputatie / Geld / Actie]

---

### Red/Green Flags Checklist

**Red Flags:**
- [ ] "Dat is een geweldig idee!"
- [ ] "Ik zou het zeker gebruiken"
- [ ] Geen specifieke details/voorbeelden
- [ ] Praat over toekomst, niet verleden
- [ ] Stelt geen vragen terug
- [ ] Vaagheid ("meestal", "soms")

**Green Flags:**
- [ ] Specifieke gebeurtenissen met data/tijden
- [ ] Noemt concrete bedragen (tijd/geld)
- [ ] Heeft alternatieven geprobeerd
- [ ] Stelt vragen over hoe het werkt
- [ ] Biedt intro's aan
- [ ] Vraagt wanneer beschikbaar
- [ ] Deelt interne/gevoelige details
- [ ] Emotionele taal ("Ik word gek van...")

**Overall Signal Strength:** [STERK / GEMIDDELD / ZWAK]

---

## 6. Interview Notes Template

Gebruik dit template tijdens/direct na elk interview.

---

```markdown
# Interview Notes — [P001, P002, etc.]

## Meta
- **Datum:** [YYYY-MM-DD]
- **Deelnemer:** [Functie, bedrijfsgrootte, industrie]
- **Duur:** [minuten]
- **Format:** [Video/In-person/Telefoon]
- **Opname:** [Ja/Nee, bestandslocatie]

---

## Chronologisch Notitieblok

> Noteer letterlijke quotes tussen aanhalingstekens. Gebruik [P] voor participant, [I] voor interviewer.

**00:00-05:00 Opening**
- [I] Uitleg doel interview
- [P] ...

**05:00-20:00 Deel 1: Timeline**
- [P] Beschrijft situatie: ...
- Quote: "..."
- Doorvraag: ...

**20:00-30:00 Deel 2: Push**
- [P] Frustratie: ...
- Quote: "..."

**30:00-40:00 Deel 3: Pull**
- [P] Ideale situatie: ...
- Quote: "..."

**40:00-50:00 Deel 4: Anxiety**
- [P] Barrières: ...
- Quote: "..."

**50:00-55:00 Deel 5: Habit**
- [P] Huidige proces: ...
- Quote: "..."

**55:00-60:00 Afsluiting**
- Commitment: [Ja/Nee op vervolgafspraak/intro/pilot]
- Referrals: [Namen/bedrijven]

---

## Key Quotes

**PUSH:**
> "..."
> "..."

**PULL:**
> "..."
> "..."

**ANXIETY:**
> "..."
> "..."

**HABIT:**
> "..."
> "..."

---

## Forces Scoring

| Force | Score (1-10) | Rationale |
|-------|--------------|-----------|
| PUSH | [X] | [Waarom deze score] |
| PULL | [X] | [Waarom deze score] |
| ANXIETY | [X] | [Waarom deze score] |
| HABIT | [X] | [Waarom deze score] |

**Switching Formula:** Push ([X]) + Pull ([X]) vs. Anxiety ([X]) + Habit ([X])
**Conclusie:** [WAARSCHIJNLIJK SWITCH / OP HET RANDJE / BLIJFT BIJ HUIDIG]

---

## Job Statement
> "Help me [doel] zodat ik [gewenst resultaat]"

---

## Commitment Level

Hoogst bereikte niveau: **[Tijd / Reputatie / Geld / Actie]**

Details:
- [ ] Vervolgafspraak op [datum]
- [ ] Intro bij [naam]
- [ ] Pilot interesse: [Ja/Nee]
- [ ] Data sharing: [Ja/Nee]

---

## Red/Green Flags

**Red Flags (⚠️):**
- [X] [Beschrijf]

**Green Flags (✅):**
- [X] [Beschrijf]

**Overall:** [STERK / GEMIDDELD / ZWAK signaal]

---

## Toolstack

| Tool | Gebruikt Voor | Frustratie |
|------|---------------|------------|
| [Google Sheets] | [KPI tracking] | [Handmatige consolidatie] |
| ... | ... | ... |

---

## Action Items
- [ ] Stuur €50 bol.com bon naar [email]
- [ ] Voeg toe aan onderzoeksrapport
- [ ] [Andere opvolging]

---

## Researcher Notes
> Persoonlijke observaties, hypotheses, vragen voor volgende interviews

- ...
- ...
```

---

## 7. Analyse Protocol (na 10-15 interviews)

Na alle interviews is het tijd om patronen te identificeren en opportunity statements te formuleren.

---

### Stap 1: Job Clustering

**Doel:** Groepeer alle "job statements" in 3-5 categorieën.

**Methode:**
1. Print alle job statements uit (of zet in spreadsheet)
2. Groepeer op basis van gelijkenis
3. Geef elke cluster een naam

**Voorbeeld Output:**

| Cluster | Aantal Participants | Job Statements |
|---------|---------------------|----------------|
| **Proactief Signaleren** | 7/15 | "Help me bottlenecks zien voordat ze escaleren", "Help me trends vroegtijdig spotten", etc. |
| **Dataconsolidatie** | 9/15 | "Help me data uit meerdere bronnen samenvoegen", "Help me een single source of truth creëren", etc. |
| **Rapportage Automatiseren** | 6/15 | "Help me maandrapportages automatiseren", "Help me tijd besparen op repetitief werk", etc. |
| **Team Alignment** | 5/15 | "Help me iedereen op dezelfde cijfers laten kijken", "Help me discussies voorkomen over 'welke data klopt'", etc. |
| **Besluitvorming Versnellen** | 8/15 | "Help me sneller data-driven beslissingen nemen", "Help me niet te hoeven wachten op rapporten", etc. |

---

### Stap 2: Forces Analyse Aggregatie

**Doel:** Identificeer patronen in push/pull/anxiety/habit over alle interviews.

**Methode:**
1. Maak een tabel met alle scores
2. Bereken gemiddelden per segment
3. Identificeer outliers

**Voorbeeld Output:**

| Segment | Push (gem.) | Pull (gem.) | Anxiety (gem.) | Habit (gem.) | Switch Likelihood |
|---------|-------------|-------------|----------------|--------------|-------------------|
| **Founders (10-30 FTE)** | 8.2 | 7.5 | 6.0 | 5.5 | HOOG (15.7 vs 11.5) |
| **Ops Managers (30-70 FTE)** | 9.0 | 8.5 | 7.0 | 6.0 | HOOG (17.5 vs 13.0) |
| **Team Leads (70-100 FTE)** | 6.5 | 6.0 | 7.5 | 7.0 | LAAG (12.5 vs 14.5) |

**Inzichten:**
- Ops Managers hebben hoogste pijn (push 9.0) + hoogste pull (8.5) → **primary target**
- Team Leads hebben hoge anxiety (7.5) + habit (7.0) → **adoptie-barrière**
- Founders zijn gemotiveerd maar hebben minder tijd voor implementatie (anxiety: time)

---

### Stap 3: Pijnpunt Clustering

**Doel:** Rank pijnpunten op **frequentie × intensiteit**.

**Methode:**
1. Lijst alle genoemde frustraties
2. Tel hoe vaak genoemd (frequentie)
3. Score intensiteit (gem. emotional score uit interviews)
4. Bereken: Frequentie × Intensiteit = Priority Score

**Voorbeeld Output:**

| Pijnpunt | Frequentie (X/15) | Intensiteit (1-10) | Priority Score | Rank |
|----------|-------------------|--------------------|----------------|------|
| **Handmatige dataconsolidatie uit meerdere bronnen** | 12/15 | 8.5 | 102 | #1 |
| **Te laat signaleren van problemen (dagen/weken vertraging)** | 10/15 | 9.0 | 90 | #2 |
| **Maandrapportage kost meerdere dagen werk** | 9/15 | 7.5 | 67.5 | #3 |
| **Data inconsistenties tussen teams** | 8/15 | 7.0 | 56 | #4 |
| **Gebrek aan real-time inzicht** | 11/15 | 5.0 | 55 | #5 |
| **Excel/Sheets versies raken out of sync** | 7/15 | 6.0 | 42 | #6 |

---

### Stap 4: Opportunity Statement Formulering

**Format:**
```
[Doelgroep] wil [job/doel]
maar ervaart [frustratie/barrière]
waardoor [negatief gevolg].
```

**Top 3-5 Opportunity Statements:**

**Opportunity #1: Dataconsolidatie**
> Nederlandse SMB operations managers (30-70 FTE) willen operationele KPI's monitoren vanuit één centrale plek, maar ervaren dat data verspreid zit over Google Sheets, Slack, ERP-systemen en losse tools, waardoor ze wekelijks uren kwijt zijn aan handmatige consolidatie en regelmatig verkeerde beslissingen nemen op basis van incomplete data.

**Opportunity #2: Proactieve Signalering**
> Nederlandse SMB founders (10-30 FTE) willen operationele problemen (churn, voorraad, bottlenecks) proactief signaleren, maar ervaren dat spreadsheets alleen snapshots tonen zonder trends of alerts, waardoor ze problemen pas ontdekken als het al te laat is en in firefighting-mode belanden.

**Opportunity #3: Rapportage Automatiseren**
> Nederlandse SMB operations managers willen maandelijkse management rapportages automatisch genereren, maar ervaren dat dit nu 2-3 dagen handmatig datawerk kost met risico op fouten, waardoor ze kostbare tijd verliezen die ze aan strategisch werk zouden kunnen besteden.

**Opportunity #4: Team Alignment**
> Nederlandse SMB team leads (70-100 FTE) willen dat iedereen naar dezelfde cijfers kijkt, maar ervaren dat elk team zijn eigen dashboards en spreadsheets heeft met subtiele verschillen, waardoor vergaderingen beginnen met discussies over 'welke cijfers kloppen' in plaats van acties.

**Opportunity #5: Real-Time Inzicht**
> Nederlandse SMB operations managers willen beslissingen nemen op basis van actuele data, maar ervaren dat rapporten altijd verouderd zijn tegen de tijd dat ze klaar zijn, waardoor ze te laat reageren op veranderende omstandigheden.

---

### Stap 5: Prioritering Matrix

**Doel:** Rank opportunities op **impact × haalbaarheid**.

| Opportunity | Impact (1-10) | Haalbaarheid (1-10) | Score (Impact × Haalbaarheid) | Rank |
|-------------|---------------|---------------------|-------------------------------|------|
| #1: Dataconsolidatie | 9 | 7 | 63 | #1 |
| #2: Proactieve Signalering | 9 | 6 | 54 | #2 |
| #3: Rapportage Automatiseren | 8 | 8 | 64 | #1 (tie) |
| #4: Team Alignment | 7 | 7 | 49 | #3 |
| #5: Real-Time Inzicht | 8 | 5 | 40 | #4 |

**Aanbevolen Focus:**
1. **Rapportage Automatiseren** (score 64, hoogste haalbaarheid)
2. **Dataconsolidatie** (score 63, hoogste impact)
3. **Proactieve Signalering** (score 54, maar hoogste emotional intensity)

---

### Stap 6: Output Format voor Stakeholders

**Executive Summary (1 pagina):**

```markdown
# Roosevelt OPS — Interview Research Samenvatting

## Onderzoek
- **Periode:** [data]
- **Deelnemers:** 15 interviews (5 founders, 6 ops managers, 4 team leads)
- **Bedrijfsgrootte:** 10-100 FTE Nederlandse SMB's
- **Industrie:** SaaS (6), E-commerce (4), Consultancy (3), Overig (2)

## Top 3 Inzichten

**1. Handmatige Dataconsolidatie = Grootste Pijnpunt**
- 12/15 deelnemers besteden wekelijks 3-8 uur aan data consolideren
- Data verspreid over Sheets, Slack, ERP, losse tools
- Quote: *"Elke maand weer dat gedoe — ik trek data uit 5 systemen, plak het in Excel, en hoop dat ik niets vergeet."*

**2. Proactieve Signalering Ontbreekt**
- 10/15 deelnemers ontdekken problemen te laat (dagen/weken vertraging)
- Spreadsheets tonen geen trends of alerts
- Quote: *"Vorige maand zagen we pas halverwege dat onze churn 30% hoger lag. Als we dat eerder hadden geweten..."*

**3. Implementatie-Angst is Real**
- 8/15 hebben eerder BI-tools geprobeerd (Metabase, Looker) en gefaald
- Reden: te complex, team adoptie mislukt, te duur
- Quote: *"We hebben €15k uitgegeven aan Looker. Na 3 maanden gebruikte niemand het meer. Terug naar Excel."*

## Opportunity #1 (hoogste prioriteit)
**Rapportage Automatiseren voor Ops Managers (30-70 FTE)**
- Impact: 9/10 (bespaart 2-3 dagen/maand)
- Haalbaarheid: 8/10 (duidelijke use case, eenvoudig te valideren)
- Commitment: 6/15 deelnemers willen pilot (4 ops managers, 2 founders)

## Volgende Stappen
1. Prototype bouwen voor maandrapportage automatisering
2. Pilot met 3-5 ops managers (reeds commitment)
3. Itereren op basis van usage data
```

---

## 8. Planning & Logistiek

### 3-Weken Planning

| Week | Activiteiten | Deliverables |
|------|-------------|--------------|
| **Week 1: Werving** | - LinkedIn outreach (50 berichten)<br>- Email follow-ups<br>- Screener vragen toepassen<br>- Eerste 5 interviews inplannen | - 10-15 interviews ingepland<br>- Screener data in spreadsheet |
| **Week 2: Interviews** | - 10-15 interviews afnemen (3/dag max)<br>- Direct na elk interview: notities + forces template invullen<br>- Audio opnames transcriberen (optioneel: Otter.ai) | - 10-15 ingevulde interview notes<br>- 10-15 ingevulde forces templates |
| **Week 3: Analyse** | - Job clustering<br>- Forces aggregatie<br>- Pijnpunt prioritering<br>- Opportunity statements schrijven<br>- Executive summary maken | - Top 3-5 opportunity statements<br>- Prioritering matrix<br>- Executive summary (1 pagina) |

---

### Interviewplanning Spreadsheet Template

| Deelnemer ID | Naam | Functie | Bedrijf (FTE) | Email | Telefoon | Status | Datum/Tijd | Zoom Link | Opname Locatie | Incentive Verstuurd |
|--------------|------|---------|---------------|-------|----------|--------|------------|-----------|----------------|---------------------|
| P001 | [Naam] | COO | [Bedrijf] (45 FTE) | ... | ... | ✅ Afgerond | 2026-02-12 14:00 | [link] | `/recordings/P001.m4a` | ✅ |
| P002 | [Naam] | Founder | [Bedrijf] (18 FTE) | ... | ... | 📅 Ingepland | 2026-02-13 10:00 | [link] | - | ❌ |
| P003 | [Naam] | Ops Manager | [Bedrijf] (60 FTE) | ... | ... | 📧 Uitgenodigd | - | - | - | ❌ |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

**Statussen:**
- 📧 Uitgenodigd (email verstuurd)
- 📅 Ingepland (datum bevestigd)
- ✅ Afgerond (interview gedaan)
- ❌ Afgewezen / Niet gereageerd

---

### Tips voor Remote Interviews (Zoom/Teams)

#### Voor het Interview
- [ ] Test audio/video 10 minuten van tevoren
- [ ] Stuur Zoom link 24 uur vooraf + reminder 1 uur voor gesprek
- [ ] Zorg voor stille ruimte zonder onderbrekingen
- [ ] Heb backup (telefoon) klaar als Zoom faalt
- [ ] Print interview script (om naast scherm te leggen)

#### Tijdens het Interview
- [ ] Start opname direct (vraag eerst toestemming!)
- [ ] Zet Zoom op "Speaker View" (focus op deelnemer)
- [ ] Schakel notificaties uit (Do Not Disturb mode)
- [ ] Gebruik Zoom chat alleen voor links/referenties
- [ ] Maak aantekeningen in apart document (niet in Zoom chat)
- [ ] Let op non-verbale signalen (enthousiasme, frustratie, twijfel)

#### Na het Interview
- [ ] Download opname direct (Zoom verwijdert na 30 dagen)
- [ ] Vul forces template in binnen 1 uur (terwijl het vers is)
- [ ] Stuur bedank-email binnen 24 uur
- [ ] Verstuur incentive (bol.com bon) binnen 1 week

#### Zoom Settings Aanbevelingen
- **Opname:** Lokaal opnemen (niet cloud, vanwege privacy)
- **Video kwaliteit:** 720p (voldoende, bespaart bandbreedte)
- **Audio:** Originele audio (geen achtergrondruisonderdrukking, verstoort transcriptie)
- **Transcriptie:** Schakel uit (Zoom transcriptie is slecht in Nederlands, gebruik Otter.ai achteraf)

---

### Tips voor In-Person Interviews

#### Voor het Interview
- [ ] Plan interview op hun locatie (kantoor) — voelt vertrouwder, je ziet hun context
- [ ] Kom 10 minuten te vroeg (maar wacht buiten tot 5 min voor afspraak)
- [ ] Print consent form (opname toestemming)
- [ ] Breng voice recorder (telefoon is backup)
- [ ] Breng notitieblok (geen laptop — te afleidend)

#### Tijdens het Interview
- [ ] Vraag waar je mag zitten (niet aan hun bureau — te formeel)
- [ ] Leg voice recorder tussen jullie in (zichtbaar, maar niet opdringerig)
- [ ] Maak oogcontact, knik, laat zien dat je luistert
- [ ] Noteer alleen keywords (niet volledige zinnen, verstoort flow)
- [ ] Observeer hun werkplek (welke tools open op scherm, whiteboard, post-its)

#### Na het Interview
- [ ] Vraag aan het einde: "Mag ik een foto maken van je dashboard/scherm?" (met toestemming, voor context)
- [ ] Vul forces template in vóór je vertrekt (terwijl het vers is)
- [ ] Stuur bedank-email diezelfde avond

#### Voordelen In-Person vs. Remote
- **Context:** Je ziet hun werkplek, tools, workflow
- **Non-verbaal:** Lichaamstaal is duidelijker
- **Rapport:** Persoonlijke connectie is sterker
- **Focus:** Minder afleidingen (geen Slack, email)

**Nadelen:**
- **Tijd:** Reistijd (plan max 2 interviews/dag in-person)
- **Kosten:** Reiskosten (indien buiten regio)
- **Scheduling:** Moeilijker in te plannen (mensen werken hybrid)

**Aanbeveling:** Doe 50/50 mix (remote voor snelheid, in-person voor diepere inzichten).

---

## Checklist: Ben je klaar om te starten?

### Voorbereiding
- [ ] Interview script gelezen en geoefend (doe een pilot met collega/vriend)
- [ ] Mom Test cheatsheet uitgeprint (naast je tijdens interviews)
- [ ] Templates klaar (interview notes, forces analyse)
- [ ] Recruitment emails/LinkedIn berichten voorbereid
- [ ] €50 bol.com bons klaarliggen (of budget beschikbaar)
- [ ] Zoom account getest (opname functie werkt)
- [ ] Voice recorder/backup opname-methode getest

### Tijdens Interviews
- [ ] Toestemming voor opname gevraagd
- [ ] 80/20 regel toegepast (80% luisteren, 20% vragen)
- [ ] Doorgevraagd op vaagheid ("Kun je een voorbeeld geven?")
- [ ] Commitment escalation geprobeerd (tijd → reputatie → geld)
- [ ] Referrals gevraagd

### Na Elk Interview
- [ ] Forces template ingevuld binnen 1 uur
- [ ] Interview notes volledig gedocumenteerd
- [ ] Key quotes letterlijk opgeschreven
- [ ] Red/green flags geïdentificeerd
- [ ] Incentive verstuurd binnen 1 week

### Na 10-15 Interviews
- [ ] Job clustering gedaan (3-5 categorieën)
- [ ] Forces aggregatie berekend per segment
- [ ] Pijnpunten gerankt (frequentie × intensiteit)
- [ ] Top 3-5 opportunity statements geformuleerd
- [ ] Prioritering matrix gemaakt (impact × haalbaarheid)
- [ ] Executive summary geschreven (1 pagina)

---

## Veelgestelde Vragen (FAQ)

**Q: Wat als ze meteen vragen naar mijn product?**
A: "Ik vertel er graag straks meer over, maar ik wil eerst echt begrijpen hoe jullie het nu doen — zonder dat ik je beïnvloed met mijn ideeën. Deal?"

**Q: Wat als ze zeggen "Ik heb geen problemen met mijn huidige aanpak"?**
A: Dit is een red flag (geen push-force). Vraag door: "Interessant — wat werkt er dan zo goed? En als je één ding zou kunnen verbeteren, wat zou dat zijn?" Als ze echt geen frustratie hebben, zijn ze geen goede fit.

**Q: Hoeveel doorvragen is te veel?**
A: Als ze enthousiast blijven vertellen → blijf doorvragen. Als ze korte antwoorden geven of ongeduldig worden → ga verder naar volgende vraag.

**Q: Mag ik mijn product noemen in de werving email?**
A: Ja, maar houd het vaag. "Ik werk aan een tool voor operationeel management" is oké. "Ik bouw een AI-gedreven real-time KPI dashboard" is te specifiek (beïnvloedt hun antwoorden).

**Q: Wat als ik maar 5 interviews kan regelen, niet 10-15?**
A: 5 is het absolute minimum voor patronen. Maar: splits dan 50/50 tussen founders en ops managers (geen team leads). Kwaliteit > kwantiteit.

**Q: Moet ik transcripties maken?**
A: Optioneel. Voor diepere analyse is het handig (Ctrl+F op keywords). Maar als tijd beperkt is: notities + key quotes is voldoende.

**Q: Wat als ze tijdens het interview committen aan een pilot?**
A: Geweldig! Maar test het commitment: "Top — ik heb op [datum] een prototype klaar. Kun je die week 30 minuten blokkeren in je agenda om het te bekijken?" Als ze "ja" zeggen en direct plannen → strong signal. Als ze "stuur maar een link" → weak signal.

---

**Laatste tip:** Dit voelt in het begin ongemakkelijk. Dat is normaal. Je leert het meeste van interview #3-5, niet #1. Zie de eerste 2 als oefening.

**Succes!**
