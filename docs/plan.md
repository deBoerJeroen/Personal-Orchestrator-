# Projectplan — Persoonlijke uitvoeringsassistent (werktitel: **Nu**)

## Context

Jeroen kan plannen. Wat hij niet genoeg doet is uitvoeren. De vraag is een persoonlijke
productivity- en coachingapp op basis van GTD, Atomic Habits en The Let Them Theory, met
coachende agents die scherp doorvragen in plaats van bevestigen.

Het echte risico van dit project is dat het project zélf een vorm van motion wordt: een
prachtig systeem ontwerpen in plaats van vandaag één ding afmaken. Dit plan is daarom
bewust het **laatste grote ontwerpdocument**. Alles erna is code die je dezelfde week
gebruikt.

De repo `deboerjeroen/personal-orchestrator-` is leeg (geen commits). Branch:
`claude/productivity-coaching-app-design-zuryp8`.

**Beslissingen die je in deze sessie al hebt genomen:**

| Onderwerp | Keuze |
|---|---|
| Hosting & data | Vercel (regio fra1) + Neon Postgres, EU-regio Frankfurt |
| AI in de app | **Geen LLM-calls in de app.** Coaching via Claude Code skills op de database; in-app coaching is deterministisch (regels) |
| Taal | Nederlandse UI, Engelse domeintermen (next action, motion, habit stack) en Engelse codebase |
| Eerste epic | Volledige fase 1: auth, capture, inbox, doelen, projecten, acties, werk/privé, Nu-scherm, dagcheck-in |

---

## 1. Executive summary

Bouw **Nu**: één rustige webapp (installeerbare PWA) die op elk moment antwoord geeft op
"wat doe ik nu?" en die het startdrempeltje zo laag maakt dat beginnen makkelijker is dan
uitstellen.

Drie tabs, niet vijf: **Nu**, **Inbox**, **Overzicht**. Overal een capture-knop.
Gewoontes leven binnen Nu. Check-in en review zijn korte flows, geen schermen.

De app doet géén AI-calls. Wat vaak "AI-coaching" heet, is bij nader inzien een handvol
deterministische regels: motion herkennen, een actie kleiner maken, na een gemiste gewoonte
de minimale versie voorstellen, in de weekreview alleen uitzonderingen tonen. Die regels
zijn goedkoper, sneller, uitlegbaar, werken offline en sturen geen dagboektekst naar een
model. Het échte gesprek — inbox verduidelijken, een gewoonte ontwerpen, een Let
Them-situatie uitpluizen — voer je in Claude Code met skills die via een CLI op je eigen
database werken.

Fase 1 is in ~2–3 weken bruikbaar. Vanaf dag één ga je hem echt gebruiken; dat is het enige
zinvolle succescriterium.

## 2. Probleemdefinitie

Niet: "ik weet niet wat ik moet doen."
Wel: **de afstand tussen weten en beginnen is te groot, en plannen voelt als vooruitgang.**

Vier concrete faalmodi:

1. **Open loops** — dingen die aandacht vragen zitten in het hoofd, niet in een systeem. Kost rust.
2. **Vage taken** — "presentatie voorbereiden" is niet uitvoerbaar, dus er gebeurt niets.
3. **Motion als vluchtroute** — herplannen, herstructureren, tools vergelijken voelt productief en levert niets op.
4. **Alles-of-niets na terugval** — één gemiste dag maakt het systeem "kapot" en dan stopt het helemaal.

Bestaande apps lossen 1 en 2 half op (Things, Todoist, OmniFocus) en maken 3 vaak erger:
hoe rijker het systeem, hoe meer je erin kunt schuilen.

## 3. Primaire gebruikersbehoefte

> Eén rustige plek die mij vertelt wat nu belangrijk is en mij helpt de kleinst mogelijke
> zinvolle actie daadwerkelijk uit te voeren.

Operationeel: binnen 3 seconden na openen zie ik één actie die ik nu kan doen, en één knop
om te beginnen. Alles daarbuiten is secundair.

## 4. Anti-doelstellingen

Wat we expliciet **niet** willen:

- Geen life operating system. Geen tweede baan aan onderhoud.
- Geen dashboard dat je 's ochtends "leest" in plaats van gebruikt.
- Geen streak-verslaving, geen punten, geen levels, geen schuld-UI.
- Geen retentie-optimalisatie. Elke minuut ín de app is een kostenpost, geen KPI.
- Geen AI die de baas is over je lijst. Geen ondoorzichtige prioritering.
- Geen configuratieproject: geen tientallen tags, geen custom velden, geen instellingen-scherm dat groeit.
- Geen samenwerking, delen, sociale features of publieke profielen.
- Geen therapie. De app is geen behandelaar en doet niet alsof.

## 5. Onderzoek — Getting Things Done

Bronnen: gtd.be (officiële GTD-partner, 5 stappen), Wikipedia GTD (definities), FacileThings
GTD Dictionary (2-minutenregel). `gettingthingsdone.com` en `jamesclear.com` blokkeren
automatische fetches (HTTP 403); definities komen daarom uit secundaire maar consistente
bronnen plus bekende boekinhoud.

**De vijf stappen.**

1. **Capture** — verzamel alles wat aandacht vraagt in een vertrouwd systeem buiten je hoofd.
2. **Clarify** — bepaal per item: is dit uitvoerbaar? Zo nee: weggooien / referentie / someday. Zo ja: wat is de eerstvolgende actie?
3. **Organize** — zet het op de juiste lijst (next actions, projecten, wachten op, agenda, someday).
4. **Reflect** — review, met de weekly review als hart van het systeem.
5. **Engage** — kies op het moment zelf, op basis van context, beschikbare tijd, energie en prioriteit.

**Twee harde definities die het product bepalen.**

- *Next action*: "de eerstvolgende fysieke, zichtbare activiteit die nodig is om de huidige realiteit richting afronding te bewegen." Fysiek en zichtbaar — dat is de toets.
- *Project*: elk gewenst resultaat waarvoor **meer dan één actiestap** nodig is en dat binnen ongeveer een jaar afgerond kan worden. Je "doet" geen project; je doet alleen acties.

**Twee-minutenregel**: als de eerstvolgende actie in twee minuten kan, doe hem nu — niet
omdat hij belangrijk is, maar omdat opslaan en bijhouden duurder is dan uitvoeren.

**Wat ik niet overneem.** GTD's volledige horizon-model (runway t/m 50.000 ft, zes niveaus),
uitgebreide contextlijsten (@telefoon, @errands, @kantoor, @agenda per persoon) en het
natural planning model als verplichte stap. Voor één gebruiker met een mobiel-eerst app is
dat administratieve overhead. Ik houd twee horizons over (identiteit + doelen) en vier
contexten. Dat is de belangrijkste vereenvoudiging in dit plan.

**Wat ik wél hard overneem.** De 5 stappen als workflow, de projectdefinitie inclusief de
regel "geen project zonder next action", de eis dat een actie fysiek en zichtbaar is, de
2-minutenregel bij verwerken, en de weekly review — maar dan als uitzonderingenrapport in
plaats van checklist.

## 6. Onderzoek — Atomic Habits

Bron: jamesclear.com/atomic-habits-summary (geblokkeerd voor fetch; inhoud via zoekresultaten
en boekinhoud), plus meerdere consistente samenvattingen.

**Drie lagen van gedragsverandering.** Uitkomsten (wat je krijgt) → processen (wat je doet)
→ identiteit (wat je gelooft). Duurzame verandering loopt van binnen naar buiten:
*"Het doel is niet een boek lezen, maar een lezer worden."* Elke uitvoering is een stem voor
het type persoon dat je wilt zijn.

**De habit loop.** Cue → craving → response → reward. De vier wetten zijn per stap ontworpen.

| Wet | Bouwen | Afleren (inversie) |
|---|---|---|
| 1. Cue | Maak het zichtbaar | Maak het onzichtbaar |
| 2. Craving | Maak het aantrekkelijk | Maak het onaantrekkelijk |
| 3. Response | **Maak het makkelijk** | Maak het moeilijk |
| 4. Reward | Maak het bevredigend | Maak het onbevredigend |

**Technieken die direct productbeslissingen worden.**

