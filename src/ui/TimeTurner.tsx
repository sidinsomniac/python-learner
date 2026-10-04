import { useEffect, useMemo, useState } from "react";
import { LESSONS, REVIEW_CARDS } from "../engine/content";
import { compareProphecy, isLessonComplete } from "../engine/progress";
import { dayKey, dueCards } from "../engine/review";
import { useFx, useGame } from "../engine/store";
import { forgeCards, FRESH_PER_SESSION } from "../mentor/cardsmith";
import { askJson, mentorReady } from "../mentor/llm";
import type { ReviewCard } from "../engine/types";
import { FEATURE_LEVEL, hasFeature } from "../lore/levels";
import { python } from "../runtime/pythonRunner";
import { renderInline, renderMarkdown } from "./md";

/** Cards from lessons you've properly completed (skipped lessons don't count), plus the AI Professor's saved cards. */
export function useDeck(): ReviewCard[] {
  const exercises = useGame((s) => s.exercises);
  const aiCards = useGame((s) => s.aiCards);
  return useMemo(() => {
    const done = new Set(LESSONS.filter((l) => isLessonComplete(l, exercises)).map((l) => l.id));
    return [...REVIEW_CARDS, ...Object.values(aiCards)].filter((c) => done.has(c.lessonId));
  }, [exercises, aiCards]);
}

/** Seconds to wait for fresh cards before giving up on them for this visit. */
const FRESH_TIMEOUT = 25;

type Fresh = { status: "off" | "writing" | "ready" | "failed"; cards: ReviewCard[]; note?: string };

/**
 * Fresh cards for this visit, if the player agreed to them: unseen saved AI
 * cards first, and otherwise new ones from the Professor (checked by cardsmith).
 */
