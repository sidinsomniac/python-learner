// The Time-Turner: spaced repetition over each lesson's review cards.
import type { ReviewCard } from "./types";

/** Days until a card is due again, after answering it correctly from each box. */
export const INTERVALS = [1, 3, 7, 16, 35];
export const SESSION_SIZE = 5;

export interface CardState {
  box: number;
  due: string; // YYYY-MM-DD
  misses: number;
}

export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

/** Move a card after an answer: up a box when right, back to the start when wrong. */
export function answerCard(state: CardState | undefined, correct: boolean, today: string): CardState {
  const box = state?.box ?? 0;
  if (!correct) return { box: 0, due: addDays(today, 1), misses: (state?.misses ?? 0) + 1 };
  return { box: Math.min(box + 1, INTERVALS.length - 1), due: addDays(today, INTERVALS[box]), misses: state?.misses ?? 0 };
}

/** Today's session: due cards (new cards are always due), weakest first. */
export function dueCards(
  deck: ReviewCard[],
  states: Record<string, CardState>,
  today: string,
  size = SESSION_SIZE,
): ReviewCard[] {
  return deck
    .filter((c) => !states[c.id] || states[c.id].due <= today)
    .sort((a, b) => {
      const sa = states[a.id];
      const sb = states[b.id];
      // Cards you've missed come first, then lower boxes, then brand-new cards.
      const missA = sa?.misses ?? 0;
      const missB = sb?.misses ?? 0;
      if (missA !== missB) return missB - missA;
      const boxA = sa ? sa.box : 99;
      const boxB = sb ? sb.box : 99;
      return boxA - boxB;
    })
    .slice(0, size);
}

/** Attendance streak: consecutive days with a finished review session. */
export function nextStreak(lastDay: string | null, streak: number, today: string): number {
  if (lastDay === today) return streak;
  if (lastDay && addDays(lastDay, 1) === today) return streak + 1;
  return 1;
}
