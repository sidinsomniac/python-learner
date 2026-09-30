import { displayNumber, YEARS } from "../engine/content";
import { GRADE_NAME, isExerciseUnlocked, isLessonComplete, isLessonUnlocked, lessonGrade } from "../engine/progress";
import { useGame } from "../engine/store";
import { TIER_LABEL, type Lesson } from "../engine/types";
import { HOUSES, YEAR_NAMES } from "../lore/lore";
import { Cutscene } from "./Cutscene";
import { go } from "./router";

export const YEAR_TOPICS = [
  "print, variables, numbers, strings, if/else, loops, lists",
  "list power, tuples, dictionaries, sets, comprehensions, functions",
  "exceptions, files, recursion, Big-O, searching and sorting",
  "classes and objects, stacks, queues, linked lists, hash maps",
  "iterators, generators, two pointers, sliding window, divide and conquer",
  "decorators, testing, trees, heaps, graphs, and Leaving Hogwarts",
  "dynamic programming, greedy, shortest paths, and your capstone",
];

export function MapView() {
  const { name, house, exercises } = useGame();
  const h = HOUSES[house!];
  const lessonsDone = YEARS.flatMap((y) => y.lessons).filter((l) => isLessonComplete(l, exercises)).length;

  return (
    <div className="stack">
      <section className="card hero">
        <h1>The Great Hall</h1>
        <p>
          Candles float above the {h.name} table.{" "}
          {lessonsDone === 0 ? (
            <>Welcome, {name}! Your first lesson is waiting below.</>
          ) : (
            <>
              Welcome back, {name}. You've completed {lessonsDone} lesson{lessonsDone === 1 ? "" : "s"} so far.
            </>
          )}
        </p>
        <p className="muted small">
          Each lesson has a <strong>📖 story and lecture</strong>, then exercises: <strong>🌱 Warm-up</strong> and{" "}
          <strong>🔥 Core challenge</strong> (required), and an optional <strong>⭐ Outstanding challenge</strong> for the
          brave. Stuck? Professor Ashwood asks questions, never gives answers.
        </p>
      </section>

      {YEAR_NAMES.map((yearName, i) => {
        const year = YEARS.find((y) => y.year === i + 1);
        return (
          <section key={yearName} className={`card year ${year ? "" : "locked-year"}`}>
            <h2>{yearName}</h2>
            {year && <p className="mystery">🔍 This year's mystery: {year.mystery}</p>}
            <p className="muted small">{YEAR_TOPICS[i]}</p>
            {!year ? (
              <p className="muted">🔒 The staircase to this floor hasn't moved into place yet. (Coming soon!)</p>
            ) : (
              <>
                <Cutscene id={`year-${year.year}`} lines={year.intro} title={`${year.mystery}: prologue`} />
                <ol className="quest-list">
                  {year.lessons.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ))}
                </ol>
              </>
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

function LessonCard({ lesson }: { lesson: Lesson }) {
  const records = useGame((s) => s.exercises);
  const done = isLessonComplete(lesson, records);
  const started = lesson.exercises.some((e) => records[e.id]);
  const open = started || isLessonUnlocked(lesson, YEARS, records);
  const grade = lessonGrade(lesson, records);
  const icon = done ? "✅" : !open ? "🔒" : lesson.kind === "trial" ? "🏁" : lesson.kind === "revision" ? "📚" : "🪄";

  return (
    <li>
      <button
        className={`quest-card ${done ? "done" : open ? "open" : "locked"} kind-${lesson.kind}`}
        disabled={!open}
        onClick={() => go(`/lesson/${lesson.id}`)}
        data-testid={`lesson-${lesson.id}`}
      >
        <span className="quest-icon" aria-hidden>
          {icon}
        </span>
        <span className="quest-text">
          <strong>
            <span className="lesson-no">{displayNumber(lesson)}</span> {lesson.title}
          </strong>
          <span className="muted small">
            📍 {lesson.location} · {lesson.concepts.join(", ")}
          </span>
        </span>
        <span className="tier-dots" aria-label="Exercises">
          {lesson.exercises.map((e) => (
            <span
              key={e.id}
              title={`${TIER_LABEL[e.tier].label}: ${e.title}`}
              className={records[e.id] ? "dot done" : isExerciseUnlocked(e, lesson, records) && open ? "dot" : "dot dim"}
            >
              {TIER_LABEL[e.tier].icon}
            </span>
          ))}
        </span>
        {grade && (
          <span className={`grade grade-${grade}`} title={GRADE_NAME[grade]}>
            {grade}
          </span>
        )}
      </button>
    </li>
  );
}
