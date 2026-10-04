// The Time-Turner's card writer: asks the AI Professor for fresh review cards
// about lessons the player has finished, aimed at their weakest topics, and
// keeps only the ones that survive every quality gate in cardCheck.ts.
import { LESSONS, REVIEW_CARDS } from "../engine/content";
import { isLessonComplete } from "../engine/progress";
import type { CardState } from "../engine/review";
import { rankWeakest } from "../engine/stats";
import type { ExerciseRecord, ReviewCard } from "../engine/types";
import { BLIND_SYSTEM, blindRequest, CARD_SYSTEM, cardRequest, type CardBrief } from "./cardPrompt";
import { fingerprint, forbidden, notUseful, outOfScope, parseCard, runCheck, type Runner } from "./cardCheck";

/** How many fresh cards a session gets. */
export const FRESH_PER_SESSION = 3;
/** How many candidates to ask for, so a few can fail the gates. */
const CANDIDATES = 7;

/** Sends a system prompt and a user message, and returns parsed JSON. */
export type AskJson = (system: string, user: string) => Promise<unknown>;

export interface ForgeInput {
  exercises: Record<string, ExerciseRecord>;
  cards: Record<string, CardState>;
  aiCards: Record<string, ReviewCard>;
  /** Fingerprints of cards the player flagged, with their reason. */
  rejected: Record<string, string>;
  ask: AskJson;
  run: Runner;
  now?: Date;
  random?: () => number;
}

export interface ForgeResult {
  cards: ReviewCard[];
  /** Why each candidate was dropped (shown nowhere, but handy for tuning and tests). */
  dropped: string[];
}

// The ranking lives with the progress stats, so the Ledger shows the same weak spots the card writer aims at.
export { rankWeakest };

/** One line describing a card, for examples and "avoid" lists. */
function brief(c: ReviewCard): string {
  const text = "code" in c ? c.code.replace(/\s*\n\s*/g, " / ") : c.q;
  return `[${c.type}] ${c.type !== "predict" && "q" in c && c.q ? `${c.q} ` : ""}${text}`.slice(0, 220);
}

/** Ask for candidates, then keep up to FRESH_PER_SESSION that pass every gate, in a mix of types. */
export async function forgeCards(input: ForgeInput): Promise<ForgeResult> {
  const done = LESSONS.filter((l) => isLessonComplete(l, input.exercises));
  const doneIds = new Set(done.map((l) => l.id));
  const targets = rankWeakest(done, input).slice(0, 3);
  if (targets.length === 0) return { cards: [], dropped: ["no finished lessons yet"] };

  const lastDone = Math.max(...done.map((l) => LESSONS.indexOf(l)));
  const learned = [...new Set(done.flatMap((l) => l.concepts))];
  const notYet = [...new Set(LESSONS.slice(lastDone + 1, lastDone + 5).flatMap((l) => l.concepts))].filter((c) => !learned.includes(c));
  const saved = Object.values(input.aiCards);
  const avoid = [...Object.values(input.rejected).slice(-5), ...saved.slice(-10).map(brief)];
  const briefs: CardBrief[] = targets.map((l) => ({ lesson: l.id, title: l.title, concepts: l.concepts, examples: l.review.map(brief) }));

  const reply = (await input.ask(CARD_SYSTEM, cardRequest(briefs, learned, notYet, avoid, CANDIDATES))) as { cards?: unknown };
  const raw = Array.isArray(reply) ? reply : Array.isArray(reply?.cards) ? reply.cards : [];

  const seen = new Set([...REVIEW_CARDS, ...saved].map(fingerprint));
  for (const fp of Object.keys(input.rejected)) seen.add(fp);
  const stamp = (input.now ?? new Date()).getTime().toString(36);
  const dropped: string[] = [];
  const passed: ReviewCard[] = [];

  for (let i = 0; i < raw.length; i++) {
    const r = raw[i] as { lesson?: unknown };
    const lessonId = typeof r?.lesson === "string" && doneIds.has(r.lesson) ? r.lesson : targets[0].id;
    const card = parseCard(r, `ai-${stamp}-${i}`, lessonId);
    if (!card) {
      dropped.push(`#${i}: malformed`);
      continue;
    }
    const why = forbidden(card) ?? outOfScope(card, doneIds) ?? notUseful(card) ?? (seen.has(fingerprint(card)) ? "a duplicate" : null);
    if (why) {
      dropped.push(`#${i}: ${why}`);
      continue;
    }
    const ran = await runCheck(card, input.run);
    if (ran) {
      dropped.push(`#${i}: ${ran}`);
      continue;
    }
    seen.add(fingerprint(card));
    passed.push(card);
  }

  // Choice cards get a blind second opinion: a fresh call must pick the same answer.
  const choices = passed.filter((c): c is Extract<ReviewCard, { type: "choice" }> => c.type === "choice");
  let agreed = new Set<string>(passed.filter((c) => c.type !== "choice").map((c) => c.id));
  if (choices.length) {
    try {
      const blind = (await input.ask(BLIND_SYSTEM, blindRequest(choices))) as { answers?: unknown };
      const answers = Array.isArray(blind?.answers) ? blind.answers : [];
      choices.forEach((c, i) => {
        if (answers[i] === c.answer) agreed.add(c.id);
        else dropped.push(`${c.id}: the blind check disagreed`);
      });
    } catch {
      choices.forEach((c) => dropped.push(`${c.id}: the blind check failed`));
    }
  }
  agreed = new Set(agreed);
  const good = passed.filter((c) => agreed.has(c.id));

  // One of each type first, then fill up.
  const picked: ReviewCard[] = [];
  for (const type of ["bug", "complete", "predict", "choice"] as const) {
    const c = good.find((g) => g.type === type);
    if (c && picked.length < FRESH_PER_SESSION) picked.push(c);
  }
  for (const c of good) if (picked.length < FRESH_PER_SESSION && !picked.includes(c)) picked.push(c);
  return { cards: picked, dropped };
}
