import { describe, expect, it } from "vitest";
import { daysUntil, logicalDay, nextDay } from "@/lib/rules/day";

describe("logicalDay", () => {
  it("rekent de avond gewoon tot dezelfde dag", () => {
    expect(logicalDay(new Date("2026-07-28T22:30:00+02:00"))).toBe("2026-07-28");
  });

  it("rekent half één 's nachts nog tot de vorige dag", () => {
    // Dit is het punt: wie om 00:30 zijn gewoonte afvinkt, heeft niet gemist.
    expect(logicalDay(new Date("2026-07-29T00:30:00+02:00"))).toBe("2026-07-28");
  });

  it("begint de nieuwe dag pas om vier uur", () => {
    expect(logicalDay(new Date("2026-07-29T03:59:00+02:00"))).toBe("2026-07-28");
    expect(logicalDay(new Date("2026-07-29T04:01:00+02:00"))).toBe("2026-07-29");
  });

  it("rekent met de tijdzone van de gebruiker, niet met UTC", () => {
    // 23:00 UTC is 01:00 Amsterdam — dus nog steeds de dag ervoor.
    expect(logicalDay(new Date("2026-07-28T23:00:00Z"))).toBe("2026-07-28");
  });

  it("werkt ook in de winter", () => {
    expect(logicalDay(new Date("2026-01-15T00:30:00+01:00"))).toBe("2026-01-14");
  });
});

describe("nextDay", () => {
  it("telt een dag op", () => {
    expect(nextDay("2026-07-28")).toBe("2026-07-29");
  });

  it("gaat correct over een maandgrens", () => {
    expect(nextDay("2026-07-31")).toBe("2026-08-01");
  });
});

describe("daysUntil", () => {
  const now = new Date("2026-07-28T09:00:00+02:00");

  it("telt hele kalenderdagen, niet uren", () => {
    expect(daysUntil(new Date("2026-07-28T23:00:00+02:00"), now)).toBe(0);
    expect(daysUntil(new Date("2026-07-29T08:00:00+02:00"), now)).toBe(1);
  });

  it("levert een negatief getal op voor een verstreken deadline", () => {
    expect(daysUntil(new Date("2026-07-26T09:00:00+02:00"), now)).toBe(-2);
  });
});
