import { describe, expect, it } from "vitest";
import { LESSONS, REVIEW_CARDS } from "./content";
import { backfillActivity, bumpActivity, gradeSpread, practiceHeatmap, practiceStreaks, retention, weakestTopics, yearRecap, type Activity } from "./stats";
import type { ExerciseRecord } from "./types";

const rec = (completedAt: string, grade: ExerciseRecord["grade"] = "E"): ExerciseRecord => ({ completedAt, attempts: 1, hintsUsed: 0, xpEarned: 1, grade });
const day = (exercises = 0, cards = 0, correct = 0, duels = 0) => ({ exercises, cards, correct, duels });

describe("the activity log", () => {
  it("adds to today's tally and forgets days older than 400", () => {
    let a: Activity = { "2025-01-01": day(3) };
    a = bumpActivity(a, "2026-10-04", { cards: 1, correct: 1 });
    a = bumpActivity(a, "2026-10-04", { cards: 1 });
    expect(a["2026-10-04"]).toEqual(day(0, 2, 1));
    expect(a["2025-01-01"]).toBeUndefined();
  });

  it("rebuilds an old save's log from when exercises were finished", () => {
    const a = backfillActivity({ x: rec("2026-09-01T10:00:00"), y: rec("2026-09-01T18:00:00"), z: rec("not a date") });
    expect(a["2026-09-01"].exercises).toBe(2);
    expect(Object.keys(a)).toHaveLength(1);
  });
});

describe("streaks and the heatmap", () => {
  const log: Activity = { "2026-10-01": day(1), "2026-10-02": day(0, 3), "2026-10-03": day(2), "2026-09-20": day(1), "2026-09-21": day(1) };

  it("counts the current run, the best run and the days practised", () => {
    expect(practiceStreaks(log, "2026-10-04")).toEqual({ current: 3, best: 3, daysPractised: 5 });
    expect(practiceStreaks(log, "2026-10-06").current).toBe(0);
  });

  it("lays out weeks Monday to Sunday, ending today, with quiet days at level 0", () => {
    const weeks = practiceHeatmap(log, "2026-10-04", 2); // a Sunday
    expect(weeks[0][0].day).toBe("2026-09-21"); // a Monday
    expect(weeks[1].at(-1)!.day).toBe("2026-10-04");
    const flat = weeks.flat();
    expect(flat.find((d) => d.day === "2026-10-02")!.level).toBeGreaterThan(flat.find((d) => d.day === "2026-10-01")!.level);
    expect(flat.find((d) => d.day === "2026-09-28")!.level).toBe(0);
  });
});

describe("retention and grades", () => {
  it("puts cards in their boxes and works out the recent hit rate", () => {
    const deck = REVIEW_CARDS.slice(0, 4);
    const cards = { [deck[0].id]: { box: 0, due: "x", misses: 1 }, [deck[1].id]: { box: 4, due: "x", misses: 0 } };
    const r = retention(deck, cards, { "2026-10-03": day(0, 4, 3), "2026-01-01": day(0, 10, 0) }, "2026-10-04");
    expect(r.boxes).toEqual([1, 0, 0, 0, 1]);
    expect(r.unseen).toBe(2);
    expect(r.hitRate).toBe(0.75);
  });

  it("counts grades per year", () => {
    const [a, b] = LESSONS[0].exercises;
    expect(gradeSpread({ [a.id]: rec("2026-01-01", "O"), [b.id]: rec("2026-01-01", "A") })).toEqual([{ year: 1, grades: { O: 1, E: 0, A: 1, P: 0 } }]);
  });
});

describe("weak spots and the year's recap", () => {
  const year1 = Object.fromEntries(LESSONS.filter((l) => l.year === 1).flatMap((l) => l.exercises.map((e) => [e.id, rec("2026-09-01", "O")])));

  it("names the lesson whose cards you miss most", () => {
    const missed = LESSONS.find((l) => l.id === "y1-l07")!.review[0].id;
    const weak = weakestTopics({ exercises: year1, cards: { [missed]: { box: 0, due: "x", misses: 4 } }, aiCards: {}, now: new Date("2026-09-02") });
    expect(weak[0].id).toBe("y1-l07");
    expect(weak).toHaveLength(5);
  });

  it("sums up a finished year", () => {
    const r = yearRecap(1, { exercises: year1, cards: {}, aiCards: {}, activity: { "2026-09-01": day(5) } });
    expect(r.lessons).toBe(LESSONS.filter((l) => l.year === 1).length);
    expect(r.outstanding).toBe(r.exercises);
    expect(r.daysPractised).toBe(1);
  });
});
