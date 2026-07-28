# Nu

Persoonlijke uitvoeringsassistent op basis van GTD, Atomic Habits en
The Let Them Theory. Eén gebruiker, Nederlandse interface.

De belofte: **één rustige plek die vertelt wat nu belangrijk is en helpt de
kleinst mogelijke zinvolle actie daadwerkelijk uit te voeren.**

Het volledige plan staat in [`docs/plan.md`](docs/plan.md). De werkafspraken
staan in [`CLAUDE.md`](CLAUDE.md).

## Status

Fase 1 (basis) is gebouwd: inloggen, quick capture, inbox met clarify-flow,
doelen, projecten, acties, werk/privé, Nu-scherm met aanbeveling, "maak
kleiner", ochtend- en avondcheck-in, overzicht, export en accountverwijdering,
installeerbare PWA.

Gewoontes (fase 2), Let Them en weekly review (fase 3) en push (fase 4) volgen.
Zie [`docs/not-now.md`](docs/not-now.md).

## Aan de praat krijgen

Je hebt een Neon-database nodig (gratis tier volstaat) en Node 22+.

```bash
# 1. Database: maak op neon.tech een project aan in regio Frankfurt (eu-central-1).
#    Kopieer de connection string.

# 2. Configureer
cp .env.example .env
#    Vul DATABASE_URL in.
#    BETTER_AUTH_SECRET: openssl rand -base64 32
#    SEED_USER_EMAIL / SEED_USER_PASSWORD: jouw account.

# 3. Installeren en schema wegzetten
pnpm install
pnpm db:push

# 4. Account en gebieden aanmaken
pnpm seed

# 5. Starten
pnpm dev
```

Open http://localhost:3000 en log in.

## Op je telefoon zetten

Push werkt op iOS alleen voor webapps die op het beginscherm staan, dus doe dit
ook al vóór fase 4:

**iOS (Safari):** deel-knop → *Zet op beginscherm*.
**Android (Chrome):** menu → *App installeren*.

## Commando's

| Commando | Wat |
|---|---|
| `pnpm dev` | Ontwikkelserver |
| `pnpm typecheck` | TypeScript |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests (regelsengine + privacy) |
| `pnpm test:e2e` | Playwright, drie kritieke flows |
| `pnpm db:push` | Schema naar de database |
| `pnpm db:studio` | Data bekijken |
| `pnpm seed` | Gebruiker en gebieden aanmaken |

## Je data

- **Export:** `GET /api/export` (ingelogd) levert alles als JSON. Doe dit
  wekelijks en bewaar het bestand op je eigen schijf — dat is je backup naast
  Neon's point-in-time recovery.
- **Verwijderen:** `DELETE /api/account` met body
  `{"confirm":"VERWIJDER MIJN ACCOUNT"}`. Onherroepelijk, alles cascadeert weg.

## Deployen

Vercel, functieregio `fra1`. Zet `DATABASE_URL`, `BETTER_AUTH_SECRET` en
`BETTER_AUTH_URL` als environment variables. Verder is er niets te configureren.
