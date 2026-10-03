import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LEVEL_REWARDS, rewardsBetween } from "../lore/levels";
import type { HouseId } from "../lore/lore";
import { aidById, itemById, type AidId, type ItemKind } from "../lore/shop";
import { DEFAULT_MENTOR_SETTINGS, type MentorSettings } from "../mentor/llm";
import { DEFAULT_MUSIC, type MusicSettings } from "./music";
import * as perks from "./perks";
import { LESSONS, YEARS } from "./content";
import type { DuelOutcome } from "./duel";
import {
  bestGrade,
  canSkip,
  gradeFor,
  isLessonComplete,
  isYearComplete,
  levelFromXp,
  scaled,
  levelBonus,
  skipCost,
  skipsInYear,
  xpForCompletion,
} from "./progress";
import { answerCard, dayKey, nextStreak, type CardState } from "./review";
import type { Exercise, ExerciseRecord, Grade, Lesson, SceneLine } from "./types";

export const SAVE_KEY = "parseltongue-save-v1";
export const SAVE_VERSION = 3;
/** The last few raw saves, copied before any upgrade runs (see backupRawSave). */
export const BACKUP_KEY = "parseltongue-save-backup";
const MAX_BACKUPS = 3;

export interface Reward {
  firstTime: boolean;
  xp: number;
  galleons: number;
  housePoints: number;
  grade: Grade;
  gradeImproved: boolean;
  newBadges: string[];
  levelUp: number | null;
  lessonCompleted: boolean;
  clue?: string;
  /** The level bonus applied to Galleons and house points (1 = none). */
  levelBonus: number;
  /** Things your familiar did this time ("The Niffler pocketed a Galleon"). */
  perkNotes: string[];
}

/** Day-stamps for perks that work once a day, week or year. */
export interface PerkState {
  ratSavedOn: string | null;
  nifflerOn: string | null;
  /** School years in which the phoenix has already been reborn. */
  phoenixYears: Record<string, string>;
}

const DEFAULT_PERK_STATE: PerkState = { ratSavedOn: null, nifflerOn: null, phoenixYears: {} };

export type Result = { ok: true } | { ok: false; reason: string };

export interface GameState {
  name: string;
  house: HouseId | null;
  xp: number;
  /** The highest level ever reached. Rewards are never taken away. */
  bestLevel: number;
  galleons: number;
  housePoints: number;
  exercises: Record<string, ExerciseRecord>;
  attempts: Record<string, number>;
  hintsUnlocked: Record<string, number>;
  /** Hints taken under Felix Felicis: they cost no XP and don't lower grades. */
  freeHints: Record<string, number>;
  drafts: Record<string, string>;
  badges: Record<string, string>;
  eggsFound: Record<string, string>;
  clues: Record<string, string>;
  scenesSeen: Record<string, boolean>;
  /** Lessons skipped with Peeves' Bargain (kept even after they're finished later). */
  skipped: Record<string, string>;
  owned: Record<string, string>;
  equipped: Partial<Record<ItemKind, string>>;
  aids: Record<AidId, number>;
  /** Aids bought per `${aid}:${year}` - each year's stock is limited. */
  aidBought: Record<string, number>;
  cards: Record<string, CardState>;
  reviewLastDay: string | null;
  reviewStreak: number;
  duels: Record<string, { wins: number; losses: number; draws: number }>;
  /** The day each duel opponent last paid in full (later wins that day pay 1 Galleon). */
  duelPaidOn: Record<string, string>;
  perkState: PerkState;
  theme: "dark" | "light";
  ambience: boolean;
  /** The equipped wand's effects while typing in the editor. */
  wandFx: boolean;
  music: MusicSettings;
  marauderMap: boolean;
  mentor: MentorSettings;

