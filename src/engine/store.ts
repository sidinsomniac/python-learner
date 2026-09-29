import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { HouseId } from "../lore/lore";
import { DEFAULT_MENTOR_SETTINGS, type MentorSettings } from "../mentor/llm";
import { QUESTS } from "./content";
import { isYearComplete, levelFromXp, xpForCompletion } from "./progress";
import type { CompletionRecord, Quest } from "./types";

export const SAVE_KEY = "parseltongue-save-v1";

export interface Reward {
  xp: number;
  galleons: number;
  housePoints: number;
  newBadges: string[];
  levelUp: number | null;
}

export interface GameState {
  name: string;
  house: HouseId | null;
  xp: number;
  galleons: number;
  housePoints: number;
  completed: Record<string, CompletionRecord>;
  attempts: Record<string, number>;
  hintsUnlocked: Record<string, number>;
  drafts: Record<string, string>;
  badges: Record<string, string>;
  eggsFound: Record<string, string>;
  theme: "dark" | "light";
  marauderMap: boolean;
  mentor: MentorSettings;

  setName: (name: string) => void;
  setHouse: (house: HouseId) => void;
  saveDraft: (questId: string, code: string) => void;
  recordAttempt: (questId: string) => number;
  unlockHint: (questId: string) => void;
  completeQuest: (quest: Quest) => Reward;
  awardBadge: (id: string) => boolean;
  foundEgg: (id: string) => void;
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
  completed: {},
  attempts: {},
  hintsUnlocked: {},
  drafts: {},
  badges: {},
  eggsFound: {},
  theme: "dark" as const,
  marauderMap: false,
  mentor: DEFAULT_MENTOR_SETTINGS,
};

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialData,

      setName: (name) => set({ name }),
      setHouse: (house) => set({ house }),
      saveDraft: (questId, code) => set((s) => ({ drafts: { ...s.drafts, [questId]: code } })),

      recordAttempt: (questId) => {
        const n = (get().attempts[questId] ?? 0) + 1;
        set((s) => ({ attempts: { ...s.attempts, [questId]: n } }));
        return n;
      },

      unlockHint: (questId) =>
        set((s) => ({
          hintsUnlocked: { ...s.hintsUnlocked, [questId]: Math.min(5, (s.hintsUnlocked[questId] ?? 0) + 1) },
        })),

      completeQuest: (quest) => {
        const s = get();
        const already = s.completed[quest.id];
        const hintsUsed = Math.min(4, s.hintsUnlocked[quest.id] ?? 0);
        const attempts = s.attempts[quest.id] ?? 1;
        const reward: Reward = { xp: 0, galleons: 0, housePoints: 0, newBadges: [], levelUp: null };
        if (already) return reward; // replays are for fun, not farming

        reward.xp = xpForCompletion(quest.xp, hintsUsed, attempts);
        reward.galleons = quest.galleons;
        reward.housePoints = 10;
        const completed = {
          ...s.completed,
          [quest.id]: { completedAt: now(), attempts, hintsUsed, xpEarned: reward.xp },
        };
        const oldLevel = levelFromXp(s.xp);
        const newLevel = levelFromXp(s.xp + reward.xp);
        if (newLevel > oldLevel) reward.levelUp = newLevel;
        set({
          completed,
          xp: s.xp + reward.xp,
          galleons: s.galleons + reward.galleons,
          housePoints: s.housePoints + reward.housePoints,
        });

        const earn = (id: string) => get().awardBadge(id) && reward.newBadges.push(id);
        earn("dobbys-sock");
        if (hintsUsed === 0) earn("no-hint-hex");
        if (attempts <= 1) earn("first-try");
        if (quest.type === "repair") earn("bug-tamer");
        if (quest.type === "divination") earn("seer");
        if (isYearComplete(1, QUESTS, completed)) earn("year-1");
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

      setTheme: (theme) => set({ theme }),
      setMarauderMap: (marauderMap) => set({ marauderMap }),
      setMentor: (patch) => set((s) => ({ mentor: { ...s.mentor, ...patch } })),
      resetProgress: () => set({ ...initialData, mentor: get().mentor }),

      importSave: (json) => {
        const data = JSON.parse(json);
        if (typeof data !== "object" || data === null || !("xp" in data) || !("completed" in data)) {
          throw new Error("That doesn't look like a Parseltongue save file.");
        }
        set({ ...initialData, ...data, mentor: get().mentor });
      },
    }),
    {
      name: SAVE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
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
  return JSON.stringify(data, null, 2);
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