function useFreshCards(): Fresh {
  const consent = useGame((s) => s.mentor.aiCards && mentorReady(s.mentor));
  const hasDeck = useDeck().length > 0;
  const [fresh, setFresh] = useState<Fresh>({ status: "off", cards: [] });
  useEffect(() => {
    if (!consent || !hasDeck) return;
    const s = useGame.getState();
    const unseen = Object.values(s.aiCards).filter((c) => !s.cards[c.id]);
    if (unseen.length >= FRESH_PER_SESSION) {
      setFresh({ status: "ready", cards: unseen.slice(0, FRESH_PER_SESSION) });
      return;
    }
    let live = true;
    setFresh({ status: "writing", cards: [] });
    const timer = setTimeout(() => live && setFresh({ status: "failed", cards: unseen, note: "The Professor took too long - today's session uses the usual cards." }), FRESH_TIMEOUT * 1000);
    forgeCards({
      exercises: s.exercises,
      cards: s.cards,
      aiCards: s.aiCards,
      rejected: s.rejectedCards,
      ask: (system, user) => askJson(useGame.getState().mentor, system, user),
      run: (code) => python.run(code, [], {}, 4000),
    })
      .then((r) => {
        if (!live) return;
        useGame.getState().saveAiCards(r.cards);
        setFresh({ status: "ready", cards: [...unseen, ...r.cards].slice(0, FRESH_PER_SESSION) });
      })
      .catch((err) => live && setFresh({ status: "failed", cards: unseen, note: `No fresh cards today (${err instanceof Error ? err.message : String(err)}).` }))
      .finally(() => clearTimeout(timer));
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [consent, hasDeck]);
  return fresh;
}

/** Mix fresh cards in among the due ones: every other card, starting second. */
function interleave(due: ReviewCard[], fresh: ReviewCard[]): ReviewCard[] {
  const ids = new Set(fresh.map((c) => c.id));
  const rest = due.filter((c) => !ids.has(c.id));
  const out: ReviewCard[] = [];
  while (rest.length || fresh.length) {
    if (rest.length) out.push(rest.shift()!);
    if (fresh.length) out.push(fresh.shift()!);
  }
  return out;
}

export function useDueCount(): number {
  const deck = useDeck();
  const cards = useGame((s) => s.cards);
  const bestLevel = useGame((s) => s.bestLevel);
  if (!hasFeature(bestLevel, "time-turner")) return 0;
  return dueCards(deck, cards, dayKey(new Date())).length;
}

export function TimeTurner() {
  const bestLevel = useGame((s) => s.bestLevel);
  const streak = useGame((s) => s.reviewStreak);
  const deck = useDeck();
  const [session, setSession] = useState<ReviewCard[] | null>(null);
  const fresh = useFreshCards();

  if (!hasFeature(bestLevel, "time-turner")) {
    return (
      <div className="card secret">
        <h1>⏳ The Time-Turner</h1>
        <p>Professor McGonagall keeps the Time-Turner locked away until you reach level {FEATURE_LEVEL["time-turner"]}.</p>
      </div>
    );
  }

  const start = () => {
    const freshCards = fresh.status === "ready" || fresh.status === "failed" ? fresh.cards : [];
    const freshIds = new Set(freshCards.map((c) => c.id));
    const due = dueCards(
      deck.filter((c) => !freshIds.has(c.id)),
      useGame.getState().cards,
      dayKey(new Date()),
    );
    setSession(interleave(due, [...freshCards]));
  };

  return (
    <div className="stack">
      <section className="card hero">
        <h1>⏳ The Time-Turner</h1>
        <p>
          Turn back time and revisit old spells before you forget them. Each day, a few cards come back - the ones you
          find hardest come back soonest.
        </p>
        <p className="small muted">
          📅 Review streak: <strong>{streak}</strong> day{streak === 1 ? "" : "s"} · Cards in your deck: {deck.length}
        </p>
      </section>
      {session === null ? (
        <SessionStart onStart={start} fresh={fresh} />
      ) : (
        <Session key={session.map((c) => c.id).join()} cards={session} onDone={() => setSession(null)} />
      )}
    </div>
  );
}

function SessionStart({ onStart, fresh }: { onStart: () => void; fresh: Fresh }) {
  const due = useDueCount();
  const deck = useDeck();
  if (deck.length === 0) {
    return <p className="card muted">Your deck is empty. Complete a lesson and its cards will join the Time-Turner.</p>;
  }
  const freshReady = fresh.status === "ready" ? fresh.cards.length : 0;
  return (
    <div className="card center">
      {fresh.status === "writing" && (
        <p className="small muted" data-testid="fresh-writing">
          ⏳ The Professor is writing fresh challenges for your weakest topics...
        </p>
      )}
      {freshReady > 0 && (
        <p className="small" data-testid="fresh-ready">
          ✨ {freshReady} fresh challenge{freshReady === 1 ? "" : "s"} from the Professor today.
        </p>
      )}
      {fresh.status === "failed" && fresh.note && <p className="small muted">{fresh.note}</p>}
      {due > 0 || freshReady > 0 ? (
        <>
          <p>
            <strong>{due}</strong> card{due === 1 ? "" : "s"} due today{freshReady > 0 ? `, plus ${freshReady} fresh` : ""}.
          </p>
          <button className="btn primary" onClick={onStart} data-testid="review-start">
            Turn the Time-Turner ⏳
          </button>
        </>
      ) : (
        <p className="muted">✨ All caught up for today. Come back tomorrow to keep your streak alive!</p>
      )}
    </div>
  );
}

function Session({ cards, onDone }: { cards: ReviewCard[]; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [summary, setSummary] = useState<{ xp: number; galleons: number; streak: number } | null>(null);

  if (summary) {
    return (
      <div className="card center" data-testid="review-summary">
        <h2>⏳ Session complete</h2>
        <p>
          {correctCount} of {cards.length} remembered.
        </p>
        {summary.xp > 0 && (
          <p>
            ✨ +{summary.xp} XP bonus · 🪙 +{summary.galleons} Galleons
          </p>
        )}
        <p>📅 Streak: {summary.streak} day{summary.streak === 1 ? "" : "s"}</p>
        <button className="btn" onClick={onDone}>
          Back
        </button>
      </div>
    );
  }

  const card = cards[index];
  const flag = () => {
    useGame.getState().rejectCard(card.id);
    useFx.getState().toast("🚩 Thanks - that card is gone, and the Professor will avoid ones like it.", "info");
    next();
  };
  const answer = (correct: boolean) => {
    useGame.getState().answerReviewCard(card.id, correct);
    if (correct) setCorrectCount((c) => c + 1);
    setResult(correct);
  };
  const next = () => {
    if (index + 1 >= cards.length) setSummary(useGame.getState().finishReviewSession(correctCount));
    else {
      setIndex(index + 1);
      setResult(null);
    }
  };

  return (
    <div className="card review-card" data-testid="review-card">
      <p className="muted small">
        Card {index + 1} of {cards.length}
        {card.source === "ai" && (
          <span className="fresh-tag" data-testid="fresh-tag">
            {" "}
            · ✨ Written by the Professor
          </span>
        )}
      </p>
      <CardFace key={card.id} card={card} result={result} onAnswer={answer} />
      {result !== null && (
        <div className={`fb ${result ? "success" : "error"}`}>
          <strong>{result ? "✔ Remembered!" : "✘ Not quite - this card will come back tomorrow."}</strong>
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(card.why) }} />
          <button className="btn primary" onClick={next} data-testid="review-next">
            {index + 1 >= cards.length ? "Finish" : "Next card ▸"}
          </button>
          {card.source === "ai" && (
            <button className="btn ghost small" onClick={flag} data-testid="flag-card">
              🚩 This card is wrong or unhelpful
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** One review card, used by the Time-Turner (and, for choice cards, the Dueling Club). */
export function CardFace({
  card,
  result,
  onAnswer,
}: {
  card: ReviewCard;
  result: boolean | null;
  onAnswer: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [prophecy, setProphecy] = useState("");
  const [busy, setBusy] = useState(false);

  if (card.type === "choice") {
    return (
      <div>
        <p className="review-q" dangerouslySetInnerHTML={{ __html: renderInline(card.q) }} />
        <div className="answers">
          {card.options.map((option, i) => (
            <button
              key={i}
              className={`btn answer ${picked === i ? (i === card.answer ? "picked-right" : "picked-wrong") : ""} ${result !== null && i === card.answer ? "picked-right" : ""}`}
              disabled={result !== null}
              onClick={() => {
                setPicked(i);
                onAnswer(i === card.answer);
              }}
              dangerouslySetInnerHTML={{ __html: renderInline(option) }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (card.type === "bug") {
    const lines = card.code.replace(/\n$/, "").split("\n");
    return (
      <div>
        <p className="review-q">
          {card.q ? <span dangerouslySetInnerHTML={{ __html: renderInline(card.q) }} /> : "One line of this spell is wrong. Which?"}
        </p>
        <p className="small muted">
          It should print: <code>{card.expected}</code>
        </p>
        <ol className="bug-lines" data-testid="bug-lines">
          {lines.map((line, i) => {
            const n = i + 1;
            const state = result === null ? "" : n === card.buggyLine ? "picked-right" : picked === n ? "picked-wrong" : "";
            return (
              <li key={i}>
                <button
                  className={`bug-line ${state}`}
                  disabled={result !== null || !line.trim()}
                  onClick={() => {
                    setPicked(n);
                    onAnswer(n === card.buggyLine);
                  }}
                >
                  <span className="bug-n">{n}</span>
                  <code>{line || " "}</code>
                </button>
              </li>
            );
          })}
        </ol>
        {result !== null && (
          <p className="small">
            The fix for line {card.buggyLine}: <code>{card.fix.trim()}</code>
          </p>
        )}
      </div>
    );
  }

  if (card.type === "complete") {
    return (
      <div>
        <p className="review-q">
          {card.q ? <span dangerouslySetInnerHTML={{ __html: renderInline(card.q) }} /> : "Which line completes the spell?"}
        </p>
        <pre className="console review-code">
          {card.code
            .replace(/\n$/, "")
            .split("\n")
            .map((line, i) => (
              <span key={i} className={line.trim() === "____" ? "blank-line" : undefined}>
                {line}
                {"\n"}
              </span>
            ))}
        </pre>
        <p className="small muted">
          It should print: <code>{card.expected}</code>
        </p>
        <div className="answers">
          {card.options.map((option, i) => (
            <button
              key={i}
              className={`btn answer ${picked === i ? (i === card.answer ? "picked-right" : "picked-wrong") : ""} ${result !== null && i === card.answer ? "picked-right" : ""}`}
              disabled={result !== null}
              onClick={() => {
                setPicked(i);
                onAnswer(i === card.answer);
              }}
            >
              <code>{option}</code>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const check = async () => {
    setBusy(true);
    try {
      const actual = await python.run(card.code, []);
      onAnswer(compareProphecy(prophecy, actual.stdout).correct);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <p className="review-q">{card.q ? <span dangerouslySetInnerHTML={{ __html: renderInline(card.q) }} /> : "What does this print?"}</p>
      <pre className="console review-code">{card.code}</pre>
      <textarea value={prophecy} onChange={(e) => setProphecy(e.target.value)} rows={3} disabled={result !== null} spellCheck={false} aria-label="Your prediction" />
      {result === null && (
        <button className="btn primary" onClick={check} disabled={busy || !prophecy.trim()}>
          Check
        </button>
      )}
    </div>
  );
}
