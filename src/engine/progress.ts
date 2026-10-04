import { load as loadYaml } from "js-yaml";
import reviewRulesRaw from "/content/review-rules.yaml?raw";
import { lessonIndex } from "./content";
import { isRequired, type Exercise, type ExerciseRecord, type Grade, type Lesson, type Year } from "./types";

type Records = Record<string, ExerciseRecord>;

/** XP needed to *reach* a level: 1 -> 0, 2 -> 100, 3 -> 300, 4 -> 600 ... */
export const xpForLevel = (level: number) => 50 * (level - 1) * level;

export const MAX_LEVEL = 20;

/** Galleons and house points grow 3% per level above 1 (x1.57 at level 20). XP doesn't scale. */
export const levelBonus = (level: number) => 1 + 0.03 * (Math.max(1, level) - 1);
/** Scale a Galleon or house-point reward by the level bonus, rounding up. */
export const scaled = (amount: number, level: number) => Math.ceil(amount * levelBonus(level) - 1e-9);

export function levelFromXp(xp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) level++;
  return level;
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  if (level >= MAX_LEVEL) return { level, into: 0, needed: 0, fraction: 1 };
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return { level, into: xp - floor, needed: ceil - floor, fraction: (xp - floor) / (ceil - floor) };
}

export const HINT_PENALTY = 0.15;
export const MIN_XP_FRACTION = 0.4;
export const FIRST_TRY_BONUS = 0.25;

/** Fewer hints earn more XP, but hints never block progress. */
export function xpForCompletion(baseXp: number, hintsUsed: number, attempts: number): number {
  const fraction = Math.max(MIN_XP_FRACTION, 1 - HINT_PENALTY * Math.min(4, hintsUsed));
  const bonus = attempts <= 1 && hintsUsed === 0 ? 1 + FIRST_TRY_BONUS : 1;
  return Math.round(baseXp * fraction * bonus);
}

// ---------------------------------------------------------------------------
// Grades (see docs/exercise-design.md §5). Grades never block progress.
// ---------------------------------------------------------------------------

const GRADE_RANK: Record<Grade, number> = { O: 4, E: 3, A: 2, P: 1 };

export const GRADE_NAME: Record<Grade, string> = {
  O: "Outstanding",
  E: "Exceeds Expectations",
  A: "Acceptable",
  P: "Poor",
};

export function gradeFor(hintsUsed: number, reviewClean: boolean): Grade {
  if (hintsUsed >= 5) return "P";
  if (hintsUsed >= 2) return "A";
  if (hintsUsed === 1) return "E";
  return reviewClean ? "O" : "E";
}

export const bestGrade = (a: Grade | undefined, b: Grade): Grade =>
  a && GRADE_RANK[a] >= GRADE_RANK[b] ? a : b;

/** A lesson's grade: its weakest required exercise, lifted to O by the Outstanding challenge. */
export function lessonGrade(lesson: Lesson, records: Records): Grade | null {
  const required = lesson.exercises.filter(isRequired);
  if (!required.every((e) => records[e.id])) return null;
  let grade = required.map((e) => records[e.id].grade).reduce((lo, g) => (GRADE_RANK[g] < GRADE_RANK[lo] ? g : lo), "O" as Grade);
  const outstanding = lesson.exercises.find((e) => e.tier === "outstanding");
  if (outstanding && records[outstanding.id] && GRADE_RANK[grade] >= GRADE_RANK.E) grade = "O";
  return grade;
}

// ---------------------------------------------------------------------------
// Unlocking.
// ---------------------------------------------------------------------------

type Skipped = Record<string, string>;

/** Every required exercise done. (A skipped lesson isn't "complete" - see isLessonPassed.) */
export const isLessonComplete = (lesson: Lesson, records: Records) =>
  lesson.exercises.filter(isRequired).every((e) => Boolean(records[e.id]));

/** Complete, or skipped with Peeves' Bargain - either way the next lesson opens. */
export const isLessonPassed = (lesson: Lesson, records: Records, skipped: Skipped = {}) =>
  isLessonComplete(lesson, records) || Boolean(skipped[lesson.id]);