  setName: (name: string) => void;
  setHouse: (house: HouseId) => void;
  saveDraft: (exerciseId: string, code: string) => void;
  recordAttempt: (exerciseId: string) => number;
  unlockHint: (exerciseId: string) => void;
  completeExercise: (exercise: Exercise, lesson: Lesson, reviewClean: boolean) => Reward;
  gainXp: (amount: number) => number | null;
  skipLesson: (lesson: Lesson) => Result;
  buyItem: (id: string) => Result;
  equip: (kind: ItemKind, id: string | null) => void;
  buyAid: (aid: AidId, year: number) => Result;
  drinkFelix: (exerciseId: string) => Result;
  pourSand: (exerciseId: string) => Result;
  answerReviewCard: (cardId: string, correct: boolean) => void;
  finishReviewSession: (correctCount: number) => { xp: number; galleons: number; streak: number };
  recordDuel: (opponentId: string, outcome: DuelOutcome, galleons: number) => { badges: string[]; galleons: number; housePoints: number };
  awardBadge: (id: string) => boolean;
  foundEgg: (id: string) => void;
  markSceneSeen: (id: string) => void;
  setTheme: (theme: "dark" | "light") => void;
  setAmbience: (on: boolean) => void;
  setWandFx: (on: boolean) => void;
  setMusic: (patch: Partial<MusicSettings>) => void;
  setMarauderMap: (open: boolean) => void;
  setMentor: (patch: Partial<MentorSettings>) => void;
  resetProgress: () => void;
  importSave: (json: string) => void;
}

const now = () => new Date().toISOString();
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

const initialData = {
  name: "",
  house: null,
  xp: 0,
  bestLevel: 1,
  galleons: 0,
  housePoints: 0,
  exercises: {},
  attempts: {},
  hintsUnlocked: {},
  freeHints: {},
  drafts: {},
  badges: {},
  eggsFound: {},
  clues: {},
  scenesSeen: {},
  skipped: {},
  owned: { "wand-holly": "start" },
  equipped: { wand: "wand-holly" },
  aids: { felix: 0, sand: 0 },
  aidBought: {},
  cards: {},
  reviewLastDay: null,
  reviewStreak: 0,
  duels: {},
  duelPaidOn: {},
  perkState: DEFAULT_PERK_STATE,
  theme: "dark" as const,
  ambience: true,
  wandFx: true,
  music: DEFAULT_MUSIC,
  marauderMap: false,
  mentor: DEFAULT_MENTOR_SETTINGS,
};

/** Badges for finishing each year, and for uncovering every clue of its mystery. */
const YEAR_BADGES: Record<number, { complete: string; detective: string }> = {
  1: { complete: "year-1", detective: "detective" },
  2: { complete: "year-2", detective: "cabinet-detective" },
  3: { complete: "year-3", detective: "loop-detective" },
};

// Declared before the store: persisted saves are migrated while it is created.
/** Where the five quests of the first slice (save version 1) live now. */
export const V1_QUEST_TO_EXERCISE: Record<string, string> = {
  "y1-q1-first-incantation": "y1-l01.warmup",
  "y1-q2-naming-yourself": "y1-l02.warmup",
  "y1-q3-scrambled-scroll": "y1-l03.warmup",
  "y1-q4-divining-the-cauldron": "y1-l04a.warmup",
  "y1-q5-broken-letter-potion": "y1-l05.warmup",
};

/** Upgrade an older save to the current shape, keeping everything earned. */
export function migrateSave(old: Record<string, unknown>, version: number): Record<string, unknown> {
  let save = old;
  if (version < 2) {
    const rename = <T,>(rec: unknown): Record<string, T> =>
      Object.fromEntries(
        Object.entries((rec ?? {}) as Record<string, T>)
          .filter(([k]) => V1_QUEST_TO_EXERCISE[k])
          .map(([k, v]) => [V1_QUEST_TO_EXERCISE[k], v]),
      );
    const completed = (old.completed ?? {}) as Record<string, { completedAt: string; attempts: number; hintsUsed: number; xpEarned: number }>;
    const exercises: Record<string, ExerciseRecord> = {};
    for (const [questId, rec] of Object.entries(completed)) {
      const id = V1_QUEST_TO_EXERCISE[questId];
      if (id) exercises[id] = { ...rec, grade: gradeFor(rec.hintsUsed, false) };
    }
    const { completed: _completed, ...rest } = old;
    void _completed;
    save = {
      ...rest,
      exercises,
      attempts: rename<number>(old.attempts),
      hintsUnlocked: rename<number>(old.hintsUnlocked),
      drafts: rename<string>(old.drafts),
      clues: {},
      scenesSeen: {},
    };
  }
  if (version < 3) {
    // Version 3 adds the economy. New fields get their defaults, and the
    // rewards for levels not yet rewarded are handed out straight away.
    // Anything a mislabelled save already holds is kept.
    const previousBest = Number(save.bestLevel ?? 1);
    const level = Math.max(previousBest, levelFromXp(Number(save.xp ?? 0)));
    const owned: Record<string, string> = { ...initialData.owned, ...((save.owned ?? {}) as Record<string, string>) };
    let galleons = Number(save.galleons ?? 0);
    for (const r of rewardsBetween(1, level)) if (r.item && !owned[r.item]) owned[r.item] = "level reward";
    for (const r of rewardsBetween(previousBest, level)) galleons += r.galleons ?? 0;
    save = { ...save, bestLevel: level, owned, galleons };
  }
  return save;
}

