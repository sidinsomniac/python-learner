export type QuestType = "practice" | "scramble" | "divination" | "repair";

export interface HintLadder {
  nudge: string;
  question: string;
  pseudocode: string;
  flaw: string;
  analogous: string;
}

export interface Quest {
  id: string;
  year: number;
  order: number;
  title: string;
  type: QuestType;
  concepts: string[];
  xp: number;
  galleons: number;
  summary: string;
  task: string;
  intro?: string;
  success?: string;
  /** Default answers fed to input() when running. */
  inputs: string[];
  lecture: string;
  starter: string;
  tests: string;
  hints: HintLadder;
  spellbook: string;
  /** Scramble quests: the lines in their shuffled starting order. */
  lines?: string[];
  /** Divination quests: the code whose output is predicted. */
  snippet?: string;
}

export interface CompletionRecord {
  completedAt: string;
  attempts: number;
  hintsUsed: number;
  xpEarned: number;
}

export const QUEST_TYPE_LABEL: Record<QuestType, { label: string; icon: string }> = {
  practice: { label: "Spell Practice", icon: "🪄" },
  scramble: { label: "Spell Scramble", icon: "📜" },
  divination: { label: "Divination", icon: "🔮" },
  repair: { label: "Potion Repair", icon: "⚗️" },
};
