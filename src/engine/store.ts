import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { HouseId } from "../lore/lore";
import { DEFAULT_MENTOR_SETTINGS, type MentorSettings } from "../mentor/llm";
import { YEARS } from "./content";
import { bestGrade, gradeFor, isLessonComplete, isYearComplete, levelFromXp, xpForCompletion } from "./progress";
import type { Exercise, ExerciseRecord, Grade, Lesson } from "./types";

export const SAVE_KEY = "parseltongue-save-v1";
export const SAVE_VERSION = 2;

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
}

export interface GameState {
  name: string;
  house: HouseId | null;
  xp: number;
  galleons: number;
  housePoints: number;
  exercises: Record<string, ExerciseRecord>;
  attempts: Record<string, number>;
  hintsUnlocked: Record<string, number>;
  drafts: Record<string, string>;
  badges: Record<string, string>;
  eggsFound: Record<string, string>;
  clues: Record<string, string>;
  scenesSeen: Record<string, boolean>;
  theme: "dark" | "light";
  marauderMap: boolean;
  mentor: MentorSettings;

  setName: (name: string) => void;
  setHouse: (house: HouseId) => void;
  saveDraft: (exerciseId: string, code: string) => void;
  recordAttempt: (exerciseId: string) => number;
  unlockHint: (exerciseId: string) => void;
  completeExercise: (exercise: Exercise, lesson: Lesson, reviewClean: boolean) => Reward;
  awardBadge: (id: string) => boolean;
  foundEgg: (id: string) => void;
  markSceneSeen: (id: string) => void;
  setTheme: (theme: "dark" | "light") => void;
  setMarauderMap: (open: boolean) => void;
  setMentor: (patch: Partial<MentorSettings>) => void;
  resetProgress: () => void;
  importSave: (json: string) => void;
}

const now = () => new Date().toISOString();

const initialData = {
  name: "",
  house: null,
  xp: 0,
  galleons: 0,
  housePoints: 0,
  exercises: {},
  attempts: {},
  hintsUnlocked: {},
  drafts: {},
  badges: {},
  eggsFound: {},
  clues: {},
  scenesSeen: {},
  theme: "dark" as const,
  marauderMap: false,
  mentor: DEFAULT_MENTOR_SETTINGS,
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
  if (version >= 2) return old;
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
  return {
    ...rest,
    exercises,
    attempts: rename<number>(old.attempts),
    hintsUnlocked: rename<number>(old.hintsUnlocked),
    drafts: rename<string>(old.drafts),
    clues: {},
    scenesSeen: {},
  };
}

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
        set((s) => ({ hintsUnlocked: { ...s.hintsUnlocked, [id]: Math.min(5, (s.hintsUnlocked[id] ?? 0) + 1) } })),

      completeExercise: (exercise, lesson, reviewClean) => {
        const s = get();
        const previous = s.exercises[exercise.id];
        const hintsUsed = s.hintsUnlocked[exercise.id] ?? 0;
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
        };

        if (previous) {
          // Replays can raise a grade, but never farm XP.
          if (reward.gradeImproved) set({ exercises: { ...s.exercises, [exercise.id]: { ...previous, grade } } });
        } else {
          reward.xp = xpForCompletion(exercise.xp, hintsUsed, attempts);
          reward.galleons = exercise.galleons;
          reward.housePoints = 5;
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
          const oldLevel = levelFromXp(s.xp);
          const newLevel = levelFromXp(s.xp + reward.xp);
          if (newLevel > oldLevel) reward.levelUp = newLevel;
          set({
            exercises,
            clues,
            xp: s.xp + reward.xp,
            galleons: s.galleons + reward.galleons,
            housePoints: s.housePoints + reward.housePoints,
          });
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
        const year1 = YEARS.find((y) => y.year === 1);
        if (isYearComplete(year1, exercises)) earn("year-1");
        const cluesInYear1 = year1?.lessons.filter((l) => l.clue) ?? [];
        if (cluesInYear1.length > 0 && cluesInYear1.every((l) => get().clues[l.id])) earn("detective");
        return reward;
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
      setMarauderMap: (marauderMap) => set({ marauderMap }),
      setMentor: (patch) => set((s) => ({ mentor: { ...s.mentor, ...patch } })),
      resetProgress: () => set({ ...initialData, mentor: get().mentor }),

      importSave: (json) => {
        const parsed = JSON.parse(json);
        if (typeof parsed !== "object" || parsed === null || !("xp" in parsed)) {
          throw new Error("That doesn't look like a Parseltongue save file.");
        }
        const data = "exercises" in parsed ? parsed : migrateSave(parsed, 1);
        set({ ...initialData, ...data, mentor: get().mentor });
      },
    }),
    {
      name: SAVE_KEY,
      version: SAVE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => migrateSave(persisted as Record<string, unknown>, version) as unknown as GameState,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameState>;
        return { ...current, ...p, mentor: { ...DEFAULT_MENTOR_SETTINGS, ...(p.mentor ?? {}) } };
      },
    },
  ),
);

/** Everything worth backing up (API keys are deliberately excluded). */
export function exportSave(): string {
  const { mentor: _mentor, ...rest } = useGame.getState();
  void _mentor;
  const data = Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== "function"));
  return JSON.stringify({ ...data, saveVersion: SAVE_VERSION }, null, 2);
}

// ---------------------------------------------------------------------------
// Short-lived visual effects and toasts (not saved).
// ---------------------------------------------------------------------------

export interface Toast {
  id: number;
  text: string;
  kind: "egg" | "reward" | "badge" | "info";
}

export type Fx = "patronus" | "levitate" | "fireworks" | "duck" | null;

interface FxState {
  toasts: Toast[];
  fx: Fx;
  toast: (text: string, kind?: Toast["kind"]) => void;
  dismiss: (id: number) => void;
  play: (fx: Exclude<Fx, null>) => void;
}

let toastId = 1;

export const useFx = create<FxState>()((set, get) => ({
  toasts: [],
  fx: null,
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
}));