/**
 * A save's real version, judged by what it holds. A missing or too-low version
 * number must never send a newer save through an older upgrade - the version 1
 * upgrade, for one, rebuilds `exercises` from scratch.
 */
export function detectSaveVersion(save: Record<string, unknown>, claimed: number): number {
  const v = Number.isFinite(claimed) ? claimed : 0;
  if ("bestLevel" in save || "owned" in save) return Math.max(v, 3);
  if ("exercises" in save) return Math.max(v, 2);
  if ("completed" in save) return 1;
  return v;
}

/**
 * Turn any save the player might have into plain state plus its version:
 * a downloaded backup ({...state, saveVersion}), the raw localStorage value
 * ({state, version}), or a bare state object.
 */
export function unwrapSave(parsed: unknown): { state: Record<string, unknown>; version: number } {
  if (typeof parsed !== "object" || parsed === null) throw new Error("That doesn't look like a Parseltongue save.");
  const obj = parsed as Record<string, unknown>;
  const inner = typeof obj.state === "object" && obj.state !== null ? (obj.state as Record<string, unknown>) : obj;
  if (!("xp" in inner) && !("exercises" in inner) && !("completed" in inner)) {
    throw new Error("That doesn't look like a Parseltongue save.");
  }
  const { saveVersion, ...state } = inner;
  const claimed = Number(obj.state ? obj.version : saveVersion);
  return { state, version: detectSaveVersion(state, Number.isFinite(claimed) ? claimed : 0) };
}

/**
 * Fill in what can be worked out from the finished exercises: clues, seen
 * story scenes, and level rewards. Used after an import, since hand-made or
 * partial saves often carry only the exercises and totals.
 */
export function rebuildDerived(save: Record<string, unknown>): Record<string, unknown> {
  const exercises = (save.exercises ?? {}) as Record<string, ExerciseRecord>;
  const clues = { ...((save.clues ?? {}) as Record<string, string>) };
  const scenesSeen = { ...((save.scenesSeen ?? {}) as Record<string, boolean>) };
  for (const lesson of LESSONS) {
    if (!isLessonComplete(lesson, exercises)) continue;
    const finished = lesson.exercises.map((e) => exercises[e.id]?.completedAt).filter(Boolean).sort();
    if (lesson.clue && !clues[lesson.id]) clues[lesson.id] = finished.at(-1) ?? now();
    scenesSeen[lesson.id] = true;
    scenesSeen[`${lesson.id}:outro`] = true;
    scenesSeen[`year-${lesson.year}`] = true;
  }
  const previousBest = Number(save.bestLevel ?? 1);
  const level = Math.max(previousBest, levelFromXp(Number(save.xp ?? 0)));
  const owned: Record<string, string> = { ...initialData.owned, ...((save.owned ?? {}) as Record<string, string>) };
  let galleons = Number(save.galleons ?? 0);
  for (const r of rewardsBetween(1, level)) if (r.item && !owned[r.item]) owned[r.item] = "level reward";
  for (const r of rewardsBetween(previousBest, level)) galleons += r.galleons ?? 0;
  return { ...save, clues, scenesSeen, bestLevel: level, owned, galleons };
}

export interface SaveBackup {
  at: string;
  raw: string;
}

const storage = (): Storage | null => {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
};

