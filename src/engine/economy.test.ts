import { beforeEach, describe, expect, it } from "vitest";
import { FEATURE_LEVEL, hasFeature, LEVEL_REWARDS, rewardsBetween } from "../lore/levels";
import { AIDS, ITEMS, itemById } from "../lore/shop";
import { pickPreset, PRESETS } from "./ambience";
import { lessonById, REVIEW_CARDS, YEARS } from "./content";
import { duelOutcome, mulberry32, opponentRound, OPPONENTS, scoreAnswer } from "./duel";
import { canSkip, currentYear, isLessonUnlocked, levelFromXp, MAX_LEVEL, skipCost, xpForLevel } from "./progress";
import { addDays, answerCard, dueCards, INTERVALS, nextStreak } from "./review";
import { migrateSave, useGame } from "./store";
import { isRequired, type ExerciseRecord } from "./types";

const rec: ExerciseRecord = { completedAt: "x", attempts: 1, hintsUsed: 0, xpEarned: 1, grade: "E" };
const doneLessons = (ids: string[]) =>
  Object.fromEntries(ids.flatMap((id) => lessonById(id)!.exercises.filter(isRequired).map((e) => [e.id, rec])));

const reset = (patch: Record<string, unknown> = {}) => {
  useGame.getState().resetProgress();
  useGame.setState({ name: "Tester", house: "ravenclaw", ...patch });
};

describe("Peeves' Bargain (skipping)", () => {
  it("costs Galleons and XP, rising 50% with every skip that year", () => {
    expect(skipCost(0)).toEqual({ galleons: 75, xp: 60 });
    expect(skipCost(1)).toEqual({ galleons: 113, xp: 90 });
    expect(skipCost(2)).toEqual({ galleons: 150, xp: 120 });
  });

  it("only allows skipping the next unfinished lesson, and never a Trial", () => {
    expect(canSkip(lessonById("y1-l01")!, YEARS, {}, {})).toBe(true);
    expect(canSkip(lessonById("y1-l02")!, YEARS, {}, {})).toBe(false);
    const allButTrial = doneLessons(YEARS[0].lessons.filter((l) => l.kind !== "trial").map((l) => l.id));
    expect(canSkip(lessonById("y1-trial")!, YEARS, allButTrial, {})).toBe(false);
  });

  it("opens the next lesson but gives no grade or clue", () => {
    reset({ galleons: 200, xp: 150 });
    const result = useGame.getState().skipLesson(lessonById("y1-l01")!);
    expect(result.ok).toBe(true);
    const s = useGame.getState();
    expect(s.galleons).toBe(125);
    expect(s.xp).toBe(90);
    expect(s.clues["y1-l01"]).toBeUndefined();
    expect(isLessonUnlocked(lessonById("y1-l02")!, YEARS, s.exercises, s.skipped)).toBe(true);
  });

  it("refuses when you can't afford it, and never takes XP below zero", () => {
    reset({ galleons: 10 });
    expect(useGame.getState().skipLesson(lessonById("y1-l01")!).ok).toBe(false);
    reset({ galleons: 500, xp: 20 });
    useGame.getState().skipLesson(lessonById("y1-l01")!);
    expect(useGame.getState().xp).toBe(0);
  });

  it("keeps levels already reached even when XP drops", () => {
    reset({ galleons: 500, xp: 350, bestLevel: 3 });
    useGame.getState().skipLesson(lessonById("y1-l01")!);
    expect(levelFromXp(useGame.getState().xp)).toBe(2);
    expect(useGame.getState().bestLevel).toBe(3);
  });
});

describe("levels and rewards", () => {
  it("caps at level 20 with a reward for every level from 2", () => {
    expect(MAX_LEVEL).toBe(20);
    expect(levelFromXp(10_000_000)).toBe(20);
    expect(LEVEL_REWARDS.map((r) => r.level)).toEqual(Array.from({ length: 19 }, (_, i) => i + 2));
    for (const r of LEVEL_REWARDS) if (r.item) expect(itemById(r.item)).toBeDefined();
  });

  it("unlocks features at their levels", () => {
    expect(hasFeature(1, "time-turner")).toBe(false);
    expect(hasFeature(FEATURE_LEVEL["time-turner"], "time-turner")).toBe(true);
    expect(rewardsBetween(1, 3).map((r) => r.unlock)).toEqual(["time-turner", "dueling-club"]);
  });

  it("hands out rewards when XP crosses a level", () => {
    reset({ xp: 0, bestLevel: 1, galleons: 0 });
    const level = useGame.getState().gainXp(xpForLevel(4));
    expect(level).toBe(4);
    const s = useGame.getState();
    expect(s.bestLevel).toBe(4);
    expect(s.owned["fam-owl"]).toBeDefined();
    expect(s.galleons).toBe(10);
  });
});

