# Nu — persoonlijke uitvoeringsassistent

Eén rustige plek die vertelt wat nu belangrijk is en helpt de kleinst mogelijke
zinvolle actie daadwerkelijk uit te voeren. Gebaseerd op GTD, Atomic Habits en
The Let Them Theory.

Eén gebruiker. Nederlandse UI, Engelse code.

## De tien productprincipes

Dit is het meetlint voor elk verzoek, ook voor verzoeken van de eigenaar zelf.

1. **Vastleggen kost < 3 seconden en 0 beslissingen.** Één veld, geen categorie, geen datum.
2. **Het startscherm beantwoordt binnen 3 seconden: wat doe ik nu.** Eén actie, één knop.
3. **Elke plannende handeling eindigt in een concrete eerstvolgende actie.** Geen uitzonderingen.
4. **Alles heeft een minimale versie.** Elke gewoonte, elke actie, elke check-in.
5. **Missen is voorzien, niet bestraft.** Geen schuld-UI, geen verloren voortgang.
6. **Maximaal drie dingen tegelijk zichtbaar.** Drie focusacties, drie opties, drie tabs.
7. **Nieuwe functies moeten tot méér uitvoering leiden**, niet tot beter overzicht. Twijfel = niet bouwen.
8. **De app claimt geen tijd voor zichzelf.** Onderhoud ≤ 10 minuten per week, totaal.
9. **Elke aanbeveling is in één zin uitlegbaar.** Geen ondoorzichtige scoring.
10. **Coaching eindigt altijd in gedrag**, nooit in inzicht alleen.

## Definitie van "simpel"

Een nieuwe functie mag maximaal **één scherm, drie velden en twee taps**
toevoegen. Kost hij meer, dan eerst overleggen — niet bouwen en daarna vragen.

Verder:

- Geen nieuwe dependency zonder expliciete afweging in de PR-beschrijving.
- **Geen nieuwe tabel zonder een geschrapte.** Het schema past nu in één bestand; dat blijft zo.
- Geen nieuw tabblad. Er zijn er drie: Nu, Inbox, Overzicht.
- Geen tags, geen subtaken dieper dan één niveau, geen instellingenscherm.

## Definitie van done

Een wijziging is klaar als:

1. Hij werkt op mobiel, met één hand, staand.
2. Er een test is als er een regel in zit (`lib/rules/**` heeft altijd tests).
3. Er geen gebruikerstekst in logs of events belandt.
4. `pnpm typecheck && pnpm lint && pnpm test` groen is.
5. De flow minstens één keer echt gebruikt is, niet alleen bekeken.

## Architectuur

- **Next.js 16 App Router**, server components + server actions. Geen aparte API-laag, geen state library.
- **Drizzle + Neon Postgres** (regio Frankfurt). Schema in `db/schema.ts`, één bestand.
- **better-auth**, e-mail + wachtwoord, registratie uit. Account via `pnpm seed`.
- **Geen LLM-calls in de app.** Coaching in de app is deterministisch (`lib/rules/**`). Het gesprek voer je in Claude Code. Dit is een bewuste keuze: goedkoper, uitlegbaar, werkt offline en stuurt geen dagboektekst naar een model.
- **Geen microservices, geen queue, geen Redis, geen Docker.**

### Belangrijke bestanden

| Pad | Wat |
|---|---|
| `lib/rules/rank.ts` | Welke actie wordt aanbevolen, en waarom. Transparante score. |
| `lib/rules/motion.ts` | Motion-herkenning en patroondetectie. |
| `lib/rules/shrink.ts` | "Maak kleiner" — sjablonen voor een startstap van 2 minuten. |
| `lib/rules/day.ts` | Een dag loopt 04:00→04:00 Europe/Amsterdam. |
| `lib/limits.ts` | Harde grenzen (3 doelen, 3 focusacties, 1 motion, 3 gewoontes). |
| `lib/copy.ts` | **Alle** Nederlandse teksten. Nooit hardcoded tekst in een component. |
| `lib/logger.ts` | Logging zonder inhoud. Zie securityregels. |
| `lib/events.ts` | Het gebeurtenislog onder motion-detectie en metrics. |

## Securityregels

De data hier is dagboek, gedachten over collega's en terugval. Behandel het zo.

1. **Nooit gebruikerstekst in logs.** Gebruik `logger` uit `lib/logger.ts`, nooit `console.log` direct. `tests/unit/logger.test.ts` bewaakt dit; die test mag nooit worden versoepeld.
2. **`activity_event.meta` bevat nooit vrije tekst.** Alleen ids, tellingen en enum-waarden.
3. **Elke query filtert op `userId`.** Zonder uitzondering, ook in scripts.
4. Elke server action begint met `requireUser()`.
5. Geen analytics, geen third-party scripts, geen externe fonts. De CSP in `next.config.ts` staat geen externe origins toe.
6. Secrets alleen in env vars. `.env` staat in `.gitignore` en hoort daar te blijven.
7. Export (`/api/export`) en verwijderen (`/api/account`) blijven werken. Als je er niet uit kunt, zit je vast.

## UX-principes

- Mobiel eerst. Tapdoelen ≥ 44px, basistekst 17px.
- Systeemfont, veel wit, één accentkleur. Geen animatie behalve de bevestiging bij afvinken.
- Donkere modus volgt het systeem.
- Geen schuldtaal, ooit. Geen uitroeptekens, geen "goed bezig!", geen rode cijfers bij gemiste dagen.
- Toon van alle teksten: vriendelijk, direct, nuchter. Niet therapeutisch, niet betuttelend.
- Elke AI- of regelsuggestie wordt gelabeld als suggestie, niet als feit.

## Codeconventies

- TypeScript strict. Geen `any`, geen `as` om een typefout weg te drukken.
- Server components tenzij interactie nodig is; dan `"use client"` op het kleinst mogelijke component.
- `"use server"`-bestanden exporteren **alleen** async functies. Constanten horen in `lib/limits.ts`.
- Zod voor elke externe invoer.
- Nederlandse UI-tekst uitsluitend via `lib/copy.ts`.
- Commits klein en controleerbaar, in het Engels.

## Teststrategie

- `lib/rules/**` → Vitest, hoge dekking. Dit is het hart en het is puur.
- Drie Playwright-flows op mobiel viewport: capture→verwerken→afvinken, vage taak→project+actie, ochtend→avond check-in.
- Geen UI-snapshots, geen componenttests, geen jacht op 100%.

## Werkwijze

Bouwen → `/simpel` (simplicity-reviewer) → `/privacy` (privacy-security-reviewer)
→ tests → commit. Nooit twee reviewagents tegelijk op dezelfde wijziging.

## Motion-guard

De eigenaar van dit project heeft de neiging het bouwen van het systeem zelf een
vorm van motion te maken. Als een gesprek langer dan een paar beurten over
mogelijkheden, nieuwe functies of perfectere architectuur gaat zonder dat er
code verandert: **benoem dat** en breng het terug tot de kleinste werkende stap.