- *Implementation intention*: "Ik zal [gedrag] doen om [tijd] in [locatie]." Verdubbelt ruwweg de kans op uitvoering ten opzichte van intentie alleen.
- *Habit stacking*: "Na [bestaande gewoonte] zal ik [nieuwe gewoonte] doen." De bestaande routine is de cue.
- *Environment design*: gedrag volgt de omgeving meer dan de motivatie. Cue zichtbaar maken werkt beter dan jezelf toespreken.
- *Two-minute rule*: schaal elke nieuwe gewoonte terug tot ≤2 minuten. "Lezen voor het slapen" wordt "het boek openslaan". Eerst opdagen beheersen, dan pas optimaliseren.
- *Habit tracking*: meten is bevredigend en zichtbaar — maar tracking is zelf een gewoonte die kan ontsporen in administratie.
- *Never miss twice*: één keer missen is een ongeluk, twee keer is het begin van een nieuwe gewoonte. De regel gaat niet over perfectie maar over hersteltijd.
- *Motion vs action*: motion is plannen, leren, strategie bepalen — het voelt als vooruitgang maar produceert geen resultaat. Action is het gedrag dat een uitkomst oplevert. Motion is een vorm van uitstel die er goed uitziet.

**Wat ik niet overneem.** Habit scorecard als onboardingstap, temptation bundling als
verplicht veld, accountability partners, habit contracts, uitgebreide streak-visualisaties.
Te veel invoer, te weinig uitvoering.

## 7. Onderzoek — Let Them & Let Me

Bron: samenvattingen van Mel Robbins' *The Let Them Theory* (2024) plus therapeutische
kritiek (Zencare, Psychology Today, Charlotte Bailey, Heartened Therapy).

**Deel 1 — Let Them.** Bij irritatie, frustratie, zorg of piekeren: zeg "let them". Je laat
los wat een ander denkt, zegt, doet, gelooft of voelt. Dat is niet goedkeuring; het is
erkennen dat het buiten je controle ligt en dat de poging tot controle jou uitput.

**Deel 2 — Let Me.** Elk "let them"-moment is een uitnodiging tot "let me": wat kies *ik*,
welke grens stel *ik*, welke actie doe *ik*? Robbins is expliciet dat de theorie pas
compleet is met beide helften. Let Them geeft opluchting, Let Me geeft richting.

**De kritiek is bruikbaar en moet in het product.** Therapeuten waarschuwen consistent voor
drie dingen:

1. De vuistregel werkt slecht in **asymmetrische of onveilige situaties**: mishandeling, dwang op het werk, verwaarlozing, discriminatie. Daar is "laten gaan" de verkeerde zet.
2. Risico op **verwarring tussen grens en cut-off**: een grens is een heldere verwachting mét consequentie; een cut-off is terugtrekken om ongemak te vermijden.
3. Risico op **passieve berusting**: het klinkt rustig en laat het probleem onaangeroerd.

**Productconsequentie.** De Let Them-flow krijgt een verplichte veiligheidsvraag (stap 4).
Bij ja gaat de flow niet naar "loslaten" maar naar grens/actie, met een nuchtere verwijzing
naar echte hulp. En elke flow eindigt bij Let Me — nooit alleen bij Let Them.

## 8. Vertaling van theorie naar productbeslissingen

Per functie: probleem → gedragsprincipe → cognitieve last → uitvoering → complexiteitsrisico → MVP?

| Functie | Probleem | Principe | Verlaagt last door | Maakt uitvoeren makkelijker door | Risico | MVP |
|---|---|---|---|---|---|---|
| Quick capture (FAB, overal) | Open loops in je hoofd | GTD capture; wet 1 zichtbaar | Eén veld, geen classificatie | Denken en doen ontkoppeld | Inbox groeit ongelimiteerd | **Ja** |
| Inbox één-item-per-scherm | Verwerken voelt als een berg | GTD clarify; wet 3 makkelijk | Eén beslissing tegelijk | Elk item eindigt in een actie of weg | Te veel keuzeknoppen | **Ja** |
| Verplichte next action per project | Projecten stallen onzichtbaar | GTD projectdefinitie | Project zonder actie wordt gemarkeerd | Er is altijd iets te doen | Kan pushen tot nep-acties | **Ja** |
| Nu-scherm: 1 aanbeveling + max 3 | Keuzestress = uitstel | GTD engage; wet 1+3 | Van 60 taken naar 3 | Startknop staat direct onder de actie | "Waarom deze?" moet uitlegbaar blijven | **Ja** |
| "Maak kleiner" | Taak te groot om te beginnen | Two-minute rule | Splitst zonder editscherm | Genereert een 2-minuten-startstap | Oneindig kleiner maken | **Ja** |
| Motion/action-markering | Plannen vermomd als werk | Motion vs action | Eén toggle, geen theorie | Dwingt tot "wat levert dit op?" | Zelfbeoordeling wordt schuld | **Ja** |
| Motion-budget (max 1 van 3) | Motion verdringt action | Motion vs action | Automatische grens | Er blijft altijd ≥2 echte acties | Kan te streng voelen | **Ja** |
| Werk/privé-modus | Verkeerde context = ruis | GTD contexten (ingedikt) | Halveert de lijst | Toont alleen wat nu kan | Meer gebieden = meer beheer | **Ja** |
| Dagcheck-in ochtend ≤60s | Dag start zonder richting | Implementation intention | 3 taps, geen tekst | Legt vandaag's 3 acties vast | Groeit uit tot vragenlijst | **Ja** |
| Dagcheck-in avond ≤90s | Geen feedback op gedrag | Wet 4 bevredigend | Alles optioneel | Sluit open loops, zet morgen klaar | Wordt dagboekverplichting | **Ja** |
| Gewoonte met minimale versie | Slechte dag = 0 | Two-minute rule; wet 3 | Twee vaste velden | Minimale versie is altijd haalbaar | Twee versies = twee beslissingen | Fase 2 |
| Eén-tik habit log | Registratie is frictie | Wet 3+4 | Eén tap, geen scherm | Directe bevestiging | Tracking wordt de gewoonte | Fase 2 |
| Herstelregel na missen | Alles-of-niets-terugval | Never miss twice | App beslist, jij niet | Volgende keer automatisch minimaal | Kan betuttelend worden | Fase 2 |
| Habit stack / implementation intention | Gewoonte heeft geen cue | Wet 1 | Eén zin invullen | Koppelt aan bestaande routine | Veld blijft leeg = waardeloos | Fase 2 |
| Let Them-flow | Piekeren over anderen | Let Them / Let Me | Vaste 7 stappen | Eindigt in loslaten óf één actie | Kan therapie-achtig worden | Fase 3 |
| Weekly review als uitzonderingen | Review = 90 minuten admin | GTD reflect | Toont alleen wat afwijkt | Review eindigt in ≤5 besluiten | Detectieregels worden complex | Fase 3 |
| Patrooninzichten | Blinde vlekken | Reflectie | Maandelijks, niet dagelijks | Benoemt concreet gedrag | Statistiek als nieuw motion-speeltje | Fase 3 |
| Pushnotificaties | Cue ontbreekt op het moment | Wet 1 | Actieknop in notificatie | Handelen zonder app te openen | iOS-beperkingen, irritatie | Fase 4 |

## 9. Kerngedragsrisico: motion versus action

Dit is het scharnierpunt van het hele product. Concrete implementatie, **volledig
deterministisch, geen model nodig**:

**a. Expliciete markering.** Elke actie heeft `kind: 'action' | 'motion'`. Standaard `action`.
Een motion-actie heeft een verplicht veld `leads_to`: "en dan kan ik…" — het concrete
resultaat waar deze voorbereiding toe leidt.

**b. Heuristische suggestie bij aanmaken.** Titels die beginnen met *uitzoeken, onderzoeken,
plannen, nadenken over, kiezen tussen, vergelijken, opzetten, structureren, inrichten,
opnieuw bekijken, verkennen* krijgen een suggestie: "Dit lijkt voorbereiding. Klopt dat?"
Eén tap om te bevestigen of af te wijzen. Geen AI, gewoon een woordenlijst — en daarmee
uitlegbaar.

**c. Motion-budget.** Van de maximaal 3 focusacties per dag mag er hooguit 1 motion zijn.
De app biedt bij overschrijding aan te ruilen. Hard, maar niet blokkerend.

**d. Patroondetectie (fase 3, uit `activity_event`).**

| Signaal | Drempel | Interventie |
|---|---|---|
| Project ≥3× bewerkt in 7 dagen, 0 acties afgerond | 3 / 7d | Flow F: "geen nieuw plan, kies één actie van 5 minuten" |
| Actie ≥2× doorgeschoven | 2 | "Kleiner maken, schrappen of bewust plannen?" |
| Motion:action-verhouding afgeronde acties | >50% over 7d | Vlag in weekly review |
| Actie ≥14 dagen in `next` zonder afronding | 14d | Weekly review: schrappen of kleiner |
| Sessie zonder afgeronde actie | 3 sessies op rij | "Wil je nog plannen, of nu één minuut beginnen?" |

