import type { CompletionRecord, Quest } from "./types";

/** XP needed to *reach* a level: 1 -> 0, 2 -> 100, 3 -> 300, 4 -> 600 ... */
export const xpForLevel = (level: number) => 50 * (level - 1) * level;

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return { level, into: xp - floor, needed: ceil - floor, fraction: (xp - floor) / (ceil - floor) };
}

export const HINT_PENALTY = 0.15;
export const MIN_XP_FRACTION = 0.4;
export const FIRST_TRY_BONUS = 0.25;

/** Fewer hints earn more XP, but hints never block progress. */
export function xpForCompletion(baseXp: number, hintsUsed: number, attempts: number): number {
  const fraction = Math.max(MIN_XP_FRACTION, 1 - HINT_PENALTY * hintsUsed);
  const bonus = attempts <= 1 && hintsUsed === 0 ? 1 + FIRST_TRY_BONUS : 1;
  return Math.round(baseXp * fraction * bonus);
}

/** A quest unlocks when the previous quest in its Year is complete. */
export function isQuestUnlocked(
  quest: Quest,
  allQuests: Quest[],
  completed: Record<string, CompletionRecord>,
): boolean {
  const yearQuests = allQuests.filter((q) => q.year === quest.year).sort((a, b) => a.order - b.order);
  const index = yearQuests.findIndex((q) => q.id === quest.id);
  if (index <= 0) return quest.year === 1 || isYearComplete(quest.year - 1, allQuests, completed);
  return Boolean(completed[yearQuests[index - 1].id]);
}

export function isYearComplete(
  year: number,
  allQuests: Quest[],
  completed: Record<string, CompletionRecord>,
): boolean {
  const yearQuests = allQuests.filter((q) => q.year === year);
  return yearQuests.length > 0 && yearQuests.every((q) => completed[q.id]);
}

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
