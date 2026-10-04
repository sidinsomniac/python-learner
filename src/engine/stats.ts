// The Marauder's Ledger: pure numbers about how a player is doing, worked out
// from the save. The daily activity log lives in the save; everything else here
// is derived, so it can never drift out of step with the real progress.
import { LESSONS, REVIEW_CARDS, YEARS } from "./content";
import { isLessonComplete } from "./progress";
import { addDays, dayKey, INTERVALS, type CardState } from "./review";
import type { ExerciseRecord, Grade, Lesson, ReviewCard } from "./types";

export interface DayActivity {
  /** Exercises finished for the first time. */
  exercises: number;
  /** Time-Turner cards answered, and how many of them were right. */
  cards: number;
  correct: number;
  duels: number;
}
export type Activity = Record<string, DayActivity>;

/** How many days of activity the save keeps. */
export const ACTIVITY_DAYS = 400;

const EMPTY: DayActivity = { exercises: 0, cards: 0, correct: 0, duels: 0 };

/** Add to today's tally, dropping days older than ACTIVITY_DAYS. */
export function bumpActivity(activity: Activity, day: string, add: Partial<DayActivity>): Activity {
  const today = { ...EMPTY, ...activity[day] };
  for (const [k, v] of Object.entries(add) as [keyof DayActivity, number][]) today[k] += v;
  const oldest = addDays(day, -ACTIVITY_DAYS);
  const out: Activity = {};
  for (const [d, a] of Object.entries(activity)) if (d > oldest) out[d] = a;
  out[day] = today;
  return out;
}

/** For saves from before the log existed: rebuild it from when each exercise was finished. */
export function backfillActivity(exercises: Record<string, ExerciseRecord>): Activity {
  const out: Activity = {};
  for (const r of Object.values(exercises)) {
    const t = Date.parse(r.completedAt);
    if (Number.isNaN(t)) continue;
    const day = dayKey(new Date(t));
    out[day] = { ...EMPTY, ...out[day], exercises: (out[day]?.exercises ?? 0) + 1 };
  }
  return out;
}

const total = (a?: DayActivity) => (a ? a.exercises + a.cards + a.duels : 0);

export interface HeatDay {
  day: string;
  count: number;
  /** 0 (nothing) to 4 (a big day), for colouring. */
  level: number;
}

/** The last `weeks` weeks, oldest first, as columns of Monday-to-Sunday. */
export function practiceHeatmap(activity: Activity, today: string, weeks = 53): HeatDay[][] {
  const [y, m, d] = today.split("-").map(Number);
  const weekday = (new Date(y, m - 1, d).getDay() + 6) % 7; // Monday = 0
  const start = addDays(today, -weekday - (weeks - 1) * 7);
  const counts = Object.values(activity).map(total).filter((n) => n > 0).sort((a, b) => a - b);
  const quartile = (q: number) => counts[Math.floor((counts.length - 1) * q)] ?? 1;
  const cuts = [quartile(0.25), quartile(0.5), quartile(0.75)];
  const level = (n: number) => (n === 0 ? 0 : 1 + cuts.filter((c) => n > c).length);
  const columns: HeatDay[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: HeatDay[] = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(start, w * 7 + i);
      if (day > today) break;
      const count = total(activity[day]);
      col.push({ day, count, level: level(count) });
    }
    columns.push(col);
  }
  return columns;
}

/** Days in a row with any practice: the current run (today or yesterday counts) and the best ever. */
export function practiceStreaks(activity: Activity, today: string): { current: number; best: number; daysPractised: number } {
  const days = Object.keys(activity)
    .filter((d) => total(activity[d]) > 0)
    .sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  const last = days[days.length - 1];
  const current = last === today || (last && addDays(last, 1) === today) ? run : 0;
  return { current, best, daysPractised: days.length };
}

export interface Retention {
  /** How many cards sit in each Leitner box (0 = just learned or missed, last = mastered). */
  boxes: number[];
  /** Cards never reviewed yet. */
  unseen: number;
  /** Share of Time-Turner answers that were right over the last 30 days, or null with none. */
  hitRate: number | null;
}

