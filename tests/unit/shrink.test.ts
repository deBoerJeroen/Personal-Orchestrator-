import { describe, expect, it } from "vitest";
import { shrink } from "@/lib/rules/shrink";

describe("shrink", () => {
  it("maakt van schrijven een eerste zin", () => {
    const result = shrink("Schrijf de kwartaalrapportage");

    expect(result).toEqual({
      kind: "suggestion",
      title: 'Open het bestand voor "de kwartaalrapportage" en schrijf één zin',
    });
  });

  it("maakt van bellen het opzoeken van een nummer", () => {
    expect(shrink("Bel de huisarts")).toEqual({
      kind: "suggestion",
      title: "Zoek het telefoonnummer van de huisarts op",
    });
  });

  it("maakt van sporten het aantrekken van kleren", () => {
    expect(shrink("Sport drie keer deze week")).toEqual({
      kind: "suggestion",
      title: "Trek je sportkleren aan",
    });
  });

  it("verzint niets als geen sjabloon past, maar vraagt het", () => {
    const result = shrink("Wortels planten in de moestuin");

    expect(result).toEqual({
      kind: "ask",
      question: "Wat zijn de eerste twee minuten hiervan?",
    });
  });

  it("kijkt niet naar hoofdletters of spaties", () => {
    expect(shrink("  MAIL Vincent  ")).toEqual({
      kind: "suggestion",
      title: "Open een lege mail aan Vincent en typ de aanhef",
    });
  });
});
