import { useMemo } from "react";
import { OPPONENTS } from "../engine/duel";
import { GRADE_NAME } from "../engine/progress";
import { dayKey, INTERVALS } from "../engine/review";
import { gradeSpread, practiceHeatmap, practiceStreaks, retention, weakestTopics } from "../engine/stats";
import { useGame } from "../engine/store";
import type { Grade } from "../engine/types";
import { hasFeature } from "../lore/levels";
import { useDeck } from "./deck";

const BOX_NAMES = ["Fresh", "Settling", "Steady", "Strong", "Mastered"];
const GRADES: Grade[] = ["O", "E", "A", "P"];
const CELL = 12;

/** The Marauder's Ledger: practice days, memory, weak spots, grades and duels. */
export function Progress() {
  const activity = useGame((s) => s.activity);
  const exercises = useGame((s) => s.exercises);
  const cards = useGame((s) => s.cards);
  const aiCards = useGame((s) => s.aiCards);
  const duels = useGame((s) => s.duels);
  const bestLevel = useGame((s) => s.bestLevel);
  const deck = useDeck();
  const today = dayKey(new Date());

  const weeks = useMemo(() => practiceHeatmap(activity, today), [activity, today]);
  const streaks = practiceStreaks(activity, today);
  const memory = retention(deck, cards, activity, today);
  const weak = useMemo(() => weakestTopics({ exercises, cards, aiCards }), [exercises, cards, aiCards]);
  const grades = gradeSpread(exercises);
  const maxBox = Math.max(1, memory.unseen, ...memory.boxes);
  const fought = OPPONENTS.filter((o) => duels[o.id]);

  return (
    <div className="stack ledger">
      <section className="card hero">
        <h1>📒 The Marauder's Ledger</h1>
        <p className="muted">
          <em>"I solemnly swear that I am up to no good"</em>, and here is the proof: every day you practised, what's sticking, and
          what's slipping.
        </p>
        <div className="ledger-stats">
          <Stat label="Days in a row" value={streaks.current} testId="ledger-streak" />
          <Stat label="Best run" value={streaks.best} />
          <Stat label="Days practised" value={streaks.daysPractised} testId="ledger-days" />
          <Stat label="Exercises done" value={Object.keys(exercises).length} />
        </div>
      </section>

      <section className="card">
        <h2>🗓️ Practice over the last year</h2>
        <div className="heatmap-scroll">
          <svg
            className="heatmap"
            width={weeks.length * (CELL + 2)}
            height={7 * (CELL + 2)}
            role="img"
            aria-label={`Practice heatmap: ${streaks.daysPractised} days practised`}
            data-testid="heatmap"
          >
            {weeks.map((col, w) =>
              col.map((d, i) => (
                <rect key={d.day} x={w * (CELL + 2)} y={i * (CELL + 2)} width={CELL} height={CELL} rx={2} className={`heat heat-${d.level}`} data-count={d.count}>
                  <title>
                    {d.day}: {d.count ? `${d.count} thing${d.count === 1 ? "" : "s"} practised` : "no practice"}
                  </title>
                </rect>
              )),
            )}
          </svg>
        </div>
        <p className="muted small">Each square is a day: exercises finished, Time-Turner cards answered and duels fought.</p>
      </section>

      {hasFeature(bestLevel, "time-turner") && (
        <section className="card">
          <h2>⏳ What's sticking</h2>
          <p className="muted small">
            Time-Turner cards move up a box each time you remember them, and wait longer before coming back (
            {INTERVALS.join(", ")} days). A miss sends a card back to the start.
            {memory.hitRate !== null && (
              <>
                {" "}
                Over the last 30 days you remembered <strong data-testid="ledger-hit-rate">{Math.round(memory.hitRate * 100)}%</strong>.
              </>
            )}
          </p>
          <div className="boxes">
            {[["Not yet seen", memory.unseen] as const, ...memory.boxes.map((n, i) => [BOX_NAMES[i], n] as const)].map(([name, n]) => (
              <div key={name} className="box-row">
                <span className="small">{name}</span>
                <span className="box-bar">
                  <span style={{ width: `${(n / maxBox) * 100}%` }} />
                </span>
                <span className="small">{n}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <h2>🕯️ Weak spots</h2>
        {weak.length === 0 ? (
          <p className="muted">Finish a lesson or two, and the Ledger will tell you where to look again.</p>
        ) : (
          <>
            <p className="muted small">Lessons whose cards you miss most, with lower grades, or that you haven't touched in a while.</p>
            <ol className="weak-list" data-testid="weak-spots">
              {weak.map((l) => (
                <li key={l.id}>
                  <a href={`#/lesson/${l.id}`}>{l.title}</a> <span className="muted small">· Year {l.year}</span>
                </li>
              ))}
            </ol>
            {hasFeature(bestLevel, "time-turner") && <a className="btn" href="#/time-turner">⏳ Review with the Time-Turner</a>}
          </>
        )}
      </section>

      {grades.length > 0 && (
        <section className="card">
          <h2>📜 Grades by year</h2>
          <table className="report">
            <thead>
              <tr>
                <th>Year</th>
                {GRADES.map((g) => (
                  <th key={g} title={GRADE_NAME[g]}>
                    <span className={`grade grade-${g}`}>{g}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grades.map((y) => (
                <tr key={y.year}>
                  <td>Year {y.year}</td>
                  {GRADES.map((g) => (
                    <td key={g}>{y.grades[g]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {fought.length > 0 && (
        <section className="card">
          <h2>⚔️ Duelling record</h2>
          <table className="report">
            <thead>
              <tr>
                <th>Opponent</th>
                <th>Won</th>
                <th>Drawn</th>
                <th>Lost</th>
              </tr>
            </thead>
            <tbody>
              {fought.map((o) => (
                <tr key={o.id}>
                  <td>{o.name}</td>
                  <td>{duels[o.id].wins}</td>
                  <td>{duels[o.id].draws}</td>
                  <td>{duels[o.id].losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, testId }: { label: string; value: number; testId?: string }) {
  return (
    <div className="ledger-stat">
      <strong data-testid={testId}>{value}</strong>
      <span className="muted small">{label}</span>
    </div>
  );
}
