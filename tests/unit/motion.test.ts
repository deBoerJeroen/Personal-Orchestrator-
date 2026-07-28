import { describe, expect, it } from "vitest";
import { analyseTitle, detectPatterns } from "@/lib/rules/motion";

describe("analyseTitle", () => {
  it("herkent voorbereiding aan het werkwoord", () => {
    const hint = analyseTitle("Nog uitzoeken hoe ouderschapsverlof werkt");

    expect(hint.looksLikeMotion).toBe(true);
    expect(hint.matched).toBe("uitzoeken");
  });

  it.each([
    "Tools vergelijken voor de nieuwsbrief",
    "Nadenken over de indeling van de zolder",
    "Het systeem opnieuw inrichten",
  ])("herkent %s als voorbereiding", (title) => {
    expect(analyseTitle(title).looksLikeMotion).toBe(true);
  });

  it("markeert vage taken als vaag, niet als motion", () => {
    const hint = analyseTitle("Presentatie voorbereiden");

    expect(hint.looksVague).toBe(true);
    expect(hint.looksLikeMotion).toBe(false);
  });

  it("markeert losse woorden zonder werkwoord als vaag", () => {
    expect(analyseTitle("Financiën").looksVague).toBe(true);
  });

  it("laat een concrete actie met rust", () => {
    const hint = analyseTitle("Bel de huisarts om een afspraak te maken");

    expect(hint.looksLikeMotion).toBe(false);
    expect(hint.looksVague).toBe(false);
  });

  it("kijkt niet naar hoofdletters", () => {
    expect(analyseTitle("UITZOEKEN wat de regels zijn").looksLikeMotion).toBe(true);
  });
});

describe("detectPatterns", () => {
  const empty = {
    projectEdits: [],
    postponed: [],
    completedLastWeek: { motion: 0, action: 0 },
  };

  it("ziet een project dat wel wordt bijgeschaafd maar niet vooruitkomt", () => {
    const patterns = detectPatterns({
      ...empty,
      projectEdits: [{ projectId: "p1", edits: 3, completedActions: 0 }],
    });

    expect(patterns).toContainEqual({ type: "project_churn", projectId: "p1", edits: 3 });
  });

  it("laat een druk bewerkt project met rust zolang er acties afgerond worden", () => {
    const patterns = detectPatterns({
      ...empty,
      projectEdits: [{ projectId: "p1", edits: 5, completedActions: 2 }],
    });

    expect(patterns).toHaveLength(0);
  });

  it("signaleert een actie die twee keer is doorgeschoven", () => {
    const patterns = detectPatterns({ ...empty, postponed: [{ actionId: "a1", times: 2 }] });

    expect(patterns).toContainEqual({ type: "action_postponed", actionId: "a1", times: 2 });
  });

  it("signaleert een week met meer voorbereiding dan resultaat", () => {
    const patterns = detectPatterns({ ...empty, completedLastWeek: { motion: 5, action: 2 } });

    expect(patterns).toContainEqual({ type: "motion_ratio", motion: 5, action: 2 });
  });

  it("zwijgt bij te weinig data om iets zinnigs over te zeggen", () => {
    const patterns = detectPatterns({ ...empty, completedLastWeek: { motion: 1, action: 0 } });

    expect(patterns).toHaveLength(0);
  });
});
