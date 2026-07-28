import { describe, expect, it } from "vitest";
import { MAX_MOTION_IN_FOCUS } from "@/lib/limits";
import {
  rankActions,
  scoreAction,
  selectFocus,
  type RankContext,
  type RankableAction,
} from "@/lib/rules/rank";

const NOW = new Date("2026-07-28T09:00:00+02:00");

const baseCtx: RankContext = {
  now: NOW,
  mode: null,
  today: "2026-07-28",
};

function makeAction(overrides: Partial<RankableAction> = {}): RankableAction {
  return {
    id: "a1",
    title: "Bel de huisarts",
    kind: "action",
    areaSlug: "prive",
    context: "telefoon",
    estimateMinutes: 5,
    energy: "normaal",
    dueAt: null,
    scheduledFor: null,
    postponedCount: 0,
    supportsActiveGoal: false,
    ...overrides,
  };
}

describe("scoreAction", () => {
  it("geeft een echte deadline binnen drie dagen het zwaarste gewicht", () => {
    const result = scoreAction(makeAction({ dueAt: new Date("2026-07-29T12:00:00+02:00") }), baseCtx);

    expect(result.score).toBe(3);
    expect(result.why).toBe("de deadline is over 1 dag");
  });

  it("weegt een verstreken deadline nog zwaarder", () => {
    const result = scoreAction(makeAction({ dueAt: new Date("2026-07-26T12:00:00+02:00") }), baseCtx);

    expect(result.score).toBe(4);
    expect(result.why).toBe("de deadline is verstreken");
  });

  it("negeert deadlines die ver weg liggen", () => {
    const result = scoreAction(makeAction({ dueAt: new Date("2026-09-01T12:00:00+02:00") }), baseCtx);

    expect(result.score).toBe(0);
  });

  it("trekt punten af voor motion", () => {
    const result = scoreAction(makeAction({ kind: "motion" }), baseCtx);

    expect(result.score).toBe(-2);
    expect(result.reasons).toContainEqual({ points: -2, label: "dit is voorbereiding, geen resultaat" });
  });

  it("duwt uitgestelde acties omlaag, maar nooit verder dan drie punten", () => {
    const result = scoreAction(makeAction({ postponedCount: 9 }), baseCtx);

    expect(result.score).toBe(-3);
  });

  it("beloont een match met de gekozen modus", () => {
    const result = scoreAction(makeAction({ areaSlug: "werk" }), { ...baseCtx, mode: "werk" });

    expect(result.score).toBe(2);
    expect(result.why).toBe("dit past bij je werkmodus");
  });

  it("telt beschikbare tijd en energie mee", () => {
    const result = scoreAction(makeAction({ estimateMinutes: 5, energy: "laag" }), {
      ...baseCtx,
      availableMinutes: 15,
      energy: "laag",
    });

    expect(result.score).toBe(2);
  });

  it("telt tijd niet mee als de actie langer duurt dan er tijd is", () => {
    const result = scoreAction(makeAction({ estimateMinutes: 60 }), {
      ...baseCtx,
      availableMinutes: 15,
    });

    expect(result.score).toBe(0);
  });

  it("geeft altijd een uitlegbare reden, ook zonder positieve punten", () => {
    const result = scoreAction(makeAction(), baseCtx);

    expect(result.why).toBe("dit is je oudste openstaande actie");
  });
});

describe("rankActions", () => {
  it("zet de hoogste score bovenaan", () => {
    const ranked = rankActions(
      [
        makeAction({ id: "laag", title: "Zomaar iets" }),
        makeAction({ id: "hoog", title: "Belastingaangifte", dueAt: new Date("2026-07-28T23:00:00+02:00") }),
      ],
      baseCtx,
    );

    expect(ranked[0]?.action.id).toBe("hoog");
  });

  it("laat bij gelijke stand een echte actie voorgaan op voorbereiding", () => {
    const ranked = rankActions(
      [
        makeAction({ id: "motion", kind: "motion", supportsActiveGoal: true }),
        makeAction({ id: "action", kind: "action" }),
      ],
      baseCtx,
    );

    expect(ranked[0]?.action.id).toBe("action");
  });
});

describe("selectFocus", () => {
  it("toont er nooit meer dan drie", () => {
    const ranked = rankActions(
      Array.from({ length: 8 }, (_, i) => makeAction({ id: `a${i}`, title: `Actie ${i}` })),
      baseCtx,
    );

    expect(selectFocus(ranked)).toHaveLength(3);
  });

  it("laat hooguit één motion-actie in de dagelijkse top drie", () => {
    const ranked = rankActions(
      [
        makeAction({ id: "m1", kind: "motion", supportsActiveGoal: true }),
        makeAction({ id: "m2", kind: "motion", supportsActiveGoal: true }),
        makeAction({ id: "m3", kind: "motion", supportsActiveGoal: true }),
        makeAction({ id: "a1", title: "Stuur Vincent de drie open vragen" }),
        makeAction({ id: "a2", title: "Leg de sportkleding klaar" }),
      ],
      baseCtx,
    );

    const focus = selectFocus(ranked);
    const motionCount = focus.filter((f) => f.action.kind === "motion").length;

    expect(focus).toHaveLength(3);
    expect(motionCount).toBe(MAX_MOTION_IN_FOCUS);
  });

  it("vult aan met echte acties als er te weinig zijn", () => {
    const ranked = rankActions([makeAction({ id: "enige" })], baseCtx);

    expect(selectFocus(ranked)).toHaveLength(1);
  });
});
