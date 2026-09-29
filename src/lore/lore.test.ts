import { describe, expect, it } from "vitest";
import { detectEggs } from "./easterEggs";
import { sortIntoHouse } from "./lore";

const ids = (out: string) => detectEggs(out).map((h) => h.id);

describe("easter eggs", () => {
  it("responds to printed spells", () => {
    expect(ids("Lumos")).toEqual(["lumos"]);
    expect(ids("Nox")).toEqual(["nox"]);
    expect(ids("EXPECTO PATRONUM!")).toEqual(["patronus"]);
    expect(ids("I solemnly swear that I am up to no good")).toEqual(["marauder-open"]);
  });
  it("corrects a mispronounced levitation charm", () => {
    expect(ids("Wingardium Leviosar")).toEqual(["leviosar"]);
    expect(ids("Wingardium Leviosa")).toEqual(["leviosa"]);
  });
  it("ignores ordinary output", () => {
    expect(ids("Hello, Hogwarts!\nI am ready to learn magic.")).toEqual([]);
    expect(ids("noxious fumes")).toEqual([]);
  });
  it("finds the Zen of Python", () => {
    expect(ids("The Zen of Python, by Tim Peters\n\nBeautiful is better than ugly.")).toContain("zen");
  });
  it("summons named objects", () => {
    expect(detectEggs("Accio Firebolt")[0].message).toContain("Accio Firebolt");
  });
});

describe("sorting", () => {
  it("picks the most-chosen house", () => {
    expect(sortIntoHouse(["ravenclaw", "ravenclaw", "slytherin", "gryffindor"])).toBe("ravenclaw");
  });
  it("breaks ties among the tied houses only", () => {
    expect(sortIntoHouse(["hufflepuff", "slytherin"], () => 0)).toBe("hufflepuff");
    expect(sortIntoHouse(["hufflepuff", "slytherin"], () => 0.99)).toBe("slytherin");
  });
});