export function readBackups(): SaveBackup[] {
  try {
    const list = JSON.parse(storage()?.getItem(BACKUP_KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((b) => typeof b?.raw === "string") : [];
  } catch {
    return [];
  }
}

/** Copy the stored save aside before the game loads (and possibly upgrades) it. */
export function backupRawSave(at = now()): void {
  const store = storage();
  const raw = store?.getItem(SAVE_KEY);
  if (!store || !raw) return;
  const backups = readBackups();
  if (backups[0]?.raw === raw) return;
  try {
    store.setItem(BACKUP_KEY, JSON.stringify([{ at, raw }, ...backups].slice(0, MAX_BACKUPS)));
  } catch {
    // Storage full: the game still works, just without this safety copy.
  }
}

backupRawSave();

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialData,

      setName: (name) => set({ name }),
      setHouse: (house) => set({ house }),
      saveDraft: (id, code) => set((s) => ({ drafts: { ...s.drafts, [id]: code } })),

      recordAttempt: (id) => {
        const n = (get().attempts[id] ?? 0) + 1;
        set((s) => ({ attempts: { ...s.attempts, [id]: n } }));
        return n;
      },

      unlockHint: (id) =>
        set((s) => {
          const first = (s.hintsUnlocked[id] ?? 0) === 0;
          const freeHints = first && perks.freeFirstHint(s.equipped) ? { ...s.freeHints, [id]: (s.freeHints[id] ?? 0) + 1 } : s.freeHints;
          return { hintsUnlocked: { ...s.hintsUnlocked, [id]: Math.min(5, (s.hintsUnlocked[id] ?? 0) + 1) }, freeHints };
        }),

      gainXp: (amount) => {
        const s = get();
        const xp = Math.max(0, s.xp + amount);
        const level = levelFromXp(xp);
        if (level <= s.bestLevel) {
          set({ xp });
          return null;
        }
        const rewards = rewardsBetween(s.bestLevel, level);
        const owned = { ...s.owned };
        let galleons = s.galleons;
        for (const r of rewards) {
          if (r.item) owned[r.item] = owned[r.item] ?? now();
          galleons += r.galleons ?? 0;
        }
        set({ xp, bestLevel: level, owned, galleons });
        useFx.getState().levelUp(level);
        return level;
      },

      completeExercise: (exercise, lesson, reviewClean) => {
        const s = get();
        const previous = s.exercises[exercise.id];
        const hintsUsed = Math.max(0, (s.hintsUnlocked[exercise.id] ?? 0) - (s.freeHints[exercise.id] ?? 0));
        const attempts = s.attempts[exercise.id] ?? 1;
        const grade = bestGrade(previous?.grade, gradeFor(hintsUsed, reviewClean));
        const reward: Reward = {
          firstTime: !previous,
          xp: 0,
          galleons: 0,
          housePoints: 0,
          grade,
          gradeImproved: Boolean(previous && previous.grade !== grade),
          newBadges: [],
          levelUp: null,
          lessonCompleted: false,
          perkNotes: [],
          levelBonus: levelBonus(s.bestLevel),
        };
        const eq = s.equipped;

        if (previous) {
          // Replays can raise a grade, but never farm XP.
          if (reward.gradeImproved) set({ exercises: { ...s.exercises, [exercise.id]: { ...previous, grade } } });
        } else {
          reward.xp = perks.exerciseXp(eq, xpForCompletion(exercise.xp, hintsUsed, perks.countedAttempts(eq, attempts)));
          reward.galleons = perks.exerciseGalleons(eq, scaled(exercise.galleons, s.bestLevel), exercise.type);
          reward.housePoints = perks.exerciseHousePoints(eq, scaled(5, s.bestLevel));
          const today = dayKey(new Date());
          const perkState = { ...s.perkState, phoenixYears: { ...s.perkState.phoenixYears } };
          let aids = s.aids;
          if (perks.nifflerPockets(eq, s.perkState.nifflerOn, today)) {
            reward.galleons -= 1;
            perkState.nifflerOn = today;
            reward.perkNotes.push("🦫 Your Niffler pocketed a shiny Galleon for itself. It looks very pleased.");
          }
          if (perks.phoenixRebirth(eq, lesson.year, s.perkState.phoenixYears)) {
            perkState.phoenixYears[lesson.year] = now();
            aids = { ...aids, sand: (aids.sand ?? 0) + 1 };
            reward.perkNotes.push("🐦‍🔥 Your phoenix burst into flame and was reborn - leaving a pinch of Time-Turner sand in your trunk.");
          }
          const exercises = {
            ...s.exercises,
            [exercise.id]: { completedAt: now(), attempts, hintsUsed, xpEarned: reward.xp, grade },
          };
          const lessonDone = isLessonComplete(lesson, exercises) && !isLessonComplete(lesson, s.exercises);
          if (lessonDone) {
            reward.lessonCompleted = true;
            reward.housePoints += 10;
          }
          const clues = { ...s.clues };
          if (lessonDone && lesson.clue) {
            clues[lesson.id] = now();
            reward.clue = lesson.clue;
          }
          set({
            exercises,
            clues,
            aids,
            perkState,
            galleons: s.galleons + reward.galleons,
            housePoints: s.housePoints + reward.housePoints,
          });
          reward.levelUp = get().gainXp(reward.xp);
        }

        const exercises = get().exercises;
        const earn = (id: string) => get().awardBadge(id) && reward.newBadges.push(id);
        earn("dobbys-sock");
        if (hintsUsed === 0) earn("no-hint-hex");
        if (attempts <= 1) earn("first-try");
        if (grade === "O") earn("outstanding");
        if (exercise.tier === "outstanding") earn("star-student");
        if (exercise.type === "repair") earn("bug-tamer");
        if (exercise.type === "divination") earn("seer");
        const year = YEARS.find((y) => y.year === lesson.year);
        const badges = YEAR_BADGES[lesson.year];
        if (year && badges) {
          if (isYearComplete(year, exercises, get().skipped)) earn(badges.complete);
          const clueLessons = year.lessons.filter((l) => l.clue);
          if (clueLessons.length > 0 && clueLessons.every((l) => get().clues[l.id])) earn(badges.detective);
        }
        return reward;
      },

      skipLesson: (lesson) => {
        const s = get();
        if (!canSkip(lesson, YEARS, s.exercises, s.skipped)) {
          return { ok: false, reason: lesson.kind === "trial" ? "Trials can never be skipped." : "Only your next lesson can be skipped." };
        }
        const cost = skipCost(skipsInYear(lesson.year, s.skipped, YEARS));
        if (s.galleons < cost.galleons) {
          return { ok: false, reason: `Peeves wants ${cost.galleons} Galleons, and you only have ${s.galleons}.` };
        }
        set({ galleons: s.galleons - cost.galleons, skipped: { ...s.skipped, [lesson.id]: now() } });
        get().gainXp(-cost.xp);
        get().awardBadge("peeves-bargain");
        return { ok: true };
      },

      buyItem: (id) => {
        const s = get();
        const item = itemById(id);
        if (!item || item.giftOnly) return { ok: false, reason: "That isn't for sale." };
        if (s.owned[id]) return { ok: false, reason: "You already own it." };
        if (item.minLevel && s.bestLevel < item.minLevel) return { ok: false, reason: `Reach level ${item.minLevel} first.` };
        if (s.galleons < item.price) return { ok: false, reason: "Not enough Galleons." };
        set({ galleons: s.galleons - item.price, owned: { ...s.owned, [id]: now() }, equipped: { ...s.equipped, [item.kind]: id } });
        get().awardBadge("diagon-alley");
        return { ok: true };
      },

      equip: (kind, id) =>
        set((s) => {
          const equipped = { ...s.equipped };
          if (id && s.owned[id]) equipped[kind] = id;
          else delete equipped[kind];
          return { equipped };
        }),

      buyAid: (aid, year) => {
        const s = get();
        const info = aidById(aid);
        const key = `${aid}:${year}`;
        if ((s.aidBought[key] ?? 0) >= info.perYear) return { ok: false, reason: `Sold out for this year - only ${info.perYear} per year.` };
        if (s.galleons < info.price) return { ok: false, reason: "Not enough Galleons." };
        set({
          galleons: s.galleons - info.price,
          aids: { ...s.aids, [aid]: (s.aids[aid] ?? 0) + 1 },
          aidBought: { ...s.aidBought, [key]: (s.aidBought[key] ?? 0) + 1 },
        });
        return { ok: true };
      },

      drinkFelix: (exerciseId) => {
        const s = get();
        if ((s.aids.felix ?? 0) < 1) return { ok: false, reason: "You have no Felix Felicis." };
        if ((s.hintsUnlocked[exerciseId] ?? 0) >= 5) return { ok: false, reason: "Every hint is already unlocked." };
        set({
          aids: { ...s.aids, felix: s.aids.felix - 1 },
          hintsUnlocked: { ...s.hintsUnlocked, [exerciseId]: (s.hintsUnlocked[exerciseId] ?? 0) + 1 },
          freeHints: { ...s.freeHints, [exerciseId]: (s.freeHints[exerciseId] ?? 0) + 1 },
        });
        return { ok: true };
      },

      pourSand: (exerciseId) => {
        const s = get();
        if ((s.aids.sand ?? 0) < 1) return { ok: false, reason: "You have no Time-Turner sand." };
        if (!s.exercises[exerciseId]) return { ok: false, reason: "Only finished exercises can be turned back." };
        set({
          aids: { ...s.aids, sand: s.aids.sand - 1 },
          hintsUnlocked: { ...s.hintsUnlocked, [exerciseId]: 0 },
          freeHints: { ...s.freeHints, [exerciseId]: 0 },
          attempts: { ...s.attempts, [exerciseId]: 0 },
        });
        return { ok: true };
      },

      answerReviewCard: (cardId, correct) => {
        const today = dayKey(new Date());
        set((s) => ({ cards: { ...s.cards, [cardId]: answerCard(s.cards[cardId], correct, today) } }));
        if (correct) {
          set((s) => ({ galleons: s.galleons + 1 }));
          get().gainXp(5);
        }
      },

      finishReviewSession: (correctCount) => {
        const s = get();
        const today = dayKey(new Date());
        const firstToday = s.reviewLastDay !== today;
        let streak = nextStreak(s.reviewLastDay, s.reviewStreak, today);
        let perkState = s.perkState;
        const missed = s.reviewLastDay ? daysBetween(s.reviewLastDay, today) - 1 : 0;
        if (streak === 1 && s.reviewStreak > 0 && perks.ratSavesStreak(s.equipped, s.perkState.ratSavedOn, today, missed)) {
          // The rat "napped" through the missed day for you.
          streak = s.reviewStreak + 1;
          perkState = { ...perkState, ratSavedOn: today };
        }
        const bonus = firstToday ? { xp: 10, galleons: scaled(perks.reviewGalleons(s.equipped), s.bestLevel) } : { xp: 0, galleons: 0 };
        set({ reviewLastDay: today, reviewStreak: streak, perkState, galleons: s.galleons + bonus.galleons });
        if (bonus.xp) get().gainXp(bonus.xp);
        get().awardBadge("time-turner");
        if (streak >= 3) get().awardBadge("streak-3");
        if (streak >= 7) get().awardBadge("streak-7");
        void correctCount;
        return { ...bonus, streak };
      },

      recordDuel: (opponentId, outcome, galleons) => {
        const s = get();
        const rec = s.duels[opponentId] ?? { wins: 0, losses: 0, draws: 0 };
        const next = {
          wins: rec.wins + (outcome === "win" ? 1 : 0),
          losses: rec.losses + (outcome === "loss" ? 1 : 0),
          draws: rec.draws + (outcome === "draw" ? 1 : 0),
        };
        set({ duels: { ...s.duels, [opponentId]: next } });
        const earned: string[] = [];
        let paid = 0;
        let points = 0;
        if (outcome === "win") {
          const today = dayKey(new Date());
          paid = perks.duelGalleons(s.equipped, scaled(galleons, s.bestLevel), s.duelPaidOn[opponentId] !== today);
          points = scaled(perks.duelHousePoints(s.equipped), s.bestLevel);
          set((st) => ({
            galleons: st.galleons + paid,
            housePoints: st.housePoints + points,
            duelPaidOn: { ...st.duelPaidOn, [opponentId]: today },
          }));
          if (get().awardBadge(`duel-${opponentId}`)) earned.push(`duel-${opponentId}`);
          if (opponentId === "draco" && next.wins >= 3 && get().awardBadge("rivalry")) earned.push("rivalry");
        }
        return { badges: earned, galleons: paid, housePoints: points };
      },

      awardBadge: (id) => {
        if (get().badges[id]) return false;
        set((s) => ({ badges: { ...s.badges, [id]: now() } }));
        return true;
      },

      foundEgg: (id) => {
        if (!get().eggsFound[id]) set((s) => ({ eggsFound: { ...s.eggsFound, [id]: now() } }));
      },

      markSceneSeen: (id) => set((s) => ({ scenesSeen: { ...s.scenesSeen, [id]: true } })),
      setTheme: (theme) => set({ theme }),
      setAmbience: (ambience) => set({ ambience }),
      setWandFx: (wandFx) => set({ wandFx }),
      setMusic: (patch) => set((s) => ({ music: { ...s.music, ...patch } })),
      setMarauderMap: (marauderMap) => set({ marauderMap }),
      setMentor: (patch) => set((s) => ({ mentor: { ...s.mentor, ...patch } })),
      resetProgress: () => set({ ...initialData, mentor: get().mentor, music: get().music }),

      importSave: (json) => {
        backupRawSave();
        const { state, version } = unwrapSave(JSON.parse(json));
        const { mentor: _ignored, ...save } = rebuildDerived(migrateSave(state, version));
        void _ignored;
        set({ ...initialData, ...save, mentor: get().mentor });
      },
    }),
    {
      name: SAVE_KEY,
      version: SAVE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        const save = persisted as Record<string, unknown>;
        return migrateSave(save, detectSaveVersion(save, version)) as unknown as GameState;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameState>;
        return {
          ...current,
          ...p,
          owned: withLevelGifts({ ...current.owned, ...(p.owned ?? {}) }, p.bestLevel ?? 1),
          aids: { ...current.aids, ...(p.aids ?? {}) },
          mentor: { ...DEFAULT_MENTOR_SETTINGS, ...(p.mentor ?? {}) },
          music: { ...DEFAULT_MUSIC, ...(p.music ?? {}) },
          perkState: { ...DEFAULT_PERK_STATE, ...(p.perkState ?? {}) },
        };
      },
    },
  ),
);

