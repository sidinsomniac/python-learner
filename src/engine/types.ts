export type ExerciseType = "practice" | "scramble" | "divination" | "repair";

/** warmup, core, review and stage are required; outstanding is optional. */
export type Tier = "warmup" | "core" | "outstanding" | "review" | "stage";

export type LessonKind = "lesson" | "revision" | "trial";

export type Grade = "O" | "E" | "A" | "P";

export interface HintLadder {
  nudge: string;
  question: string;
  pseudocode: string;
  flaw: string;
  analogous: string;
}

export interface SceneLine {
  who: string;
  line: string;
}

export interface CastMember {
  name: string;
  portrait: string;
}

export interface Exercise {
  /** `${lessonId}.${slot}`, e.g. "y1-l01.core". */
  id: string;
  lessonId: string;
  slot: string;
  tier: Tier;
  type: ExerciseType;
  title: string;
  twist?: string;
  intro?: string;
  task: string;
  /** Default answers fed to input() when running. */
  inputs: string[];
  starter: string;
  tests: string;
  hints: HintLadder;
  xp: number;
  galleons: number;
  /** Scramble: the lines in their shuffled starting order. */
  lines?: string[];
  /** Divination: the code whose output is predicted. */
  snippet?: string;
  /** Files on the desk (the working folder) when the spell runs: name -> text. */
  files: Record<string, string>;
}

export interface Lesson {
  id: string;
  year: number;
  /** Position within the year (lessons, parts, revisions and the Trial). */
  order: number;
  /** Shown to the player: "1", "4", "R1", "Trial". */
  number: string;
  kind: LessonKind;
  title: string;
  part?: { n: number; of: number };
  location: string;
  concepts: string[];
  scene: SceneLine[];
  outro: SceneLine[];
  clue?: string;
  lecture: string;
  /** Files on the desk for the lecture's "Try it" examples and the sandbox. */
  files: Record<string, string>;
  spellbook: string;
  exercises: Exercise[];
  review: ReviewCard[];
}

/** A Time-Turner / Dueling Club card. */
export type ReviewCard =
  | { id: string; lessonId: string; type: "choice"; q: string; options: string[]; answer: number; why: string }
  | { id: string; lessonId: string; type: "predict"; q?: string; code: string; why: string };

export interface YearTheme {
  mood: string;
  /** Accent colours (headings, highlights). */
  gold: string;
  gold2: string;
  /** Background, card and border colours for the dark (default) look. */
  bg: string;
  bg2: string;
  card: string;
  card2: string;
  line: string;
}

export interface Year {
  year: number;
  title: string;
  mystery: string;
  theme: YearTheme;
  intro: SceneLine[];
  lessons: Lesson[];
}

export interface ExerciseRecord {
  completedAt: string;
  attempts: number;
  hintsUsed: number;
  xpEarned: number;
  grade: Grade;
}

export const isRequired = (e: Exercise) => e.tier !== "outstanding";

export const TIER_LABEL: Record<Tier, { label: string; icon: string }> = {
  warmup: { label: "Warm-up", icon: "🌱" },
  core: { label: "Core challenge", icon: "🔥" },
  outstanding: { label: "Outstanding", icon: "⭐" },
  review: { label: "Revision", icon: "📚" },
  stage: { label: "Trial stage", icon: "🏁" },
};

export const TYPE_LABEL: Record<ExerciseType, { label: string; icon: string }> = {
  practice: { label: "Spell Practice", icon: "🪄" },
  scramble: { label: "Spell Scramble", icon: "📜" },
  divination: { label: "Divination", icon: "🔮" },
  repair: { label: "Potion Repair", icon: "⚗️" },
};

/** Default rewards per tier (an exercise file can override them). */
export const TIER_REWARD: Record<Tier, { xp: number; galleons: number }> = {
  warmup: { xp: 20, galleons: 2 },
  core: { xp: 40, galleons: 5 },
  outstanding: { xp: 60, galleons: 10 },
  review: { xp: 15, galleons: 2 },
  stage: { xp: 50, galleons: 8 },
};
