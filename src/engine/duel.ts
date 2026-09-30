// The Dueling Club: timed rounds against simulated opponents.

export interface Opponent {
  id: string;
  cast: string;
  name: string;
  blurb: string;
  accuracy: number;
  /** Average seconds to answer. */
  speed: number;
  galleons: number;
  masters?: boolean;
}

export const ROUND_SECONDS = 20;
export const ROUNDS = 5;

export const OPPONENTS: Opponent[] = [
  { id: "neville", cast: "neville", name: "Neville Longbottom", blurb: "Nervous, kind, and better than he thinks.", accuracy: 0.55, speed: 12, galleons: 8 },
  { id: "draco", cast: "draco", name: "Draco Malfoy", blurb: "Your rival. Quick, sharp, and hates losing.", accuracy: 0.7, speed: 8, galleons: 15 },
  { id: "hermione", cast: "hermione", name: "Hermione Granger", blurb: "She has read the whole textbook. Twice.", accuracy: 0.88, speed: 7, galleons: 25, masters: true },
  { id: "snape", cast: "snape", name: "Professor Snape", blurb: "Merciless. Precise. Faintly disappointed in advance.", accuracy: 0.95, speed: 5, galleons: 40, masters: true },
];

/** 100 for a right answer, plus up to 100 more for speed. */
export function scoreAnswer(correct: boolean, seconds: number): number {
  if (!correct) return 0;
  const left = Math.max(0, ROUND_SECONDS - seconds);
  return 100 + Math.round((left / ROUND_SECONDS) * 100);
}

/** A small seeded random generator, so duels can be replayed in tests. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The opponent's answer for one round. */
export function opponentRound(opp: Opponent, rng: () => number) {
  const correct = rng() < opp.accuracy;
  const seconds = Math.min(ROUND_SECONDS, opp.speed * (0.6 + 0.8 * rng()));
  return { correct, seconds, points: scoreAnswer(correct, seconds) };
}

export type DuelOutcome = "win" | "loss" | "draw";

export const duelOutcome = (mine: number, theirs: number): DuelOutcome =>
  mine > theirs ? "win" : mine < theirs ? "loss" : "draw";
