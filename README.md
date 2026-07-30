# Nu

Persoonlijke uitvoeringsassistent op basis van GTD, Atomic Habits en
The Let Them Theory. Eén gebruiker, Nederlandse interface.

De belofte: **één rustige plek die vertelt wat nu belangrijk is en helpt de
kleinst mogelijke zinvolle actie daadwerkelijk uit te voeren.**

Het volledige plan staat in [`docs/plan.md`](docs/plan.md). De werkafspraken
staan in [`CLAUDE.md`](CLAUDE.md).

## Status

Fase 1 is af en werkt: inloggen, quick capture, inbox met clarify-flow, doelen,
projecten, acties, werk/privé, Nu-scherm met aanbeveling en uitleg, "maak
kleiner", ochtend- en avondcheck-in, overzicht, export en accountverwijdering,
installeerbare PWA.

Gewoontes (fase 2), Let Them en weekly review (fase 3) en push (fase 4) volgen.
Zie [`docs/not-now.md`](docs/not-now.md).

---

# Online zetten — zonder terminal

Eén gratis account (Vercel), ongeveer een kwartier. Je hoeft geen enkele
programmeeropdracht te typen: de app installeert zichzelf bij het uitrollen.

## Waarom is er een database nodig?

Vercel draait de code, maar bewaart niets: bij elke nieuwe versie begint de
schijf leeg. Je acties, projecten en check-ins moeten dus ergens anders staan.
Dat is de database.

Je hoeft daar geen apart account voor te maken. Vercel levert Postgres
(technisch: Neon) rechtstreeks vanuit zijn eigen dashboard, op hetzelfde
gratis niveau en op één rekening.

## Stap 1 — Database aanmaken, vanuit Vercel

1. Ga naar **vercel.com** en log in met je GitHub-account.
2. Klik bovenin op **Storage** → **Create Database**.
3. Kies **Neon (Serverless Postgres)**, het gratis plan, en als regio **Frankfurt** — je data blijft dan in de EU.
4. Geef hem een naam en maak hem aan. Verder hoef je hier niets te doen: Vercel vult `DATABASE_URL` straks zelf in.

## Stap 2 — Vier waardes klaarleggen

Zet deze even in een kladblok:

| Naam | Wat je invult |
|---|---|
| `BETTER_AUTH_SECRET` | Een willekeurige reeks van minstens 32 tekens. Ram op je toetsenbord. |
| `SEED_USER_EMAIL` | Je eigen e-mailadres |
| `SEED_USER_PASSWORD` | Het wachtwoord dat je straks gebruikt om in te loggen |
| `SEED_USER_NAME` | Je voornaam |

`DATABASE_URL` staat er bewust niet bij: die zet Vercel er zelf in zodra je de
database aan het project koppelt.

## Stap 3 — Uitrollen

1. Klik **Add New → Project** en kies deze repository.
2. Open **Environment Variables** en voeg de vier regels uit stap 2 toe.
3. Klik **Deploy**.

Loopt deze eerste poging stuk op de database? Dan is de database nog niet aan
het project gekoppeld. Ga naar **Storage**, kies je database, klik **Connect
Project** en kies dit project. Daarna in **Deployments** bij de bovenste op de
drie puntjes → **Redeploy**.

Tijdens het uitrollen maakt de app zelf de tabellen aan en zet hij jouw account
klaar. Je hoeft daar niets voor te doen.

## Stap 4 — Het adres vastleggen

Na het uitrollen krijg je een adres, bijvoorbeeld `https://nu-abc123.vercel.app`.

1. Ga in Vercel naar **Settings → Environment Variables**.
2. Voeg toe: `BETTER_AUTH_URL` met dat adres als waarde.
3. Ga naar **Deployments**, klik bij de bovenste op de drie puntjes en kies **Redeploy**.

Deze stap is nodig omdat inloggen moet weten op welk adres de app draait.

## Stap 5 — Op je telefoon zetten

Open het adres op je telefoon en log in met het e-mailadres en wachtwoord uit
stap 2. Dan:

- **iPhone (Safari):** deelknop onderin → *Zet op beginscherm*.
- **Android (Chrome):** menu rechtsboven → *App installeren*.

Doe dit echt. Op de iPhone werken meldingen later alleen als de app op je
beginscherm staat, en de app is gemaakt voor één hand op een telefoon.

## Als er iets misgaat

**"Deployment failed" met iets over de database.** De database is nog niet aan
het project gekoppeld. Zie het slot van stap 3. Vulde je `DATABASE_URL` zelf in?
Controleer dan of er `-pooler` in staat — de niet-pooled variant loopt vast
zodra er meerdere verzoeken tegelijk binnenkomen.

**Inloggen lukt niet.** Controleer of `BETTER_AUTH_URL` exact het adres van je
app is, inclusief `https://` en zonder schuine streep aan het eind. Daarna
opnieuw uitrollen.

**Je wachtwoord vergeten of veranderen.** Dat kun je zelf, in drie stappen:

1. Ga naar **Settings → Environment Variables** en zet `SEED_USER_PASSWORD` op het nieuwe wachtwoord.
2. Voeg toe: `SEED_RESET_PASSWORD` met als waarde `true`.
3. Ga naar **Deployments** → drie puntjes bij de bovenste → **Redeploy**.

**Verwijder daarna `SEED_RESET_PASSWORD` weer**, en rol nog één keer uit.
Blijft de vlag staan, dan wordt je wachtwoord bij elke volgende deploy
teruggezet naar wat er in Vercel staat. Zonder die vlag raakt een deploy je
wachtwoord nooit aan.

---

## Voor als je later toch lokaal wilt werken

Node 22+ en pnpm nodig.

```bash
cp .env.example .env      # vul de vijf waardes in
pnpm install
pnpm build                # zet de database klaar en maakt je account aan
pnpm dev
```

| Commando | Wat het doet |
|---|---|
| `pnpm dev` | Ontwikkelserver op localhost:3000 |
| `pnpm typecheck` | Controleert de types |
| `pnpm lint` | Controleert de codestijl |
| `pnpm test` | Unit tests: regelsengine en privacy |
| `pnpm test:e2e` | Playwright, de vier kritieke flows |
| `pnpm db:migrate` | Zet het databaseschema klaar |
| `pnpm seed` | Maakt gebruiker en gebieden aan |
| `pnpm db:studio` | Bekijk je data in de browser |

De e2e-tests hebben een draaiende app en een geseede gebruiker nodig:

```bash
E2E_EMAIL=... E2E_PASSWORD=... pnpm test:e2e
```

## Je data

- **Export:** ga ingelogd naar `/api/export`. Je krijgt één JSON-bestand met
  alles. Doe dit af en toe en bewaar het op je eigen schijf.
- **Verwijderen:** `DELETE /api/account` met body
  `{"confirm":"VERWIJDER MIJN ACCOUNT"}`. Onherroepelijk, alles gaat weg.

Er zit geen analytics in, geen externe scripts, en er belandt nooit door jou
geschreven tekst in een logbestand. Zie de securityregels in `CLAUDE.md`.
