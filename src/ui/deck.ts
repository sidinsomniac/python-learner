// The Time-Turner deck hooks, kept apart from TimeTurner.tsx so the header and
// the Great Hall can show the due count without loading the whole screen.
import { useMemo } from "react";
import { LESSONS, REVIEW_CARDS } from "../engine/content";
import { isLessonComplete } from "../engine/progress";
import { dayKey, dueCards } from "../engine/review";
import { useGame } from "../engine/store";
import type { ReviewCard } from "../engine/types";
import { hasFeature } from "../lore/levels";

/** Cards from lessons you've properly completed (skipped lessons don't count), plus the AI Professor's saved cards. */
export function useDeck(): ReviewCard[] {
  const exercises = useGame((s) => s.exercises);
  const aiCards = useGame((s) => s.aiCards);
  return useMemo(() => {
    const done = new Set(LESSONS.filter((l) => isLessonComplete(l, exercises)).map((l) => l.id));
    return [...REVIEW_CARDS, ...Object.values(aiCards)].filter((c) => done.has(c.lessonId));
  }, [exercises, aiCards]);
}

export function useDueCount(): number {
  const deck = useDeck();
  const cards = useGame((s) => s.cards);
  const bestLevel = useGame((s) => s.bestLevel);
  if (!hasFeature(bestLevel, "time-turner")) return 0;
  return dueCards(deck, cards, dayKey(new Date())).length;
}