/** Level-reward items added after a player passed that level still reach their trunk. */
function withLevelGifts(owned: Record<string, string>, bestLevel: number): Record<string, string> {
  const out = { ...owned };
  for (const r of LEVEL_REWARDS) if (r.item && r.level <= bestLevel && !out[r.item]) out[r.item] = new Date().toISOString();
  return out;
}

/** Everything worth backing up (API keys are deliberately excluded). */
export function exportSave(): string {
  const { mentor: _mentor, ...rest } = useGame.getState();
  void _mentor;
  const data = Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== "function"));
  return JSON.stringify({ ...data, saveVersion: SAVE_VERSION }, null, 2);
}

// ---------------------------------------------------------------------------
// Short-lived visual effects, toasts and pop-ups (not saved).
// ---------------------------------------------------------------------------

export interface Toast {
  id: number;
  text: string;
  kind: "egg" | "reward" | "badge" | "info";
}

export type Fx = "patronus" | "levitate" | "fireworks" | "duck" | "sparkle" | "golden" | "dawn" | null;

interface FxState {
  toasts: Toast[];
  fx: Fx;
  /** Levels reached that haven't been celebrated yet. */
  levelUps: number[];
  /** Short line said by the equipped familiar. */
  familiarLine: string | null;
  /** Story scenes waiting to be shown as pop-ups, oldest first. */
  scenes: QueuedScene[];
  toast: (text: string, kind?: Toast["kind"]) => void;
  dismiss: (id: number) => void;
  play: (fx: Exclude<Fx, null>) => void;
  levelUp: (level: number) => void;
  dismissLevelUp: () => void;
  cheer: (line: string) => void;
  queueScene: (scene: QueuedScene) => void;
  finishScene: () => void;
}

