/**
 * Welke actie raadt de app nu aan?
 *
 * Transparante score, geen model. Productprincipe 9: elke aanbeveling is in één
 * zin uitlegbaar. De zwaarst wegende factor wordt letterlijk de "Waarom:"-regel
 * op het Nu-scherm.
 */
import { MAX_FOCUS_ACTIONS, MAX_MOTION_IN_FOCUS } from "../limits";
import { daysUntil, type DayOptions } from "./day";

export type RankableAction = {
  id: string;
  title: string;
  kind: "action" | "motion";
  areaSlug: string;
  context: string | null;
  estimateMinutes: number | null;
  energy: "laag" | "normaal" | "hoog";
  dueAt: Date | null;
  scheduledFor: string | null;
  postponedCount: number;
  /** Hoort deze actie bij een project onder een actief doel? */
  supportsActiveGoal: boolean;
};

export type RankContext = {
  now: Date;
  /** "werk", "prive" of null voor alles. */
  mode: string | null;
  /** Minuten die de gebruiker zegt te hebben. */
  availableMinutes?: number | null;
  energy?: "laag" | "normaal" | "hoog" | null;
  /** De logische dag van vandaag (YYYY-MM-DD). */
  today: string;
  dayOptions?: DayOptions;
};

export type ScoreReason = {
  points: number;
  /** Uitlegzin in de tweede persoon, kort. */
  label: string;
};

/**
 * Generiek over het actietype, zodat de UI extra velden (projecttitel,
 * leadsTo) kan meenemen zonder een cast.
 */
export type RankedAction<T extends RankableAction = RankableAction> = {
  action: T;
  score: number;
  reasons: ScoreReason[];
  /** De zwaarst wegende positieve reden. */
  why: string;
};

const DEADLINE_WINDOW_DAYS = 3;

export function scoreAction<T extends RankableAction>(action: T, ctx: RankContext): RankedAction<T> {
  const reasons: ScoreReason[] = [];

  if (action.dueAt) {
    const days = daysUntil(action.dueAt, ctx.now, ctx.dayOptions);
    if (days < 0) {
      reasons.push({ points: 4, label: "de deadline is verstreken" });
    } else if (days <= DEADLINE_WINDOW_DAYS) {
      reasons.push({
        points: 3,
        label: days === 0 ? "dit moet vandaag af" : `de deadline is over ${days} dag${days === 1 ? "" : "en"}`,
      });
    }
  }

  if (action.scheduledFor === ctx.today) {
    reasons.push({ points: 2, label: "je hebt dit voor vandaag gepland" });
  }

  if (action.supportsActiveGoal) {
    reasons.push({ points: 2, label: "dit hoort bij een doel waar je nu aan werkt" });
  }

  if (ctx.mode && action.areaSlug === ctx.mode) {
    reasons.push({ points: 2, label: `dit past bij je ${ctx.mode === "werk" ? "werk" : "privé"}modus` });
  }

  if (
    ctx.availableMinutes != null &&
    action.estimateMinutes != null &&
    action.estimateMinutes <= ctx.availableMinutes
  ) {
    reasons.push({ points: 1, label: `dit past binnen de ${ctx.availableMinutes} minuten die je hebt` });
  }

  if (ctx.energy && action.energy === ctx.energy) {
    reasons.push({ points: 1, label: "dit past bij je energie nu" });
  }

  // Motion is niet verboden, maar mag nooit vooraan staan.
  if (action.kind === "motion") {
    reasons.push({ points: -2, label: "dit is voorbereiding, geen resultaat" });
  }

  // Uitstel betekent meestal "te groot", niet "onbelangrijk". We duwen hem
  // omlaag in plaats van harder te pushen; de UI biedt "maak kleiner" aan.
  if (action.postponedCount > 0) {
    reasons.push({
      points: -Math.min(action.postponedCount, 3),
      label: `je hebt dit ${action.postponedCount}× doorgeschoven`,
    });
  }

  const score = reasons.reduce((total, r) => total + r.points, 0);
  const best = [...reasons].filter((r) => r.points > 0).sort((a, b) => b.points - a.points)[0];

  return {
    action,
    score,
    reasons,
    why: best?.label ?? "dit is je oudste openstaande actie",
  };
}

export function rankActions<T extends RankableAction>(actions: T[], ctx: RankContext): RankedAction<T>[] {
  return actions
    .map((a) => scoreAction(a, ctx))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Gelijke stand: een echte actie gaat voor voorbereiding.
      if (a.action.kind !== b.action.kind) return a.action.kind === "action" ? -1 : 1;
      return a.action.title.localeCompare(b.action.title, "nl");
    });
}

/**
 * Kiest de dagelijkse top 3 en bewaakt het motion-budget: motion-acties die
 * boven het budget uitkomen worden overgeslagen ten gunste van echt werk.
 */
export function selectFocus<T extends RankableAction>(
  ranked: RankedAction<T>[],
  max = MAX_FOCUS_ACTIONS,
): RankedAction<T>[] {
  const focus: RankedAction<T>[] = [];
  let motionCount = 0;

  for (const candidate of ranked) {
    if (focus.length >= max) break;
    if (candidate.action.kind === "motion") {
      if (motionCount >= MAX_MOTION_IN_FOCUS) continue;
      motionCount += 1;
    }
    focus.push(candidate);
  }

  return focus;
}
