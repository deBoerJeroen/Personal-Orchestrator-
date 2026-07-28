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

Drie gratis accounts, ongeveer twintig minuten. Je hoeft geen enkele
programmeeropdracht te typen: de app installeert zichzelf bij het uitrollen.

## Stap 1 — Database aanmaken (Neon)

1. Ga naar **neon.com** en maak een gratis account.
2. Maak een nieuw project. Kies bij regio **Europe (Frankfurt)** — je data blijft dan in de EU.
3. Na het aanmaken zie je een **connection string**. Zorg dat het schuifje op **Pooled connection** staat: in de tekst moet `-pooler` voorkomen.
4. Kopieer die hele tekst. Hij begint met `postgresql://`. Bewaar hem even in een kladblok.

## Stap 2 — Drie waardes klaarleggen

Je hebt straks vijf gegevens nodig. Zet ze even in datzelfde kladblok:

| Naam | Wat je invult |
|---|---|
| `DATABASE_URL` | De gekopieerde tekst uit stap 1 |
| `BETTER_AUTH_SECRET` | Een willekeurige reeks van minstens 32 tekens. Ram op je toetsenbord. |
| `SEED_USER_EMAIL` | Je eigen e-mailadres |
| `SEED_USER_PASSWORD` | Het wachtwoord dat je straks gebruikt om in te loggen |
| `SEED_USER_NAME` | Je voornaam |

## Stap 3 — Uitrollen (Vercel)

1. Ga naar **vercel.com** en log in met je GitHub-account.
2. Klik **Add New → Project** en kies deze repository.
3. Open **Environment Variables** en voeg de vijf regels uit stap 2 toe: links de naam, rechts de waarde.
4. Klik **Deploy** en wacht een paar minuten.

Tijdens het uitrollen maakt de app zelf de database-tabellen aan en zet hij
jouw account klaar. Je hoeft daar niets voor te doen.

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

**"Deployment failed" met iets over de database.** De `DATABASE_URL` klopt
niet. Meestal is het de niet-pooled variant gekopieerd: controleer of er
`-pooler` in staat.

**Inloggen lukt niet.** Controleer of `BETTER_AUTH_URL` exact het adres van je
app is, inclusief `https://` en zonder schuine streep aan het eind. Daarna
opnieuw uitrollen.

**Je wachtwoord vergeten.** Verander `SEED_USER_PASSWORD` niet — dat werkt niet
voor een bestaand account. Vraag Claude Code om het wachtwoord te resetten.

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
