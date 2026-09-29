import { QUESTS } from "../engine/content";
import { isQuestUnlocked } from "../engine/progress";
import { useGame } from "../engine/store";
import { QUEST_TYPE_LABEL } from "../engine/types";
import { HOUSES, YEAR_NAMES } from "../lore/lore";
import { go } from "./router";

export const YEAR_TOPICS = [
  "print, variables, input, numbers, strings, f-strings",
  "booleans, if/elif/else, while and for loops, range",
  "lists, tuples, dictionaries, sets, slicing, comprehensions",
  "functions, arguments, scope, recursion, exceptions",
  "classes, inheritance, magic (dunder) methods, modules",
  "iterators, generators, decorators, files, testing",
  "algorithms and Big-O, typing, dataclasses, the standard library",
];

export function MapView() {
  const { name, house, completed } = useGame();
  const h = HOUSES[house!];
  const doneCount = Object.keys(completed).length;

  return (
    <div className="stack">
      <section className="card hero">
        <h1>The Great Hall</h1>
        <p>
          Candles float above the {h.name} table. {doneCount === 0 ? (
            <>Welcome, {name}! Your first lesson is waiting. Click it below to begin.</>
          ) : (
            <>Welcome back, {name}. You've completed {doneCount} quest{doneCount === 1 ? "" : "s"} so far.</>
          )}
        </p>
        <p className="muted small">
          How it works: each quest has a <strong>📖 Lesson</strong> to read and play with, then a <strong>📜 Task</strong>{" "}
          to solve. Stuck? Ask Professor Ashwood for hints. She'll ask you questions instead of giving answers.
        </p>
      </section>

      {YEAR_NAMES.map((yearName, i) => {
        const year = i + 1;
        const quests = QUESTS.filter((q) => q.year === year);
        return (
          <section key={year} className={`card year ${quests.length ? "" : "locked-year"}`}>
            <h2>{yearName}</h2>
            <p className="muted small">{YEAR_TOPICS[i]}</p>
            {quests.length === 0 ? (
              <p className="muted">🔒 The staircase to this floor hasn't moved into place yet. (Coming soon!)</p>
            ) : (
              <ol className="quest-list">
                {quests.map((q) => {
                  const done = Boolean(completed[q.id]);
                  const open = done || isQuestUnlocked(q, QUESTS, completed);
                  const t = QUEST_TYPE_LABEL[q.type];
                  return (
                    <li key={q.id}>
                      <button
                        className={`quest-card ${done ? "done" : open ? "open" : "locked"}`}
                        disabled={!open}
                        onClick={() => go(`/quest/${q.id}`)}
                        data-testid={`quest-${q.id}`}
                      >
                        <span className="quest-icon" aria-hidden>
                          {done ? "✅" : open ? t.icon : "🔒"}
                        </span>
                        <span className="quest-text">
                          <strong>{q.title}</strong>
                          <span className="muted small">
                            {t.label} · {q.summary}
                          </span>
                        </span>
                        <span className="muted small">{q.xp} XP</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
            {year === 1 && (
              <p className="muted small">🏁 Year 1 Trial (boss): the Wizard ID-Card Generator. Unlocks in a future update.</p>
            )}
          </section>
        );
      })}

      <footer className="kings-cross" aria-label="King's Cross station">
        <span>Platform 9</span>
        <button className="brick" title="A suspiciously solid-looking wall..." onClick={() => go("/platform-nine-and-three-quarters")}>
          🧱
        </button>
        <span>Platform 10</span>
      </footer>
    </div>
  );
}