export interface QueuedScene {
  id: string;
  title?: string;
  lines: SceneLine[];
}

let toastId = 1;

export const useFx = create<FxState>()((set, get) => ({
  toasts: [],
  fx: null,
  levelUps: [],
  familiarLine: null,
  scenes: [],
  toast: (text, kind = "info") => {
    const id = toastId++;
    set({ toasts: [...get().toasts, { id, text, kind }] });
    setTimeout(() => get().dismiss(id), 7000);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  play: (fx) => {
    set({ fx });
    setTimeout(() => get().fx === fx && set({ fx: null }), 3500);
  },
  levelUp: (level) => {
    set({ levelUps: [...get().levelUps, level] });
    get().play("fireworks");
  },
  dismissLevelUp: () => set({ levelUps: get().levelUps.slice(1) }),
  cheer: (line) => {
    set({ familiarLine: line });
    setTimeout(() => get().familiarLine === line && set({ familiarLine: null }), 3000);
  },
  queueScene: (scene) => {
    if (scene.lines.length === 0 || useGame.getState().scenesSeen[scene.id]) return;
    if (get().scenes.some((q) => q.id === scene.id)) return;
    set({ scenes: [...get().scenes, scene] });
  },
  finishScene: () => {
    const [done, ...rest] = get().scenes;
    if (done) useGame.getState().markSceneSeen(done.id);
    set({ scenes: rest });
  },
}));
