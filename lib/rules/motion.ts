/**
 * Motion versus action — het scharnierpunt van dit hele product.
 *
 * Motion is voorbereiding die voelt als vooruitgang maar geen resultaat oplevert.
 * Deze module raadt alleen; de gebruiker beslist. Geen model, gewoon een
 * woordenlijst, en daarmee uitlegbaar en testbaar.
 */

/** Werkwoorden die bijna altijd voorbereiding aankondigen. */
const MOTION_MARKERS = [
  "uitzoeken",
  "onderzoeken",
  "plannen",
  "inplannen",
  "nadenken over",
  "nadenken",
  "kiezen tussen",
  "vergelijken",
  "opzetten",
  "structureren",
  "inrichten",
  "opnieuw bekijken",
  "verkennen",
  "oriënteren",
  "orienteren",
  "brainstormen",
  "overwegen",
  "bedenken",
  "in kaart brengen",
  "lezen over",
  "research",
] as const;

/**
 * Vage taken: een zelfstandig naamwoord plus een leeg werkwoord. Deze zijn geen
 * motion maar onduidelijk — ze horen door de clarify-flow.
 */
const VAGUE_MARKERS = [
  "voorbereiden",
  "regelen",
  "oppakken",
  "aanpakken",
  "doen",
  "afhandelen",
  "bijwerken",
  "organiseren",
  "verzorgen",
] as const;

export type TitleHint = {
  looksLikeMotion: boolean;
  looksVague: boolean;
  /** Het woord dat de suggestie veroorzaakte. Voor uitlegbaarheid. */
  matched?: string;
};

export function analyseTitle(rawTitle: string): TitleHint {
  const title = rawTitle.toLowerCase().trim();

  const motionMatch = MOTION_MARKERS.find((marker) => title.includes(marker));
  if (motionMatch) {
    return { looksLikeMotion: true, looksVague: false, matched: motionMatch };
  }

  const vagueMatch = VAGUE_MARKERS.find((marker) => title.includes(marker));
  if (vagueMatch) {
    return { looksLikeMotion: false, looksVague: true, matched: vagueMatch };
  }

  // Losse woorden zonder werkwoord ("financiën", "belasting") zijn ook vaag.
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length > 0 && words.length <= 2) {
    return { looksLikeMotion: false, looksVague: true };
  }

  return { looksLikeMotion: false, looksVague: false };
}

/* ------------------------------------------------------------------ *
 * Patroondetectie over gedrag (fase 3, maar de regels horen bij elkaar)
 * ------------------------------------------------------------------ */

export type MotionPattern =
  | { type: "project_churn"; projectId: string; edits: number }
  | { type: "action_postponed"; actionId: string; times: number }
  | { type: "motion_ratio"; motion: number; action: number };

export type PatternInput = {
  /** Bewerkingen per project in de afgelopen 7 dagen. */
  projectEdits: { projectId: string; edits: number; completedActions: number }[];
  /** Hoe vaak een actie is doorgeschoven. */
  postponed: { actionId: string; times: number }[];
  /** Afgeronde acties in de afgelopen 7 dagen, gesplitst naar soort. */
  completedLastWeek: { motion: number; action: number };
};

export const PROJECT_CHURN_THRESHOLD = 3;
export const POSTPONE_THRESHOLD = 2;

/**
 * Levert patronen op, gesorteerd op urgentie. De UI toont er maximaal één per
 * dag — meer voelt als een leraar die meekijkt.
 */
export function detectPatterns(input: PatternInput): MotionPattern[] {
  const patterns: MotionPattern[] = [];

  for (const p of input.projectEdits) {
    if (p.edits >= PROJECT_CHURN_THRESHOLD && p.completedActions === 0) {
      patterns.push({ type: "project_churn", projectId: p.projectId, edits: p.edits });
    }
  }

  for (const a of input.postponed) {
    if (a.times >= POSTPONE_THRESHOLD) {
      patterns.push({ type: "action_postponed", actionId: a.actionId, times: a.times });
    }
  }

  const { motion, action } = input.completedLastWeek;
  if (motion + action >= 3 && motion > action) {
    patterns.push({ type: "motion_ratio", motion, action });
  }

  return patterns;
}