**e. Interventie-etiquette.** Maximaal één interventie per dag. Nooit twee keer dezelfde
tekst achter elkaar. Altijd exact drie opties: *kleiner maken* / *5 minuten starten* /
*schrappen of parkeren*. Nooit een vierde optie "later herinneren" — dat is een ontsnapping.

## 10. Productprincipes (tien, hard)

1. **Vastleggen kost < 3 seconden en 0 beslissingen.** Één veld, geen categorie, geen datum.
2. **Het startscherm beantwoordt binnen 3 seconden: wat doe ik nu.** Eén actie, één knop.
3. **Elke plannende handeling eindigt in een concrete eerstvolgende actie.** Geen uitzonderingen.
4. **Alles heeft een minimale versie.** Elke gewoonte, elke actie, elke check-in. Op een slechte dag is de minimale versie de hele opdracht.
5. **Missen is voorzien, niet bestraft.** Geen schuld-UI, geen verloren voortgang, automatische verzachting bij de volgende poging.
6. **Maximaal drie dingen tegelijk zichtbaar.** Drie focusacties, drie opties bij een interventie, drie tabs.
7. **Nieuwe functies moeten aantoonbaar tot méér uitvoering leiden**, niet tot beter overzicht. Twijfel = niet bouwen.
8. **De app claimt geen tijd voor zichzelf.** Onderhoud ≤ 10 minuten per week, totaal.
9. **Elke aanbeveling is in één zin uitlegbaar.** Geen ondoorzichtige scoring, geen black box.
10. **Coaching eindigt altijd in gedrag,** nooit in inzicht alleen.

Deze tien zijn het meetlint voor elk toekomstig verzoek — ook van jou aan mij. Ze komen
letterlijk in `CLAUDE.md`.

## 11. Informatiearchitectuur

**Drie tabs. Meer niet.**

```
┌─────────────────────────────────────────┐
│  Nu          Inbox (3)      Overzicht   │   ← bottom nav (mobiel) / top (desktop)
└─────────────────────────────────────────┘
                                    (+)     ← capture FAB, altijd zichtbaar
```

- **Nu** — aanbevolen actie, max 3 focusacties, gewoontes-van-nu (fase 2), coach-interventie
  wanneer nodig. Start hier de ochtend- en avondcheck-in.
- **Inbox** — één item per scherm, verwerken tot leeg. Badge toont aantal.
- **Overzicht** — één pagina met opvouwbare secties: Doelen → Projecten → Alle acties →
  Wachten op → Someday. Geen aparte schermen, geen dashboards.

**Waarom geen vijf tabs.** Gewoontes zijn onderdeel van "wat doe ik nu", geen aparte plek.
Reflectie is een handeling van 90 seconden, geen bestemming. Elk extra tabblad is een extra
plek om te wonen in plaats van te handelen.

**Werk/privé.** Eén schakelaar in de header: `Alles · Werk · Privé`. Geen aparte accounts,
geen aparte lijsten. De schakelaar filtert alles en onthoudt zijn stand.

## 12. Kernobjecten en datamodel

Je masterprompt noemt 21 entiteiten. Ik breng dat terug naar **12 tabellen**, waarvan 7 in
fase 1. Verantwoording van elke samenvoeging staat eronder.

### Schema (Drizzle / Postgres)

Alle tabellen: `id uuid pk`, `user_id uuid fk`, `created_at`, `updated_at`,
`archived_at timestamptz null` (soft delete overal — nooit hard verwijderen behalve bij
accountverwijdering).

**`user`** (F1) — `email`, `name`, `timezone` default `Europe/Amsterdam`,
`day_boundary_hour` default `4` (een "dag" loopt 04:00→04:00, zodat late avonden niet
meetellen als gemiste dag).

**`area`** (F1) — `name`, `slug`, `sort`. Geseed: `werk`, `prive`. Tabel in plaats van enum
omdat je uitbreiding wilt, maar de UI biedt geen "gebied toevoegen"-knop tot je erom vraagt.

**`identity`** (F2) — `statement` ("Ik ben iemand die afspraken met zichzelf nakomt"),
`area_id?`, `status: active|paused`. Max 5 actief (soft warning).

**`goal`** (F1) — `title`, `area_id`, `identity_id?`, `why` (betekenis), `outcome` (gewenste
uitkomst), `horizon?` (vrij tekstveld, geen datepicker), `status: active|paused|achieved|dropped`.
**Max 3 actieve doelen** — bij een 4e vraagt de app welk doel op pauze gaat. Onderbouwing:
GTD noemt geen getal, maar aandacht is de bottleneck; 3 is klein genoeg om elk doel wekelijks
te kunnen bekijken en groot genoeg voor werk + privé + gezondheid.

**`project`** (F1) — `title` (geformuleerd als uitkomst), `area_id`, `goal_id?`, `outcome`,
`status: active|on_hold|someday|done|dropped`, `due_at?` (alleen echte deadlines),
`review_note?`. Afgeleid veld `has_next_action` (query, niet opgeslagen) drijft de
"onvolledig"-badge.

**`action`** (F1) — het hart van de app.
`title`, `project_id?`, `area_id`, `context: laptop|telefoon|thuis|onderweg` (vier, meer niet),
`estimate_minutes?` (2/5/15/30/60), `energy: laag|normaal|hoog` default normaal,
`due_at?` (echte deadline), `scheduled_for?` (date, "vandaag doen"),
`status: next|waiting|scheduled|done|dropped|someday`,
`waiting_on?` (tekst — wie/wat, vervangt de WaitingFor-tabel),
`kind: action|motion` default action, `leads_to?` (verplicht als kind=motion),
`parent_action_id?` (**precies één niveau diep**, alleen gebruikt door "maak kleiner"),
`source: capture|inbox|coach|review|habit`, `postponed_count int default 0`,
`completed_at?`, `focus_date?` (op welke dag hij bij de max-3 stond).

**`inbox_item`** (F1) — `raw_text`, `status: open|processed|dropped`,
`processed_into_type?`, `processed_into_id?`, `captured_at`. Meer niet. Capture mag nooit
een formulier worden.

**`check_in`** (F1) — `date`, `kind: morning|evening`, `energy: 1..5?`, `mode: werk|prive|beide?`,
`answers jsonb` (alle reflectievragen, allemaal optioneel), `completed_at?`.
Eén tabel voor JournalEntry + ReflectionAnswer + moodtracking. `answers` als JSONB omdat de
vragenset gaat evolueren en ik daar geen migratie voor wil.

**`habit`** (F2) — `title`, `identity_id?`, `area_id`, `cue` (implementation intention of
habit stack, één zin), `stack_after?`, `location?`,
`minimal_version` (verplicht), `normal_version`, `schedule jsonb` (dagen van de week of
"x per week"), `reward?`, `obstacles?`, `recovery_note?`,
`laws jsonb` (welke van de 4 wetten al ingericht zijn — checkboxes, puur voor het ontwerpgesprek),
`type: build|break`, `status: active|paused|archived`. **Max 3 actieve gewoontes**, hard.

**`habit_log`** (F2) — `habit_id`, `date`, `level: minimal|normal|skipped`, `logged_at`,
`note?`. Unieke index op (habit_id, date).

**`activity_event`** (F1) — append-only gebeurtenislog. `type` (`action.completed`,
`action.postponed`, `project.edited`, `capture.created`, `checkin.completed`,
`intervention.shown`, `intervention.accepted`, `action.shrunk`, …), `entity_type`,
`entity_id`, `meta jsonb` (**nooit vrije tekst van de gebruiker**), `occurred_at`.
Dit is de enige tabel die ik toevoeg aan je lijst, en de belangrijkste: zonder
gebeurtenislog is motion-detectie, patrooninzicht en het meetplan onmogelijk.

**`review_session`** (F3) — `kind: weekly|monthly`, `started_at`, `completed_at?`,
`findings jsonb` (welke uitzonderingen werden getoond), `decisions jsonb` (wat besloten is),
`duration_seconds`.

**`coach_note`** (F3) — `source: claude-code|rule`, `topic`, `summary` (korte samenvatting,
geen transcript), `led_to_action_id?`, `occurred_at`. Bewust géén gesprekslogboek: dat is
gevoelig, groeit ongebreideld en levert weinig op.

**`push_subscription` + `notification_pref`** (F4) — endpoint/keys en per-gewoonte
voorkeuren, quiet hours, timezone.

### Wat ik bewust schrap en waarom

