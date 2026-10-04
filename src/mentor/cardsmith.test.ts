import { loadPyodide, type PyodideInterface } from "pyodide";
import { beforeAll, describe, expect, it } from "vitest";
import { LESSONS } from "../engine/content";
import type { ExerciseRecord } from "../engine/types";
import harnessSource from "../runtime/harness.py?raw";
import type { RunOutcome } from "../runtime/types";
import type { Runner } from "./cardCheck";
import { forgeCards, rankWeakest, type AskJson } from "./cardsmith";
import { BLIND_SYSTEM } from "./cardPrompt";
import { parseJsonReply } from "./llm";

let run: Runner;
beforeAll(async () => {
  const py: PyodideInterface = await loadPyodide();
  py.runPython(harnessSource);
  py.runPython("STEP_LIMIT = 200_000");
  run = async (code) => JSON.parse(py.globals.get("run_json")(code, "[]", "{}")) as RunOutcome;
}, 60_000);

/** A player who has finished the whole of Year 1. */
const year1: Record<string, ExerciseRecord> = Object.fromEntries(
  LESSONS.filter((l) => l.year === 1).flatMap((l) => l.exercises.map((e) => [e.id, { completedAt: "2026-09-01", attempts: 1, hintsUsed: 0, xpEarned: 1, grade: "E" as const }])),
);

const CANDIDATES = [
  // Good: the bug is real and the fix works.
  { type: "bug", lesson: "y1-l13a", code: "total = 0\nfor n in [2, 4, 6]:\n    total = n\nprint(total)", buggyLine: 3, fix: "total += n", expected: "12", why: "= throws the old total away each time; += keeps adding to it." },
  // Good: exactly one option prints 9.
  { type: "complete", lesson: "y1-l12", code: "count = 0\nfor i in range(3):\n    ____\nprint(count)", options: ["count += 3", "count += i", "count = 3"], answer: 0, expected: "9", why: "Adding 3 on each of the 3 passes gives 9." },
  // Good: a choice the blind check agrees with.
  { type: "choice", lesson: "y1-l04a", q: "What does `7 // 2` give in Python?", options: ["3", "3.5", "4"], answer: 0, why: "// is floor division: it rounds down to a whole number, unlike JavaScript's /." },
  // Out of scope for a Year 1 player.
  { type: "predict", lesson: "y1-l12", code: "f = lambda n: n * 2\nprint(f(4))", why: "A lambda is a one-line function, taught in Year 3." },
  // Malformed.
  { type: "choice", lesson: "y1-l12", q: "Missing options entirely here." },
  // Crashes.
  { type: "predict", lesson: "y1-l05", code: "print(int('three'))", why: "int() can't read words, so this raises a ValueError." },
];

const fake =
  (blindAnswers: number[]): AskJson =>
  async (system) =>
    system === BLIND_SYSTEM ? { answers: blindAnswers } : { cards: CANDIDATES };

describe("the card writer", () => {
  it("keeps only cards that pass every gate, in a mix of types", async () => {
    const r = await forgeCards({ exercises: year1, cards: {}, aiCards: {}, rejected: {}, ask: fake([0]), run });
    expect(r.cards.map((c) => c.type).sort()).toEqual(["bug", "choice", "complete"]);
    expect(r.cards.every((c) => c.source === "ai")).toBe(true);
    expect(r.dropped.join(" ")).toMatch(/lambda/);
    expect(r.dropped.join(" ")).toMatch(/malformed/);
    expect(r.dropped.join(" ")).toMatch(/doesn't run/);
  });

  it("drops a choice card when the blind second opinion disagrees", async () => {
    const r = await forgeCards({ exercises: year1, cards: {}, aiCards: {}, rejected: {}, ask: fake([2]), run });
    expect(r.cards.some((c) => c.type === "choice")).toBe(false);
    expect(r.dropped.join(" ")).toMatch(/blind check disagreed/);
  });

  it("returns nothing (rather than failing) when the AI sends nonsense", async () => {
    const r = await forgeCards({ exercises: year1, cards: {}, aiCards: {}, rejected: {}, ask: async () => ({ nope: true }), run });
    expect(r.cards).toEqual([]);
  });

  it("aims at the lessons whose cards you miss most", () => {
    const done = LESSONS.filter((l) => l.year === 1);
    const missed = { [done.find((l) => l.id === "y1-l07")!.review[0].id]: { box: 0, due: "2026-01-01", misses: 5 } };
    const ranked = rankWeakest(done, { exercises: year1, cards: missed, aiCards: {}, random: () => 0 });
    expect(ranked[0].id).toBe("y1-l07");
    expect(ranked.every((l) => l.kind === "lesson")).toBe(true);
  });

  it("reads JSON even when the model wraps it in a fence or a sentence", () => {
    expect(parseJsonReply('Here you go:\n```json\n{"cards": []}\n```')).toEqual({ cards: [] });
    expect(() => parseJsonReply("no json at all")).toThrow();
  });
});