export function isYearComplete(year: Year | undefined, records: Records, skipped: Skipped = {}): boolean {
  return Boolean(year && year.lessons.length > 0 && year.lessons.every((l) => isLessonPassed(l, records, skipped)));
}

/** A lesson opens when the previous lesson (or, for a year's first lesson, the previous year) is complete. */
export function isLessonUnlocked(lesson: Lesson, years: Year[], records: Records, skipped: Skipped = {}): boolean {
  const year = years.find((y) => y.year === lesson.year);
  if (!year) return false;
  const index = year.lessons.findIndex((l) => l.id === lesson.id);
  if (index > 0) return isLessonPassed(year.lessons[index - 1], records, skipped);
  const previousYear = years.find((y) => y.year === lesson.year - 1);
  return !previousYear || isYearComplete(previousYear, records, skipped);
}

/** The latest year the student has reached (for themes and the shop's stock). */
export function currentYear(years: Year[], records: Records, skipped: Skipped = {}): number {
  let latest = years[0]?.year ?? 1;
  for (const y of years) if (y.lessons[0] && isLessonUnlocked(y.lessons[0], years, records, skipped)) latest = y.year;
  return latest;
}

/** Whose castle colours to show: the chosen year if it's been reached, otherwise the year on screen. */
export function paletteYear(choice: number | null, onScreen: number, reached: number): number {
  return choice !== null && choice >= 1 && choice <= reached ? choice : onScreen;
}

// ---------------------------------------------------------------------------
// Peeves' Bargain: skipping a lesson costs Galleons AND XP, more each time.
// ---------------------------------------------------------------------------

export const SKIP_BASE = { galleons: 75, xp: 60 };

export function skipCost(skipsSoFarThisYear: number) {
  const factor = 1 + 0.5 * skipsSoFarThisYear;
  return { galleons: Math.round(SKIP_BASE.galleons * factor), xp: Math.round(SKIP_BASE.xp * factor) };
}

export const skipsInYear = (year: number, skipped: Skipped, years: Year[]) =>
  Object.keys(skipped).filter((id) => years.find((y) => y.year === year)?.lessons.some((l) => l.id === id)).length;

/** Only the next unfinished lesson can be skipped - and never a Trial. */
export function canSkip(lesson: Lesson, years: Year[], records: Records, skipped: Skipped): boolean {
  return (
    lesson.kind !== "trial" &&
    !isLessonPassed(lesson, records, skipped) &&
    isLessonUnlocked(lesson, years, records, skipped)
  );
}

/** Within a lesson, each exercise opens once every required exercise before it is done. */
export function isExerciseUnlocked(exercise: Exercise, lesson: Lesson, records: Records): boolean {
  const index = lesson.exercises.findIndex((e) => e.id === exercise.id);
  return lesson.exercises.slice(0, index).filter(isRequired).every((e) => Boolean(records[e.id]));
}

// ---------------------------------------------------------------------------
// Snape's code review: each rule switches on once its idea has been taught.
// ---------------------------------------------------------------------------

export const REVIEW_RULES_SINCE = loadYaml(reviewRulesRaw) as Record<string, string>;

export function reviewRulesFor(lessonId: string): string[] {
  const here = lessonIndex(lessonId);
  return Object.entries(REVIEW_RULES_SINCE)
    .filter(([, since]) => {
      const at = lessonIndex(since);
      return at >= 0 && at <= here;
    })
    .map(([rule]) => rule);
}

// ---------------------------------------------------------------------------
// Divination.
// ---------------------------------------------------------------------------

/** Compare a Divination prophecy to the real output, line by line. */
export function compareProphecy(prediction: string, actual: string) {
  const norm = (s: string) =>
    s.replace(/\r/g, "").split("\n").map((l) => l.trimEnd()).join("\n").replace(/\n+$/, "").split("\n");
  const want = norm(actual);
  const got = norm(prediction);
  let firstWrongLine: number | null = null;
  for (let i = 0; i < Math.max(want.length, got.length); i++) {
    if ((want[i] ?? null) !== (got[i] ?? null)) {
      firstWrongLine = i + 1;
      break;
    }
  }
  return {
    correct: firstWrongLine === null,
    firstWrongLine,
    expectedLineCount: want.length,
    predictedLineCount: got.length,
  };
}