| Uit je lijst | Wat er in plaats van komt |
|---|---|
| `WaitingFor` | `action.status='waiting'` + `waiting_on`. Een wachten-op-item is een actie waar jij niet aan zet bent. |
| `SomedayMaybe` | `status='someday'` op project en action. Aparte tabel = aparte lijst = aparte plek om te verdwalen. |
| `HabitDesign` | Velden inline op `habit`. Een gewoonte zonder ontwerp bestaat niet. |
| `JournalEntry` + `ReflectionAnswer` | `check_in.answers` (JSONB). |
| `Reminder` | `notification_pref` + `action.scheduled_for`. |
| `CoachingSession` + `CoachingInsight` + `AgentRecommendation` | `coach_note` + `activity_event`. |
| `Tag` | Niet gebouwd. Gebied + context + project dekken alles; tags zijn de vaakst gebruikte manier om een taaklijst in een archiveringsproject te veranderen. |

**Werk/privé** loopt via `area_id` op alles wat de gebruiker ziet, plus één UI-schakelaar.
**Export**: één endpoint `GET /api/export` → volledige JSON van alle tabellen van deze user,
plus Markdown-export van check-ins. **Verwijderen**: `DELETE /api/account` → harde delete,
cascade, geen tombstones.

## 13. Kritieke gebruikersflows

**Flow A — Gedachte vastleggen (< 3s).**
FAB tap → tekstveld met focus → typen → Enter. Toast: "In inbox." Klaar. Geen velden, geen
vragen, geen classificatie. Offline werkt dit ook (optimistic write, sync bij verbinding).

**Flow B — Inbox verwerken.** Eén item per scherm, één vraag per stap.
Item: *"Nog uitzoeken hoe ouderschapsverlof werkt."*
1. "Wat wil je dat dit oplevert?" → vrij veld, één regel → *"Weten hoeveel verlof ik opneem en dat aangevraagd hebben."*
2. "Is dit uitvoerbaar?" → **Ja** / Nee-referentie / Nee-someday / Weg.
3. "Meer dan één stap nodig?" → **Ja** → wordt project, met de uitkomst uit stap 1 als projecttitel.
4. "Wat is de eerstvolgende fysieke actie?" → de app biedt drie suggesties op basis van de tekst (regelgebaseerd: "opzoeken op…", "bellen met…", "mailen naar…") plus vrij veld → *"Open het personeelshandboek en zoek 'ouderschapsverlof'."*
5. **Motion-check** (automatisch, omdat "uitzoeken" in de titel stond): "Dit is voorbereiding. Waar leidt het toe?" → `leads_to`: *"Aanvraag ingediend bij HR."*
6. "Kan dit in 2 minuten?" → Nee.
7. Gebied: **Privé** (één tap, twee opties).
8. Deadline: "Is er een echte deadline?" → standaard **Nee**. Alleen bij ja een datum.
Resultaat: 1 project, 1 next action, 0 kunstmatige deadlines. Doorlooptijd: ~30 seconden.

**Flow C — Vage taak concreet maken.** Input *"Presentatie voorbereiden"*.
De app herkent het patroon (zelfstandig naamwoord + "voorbereiden/regelen/oppakken") en
start dezelfde clarify-flow, maar begint direct bij "wat wil je dat dit oplevert?".
Resultaat:
- Project: *Teampresentatie klaar en gedeeld*
- Next action: *Open de bestaande presentatie en schrijf de drie kernboodschappen*
- Minimale start: *Open alleen het bestand* (via "maak kleiner")
- Context: laptop · Gebied: werk · Geen deadline tenzij er een is.

**Flow D — Nieuwe gewoonte ontwerpen (fase 2).** Input *"Ik wil vaker mediteren."*
Zes stappen, één vraag per scherm: identiteit → na welke bestaande gewoonte → waar →
minimale versie (≤2 min, verplicht) → normale versie → beloning. Herstelregel wordt
automatisch ingevuld en getoond ter bevestiging, niet als vraag.
Resultaat: *Na mijn koffie zet ik me op de bank en adem ik één minuut (minimaal) / mediteer
ik tien minuten (normaal). Identiteit: iemand die rustig aan zijn dag begint.*

**Flow E — Gemiste gewoonte (fase 2).** Geen melding op de dag zelf, geen rood.
Bij de eerstvolgende gelegenheid staat er alleen: *"Gisteren overgeslagen. Vandaag telt de
minimale versie: 1 minuut."* met één knop. Bij tweemaal achter elkaar: *"Twee keer gemist.
Wat maakte het moeilijk?"* met vier vaste opties (geen tijd / cue gemist / te groot /
wilde het niet) die precies koppelen aan wet 1–4. Bij "te groot" verlaagt de app de normale
versie permanent. Streaks worden niet getoond; wél "12 van de afgelopen 14 dagen".

**Flow F — Overplanning.** Detectie: project ≥3× bewerkt in 7 dagen, 0 afgeronde acties.
Interventie op het Nu-scherm, één keer:
> *Je hebt "Teampresentatie" deze week drie keer aangepast en nog geen actie afgerond.
> Geen nieuw plan. Kies één ding van vijf minuten.*
Drie knoppen: **Maak kleiner** · **Start 5 minuten** · **Schrap of parkeer**. Geen vierde optie.

**Flow G — Let Them (fase 3).** Input *"Ik blijf nadenken over wat mijn collega van mijn
beslissing vindt."* Zeven schermen, elk één vraag:
1. Wat gebeurde er feitelijk? (alleen waarneembare feiten)
2. Wat doet/denkt/kiest de ander? (hun deel)
3. Kan ik dat controleren? (ja/nee — bij "ja" doorvragen: is dat echt zo?)
4. **Veiligheidscheck**: gevaar, discriminatie of herhaalde grensoverschrijding? → bij **ja** verlaat de flow Let Them en gaat naar grens + actie + nuchtere verwijzing naar echte hulp.
5. Let Them: wat laat ik bij hen?
6. Let Me: wat ligt bij mij?
7. Wat is de kleinste concrete stap — of laat ik het los?
Uitkomst: óf één actie in de lijst, óf een bewust "losgelaten" (gelogd, niets aangemaakt).
Geen enkele stap is verplicht; afbreken kan altijd.

**Flow H — Weekly review (fase 3, ≤10 min).** De review toont **alleen uitzonderingen**:
```
3 inbox-items ouder dan 7 dagen          → verwerk nu
2 projecten zonder next action            → één actie per project
1 deadline binnen 7 dagen                 → bevestig of verplaats
1 gewoonte 3× overgeslagen                → verlagen of stoppen?
1 doel zonder actief project              → pauzeren of project starten?
Deze week: 4 acties afgerond, 6 motion    → patroon: veel voorbereiding
```
Alles in orde = leeg scherm met "niets te doen, sluit af". Onderaan altijd één vraag:
*"Wat schrap je deze week?"* De review eindigt met maximaal 5 besluiten.

## 14. Schermstructuur

**Nu** (startpagina)
```
Werk · Privé · Alles                              [energie: normaal]

  NU DOEN
  ┌────────────────────────────────────────┐
  │ Open het personeelshandboek en zoek    │
  │ "ouderschapsverlof"                    │
  │ privé · laptop · 5 min                 │
  │ Waarom: enige actie met een echte      │
  │ deadline deze week                     │
  │  [ Start 5 min ]  [ Kleiner ]  [ ✓ ]   │
  └────────────────────────────────────────┘

  DAARNA (2)
  · Stuur Vincent de drie open vragen        ✓
  · Leg de sportkleding naast het bed        ✓

  GEWOONTES NU                          (fase 2)
  · Koffie → 1 minuut ademen               [tik]

  [ Ik zit vast ]     [ Dag afsluiten ]
                                          (+)
```
De regel "Waarom:" is verplicht en komt uit een regelgebaseerde ranking (zie §16), nooit uit
een model. De aanbeveling is één zin, altijd.

**Inbox** — één item per scherm, groot, zwarte tekst op wit, drie tot vier knoppen.
Voortgang "3 van 7" bovenaan. Leeg = een lege pagina met één zin: *"Inbox leeg."*

**Overzicht** — één scrollbare pagina, secties dichtgeklapt:
`Doelen (2) · Projecten (7) · Acties (23) · Wachten op (3) · Someday (11)`.
Projecten zonder next action krijgen een oranje stip. Verder geen kleur, geen grafieken.

**Check-in ochtend** (≤60s, 3 schermen): energie (5 knoppen) → modus (werk/privé/beide) →
"deze drie vandaag?" met een voorgestelde top 3 die je kunt vervangen. Klaar.

