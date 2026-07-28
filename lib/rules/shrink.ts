/**
 * "Maak kleiner" — de belangrijkste knop van de app.
 *
 * Atomic Habits, wet 3 en de two-minute rule: elke actie moet terug te brengen
 * zijn tot een startstap van maximaal twee minuten. Geen edit-scherm, geen
 * formulier: één tap levert een concrete eerste stap op.
 */

type Template = {
  /** Herkent het soort actie. */
  match: RegExp;
  /** Maakt de startstap. `rest` is alles na het werkwoord. */
  build: (rest: string) => string;
};

const TEMPLATES: Template[] = [
  { match: /^(schrijf|typ)\s+(.*)/i, build: (r) => `Open het bestand voor "${r}" en schrijf één zin` },
  { match: /^(bel)\s+(.*)/i, build: (r) => `Zoek het telefoonnummer van ${r} op` },
  { match: /^(mail|stuur)\s+(.*)/i, build: (r) => `Open een lege mail aan ${r} en typ de aanhef` },
  { match: /^(maak|bouw)\s+(.*)/i, build: (r) => `Maak een leeg bestand aan voor "${r}"` },
  { match: /^(lees)\s+(.*)/i, build: (r) => `Lees de eerste alinea van ${r}` },
  { match: /^(plan|boek)\s+(.*)/i, build: (r) => `Open de agenda en zoek één vrij moment voor ${r}` },
  { match: /^(ruim|opruimen)\s*(.*)/i, build: (r) => `Ruim één plank of hoek op${r ? ` van ${r}` : ""}` },
  { match: /^(zoek|zoek uit|uitzoeken)\s+(.*)/i, build: (r) => `Zoek één bron over ${r} en noteer het antwoord` },
  { match: /^(betaal|regel)\s+(.*)/i, build: (r) => `Open de app of website voor ${r} en log in` },
  { match: /^(vraag)\s+(.*)/i, build: (r) => `Schrijf de vraag voor ${r} in één zin op` },
  { match: /^(sport|train|loop|ren|fiets)\s*(.*)/i, build: () => `Trek je sportkleren aan` },
  { match: /^(open)\s+(.*)/i, build: (r) => `Open ${r} en kijk er tien seconden naar` },
];

export type ShrinkResult =
  | { kind: "suggestion"; title: string }
  /** Geen sjabloon past: vraag het de gebruiker, in plaats van iets te verzinnen. */
  | { kind: "ask"; question: string };

export function shrink(title: string): ShrinkResult {
  const trimmed = title.trim();

  for (const template of TEMPLATES) {
    const match = trimmed.match(template.match);
    if (match) {
      const rest = (match[2] ?? "").trim();
      return { kind: "suggestion", title: template.build(rest) };
    }
  }

  return {
    kind: "ask",
    question: "Wat zijn de eerste twee minuten hiervan?",
  };
}

/** Een startstap moet klein zijn. Dit is de bovengrens die de UI aanhoudt. */
export const SHRINK_ESTIMATE_MINUTES = 2;
