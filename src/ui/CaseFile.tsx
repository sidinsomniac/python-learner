import { displayNumber, YEARS } from "../engine/content";
import { GRADE_NAME, lessonGrade } from "../engine/progress";
import { useGame } from "../engine/store";
import { renderMarkdown } from "./md";

/** The year's mystery clues, and the O.W.L. report card. */
export function CaseFile() {
  const { clues, exercises } = useGame();

  return (
    <div className="stack">
      {YEARS.map((year) => {
        const clueLessons = year.lessons.filter((l) => l.clue);
        const found = clueLessons.filter((l) => clues[l.id]);
        return (
          <section key={year.year} className="stack">
            <div className="card hero">
              <h1>🔍 Case File: {year.mystery}</h1>
              <p className="muted">
                Clues found: {found.length} of {clueLessons.length}. Each lesson you complete may reveal one.
              </p>
            </div>
            <ol className="clue-board">
              {clueLessons.map((l) =>
                clues[l.id] ? (
                  <li key={l.id} className="card clue">
                    <span className="muted small">
                      {displayNumber(l)} · {l.title} · 📍 {l.location}
                    </span>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(l.clue!) }} />
                  </li>
                ) : (
                  <li key={l.id} className="card clue hidden-clue">
                    <span className="muted small">
                      {displayNumber(l)} · {l.title}
                    </span>
                    <p className="muted">❔ Not yet uncovered.</p>
                  </li>
                ),
              )}
            </ol>

            <div className="card">
              <h2>📜 Report card: Year {year.year}</h2>
              <table className="report">
                <thead>
                  <tr>
                    <th>Lesson</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {year.lessons.map((l) => {
                    const g = lessonGrade(l, exercises);
                    return (
                      <tr key={l.id}>
                        <td>
                          {displayNumber(l)} · {l.title}
                        </td>
                        <td>{g ? <span className={`grade grade-${g}`}>{g}</span> : <span className="muted">-</span>} {g && <span className="small muted">{GRADE_NAME[g]}</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