**Check-in avond** (≤90s, alles overslaanbaar): wat heb je gedaan (aangevinkte acties worden
getoond, je bevestigt) → waar zat je in motion (optioneel) → wat mag je loslaten (optioneel)
→ kleinste actie voor morgen (optioneel, wordt actie met `scheduled_for=morgen`).

**Visuele taal.** Systeemfont, veel wit, één accentkleur, geen iconenset behalve nav en FAB,
tekst 17px+ op mobiel, tapdoelen ≥44px, donkere modus volgt het systeem. Geen animatie
behalve een korte bevestigingsfade bij afvinken (wet 4: onmiddellijke, rustige bevestiging).

## 15. Coachingagents

Gegeven je keuze "geen AI in de app" splitst coaching in twee lagen.

### Laag 1 — In-app, deterministisch (altijd beschikbaar, ook offline)

| Coach | Wat het is in code | Wanneer |
|---|---|---|
| Action Coach | Regelset op `activity_event` (§9d) + "maak kleiner" + "ik zit vast" | Nu-scherm, max 1×/dag |
| GTD Coach | De clarify-flow zelf + `has_next_action`-detectie | Inbox, Overzicht |
| Habit Designer | De 6-staps ontwerpflow + herstelregels | Bij aanmaken en na missen |
| Let Them Coach | De 7-staps flow met veiligheidscheck | Vanuit "ik zit vast" of capture |
| Reflection Coach | Check-in-vragen + weekly review-uitzonderingen | Ochtend, avond, zondag |

Dit dekt ~80% van de dagelijkse coaching en heeft nul afhankelijkheden.

### Laag 2 — Claude Code skills op je eigen database (het echte gesprek)

Voor de gevallen waar taal wél nodig is: een rommelig inbox-item ontwarren, een gewoonte
ontwerpen, een Let Them-situatie die niet in zeven vragen past, maandelijkse patronen.
Deze draaien in Claude Code op je laptop, via een CLI die met dezelfde database praat.

```
.claude/skills/
  gtd-clarify/SKILL.md        verwerkt inbox-items tot projecten en next actions
  action-coach/SKILL.md       motion-confrontatie, kleiner maken, blokkade onderzoeken
  habit-design/SKILL.md       gewoonte-ontwerp volgens de vier wetten
  let-them/SKILL.md           Let Them / Let Me met veiligheidscheck
  weekly-review/SKILL.md      begeleidt de review, schrijft besluiten terug
  reflection-patterns/SKILL.md maandelijkse patronen uit activity_event
```

**Gedeelde gedragsregels** (in `CLAUDE.md`, gelden voor alle skills):
maximaal één scherpe vraag tegelijk · geen stappenplan tenzij gevraagd · eindig met één
uitvoerbare actie · geen generieke motivatie · benoem patronen zonder oordeel · label
suggesties als suggestie · maak nooit meer dan 3 items aan zonder expliciete toestemming ·
geen therapie, geen diagnose · bij signalen van crisis: stop met coachen en verwijs naar
echte hulp.

**Toon**: vriendelijk, direct, nuchter. Niet therapeutisch, niet betuttelend, niet
enthousiast. Kort.

### Laag 3 — Ontwikkelagents (voor mij, niet voor jou)

```
.claude/agents/
  simplicity-reviewer.md      blokkeert scope creep, telt taps en velden
  privacy-security-reviewer.md logging, auth, dataminimalisatie
  ux-reviewer.md              mobiel-eerst, tapdoelen, aantal schermen per taak
  database-architect.md       schema-wijzigingen en migraties
  test-engineer.md            tests voor de kritieke flows
```
Deze draaien alleen op verzoek, één tegelijk, en nooit allemaal parallel op dezelfde
wijziging — dubbel werk is ook motion.

## 16. AI-architectuur (en waarom er bijna geen in zit)

**Beslissing: de app doet geen enkele LLM-call.** Gevolgen en invulling:

**Wat regels doen (alles wat de app zelf toont).**
- *Ranking van de aanbevolen actie*: transparante score. `+3` echte deadline binnen 3 dagen · `+2` hoort bij een actief doel · `+2` past bij de gekozen modus (werk/privé) · `+1` past binnen de resterende tijd · `+1` energie-match · `−2` `kind=motion` · `−1` per keer uitgesteld (want uitstel duidt op te groot, niet op onbelangrijk — de app biedt dan "kleiner maken" aan in plaats van te pushen). De hoogste score wint; de hoogste bijdragende factor wordt de "Waarom:"-zin. Volledig uitlegbaar, testbaar met unit tests.
- *Motion-herkenning*: woordenlijst + gedragspatronen (§9).
- *"Maak kleiner"*: sjablonen per werkwoord — "schrijf X" → "open het bestand en schrijf één zin"; "bel X" → "zoek het nummer op"; "mail X" → "open een lege mail en typ de aanhef". Twaalf sjablonen dekken de meeste gevallen; anders een vrij veld met de vraag "wat is de eerste 2 minuten hiervan?".
- *Herstelregels*, *weekly-review-detectie*, *check-in-vragen*: allemaal regels.

**Wat Claude Code doet.** Het gesprek. Toegang tot data via `scripts/coach.ts` (Drizzle,
dezelfde DB): `coach today`, `coach inbox list`, `coach action create --title=… --project=…`,
`coach stats motion --days=30`. Skills roepen die CLI via Bash aan.

**Contextselectie & dataminimalisatie.** De CLI geeft standaard **geen** vrije tekst uit
check-ins terug — alleen ids, titels, statussen en tellingen. Dagboektekst komt alleen mee
als jij expliciet `--include-notes` gebruikt of erom vraagt. Zo blijft de gevoeligste data
buiten prompts, tenzij je daar bewust voor kiest.

**Toestemming.** De CLI weigert bulkbewerkingen (>3 rijen) zonder `--confirm`. Skills moeten
eerst tonen wat ze willen doen.

**Uitlegbaarheid & hallucinatie.** Omdat er geen model tussen jou en je data zit bij het
tonen van je lijst, kan de app niets verzinnen. Wat Claude Code voorstelt landt pas in de
database als de CLI het schrijft, en dat is altijd zichtbaar in de app.

**Kosten.** Nul, buiten je bestaande Claude-abonnement.

**Beschikbaarheid.** De app werkt volledig zonder internet naar welk model dan ook. Dat is
precies de eis "kernfunctionaliteit blijft werken als AI niet beschikbaar is" — maximaal
ingevuld.

**Als je later toch in-app AI wilt** (bijvoorbeeld clarify op je telefoon): één server route
`POST /api/coach`, Anthropic SDK, alleen ids en titels in de prompt, antwoord altijd als
voorstel dat jij bevestigt. Dat is een dagje werk, expliciet fase 5, en niets in het ontwerp
blokkeert het.

## 17. Notificatiestrategie

**MVP: geen push.** Reden: het is niet nodig om waarde te leveren en het is de snelste
manier om een rustige app irritant te maken. In plaats daarvan een goede "nu relevant"-weergave.

**Fase 4: web push, zelf gebouwd** (VAPID + `web-push` + eigen service worker; geen
externe notificatiedienst — dat past bij de privacy-eis).

**Technische realiteit, gecontroleerd (juli 2026):**
- Web push werkt op iOS **alleen** voor PWA's die via Safari → Deel → Zet op beginscherm zijn geïnstalleerd. Niet in een gewoon Safari-tabblad.
- Apple heeft de aangekondigde verwijdering van beginscherm-webapps in de EU (iOS 17.4) **teruggedraaid**; PWA's en push werken in de EU zoals daarvoor. Vanaf iOS 26 opent elke site die je aan het beginscherm toevoegt standaard als webapp.
- Safari 18.4 introduceerde Declarative Web Push (zonder service worker) — optioneel, later.
- Android/Chrome: geen beperkingen van betekenis.
- Consequentie voor jou: **installatie op het beginscherm is een voorwaarde**, dus de PWA-installatiehint komt al in fase 1, ook al gebruiken we push pas later.

**Regels voor notificaties, als ze er komen:**
opt-in per gewoonte, niet per taak · maximaal 3 per dag · quiet hours (standaard 22:00–07:00
Europe/Amsterdam) · nooit beschamende taal · altijd een directe actieknop ("1 minuut gedaan"
/ "morgen") · **automatisch stoppen na 3× negeren van dezelfde notificatie**, met een vraag
in de weekly review of hij weg mag · bundelen: één ochtendbericht in plaats van drie.

