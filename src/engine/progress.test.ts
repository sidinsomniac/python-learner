import { describe, expect, it } from "vitest";
import { QUESTS } from "./content";
import { compareProphecy, isQuestUnlocked, isYearComplete, levelFromXp, levelProgress, xpForCompletion, xpForLevel } from "./progress";

describe("levels", () => {
  it("uses a growing XP curve", () => {
    expect([1, 2, 3, 4].map(xpForLevel)).toEqual([0, 100, 300, 600]);
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(650)).toBe(4);
    expect(levelProgress(150)).toMatchObject({ level: 2, into: 50, needed: 200 });
  });
});

describe("xpForCompletion", () => {
  it("gives a first-try, no-hint bonus", () => {
    expect(xpForCompletion(100, 0, 1)).toBe(125);
  });
  it("gives full XP for several attempts without hints", () => {
    expect(xpForCompletion(100, 0, 3)).toBe(100);
  });
  it("takes 15% per hint but never below 40%", () => {
    expect(xpForCompletion(100, 1, 2)).toBe(85);
    expect(xpForCompletion(100, 4, 9)).toBe(40);
    expect(xpForCompletion(100, 10, 9)).toBe(40);
  });
});

describe("unlocking", () => {
  const year1 = QUESTS.filter((q) => q.year === 1);
  it("opens only the first quest at the start", () => {
    expect(year1.map((q) => isQuestUnlocked(q, QUESTS, {}))).toEqual([true, false, false, false, false]);
  });
  it("opens the next quest when the previous is done", () => {
    const done = { [year1[0].id]: { completedAt: "", attempts: 1, hintsUsed: 0, xpEarned: 1 } };
    expect(isQuestUnlocked(year1[1], QUESTS, done)).toBe(true);
    expect(isQuestUnlocked(year1[2], QUESTS, done)).toBe(false);
  });
  it("knows when a year is complete", () => {
    const all = Object.fromEntries(year1.map((q) => [q.id, { completedAt: "", attempts: 1, hintsUsed: 0, xpEarned: 1 }]));
    expect(isYearComplete(1, QUESTS, all)).toBe(true);
    expect(isYearComplete(1, QUESTS, {})).toBe(false);
  });
});

describe("compareProphecy", () => {
  it("accepts matching output, ignoring trailing spaces and blank lines", () => {
    expect(compareProphecy("10 \n3.5\n\n", "10\n3.5\n").correct).toBe(true);
  });
  it("reports the first wrong line without revealing it", () => {
    expect(compareProphecy("10\n3\n", "10\n3.5\n")).toMatchObject({ correct: false, firstWrongLine: 2 });
  });
  it("reports a line-count mismatch", () => {
    expect(compareProphecy("10\n", "10\n3.5\n")).toMatchObject({ predictedLineCount: 1, expectedLineCount: 2 });
  });
});

describe("content", () => {
  it("loads Year 1 with every activity type and a full hint ladder", () => {
    const year1 = QUESTS.filter((q) => q.year === 1);
    expect(year1).toHaveLength(5);
    expect(new Set(year1.map((q) => q.type))).toEqual(new Set(["practice", "scramble", "divination", "repair"]));
    for (const q of year1) {
      expect(Object.keys(q.hints).sort()).toEqual(["analogous", "flaw", "nudge", "pseudocode", "question"]);
      expect(q.lecture.length).toBeGreaterThan(100);
      expect(q.type === "divination" ? q.snippet : q.tests).toBeTruthy();
    }
  });
  it("never bundles reference solutions", () => {
    const bundled = JSON.stringify(QUESTS);
    expect(bundled).not.toContain('print(f"Welcome {name}! Your letter arrives in {years_left} years.")');
  });
});