export function retention(deck: ReviewCard[], cards: Record<string, CardState>, activity: Activity, today: string): Retention {
  const boxes = INTERVALS.map(() => 0);
  let unseen = 0;
  for (const c of deck) {
    const st = cards[c.id];
    if (st) boxes[st.box] += 1;
    else unseen += 1;
  }
  const since = addDays(today, -30);
  let asked = 0;
  let right = 0;
  for (const [d, a] of Object.entries(activity)) {
    if (d <= since) continue;
    asked += a.cards;
    right += a.correct;
  }
  return { boxes, unseen, hitRate: asked ? right / asked : null };
}

/** How many exercises got each grade, per year. */
export function gradeSpread(exercises: Record<string, ExerciseRecord>): { year: number; grades: Record<Grade, number> }[] {
  return YEARS.map((y) => {
    const grades: Record<Grade, number> = { O: 0, E: 0, A: 0, P: 0 };
    for (const l of y.lessons) for (const e of l.exercises) {
      const r = exercises[e.id];
      if (r) grades[r.grade] += 1;
    }
    return { year: y.year, grades };
  }).filter((y) => Object.values(y.grades).some((n) => n > 0));
}

const GRADE_WEAK: Record<Grade, number> = { O: 0, E: 1, A: 2, P: 3 };

interface WeakInput {
  exercises: Record<string, ExerciseRecord>;
  cards: Record<string, CardState>;
  aiCards: Record<string, ReviewCard>;
  now?: Date;
  random?: () => number;
}

/** Finished ordinary lessons, weakest first: missed cards, low grades and time since you did them. */
export function rankWeakest(done: Lesson[], input: WeakInput): Lesson[] {
  const now = (input.now ?? new Date()).getTime();
  const rand = input.random ?? Math.random;
  const misses = new Map<string, number>();
  const allCards = [...REVIEW_CARDS, ...Object.values(input.aiCards)];
  for (const c of allCards) misses.set(c.lessonId, (misses.get(c.lessonId) ?? 0) + (input.cards[c.id]?.misses ?? 0));
  const score = (l: Lesson) => {
    const records = l.exercises.map((e) => input.exercises[e.id]).filter(Boolean);
    const grade = records.length ? records.reduce((a, r) => a + GRADE_WEAK[r.grade], 0) / records.length : 0;
    const last = Math.max(0, ...records.map((r) => Date.parse(r.completedAt) || 0));
    const age = last ? Math.min(3, (now - last) / 86_400_000 / 10) : 1;
    return (misses.get(l.id) ?? 0) * 3 + grade + age + rand();
  };
  return done
    .filter((l) => l.kind === "lesson")
    .map((l) => ({ l, s: score(l) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.l);
}

/** The weakest finished topics, without the random tie-breaker, for showing to the player. */
export function weakestTopics(input: WeakInput, count = 5): Lesson[] {
  const done = LESSONS.filter((l) => isLessonComplete(l, input.exercises));
  return rankWeakest(done, { ...input, random: () => 0 }).slice(0, count);
}

export interface YearRecap {
  year: number;
  lessons: number;
  outstanding: number;
  exercises: number;
  cardsMastered: number;
  daysPractised: number;
  weakest?: string;
}

/** The numbers for a year's end-of-year review. */
export function yearRecap(
  year: number,
  save: WeakInput & { activity: Activity },
): YearRecap {
  const y = YEARS.find((x) => x.year === year);
  const lessons = y?.lessons ?? [];
  const ids = new Set(lessons.flatMap((l) => l.exercises.map((e) => e.id)));
  const records = Object.entries(save.exercises).filter(([id]) => ids.has(id)).map(([, r]) => r);
  const lessonIds = new Set(lessons.map((l) => l.id));
  const mastered = REVIEW_CARDS.filter((c) => lessonIds.has(c.lessonId) && (save.cards[c.id]?.box ?? 0) >= 3).length;
  const done = lessons.filter((l) => isLessonComplete(l, save.exercises));
  const weakest = rankWeakest(done, { ...save, random: () => 0 })[0];
  return {
    year,
    lessons: done.length,
    outstanding: records.filter((r) => r.grade === "O").length,
    exercises: records.length,
    cardsMastered: mastered,
    daysPractised: Object.values(save.activity).filter((a) => total(a) > 0).length,
    weakest: weakest?.title,
  };
}