E-mail als fallback: nee. Agenda: alleen lezen via ICS-URL, fase 4+.

## 18. Privacy en veiligheid

Dit is de gevoeligste data die je bezit: dagboek, gedachten over collega's, terugval.

**Concreet.**
- Eén gebruiker, geen registratieroute. Auth via better-auth met e-mail + wachtwoord (argon2) en lange sessies; wachtwoordreset via e-mail. `/api/**` weigert alles zonder sessie; elke query filtert op `user_id`.
- Data in Neon, EU-regio Frankfurt. Vercel-functies in `fra1`. Encryptie at rest en in transit door de provider.
- **Geen** app-level encryptie van dagboekvelden in de MVP. Onderbouwing: het breekt de Claude Code-coachlaag en server-side filtering, en het beschermt vooral tegen een dreiging (databasediefstal) die bij één gebruiker met een sterk wachtwoord kleiner is dan het risico dat het systeem te ingewikkeld wordt en je het niet gebruikt. Wél als open beslissing genoteerd voor fase 4.
- **Geen analytics, geen third-party scripts, geen error-reporting met payload.** Strikte CSP zonder externe origins.
- **Logging**: alleen `user_id`, route, statuscode, duur. Nooit `raw_text`, `answers`, `title` of `note`. Een lint-regel plus code review bewaakt dit; `activity_event.meta` mag per definitie geen vrije tekst bevatten.
- **Export** (`GET /api/export`) en **verwijderen** (`DELETE /api/account`) vanaf fase 1, niet later. Als je er niet uit kunt, zit je vast.
- Secrets alleen in Vercel env vars; een pre-commit hook blokkeert `.env`-bestanden.
- Backups: Neon point-in-time recovery + een wekelijkse JSON-export naar je eigen schijf (handmatig, gedocumenteerd in de README).

**Veiligheid in de coaching.** De Let Them-flow heeft een verplichte veiligheidscheck. Bij
signalen van crisis (zelfbeschadiging, geweld) stoppen alle coachpaden en tonen ze één
nuchter scherm met verwijzing naar 112 / 113 / huisarts. Geen doorvragen, geen coaching,
geen logging van de inhoud.

## 19. Technische stack met onderbouwing

| Laag | Keuze | Waarom deze en niet de alternatieven |
|---|---|---|
| Taal | TypeScript (strict) | Eén taal, end-to-end typen van DB tot UI |
| Framework | **Next.js 16, App Router** | Server components + server actions betekent: geen aparte API-laag, geen client state library. Alternatief Remix/React Router is prima maar heeft geen voordeel; SvelteKit zou sneller zijn maar je ecosysteem en mijn ondersteuning zijn sterker in React |
| UI | **Tailwind CSS v4 + een kleine set shadcn/ui-componenten** | shadcn is copy-in, geen runtime-dependency, en je kunt elk component simpeler maken. Geen MUI/Chakra: te veel gewicht en te veel opties |
| Database | **Neon Postgres, regio Frankfurt** | Serverless Postgres, gratis tier ruim voldoende voor één gebruiker, branchen per PR, EU-opslag |
| ORM | **Drizzle** | Geen query-engine binary, snelle koude start op serverless, migraties zijn leesbare SQL, en het schema is één TypeScript-bestand dat je in één blik overziet. Prisma is comfortabeler maar zwaarder en de generate-stap is extra frictie |
| Auth | **better-auth**, e-mail + wachtwoord | Draait in je eigen app, gebruikers in je eigen database, geen externe dienst, MIT. Auth.js kost extra werk voor e-mail/wachtwoord; Clerk zet je identiteitsdata bij een derde |
| Validatie | Zod, gedeeld tussen server action en formulier | Eén schema, geen dubbele regels |
| Datum/tijd | `date-fns` + `@date-fns/tz`, alles in `Europe/Amsterdam`, dag begint 04:00 | Voorkomt de klassieke "gemiste gewoonte om 00:30"-bug |
| Tests | **Vitest** (domeinregels) + **Playwright** (3 flows) | De regelsengine is het hart en is puur — die test je zonder browser. Playwright alleen voor capture→verwerk→afvinken |
| PWA | Handmatige `manifest.json` + eigen service worker | Geen plugin, geen webpack-magie. In fase 1 alleen installeerbaarheid + offline shell |
| Hosting | Vercel, functieregio `fra1` | Nul operationele last, preview per branch, gratis voor dit volume |
| Push (F4) | `web-push` + VAPID, eigen tabel | Geen externe notificatiedienst = geen extra verwerker van persoonsgegevens |
| CI | GitHub Actions: typecheck + lint + Vitest op elke push; Playwright op main | Klein en snel genoeg om niet te gaan negeren |

**Geen** microservices, geen monorepo, geen Docker in fase 1, geen Redis, geen queue, geen
tRPC (server actions dekken het), geen state library, geen i18n-framework (Nederlands is
hardcoded, met alle teksten in één `lib/copy.ts` zodat het later kan).

Lokaal draaien: `pnpm install && pnpm db:push && pnpm dev`. Eén Neon-devbranch, geen lokale
Postgres nodig.

## 20. MVP-scope (fase 1 — de eerste epic)

**In:**
- Auth (één gebruiker, inloggen, sessie, geen registratie-UI)
- Quick capture vanaf elk scherm, < 3 seconden, offline-tolerant
- Inbox met één-item-per-scherm-verwerking, inclusief 2-minutenregel en motion-check
- Doelen (max 3 actief), projecten (met verplichte next action-signalering), acties
- Gebieden werk/privé + modusschakelaar
- Nu-scherm: 1 aanbevolen actie met "waarom", max 3 focusacties, "maak kleiner", "start", "ik zit vast", "niet meer belangrijk"
- Ochtend- en avondcheck-in (≤60s / ≤90s, alles optioneel)
- Overzicht-pagina met vijf inklapbare secties
- `activity_event`-logging vanaf de eerste commit
- Export + accountverwijdering
- Installeerbare PWA met offline shell
- Tests: regelsengine (Vitest) + drie Playwright-flows

**Uit fase 1, wél kort daarna:** gewoontes (F2), Let Them-flow (F3), weekly review (F3),
motion-patroondetectie (F3), Claude Code coach-CLI en skills (F3), push (F4).

## 21. Not-now-scope (expliciet niet bouwen)

Dashboards en grafieken · complexe statistieken · sociale features · publieke profielen ·
gamification, punten, levels, badges · AI-chat als hoofdscherm in de app · volwaardige
agenda · notitie-app · documentbeheer · teamfunctionaliteit · tags · subtaken dieper dan één
niveau · automatiseringen en regels-editor · meerdere prioriteringsmethodes (Eisenhower,
MoSCoW, ABC) · lange onboarding · thema's en personalisatie · avatars voor agents ·
moodtracking met grafieken · financiële tracking · gezondheidsintegraties · Slack/Gmail/Notion-
integraties · offline-first sync-engine met conflictresolutie · multi-user · mobiele native app.

Elk van deze staat in `docs/not-now.md` met datum en reden. Toevoegen mag; verwijderen uit
de lijst vereist dat je opschrijft welk uitvoeringsprobleem het oplost.

## 22. Gefaseerde roadmap

| Fase | Inhoud | Duur | Klaar als |
|---|---|---|---|
| **1. Basis** | Auth, capture, inbox, doelen, projecten, acties, werk/privé, Nu, check-ins, export/delete, PWA | 2–3 weken | Je gebruikt hem 5 dagen op rij zonder mij |
| **2. Gewoontes** | Habit design-flow, minimale versie, habit stack, één-tik log, herstel na missen, gewoontes op Nu | 1–2 weken | Twee gewoontes lopen 2 weken, inclusief een gemiste dag zonder terugval |
| **3. Coaching** | Motion-patroondetectie, interventies, Let Them-flow, weekly review als uitzonderingenrapport, `coach` CLI + Claude Code skills | 1–2 weken | Een weekly review kost < 10 minuten en levert ≥1 geschrapt item op |
| **4. Triggers** | Web push (VAPID), quiet hours, per-gewoonte reminders, ICS-agenda lezen, eventueel spraakcapture | 1–2 weken | Een notificatie leidt aantoonbaar tot uitvoering, en je zet er geen uit uit irritatie |
| **5. Optioneel** | In-app AI-clarify, app-level encryptie dagboek, patroon-rapport maandelijks | pas na 2 maanden gebruik | Alleen als het gebruik het aantoont |

Na elke fase: één week alleen gebruiken, niets bouwen. Dat is geen pauze maar de test.

## 23. Teststrategie

**Wat wél getest wordt (en waarom het klein blijft):**

