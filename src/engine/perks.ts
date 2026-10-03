// What equipped items do. Every perk is small, never reveals an answer, and is
// a pure function of what you're wearing, so it can be tested on its own.
// The descriptions players see are the `perk` lines in src/lore/shop.ts.
import type { ItemKind } from "../lore/shop";
import type { ExerciseType } from "./types";

export type Equipped = Partial<Record<ItemKind, string>>;

const has = (eq: Equipped, id: string) => Object.values(eq).includes(id);

/** Galleons for passing an exercise for the first time. */
export function exerciseGalleons(eq: Equipped, base: number, type: ExerciseType): number {
  let g = base;
  if (type === "repair" && has(eq, "title-bugtamer")) g *= 1.5;
  if (has(eq, "fam-niffler")) g *= 1.15;
  return Math.ceil(g);
}

/** House points for passing an exercise for the first time. */
export function exerciseHousePoints(eq: Equipped, base: number): number {
  return base + (has(eq, "fam-puff") ? 2 : 0);
}

/** XP for passing an exercise, after hints and attempts are counted. */
export function exerciseXp(eq: Equipped, xp: number): number {
  return has(eq, "title-prince") ? Math.round(xp * 1.1) : xp;
}

/** The attempts that count against an exercise's XP: the Unflappable forgives the first miss. */
export function countedAttempts(eq: Equipped, attempts: number): number {
  return has(eq, "title-unflappable") ? Math.max(1, attempts - 1) : attempts;
}

/** Whether the first hint (the nudge) is free. */
export function freeFirstHint(eq: Equipped): boolean {
  return has(eq, "title-curious");
}

/** Galleons for the first Time-Turner review of the day. */
export function reviewGalleons(eq: Equipped): number {
  return (has(eq, "fam-owl") ? 5 : 3) + (has(eq, "fam-toad") ? 2 : 0);
}

/** The rat keeps a streak alive once a week, if exactly one day was missed. */
export function ratSavesStreak(eq: Equipped, lastSavedDay: string | null, today: string, missedDays: number): boolean {
  if (!has(eq, "fam-rat") || missedDays !== 1) return false;
  return !lastSavedDay || daysBetween(lastSavedDay, today) >= 7;
}

/** The Niffler takes 1 Galleon on the first exercise of each day. */
export function nifflerPockets(eq: Equipped, lastPocketDay: string | null, today: string): boolean {
  return has(eq, "fam-niffler") && lastPocketDay !== today;
}

/** The phoenix gives one Time-Turner sand per school year. */
export function phoenixRebirth(eq: Equipped, year: number, rebornYears: Record<string, string>): boolean {
  return has(eq, "fam-phoenix") && !rebornYears[year];
}

export interface DuelPerks {
  extraSeconds: number;
  shield: boolean;
}

export function duelPerks(eq: Equipped): DuelPerks {
  return { extraSeconds: has(eq, "robe-maroon") ? 3 : 0, shield: has(eq, "robe-midnight") };
}

/** Galleons for a duel win: full for the first win against someone each day, then 1. */
export function duelGalleons(eq: Equipped, base: number, firstWinToday: boolean): number {
  const g = firstWinToday ? base : 1;
  return has(eq, "robe-dragonhide") ? Math.ceil(g * 1.25) : g;
}

export function duelHousePoints(eq: Equipped): number {
  return has(eq, "robe-silver") ? 20 : 10;
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}
