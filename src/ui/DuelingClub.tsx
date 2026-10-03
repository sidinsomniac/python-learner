import { useEffect, useMemo, useRef, useState } from "react";
import { CAST } from "../engine/content";
import {
  duelOutcome,
  mulberry32,
  opponentRound,
  OPPONENTS,
  ROUND_SECONDS,
  ROUNDS,
  scoreAnswer,
  type DuelOutcome,
  type Opponent,
} from "../engine/duel";
import { duelPerks } from "../engine/perks";
import { useFx, useGame } from "../engine/store";
import type { ReviewCard } from "../engine/types";
import { badgeById } from "../lore/badges";
import { FEATURE_LEVEL, hasFeature } from "../lore/levels";
import { CardFace, useDeck } from "./TimeTurner";

const LINES: Record<string, Record<DuelOutcome, string>> = {
  neville: { win: "Wow - you're brilliant at this! Gran would be impressed.", loss: "I... I won? I actually won?!", draw: "A draw! That's the best I've ever done." },
  draco: { win: "Beginner's luck. Same time next week.", loss: "Pathetic. My father will hear about how easy that was.", draw: "A draw. Don't get used to it." },
  hermione: { win: "Honestly - well done. You must have done the reading.", loss: "You'd have got it if you'd read chapter four properly.", draw: "Hmm. Even. Let's go again." },
  snape: { win: "...Adequate. Do not let it go to your head.", loss: "As I expected. Ten points from your house.", draw: "A draw. How... unremarkable." },
};

