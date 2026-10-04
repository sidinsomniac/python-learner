import { describe, expect, it } from "vitest";
import { lessonsUpTo, outOfScope } from "../mentor/cardCheck";
import { AUROR_CASES, AUROR_PATTERNS, isCaseUnlocked } from "./auror";
import { LESSONS, lessonById } from "./content";
import type { ExerciseRecord, ReviewCard } from "./types";

// Reference solutions are never bundled into the game, but the tests can read them.
const solutions = import.meta.glob("/content/auror/*/*.solution.py", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const solutionFor = (id: string) => Object.entries(solutions).find(([p]) => p.endsWith(`/${id.replace(/^auror-/, "")}.solution.py`))?.[1];

describe("the Auror Academy", () => {
  it("has 8 patterns of 3 cases, each tied to a real lesson", () => {
    expect(AUROR_PATTERNS).toHaveLength(8);
    expect(AUROR_PATTERNS.every((p) => p.cases.length === 3)).toBe(true);
    for (const c of AUROR_CASES) {
      expect(lessonById(c.requires), c.id).toBeDefined();
      expect(c.lesson.rulesFrom).toBe(c.requires);
      expect(c.exercise.id).toBe(`${c.id}.case`);
      expect(c.complexity.options[c.complexity.answer], c.id).toBeDefined();
    }
  });

  it("solves every case with only the syntax its required lesson has taught", () => {
    const misses = AUROR_CASES.map((c) => {
      const code = solutionFor(c.id);
      if (!code) return [c.id, "no solution"];
      const card = { id: c.id, lessonId: c.requires, type: "predict", code, why: "" } as ReviewCard;
      return [c.id, outOfScope(card, lessonsUpTo(c.requires))];
    }).filter(([, why]) => why);
    expect(misses).toEqual([]);
  });

  it("opens a case only once its required lesson is finished", () => {
    const c = AUROR_CASES.find((x) => x.requires === "y2-l07")!;
    const rec: ExerciseRecord = { completedAt: "2026-01-01", attempts: 1, hintsUsed: 0, xpEarned: 1, grade: "E" };
    expect(isCaseUnlocked(c, {})).toBe(false);
    const upTo = LESSONS.slice(0, LESSONS.findIndex((l) => l.id === "y2-l07") + 1);
    const records = Object.fromEntries(upTo.flatMap((l) => l.exercises.map((e) => [e.id, rec])));
    expect(isCaseUnlocked(c, records)).toBe(true);
  });
});
