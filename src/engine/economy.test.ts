import { beforeEach, describe, expect, it } from "vitest";
import { FEATURE_LEVEL, hasFeature, LEVEL_REWARDS, rewardsBetween } from "../lore/levels";
import { AIDS, ITEMS, itemById } from "../lore/shop";
import { BANNER_PRESETS, pickPreset, PRESETS } from "./ambience";
import { lessonById, REVIEW_CARDS, YEARS } from "./content";
import { duelOutcome, mulberry32, opponentRound, OPPONENTS, scoreAnswer } from "./duel";
import { canSkip, currentYear, isLessonUnlocked, levelFromXp, MAX_LEVEL, skipCost, xpForLevel } from "./progress";
import { addDays, answerCard, dueCards, INTERVALS, nextStreak } from "./review";
import { BACKUP_KEY, backupRawSave, detectSaveVersion, migrateSave, readBackups, rebuildDerived, SAVE_KEY, unwrapSave, useGame } from "./store";
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
    expect(useGame.getState().galleons).toBe(40);
    expect(useGame.getState().buyItem("wand-elder").ok).toBe(false); // level 5 needed
    expect(useGame.getState().buyItem("ed-ember").ok).toBe(false); // gift only
  });

  it("limits learning aids per year", () => {
    reset({ galleons: 1000 });
    for (let i = 0; i < 3; i++) expect(useGame.getState().buyAid("felix", 1).ok).toBe(true);
    expect(useGame.getState().buyAid("felix", 1).ok).toBe(false);
    expect(useGame.getState().buyAid("felix", 2).ok).toBe(true);
  });

  it("pays more Galleons and house points at higher levels, but the same XP", () => {
    const lesson = lessonById("y1-l01")!;
    const core = lesson.exercises.find((e) => e.tier === "core")!;
    reset({ bestLevel: 1 });
    const low = useGame.getState().completeExercise(core, lesson, true);
    reset({ bestLevel: 10, xp: 4500 });
    const high = useGame.getState().completeExercise(core, lesson, true);
    expect(high.galleons).toBe(Math.ceil(core.galleons * 1.27));
    expect(high.housePoints).toBeGreaterThan(low.housePoints);
    expect(high.xp).toBe(low.xp);
    expect(high.levelBonus).toBeCloseTo(1.27);
  });

  it("still pays only 1 Galleon for a repeat duel win, whatever the level", () => {
    reset({ bestLevel: 15, duelPaidOn: {} });
    expect(useGame.getState().recordDuel("neville", "win", 8).galleons).toBe(Math.ceil(8 * 1.42));
    expect(useGame.getState().recordDuel("neville", "win", 8).galleons).toBe(1);
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

  it("pays out in full for the first win each day, then 1 Galleon, and awards badges", () => {
    reset({ galleons: 0, duelPaidOn: {} });
    for (let i = 0; i < 3; i++) useGame.getState().recordDuel("draco", "win", 15);
    const s = useGame.getState();
    expect(s.galleons).toBe(15 + 1 + 1);
    expect(s.duels.draco.wins).toBe(3);
    expect(s.badges["duel-draco"]).toBeDefined();
    expect(s.badges.rivalry).toBeDefined();
  });
});