export function DuelingClub() {
  const bestLevel = useGame((s) => s.bestLevel);
  const duels = useGame((s) => s.duels);
  const deck = useDeck();
  const pool = useMemo(() => deck.filter((c) => c.type === "choice"), [deck]);
  const [opponent, setOpponent] = useState<Opponent | null>(null);

  if (!hasFeature(bestLevel, "dueling-club")) {
    return (
      <div className="card secret">
        <h1>⚔️ The Dueling Club</h1>
        <p>The Dueling Club opens to students of level {FEATURE_LEVEL["dueling-club"]} and above. Keep studying!</p>
      </div>
    );
  }
  if (opponent) return <Duel key={opponent.id} opponent={opponent} pool={pool} onExit={() => setOpponent(null)} />;

  const masters = hasFeature(bestLevel, "duel-masters");
  return (
    <div className="stack">
      <section className="card hero">
        <h1>⚔️ The Dueling Club</h1>
        <p>
          Five rapid rounds of spell knowledge, {ROUND_SECONDS} seconds each. Right answers score 100, plus up to 100
          more for speed. Beat your opponent's total to win Galleons and house points.
        </p>
        {pool.length < ROUNDS && (
          <p className="fb info small">
            You need at least {ROUNDS} question cards from completed lessons to duel (you have {pool.length}). Finish a
            few more lessons first!
          </p>
        )}
      </section>
      <div className="shop-grid">
        {OPPONENTS.map((opp) => {
          const locked = opp.masters && !masters;
          const rec = duels[opp.id];
          return (
            <div key={opp.id} className={`shop-item duelist ${locked ? "locked-item" : ""}`}>
              <div className="shop-icon" aria-hidden>
                {CAST[opp.cast]?.portrait}
              </div>
              <strong>{opp.name}</strong>
              <p className="small muted">{opp.blurb}</p>
              <p className="small">
                Reward: 🪙 {opp.galleons} {rec && `· Record: ${rec.wins}W ${rec.losses}L ${rec.draws}D`}
              </p>
              {locked ? (
                <span className="small muted">🔒 Reach level {FEATURE_LEVEL["duel-masters"]}</span>
              ) : (
                <button className="btn primary small" disabled={pool.length < ROUNDS} onClick={() => setOpponent(opp)} data-testid={`duel-${opp.id}`}>
                  Bow, and begin
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface RoundResult {
  mine: number;
  theirs: number;
  correct: boolean;
  theirCorrect: boolean;
  theirSeconds: number;
}

function Duel({ opponent, pool, onExit }: { opponent: Opponent; pool: ReviewCard[]; onExit: () => void }) {
  const cards = useMemo(() => [...pool].sort(() => Math.random() - 0.5).slice(0, ROUNDS), [pool]);
  const theirs = useMemo(() => {
    const rng = mulberry32(Date.now() % 100000);
    return cards.map(() => opponentRound(opponent, rng));
  }, [cards, opponent]);
  const [round, setRound] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const equipped = useGame((s) => s.equipped);
  const robes = duelPerks(equipped);
  const roundSeconds = ROUND_SECONDS + robes.extraSeconds;
  const [left, setLeft] = useState(roundSeconds);
  const started = useRef(performance.now());
  const [finished, setFinished] = useState<{ outcome: DuelOutcome; badges: string[]; galleons: number; housePoints: number } | null>(null);
  /** Midnight robes block the first wrong answer of the duel: the card resets and you answer again. */
  const [shieldUsed, setShieldUsed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (answered !== null || finished) return;
    started.current = performance.now();
    setLeft(roundSeconds);
    const timer = setInterval(() => {
      const remaining = roundSeconds - (performance.now() - started.current) / 1000;
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(timer);
        finishRound(false);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [round, answered, finished]);

  const finishRound = (correct: boolean) => {
    const seconds = (performance.now() - started.current) / 1000;
    if (!correct && robes.shield && !shieldUsed && seconds < roundSeconds) {
      setShieldUsed(true);
      setAttempt((a) => a + 1);
      useFx.getState().toast("🛡️ Your midnight robes absorbed that hex. Try again - the clock is still running!", "info");
      return;
    }
    const them = theirs[round];
    setResults((r) => [...r, { mine: scoreAnswer(correct, seconds), theirs: them.points, correct, theirCorrect: them.correct, theirSeconds: them.seconds }]);
    setAnswered(correct);
  };

  const next = () => {
    if (round + 1 >= cards.length) {
      const mine = results.reduce((a, r) => a + r.mine, 0);
      const their = results.reduce((a, r) => a + r.theirs, 0);
      const outcome = duelOutcome(mine, their);
      const { badges, galleons, housePoints } = useGame.getState().recordDuel(opponent.id, outcome, opponent.galleons);
      for (const id of badges) {
        const b = badgeById(id);
        if (b) useFx.getState().toast(`${b.icon} Badge earned: ${b.name}!`, "badge");
      }
      if (outcome === "win") useFx.getState().play("sparkle");
      setFinished({ outcome, badges, galleons, housePoints });
    } else {
      setRound(round + 1);
      setAnswered(null);
    }
  };

  const myTotal = results.reduce((a, r) => a + r.mine, 0);
  const theirTotal = results.reduce((a, r) => a + r.theirs, 0);
  const portrait = CAST[opponent.cast]?.portrait;

  if (finished) {
    return (
      <div className="card center duel-result" data-testid="duel-result">
        <div className="shop-icon" aria-hidden>
          {portrait}
        </div>
        <h2>{finished.outcome === "win" ? "🏆 Victory!" : finished.outcome === "loss" ? "💫 Defeated..." : "🤝 A draw"}</h2>
        <p className="hat-speech">"{LINES[opponent.id]?.[finished.outcome]}"</p>
        <p>
          You {myTotal} - {theirTotal} {opponent.name}
        </p>
        {finished.outcome === "win" && (
          <p data-testid="duel-prize">
            🪙 +{finished.galleons} Galleons · +{finished.housePoints} house points
            {finished.galleons < opponent.galleons && (
              <span className="small muted"> ({opponent.name.split(" ")[0]} already paid you in full today. Rematches are for glory.)</span>
            )}
          </p>
        )}
        <button className="btn primary" onClick={onExit}>
          Back to the Club
        </button>
      </div>
    );
  }

  const last = results[round];
  return (
    <div className="stack">
      <div className="card duel-bar">
        <span>
          🧙 You: <strong>{myTotal}</strong>
        </span>
        <span className="muted">
          Round {round + 1} / {cards.length}
        </span>
        <span>
          {portrait} {opponent.name.split(" ")[0]}: <strong>{answered === null ? "?" : theirTotal}</strong>
        </span>
      </div>
      <div className="timer" aria-label="Time left">
        <div style={{ width: `${(left / roundSeconds) * 100}%` }} />
      </div>
      <div className="card review-card" data-testid="duel-round">
        <CardFace key={`${cards[round].id}:${attempt}`} card={cards[round]} result={answered} onAnswer={finishRound} />
        {answered !== null && last && (
          <div className={`fb ${answered ? "success" : "error"}`}>
            <p>
              {answered ? `✔ Correct: +${last.mine}` : left <= 0 ? "⏳ Time's up!" : "✘ Wrong spell!"} ·{" "}
              {opponent.name.split(" ")[0]} {last.theirCorrect ? `answered correctly in ${last.theirSeconds.toFixed(1)}s (+${last.theirs})` : "got it wrong"}
            </p>
            <button className="btn primary" onClick={next} data-testid="duel-next">
              {round + 1 >= cards.length ? "Final score" : "Next round ▸"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