1. **Regelsengine — Vitest, hoge dekking.** `lib/rules/`: ranking van de aanbevolen actie, motion-heuristiek, "maak kleiner"-sjablonen, herstelregels, weekly-review-detectie, dag-grens en tijdzone. Dit zijn pure functies zonder database; hier zit de kans op subtiele fouten en hier is testen goedkoop.
2. **Drie Playwright-flows.** (a) capture → inbox verwerken → actie verschijnt op Nu → afvinken. (b) vaag item → project + next action. (c) ochtendcheck-in → 3 acties → avondcheck-in. Elk op een mobiel viewport (iPhone 14) én desktop.
3. **Datamodel**: één integratietest per tabel op create/read/soft-delete met `user_id`-scoping, om te garanderen dat niets ongescopeerd lekt.
4. **Privacy-regressietest**: een test die de logger aanroept met een object vol vrije tekst en verifieert dat er niets van in de output belandt.

**Wat niet getest wordt:** UI-snapshots, componenten in isolatie, 100% dekking. Voor één
gebruiker is dat onderhoudslast zonder opbrengst.

**Handmatige toets per fase** (staat in de definition of done): op de telefoon, met één hand,
staand. Als een flow dan niet werkt, is hij niet af.

## 24. Meetplan

Alles afgeleid uit `activity_event`, zichtbaar op één onopvallende `/inzicht`-pagina die
maandelijks bekeken wordt — bewust niet op het startscherm.

| Metriek | Doel | Waarom deze |
|---|---|---|
| Tijd van FAB-tap tot opgeslagen | < 3 s (p90) | De capture-belofte |
| Inbox-items verwerkt binnen 48u | > 80% | Vertrouwen in het systeem |
| Actieve projecten met next action | 100% | GTD's belangrijkste hygiëne |
| Afgeronde acties per week | stijgend, geen doelgetal | Het eigenlijke product |
| Verhouding action:motion (afgerond) | ≥ 2:1 | Jouw kernprobleem, direct gemeten |
| Dagen met ≥1 betekenisvolle actie | > 5 per week | Consistentie boven volume |
| Terugkeer binnen 1 dag na gemiste gewoonte | > 70% | Never miss twice, gemeten |
| Duur weekly review | < 10 min | Bewaakt dat de review niet ontspoort |
| Bewust geschrapte items per week | ≥ 1 | Schrappen is een vaardigheid, geen falen |
| "Maak kleiner" → daadwerkelijk gestart | > 50% | Toetst of de belangrijkste knop werkt |
| Genegeerde notificaties (F4) | < 20% | Anders staat de notificatie fout |

**Bewust géén metriek:** sessieduur, aantal openingen per dag, streaklengte, DAU. Die
belonen het verkeerde gedrag.

## 25. Belangrijkste risico's en mitigaties

| # | Risico | Kans | Mitigatie |
|---|---|---|---|
| 1 | **Het bouwen wordt zelf motion** | Hoog | Fase 1 heeft een harde scopelijst; elke sessie begint met "welke gebruikersflow werkt aan het eind van vandaag?"; ik benoem het expliciet wanneer we over architectuur praten zonder code |
| 2 | Je gebruikt hem 2 weken en stopt | Hoog | Fase 1 eindigt met 5 dagen echt gebruik als exit-criterium, niet met een feature-lijst. Daarna een week niets bouwen |
| 3 | Scope creep via "kleine" toevoegingen | Hoog | Simplicity-reviewer + `docs/not-now.md` + de regel: nieuwe functie = eerst een bestaande weghalen |
| 4 | De app wordt een tweede administratie | Middel | Onderhoudsplafond van 10 min/week als expliciete eis; velden zijn optioneel; geen tags |
| 5 | Coaching voelt betuttelend en je zet hem uit | Middel | Max 1 interventie per dag, altijd 3 opties, nooit dezelfde tekst twee keer, altijd wegklikbaar |
| 6 | Dagboekdata lekt via logs of prompts | Laag/hoog impact | Logging zonder inhoud + regressietest; CLI geeft standaard geen vrije tekst; geen analytics |
| 7 | Coachlaag op de laptop = niet beschikbaar op het moment dat het telt | Middel | De in-app deterministische coaching dekt de dagelijkse momenten; fase 5 heeft een gedefinieerd pad naar in-app AI als dit knelt |
| 8 | iOS-push blijkt onbetrouwbaar | Middel | Push is fase 4, niet MVP; installatiehint vanaf fase 1; de app werkt volledig zonder |
| 9 | Overengineering van het datamodel | Middel | 12 tabellen, 7 in fase 1; elke nieuwe tabel vereist een geschrapte |
| 10 | Neon/Vercel gratis tier of prijs verandert | Laag | Alles is standaard Postgres + Node; verhuizen naar een VPS is een dag werk, geen migratie |

## 26. Open productbeslissingen

Bewust open gelaten, geen blokkade voor fase 1:

1. **App-level encryptie van check-in-tekst** — pas beslissen als je de app echt voor dagboek gebruikt (fase 4).
2. **Vaste weekly-reviewdag** of "wanneer je eraan toe bent" — bepalen na 3 weken gebruik.
3. **Hoe streng is max 3 focusacties** — nu een zachte grens (waarschuwing); harder maken als je hem structureel omzeilt.
4. **Spraakcapture** — alleen als tekstcapture aantoonbaar te traag blijkt in de auto/op de fiets.
5. **Meer gebieden dan werk/privé** (bijv. gezondheid, gezin) — pas als je het twee keer mist.
6. **Wordt "ik zit vast" een aparte flow of onderdeel van Action Coach** — beslissen bij het bouwen van fase 3.

## 27. Aanbevolen eerste implementatie-epic

**Epic: "Van gedachte naar afgevinkte actie, op mijn telefoon."**

Alles in fase 1 hangt hieraan. De volgorde is bewust zo gekozen dat er **na dag 2 al iets
bruikbaars staat** en het daarna alleen maar beter wordt — geen big bang op het einde.

De verticale slice die als eerste af moet (dag 1–2): inloggen → capture → item staat in de
inbox → verwerken tot één actie → actie staat op Nu → afvinken. Alles daarna is verrijking.

## 28. Concrete backlog voor de eerste ontwikkelfase

Elke regel is één commit-waardige stap. Geschat in halve dagen.

**Fundament**
1. `pnpm create next-app` (TS, App Router, Tailwind v4), pnpm, strict tsconfig, ESLint/Prettier — `package.json`, `tsconfig.json`
2. Neon-project (fra1) + Drizzle setup + `db/schema.ts` met fase-1-tabellen + eerste migratie
3. better-auth + één gebruiker seeden via script; `middleware.ts` beschermt alles behalve `/login`
4. `lib/copy.ts` (alle Nederlandse teksten op één plek) + basis-layout met 3-tabs-nav en FAB
5. GitHub Actions: typecheck + lint + Vitest; Vercel-project gekoppeld aan de branch

**Kern-slice (moet werken aan het eind van deze groep)**
6. `inbox_item` + capture-server-action + FAB-sheet + optimistic insert — `app/(app)/_components/capture.tsx`
7. Inbox-pagina, één item per scherm, minimale verwerking: → actie / → weg / → someday
8. `action`-tabel + Nu-scherm dat de acties van vandaag toont + afvinken (één tap, optimistic)
9. `activity_event`-logger + aanroepen bij create/complete/postpone — `lib/events.ts`
10. **Checkpoint: gebruik hem één dag echt.** Niets bouwen tot dat is gebeurd.

**Clarify verdiepen**
11. Volledige clarify-flow: uitkomst → uitvoerbaar → meerdere stappen → next action → motion-check → 2 minuten → gebied → deadline
12. `project` + `goal` + koppelingen; `has_next_action`-query en oranje stip
13. Motion-heuristiek (`lib/rules/motion.ts`) + `leads_to`-veld + unit tests
14. "Maak kleiner" met 12 sjablonen (`lib/rules/shrink.ts`) + tests

**Nu-scherm afmaken**
15. Ranking-engine (`lib/rules/rank.ts`) met score + "waarom"-zin + tests
16. Modusschakelaar werk/privé/alles, onthouden in cookie
17. "Ik zit vast" (drie opties) en "niet meer belangrijk" (schrappen met één tap)

**Check-ins**
18. Ochtendcheck-in: energie → modus → top 3 (3 schermen, ≤60s)
19. Avondcheck-in: gedaan → motion → loslaten → morgen (alles overslaanbaar, ≤90s)