describe("living backgrounds", () => {
  it("has eighteen presets, all different, and never repeats one back to back", () => {
    expect(PRESETS).toHaveLength(18);
    expect(new Set(PRESETS.map((p) => p.id)).size).toBe(18);
    let prev = pickPreset(null);
    for (let i = 0; i < 200; i++) {
      const next = pickPreset(prev);
      expect(next).not.toBe(prev);
      expect(PRESETS.map((p) => p.id)).toContain(next);
      prev = next;
    }
  });

  it("adds a banner's own background to the pool only while it's equipped", () => {
    const quidditch = BANNER_PRESETS.snitch.id;
    const seen = new Set(Array.from({ length: 400 }, (_, i) => pickPreset(null, () => (i % 40) / 40, [quidditch])));
    expect(seen.has(quidditch)).toBe(true);
    const without = new Set(Array.from({ length: 400 }, (_, i) => pickPreset(null, () => (i % 40) / 40)));
    expect(without.has(quidditch)).toBe(false);
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

describe("save safety", () => {
  const rec = { completedAt: "2026-09-30T10:00:00.000Z", attempts: 1, hintsUsed: 0, xpEarned: 25, grade: "O" };
  const exercises = { "y1-l01.warmup": rec, "y1-l01.core": rec, "y1-l02.warmup": rec, "y1-l02.core": rec };
  const owners = { name: "Siddhartha", house: "ravenclaw", xp: 1959, bestLevel: 6, galleons: 370, housePoints: 395, exercises };

  it("judges a save's version by what it holds, so a wrong number never wipes it", () => {
    expect(detectSaveVersion(owners, 0)).toBe(3);
    expect(detectSaveVersion({ xp: 5, exercises: {} }, 1)).toBe(2);
    expect(detectSaveVersion({ xp: 5, completed: {} }, 0)).toBe(1);
    const migrated = migrateSave(owners, detectSaveVersion(owners, 1));
    expect(Object.keys(migrated.exercises as object)).toHaveLength(4);
  });

  it("keeps owned items and doesn't pay level rewards twice when a v3 save is mislabelled v2", () => {
    const save = { ...owners, owned: { "wand-elder": "bought" } };
    const migrated = migrateSave(save, 2);
    expect((migrated.owned as Record<string, string>)["wand-elder"]).toBe("bought");
    expect(migrated.galleons).toBe(370);
  });

  it("reads every save format", () => {
    expect(unwrapSave({ state: owners }).state.xp).toBe(1959);
    expect(unwrapSave({ state: owners, version: 3 }).version).toBe(3);
    expect(unwrapSave({ ...owners, saveVersion: 3 }).state).not.toHaveProperty("saveVersion");
    expect(unwrapSave(owners).version).toBe(3);
    expect(() => unwrapSave({ hello: "world" })).toThrow();
  });

  it("rebuilds clues, seen scenes and level rewards from finished exercises", () => {
    const rebuilt = rebuildDerived({ ...owners, bestLevel: 1 });
    expect(Object.keys(rebuilt.clues as object)).toEqual(expect.arrayContaining(["y1-l01", "y1-l02"]));
    expect((rebuilt.scenesSeen as Record<string, boolean>)["y1-l01"]).toBe(true);
    expect((rebuilt.scenesSeen as Record<string, boolean>)["year-1"]).toBe(true);
    expect(rebuilt.bestLevel).toBe(6);
    expect((rebuilt.owned as Record<string, string>)["fam-owl"]).toBeDefined();
  });

  it("imports the raw localStorage value pasted in Settings", () => {
    reset();
    useGame.getState().importSave(JSON.stringify({ state: owners }));
    const s = useGame.getState();
    expect(s.xp).toBe(1959);
    expect(s.galleons).toBe(370);
    expect(s.bestLevel).toBe(6);
    expect(Object.keys(s.exercises)).toHaveLength(4);
    expect(s.clues["y1-l01"]).toBeDefined();
  });

  it("copies the stored save aside before loading, keeping the last three", () => {
    const mem = new Map<string, string>();
    const fake = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
    (globalThis as { localStorage?: unknown }).localStorage = fake;
    try {
      for (let i = 1; i <= 4; i++) {
        mem.set(SAVE_KEY, JSON.stringify({ state: { ...owners, xp: i }, version: 3 }));
        backupRawSave(`2026-10-0${i}`);
      }
      backupRawSave("2026-10-09");
      const backups = readBackups();
      expect(backups.map((b) => b.at)).toEqual(["2026-10-04", "2026-10-03", "2026-10-02"]);
      expect(JSON.parse(mem.get(BACKUP_KEY)!)).toHaveLength(3);
    } finally {
      delete (globalThis as { localStorage?: unknown }).localStorage;
    }
  });
});

beforeEach(() => reset());