describe("Diagon Alley", () => {
  it("has unique items and sensible prices", () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    for (const i of ITEMS) expect(i.giftOnly || i.price >= 0).toBe(true);
    expect(AIDS.map((a) => a.id)).toEqual(["felix", "sand"]);
  });

  it("buys and equips, respecting price and level", () => {
    reset({ galleons: 100 });
    expect(useGame.getState().buyItem("fam-toad").ok).toBe(true);
    expect(useGame.getState().equipped.familiar).toBe("fam-toad");
    expect(useGame.getState().galleons).toBe(80);
    expect(useGame.getState().buyItem("wand-elder").ok).toBe(false); // level 5 needed
    expect(useGame.getState().buyItem("ed-ember").ok).toBe(false); // gift only
  });

  it("limits learning aids per year", () => {
    reset({ galleons: 1000 });
    for (let i = 0; i < 3; i++) expect(useGame.getState().buyAid("felix", 1).ok).toBe(true);
    expect(useGame.getState().buyAid("felix", 1).ok).toBe(false);
    expect(useGame.getState().buyAid("felix", 2).ok).toBe(true);
  });

  it("Felix Felicis makes a hint free for XP and grade", () => {
    reset({ aids: { felix: 1, sand: 0 } });
    const lesson = lessonById("y1-l01")!;
    const warmup = lesson.exercises[0];
    useGame.getState().drinkFelix(warmup.id);
    expect(useGame.getState().hintsUnlocked[warmup.id]).toBe(1);
    const reward = useGame.getState().completeExercise(warmup, lesson, true);
    expect(reward.grade).toBe("O");
  });

  it("Time-Turner sand resets a finished exercise so its grade can rise", () => {
    const lesson = lessonById("y1-l01")!;
    const warmup = lesson.exercises[0];
    reset({ aids: { felix: 0, sand: 1 }, hintsUnlocked: { [warmup.id]: 3 }, exercises: { [warmup.id]: { ...rec, grade: "A" } } });
    expect(useGame.getState().pourSand(warmup.id).ok).toBe(true);
    const reward = useGame.getState().completeExercise(warmup, lesson, true);
    expect(reward.grade).toBe("O");
    expect(reward.gradeImproved).toBe(true);
  });
});

describe("the Time-Turner", () => {
  it("moves cards up the boxes when right and back to the start when wrong", () => {
    const today = "2026-09-30";
    const first = answerCard(undefined, true, today);
    expect(first).toEqual({ box: 1, due: addDays(today, INTERVALS[0]), misses: 0 });
    const second = answerCard(first, true, today);
    expect(second.due).toBe(addDays(today, INTERVALS[1]));
    expect(answerCard(second, false, today)).toEqual({ box: 0, due: "2026-10-01", misses: 1 });
  });

  it("builds a session of due cards, weakest first", () => {
    const deck = REVIEW_CARDS.filter((c) => c.lessonId === "y1-l01" || c.lessonId === "y1-l02");
    const [a, b, c] = deck;
    const states = {
      [a.id]: { box: 2, due: "2026-09-01", misses: 0 },
      [b.id]: { box: 0, due: "2026-09-01", misses: 3 },
      [c.id]: { box: 3, due: "2027-01-01", misses: 0 },
    };
    const session = dueCards(deck, states, "2026-09-30");
    expect(session[0].id).toBe(b.id);
    expect(session.map((x) => x.id)).not.toContain(c.id);
    expect(session.length).toBeLessThanOrEqual(5);
  });

  it("counts attendance streaks", () => {
    expect(nextStreak(null, 0, "2026-09-30")).toBe(1);
    expect(nextStreak("2026-09-29", 4, "2026-09-30")).toBe(5);
    expect(nextStreak("2026-09-30", 5, "2026-09-30")).toBe(5);
    expect(nextStreak("2026-09-20", 5, "2026-09-30")).toBe(1);
  });
});

describe("the Dueling Club", () => {
  it("scores right answers with a speed bonus", () => {
    expect(scoreAnswer(false, 1)).toBe(0);
    expect(scoreAnswer(true, 0)).toBe(200);
    expect(scoreAnswer(true, 20)).toBe(100);
    expect(scoreAnswer(true, 10)).toBe(150);
  });

  it("simulates opponents reproducibly, better duellists doing better", () => {
    const total = (id: string) => {
      const rng = mulberry32(42);
      const opp = OPPONENTS.find((o) => o.id === id)!;
      return Array.from({ length: 200 }, () => opponentRound(opp, rng).points).reduce((a, b) => a + b, 0);
    };
    expect(total("neville")).toBe(total("neville"));
    expect(total("snape")).toBeGreaterThan(total("draco"));
    expect(total("draco")).toBeGreaterThan(total("neville"));
    expect(duelOutcome(300, 200)).toBe("win");
    expect(duelOutcome(200, 200)).toBe("draw");
  });

  it("pays out and awards badges on a win", () => {
    reset({ galleons: 0 });
    for (let i = 0; i < 3; i++) useGame.getState().recordDuel("draco", "win", 15);
    const s = useGame.getState();
    expect(s.galleons).toBe(45);
    expect(s.duels.draco.wins).toBe(3);
    expect(s.badges["duel-draco"]).toBeDefined();
    expect(s.badges.rivalry).toBeDefined();
  });
});

describe("living backgrounds", () => {
  it("has ten presets and never repeats one back to back", () => {
    expect(PRESETS).toHaveLength(10);
    let prev = pickPreset(null);
    for (let i = 0; i < 200; i++) {
      const next = pickPreset(prev);
      expect(next).not.toBe(prev);
      expect(PRESETS.map((p) => p.id)).toContain(next);
      prev = next;
    }
  });
});

describe("years and saves", () => {
  it("knows the latest year reached", () => {
    expect(currentYear(YEARS, {}, {})).toBe(1);
  });

  it("migrates a version-2 save, granting rewards for levels already reached", () => {
    const v3 = migrateSave({ name: "Sid", xp: xpForLevel(5), galleons: 12, exercises: {} }, 2);
    expect(v3.bestLevel).toBe(5);
    expect((v3.owned as Record<string, string>)["fam-owl"]).toBeDefined();
    expect(v3.galleons).toBe(12 + 10 + 20);
  });
});

beforeEach(() => reset());