**Overzicht & afronden**
20. Overzicht-pagina met vijf inklapbare secties
21. `GET /api/export` + `DELETE /api/account` + README-instructie voor backups
22. `manifest.json`, service worker (offline shell), installatiehint op iOS
23. Playwright: drie flows op mobiel viewport
24. Privacy-check: loggerregressietest + handmatige controle van Vercel-logs

## 29. Voorgestelde Claude Code-projectstructuur

```
/
├── CLAUDE.md                      # de 10 productprincipes, definitie van "simpel",
│                                  # definition of done, codeconventies, securityregels
├── docs/
│   ├── plan.md                    # dit document
│   ├── decisions/000N-*.md        # ADR's, max 1 pagina per stuk
│   ├── not-now.md                 # geweigerde features met datum en reden
│   └── flows.md                   # de acht flows, als referentie bij het bouwen
├── .claude/
│   ├── agents/                    # ontwikkelagents (§15 laag 3)
│   │   ├── simplicity-reviewer.md
│   │   ├── privacy-security-reviewer.md
│   │   ├── ux-reviewer.md
│   │   ├── database-architect.md
│   │   └── test-engineer.md
│   ├── skills/                    # coach-skills (§15 laag 2) + dev-workflows
│   │   ├── gtd-clarify/SKILL.md
│   │   ├── action-coach/SKILL.md
│   │   ├── habit-design/SKILL.md
│   │   ├── let-them/SKILL.md
│   │   ├── weekly-review/SKILL.md
│   │   ├── reflection-patterns/SKILL.md
│   │   └── ship/SKILL.md          # typecheck + test + commit + push, disable-model-invocation
│   └── settings.json              # hooks + permissies
├── app/                           # Next.js App Router
│   ├── (auth)/login/
│   └── (app)/nu/ inbox/ overzicht/ checkin/
├── lib/
│   ├── rules/                     # rank.ts, motion.ts, shrink.ts, recovery.ts, review.ts
│   ├── copy.ts                    # alle Nederlandse teksten
│   ├── events.ts                  # activity_event logger
│   └── logger.ts                  # logging zonder inhoud
├── db/schema.ts                   # één bestand, in één blik te overzien
├── scripts/coach.ts               # CLI voor de Claude Code skills
└── tests/
```

**`CLAUDE.md` bevat minimaal:**
de 10 productprincipes woordelijk · *definitie van simpel*: een nieuwe functie mag maximaal
één scherm, drie velden en twee taps toevoegen, anders eerst overleggen · *definition of
done*: werkt op mobiel met één hand, heeft een test als er een regel in zit, logt geen
inhoud, en de flow is minstens één keer echt gebruikt · geen nieuwe dependency zonder
expliciete afweging · geen nieuwe tabel zonder een geschrapte · Nederlandse UI-teksten
uitsluitend in `lib/copy.ts`.

**Hooks (`.claude/settings.json`), bewust maar twee:**
1. `PreToolUse` op Write/Edit: blokkeer schrijven naar `.env*` en waarschuw bij een nieuwe entry in `package.json` dependencies.
2. `PostToolUse` op Write/Edit van `*.ts`/`*.tsx`: draai `tsc --noEmit` op het gewijzigde project en rapporteer fouten meteen.

**Slash-commando's (skills met `disable-model-invocation: true`):**
`/ship` (typecheck → test → commit → push), `/simpel` (laat de simplicity-reviewer over de
huidige diff gaan), `/privacy` (privacy-review over de diff).

**Orkestratie.** Nooit meer dan één reviewagent tegelijk op dezelfde wijziging. De volgorde
is vast: bouwen → `/simpel` → `/privacy` → tests → commit.

## 30. Acceptatiecriteria voor de MVP

De MVP is af als **alle** onderstaande punten waar zijn, gemeten op een echte telefoon:

1. Van appicoon tot opgeslagen gedachte: **< 3 seconden en < 3 taps**, ook offline.
2. Het Nu-scherm toont bij openen **precies één** aanbevolen actie met een leesbare reden van één zin, en maximaal drie focusacties.
3. Een actie afvinken is **één tap**, zonder bevestigingsdialoog, met directe visuele bevestiging.
4. Een vaag item ("presentatie voorbereiden") komt via de clarify-flow in **< 60 seconden** uit als project + één fysieke, zichtbare next action.
5. Elk actief project **zonder** next action is zichtbaar gemarkeerd op Overzicht.
6. "Maak kleiner" levert altijd een startstap op van **≤ 2 minuten**, zonder een edit-scherm te openen.
7. Een actie kan als motion worden gemarkeerd en vraagt dan om `leads_to`; maximaal één motion-actie in de dagelijkse top 3.
8. De ochtendcheck-in is in **≤ 60 seconden** af, de avondcheck-in in **≤ 90 seconden**, met alles overslaanbaar.
9. Een gemiste avondcheck-in heeft **nul** zichtbare gevolgen: geen melding, geen rood, geen verloren voortgang.
10. De app is installeerbaar op het iPhone-beginscherm en toont offline ten minste het laatste Nu-scherm.
11. `GET /api/export` levert alle data als JSON; `DELETE /api/account` verwijdert alles onherroepelijk.
12. Geen enkel logbestand (lokaal of Vercel) bevat door de gebruiker geschreven tekst — aangetoond met een test én een handmatige controle.
13. De regelsengine heeft tests; de drie kritieke flows draaien groen in Playwright op mobiel viewport.
14. **Het echte criterium:** je hebt de app vijf werkdagen achter elkaar gebruikt zonder dat ik ertussen zat, en er staan meer afgevinkte acties dan aangemaakte projecten.

---

## Verificatie (hoe we controleren dat het werkt)

- `pnpm test` — regelsengine (ranking, motion, shrink, herstel, dag-grens) groen.
- `pnpm test:e2e` — de drie Playwright-flows op iPhone-viewport en desktop groen.
- `pnpm typecheck && pnpm lint` — schoon; draait ook in CI op elke push.
- Handmatig op de telefoon, met één hand: capture → verwerken → Nu → afvinken; en de
  ochtend/avond-check-in binnen de tijdslimieten (met een stopwatch, één keer echt meten).
- Privacy: `pnpm test tests/privacy` + handmatig de Vercel-logs van één sessie doorlezen.
- Preview-deploy per push op de branch; `main` blijft schoon tot fase 1 af is.

## Bronnen

- [The 5 Steps of GTD — gtd.be (officiële GTD-partner)](https://www.gtd.be/en/what-is-gtd/the-5-steps-of-gtd)
- [Getting Things Done — Wikipedia (definities project & next action)](https://en.wikipedia.org/wiki/Getting_Things_Done)
- [GTD Dictionary: Two-Minute Rule — FacileThings](https://facilethings.com/gtd-dictionary/en/two-minutes-rule)
- [Atomic Habits Summary — James Clear](https://jamesclear.com/atomic-habits-summary)
- [The Four Laws of Behavior Change — Jorge Arango](https://jarango.com/2023/12/25/the-four-laws-of-behavior-change/)
- [The Let Them Theory — samenvatting, Science of People](https://www.scienceofpeople.com/let-them-theory-summary/)
- [A Therapist's Perspective on the "Let Them" Theory — Zencare](https://blog.zencare.co/therapists-perspective-let-them-theory/)
- [Why You Probably Won't "Let Them" in the Long Run — Psychology Today](https://www.psychologytoday.com/us/blog/confessions-of-a-psychological-first-responder/202505/why-you-probably-wont-let-them-in-the)
- [PWA iOS Limitations and Safari Support — MagicBell](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)
- [iOS 17.4 won't remove Home Screen web apps in the EU after all — 9to5Mac](https://9to5mac.com/2024/03/01/apple-home-screen-web-apps-ios-17-eu/)
- [Guides: PWAs — Next.js](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Create custom subagents — Claude Code docs](https://code.claude.com/docs/en/sub-agents)
- [Extend Claude with skills — Claude Code docs](https://code.claude.com/docs/en/skills)
- [Better Auth vs Clerk vs Auth.js for Next.js 2026](https://www.buildmvpfast.com/blog/better-auth-vs-clerk-vs-authjs-nextjs-decision-tree-2026)
- [Drizzle vs Prisma in 2026 — TurboStarter](https://www.turbostarter.dev/blog/drizzle-vs-prisma-typescript-orm-2026)

*Let op: `gettingthingsdone.com` en `jamesclear.com` blokkeren geautomatiseerde fetches
(HTTP 403). De definities uit die bronnen komen uit consistente secundaire bronnen en
bekende boekinhoud, niet uit een directe fetch van de officiële pagina's.*
