/**
 * Logging zonder inhoud.
 *
 * Dit is de gevoeligste data die de gebruiker bezit: dagboek, gedachten over
 * collega's, terugval. Er mag daarom NOOIT door de gebruiker geschreven tekst
 * in een logregel belanden — niet in productie, niet lokaal, niet in een
 * foutmelding. Alleen ids, routes, statuscodes en tellingen.
 *
 * Zie tests/unit/logger.test.ts: die test bewaakt deze belofte.
 */

/** Veldnamen die per definitie gebruikerstekst bevatten. */
const FORBIDDEN_KEYS = new Set([
  "rawtext",
  "title",
  "note",
  "notes",
  "answers",
  "summary",
  "why",
  "outcome",
  "statement",
  "cue",
  "reward",
  "obstacles",
  "leadsto",
  "waitingon",
  "minimalversion",
  "normalversion",
  "recoverynote",
  "reviewnote",
  "password",
  "email",
  "horizon",
  "location",
  "stackafter",
]);

/** Alleen deze primitieve typen mogen erin. Vrije tekst wordt geweigerd. */
export type LogValue = string | number | boolean | null | undefined;
export type LogFields = Record<string, LogValue>;

const UUID_OR_ID = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * Houdt alleen veilige velden over. Onbekende stringwaarden worden vervangen
 * door hun lengte: de vorm blijft debugbaar, de inhoud verdwijnt.
 */
export function sanitize(fields: Record<string, unknown>): LogFields {
  const safe: LogFields = {};

  for (const [key, value] of Object.entries(fields)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
      safe[key] = `[weggelaten:${typeof value === "string" ? value.length : "?"}]`;
      continue;
    }

    if (value == null || typeof value === "number" || typeof value === "boolean") {
      safe[key] = value;
      continue;
    }

    if (typeof value === "string") {
      // Ids, slugs en enum-waarden mogen; vrije tekst niet.
      safe[key] = UUID_OR_ID.test(value) ? value : `[weggelaten:${value.length}]`;
      continue;
    }

    safe[key] = `[weggelaten:object]`;
  }

  return safe;
}

function emit(level: "info" | "warn" | "error", message: string, fields: Record<string, unknown> = {}) {
  const line = JSON.stringify({ level, message, ...sanitize(fields), at: new Date().toISOString() });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, fields?: Record<string, unknown>) => emit("info", message, fields),
  warn: (message: string, fields?: Record<string, unknown>) => emit("warn", message, fields),
  error: (message: string, fields?: Record<string, unknown>) => emit("error", message, fields),
};
