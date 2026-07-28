import { describe, expect, it } from "vitest";
import { sanitize } from "@/lib/logger";

/**
 * Privacy-regressietest. Als deze test faalt, lekt er gebruikerstekst naar de
 * logs. Dat is een blocker, geen detail.
 */
describe("sanitize", () => {
  it("laat ids, tellingen en enum-waarden staan", () => {
    expect(
      sanitize({
        userId: "usr_123",
        status: "next",
        count: 4,
        done: true,
        missing: null,
      }),
    ).toEqual({ userId: "usr_123", status: "next", count: 4, done: true, missing: null });
  });

  it("verwijdert de inhoud van bekende tekstvelden", () => {
    const result = sanitize({ title: "Bel de huisarts over de uitslag" });

    expect(result.title).toBe("[weggelaten:31]");
    expect(JSON.stringify(result)).not.toContain("huisarts");
  });

  it("verwijdert vrije tekst ook uit onbekende velden", () => {
    const result = sanitize({ verzonnenVeld: "ik lig hier al weken wakker van" });

    expect(JSON.stringify(result)).not.toContain("wakker");
  });

  it("verwijdert geneste objecten volledig", () => {
    const result = sanitize({ answers: { loslaten: "wat mijn collega ervan vindt" } });

    expect(JSON.stringify(result)).not.toContain("collega");
  });

  it("laat niets van een dagboekantwoord door, hoe het veld ook heet", () => {
    const gevoelig = {
      rawText: "Ik voel me schuldig over gisteren",
      note: "Weer niets gedaan",
      summary: "Gesprek met Vincent liep slecht",
      email: "jeroen@example.com",
      password: "geheim123",
    };

    const dump = JSON.stringify(sanitize(gevoelig));

    for (const woord of ["schuldig", "gisteren", "Vincent", "jeroen@example.com", "geheim123"]) {
      expect(dump).not.toContain(woord);
    }
  });
});
