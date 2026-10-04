import { useState } from "react";
import { displayNumber, YEARS } from "../engine/content";
import {
  canSkip,
  currentYear,
  GRADE_NAME,
  isExerciseUnlocked,
  isLessonComplete,
  isLessonUnlocked,
  isYearComplete,
  lessonGrade,
} from "../engine/progress";
import { useGame } from "../engine/store";
import { TIER_LABEL, type Lesson, type Year } from "../engine/types";
import { HOUSES, YEAR_NAMES } from "../lore/lore";
import { itemById } from "../lore/shop";
import { Cutscene } from "./Cutscene";
import { go } from "./router";
import { SkipDialog } from "./SkipDialog";
import { useDueCount } from "./deck";

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
  const { name, house, exercises, skipped, equipped } = useGame();
  const h = HOUSES[house!];
  const lessonsDone = YEARS.flatMap((y) => y.lessons).filter((l) => isLessonComplete(l, exercises)).length;
  const now = currentYear(YEARS, exercises, skipped);
  const due = useDueCount();
  const banner = equipped.banner ? itemById(equipped.banner)?.value : undefined;

  return (
    <div className="stack">
      <section className={`card hero ${banner ? `banner-${banner}` : ""}`}>
        {banner && <div className={`banner-strip banner-${banner}`} aria-hidden />}
        <h1>The Great Hall</h1>
        <p>
          Candles float above the {h.name} table.{" "}
          {lessonsDone === 0 ? (
            <>Welcome, {name}! Your first lesson is waiting below.</>
          ) : (
            <>
              Welcome back, {name}. You've completed {lessonsDone} lesson{lessonsDone === 1 ? "" : "s"} so far.{" "}
              <a href="#/progress">📒 Open the Ledger</a> to see how it's sticking.
            </>
          )}
        </p>
        {due > 0 && (
          <p>
            ⏳ <a href="#/time-turner">{due} Time-Turner card{due === 1 ? " is" : "s are"} due today</a> - keep your old
            spells fresh!
          </p>
        )}
        <p className="muted small">
          Each lesson has a <strong>📖 story and lecture</strong>, then exercises: <strong>🌱 Warm-up</strong> and{" "}
          <strong>🔥 Core challenge</strong> (required), and an optional <strong>⭐ Outstanding challenge</strong> for the
          brave. Stuck? Professor Ashwood asks questions, never gives answers.
        </p>
      </section>

      {YEAR_NAMES.map((yearName, i) => {
        const year = YEARS.find((y) => y.year === i + 1);
        const reached = Boolean(year?.lessons[0] && isLessonUnlocked(year.lessons[0], YEARS, exercises, skipped));
        return (
          <YearSection key={yearName} yearName={yearName} topics={YEAR_TOPICS[i]} year={year} reached={reached} current={year?.year === now} />
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

function YearSection({
  yearName,
  topics,
  year,
  reached,
  current,
}: {
  yearName: string;
  topics: string;
  year?: Year;
  reached: boolean;
  current: boolean;
}) {
  const exercises = useGame((s) => s.exercises);
  const skipped = useGame((s) => s.skipped);
  const [open, setOpen] = useState(current);
  const done = year ? isYearComplete(year, exercises, skipped) : false;

  if (!year || !reached) {
    return (
      <section className="card year locked-year">
        <h2>{yearName}</h2>
        {year && <p className="mystery">🔍 {year.mystery}</p>}
        <p className="muted small">{topics}</p>
        <p className="muted">
          {year ? "🔒 Pass last year's Trial to board the Hogwarts Express." : "🔒 The staircase to this floor hasn't moved into place yet. (Coming soon!)"}
        </p>
      </section>
    );
  }

  return (
    <section className={`card year year-${year.year}`} data-testid={`year-${year.year}`}>
      <div className="row between">
        <h2>
          {done && "✅ "}
          {yearName}
        </h2>
        <button className="btn small ghost" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? "Fold away" : "Open"}
        </button>
      </div>
      <p className="mystery">
        🔍 This year's mystery: {year.mystery} · <span className="muted">{year.theme.mood}</span>
      </p>
      <p className="muted small">{topics}</p>
      {open && (
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
}

function LessonCard({ lesson }: { lesson: Lesson }) {
  const records = useGame((s) => s.exercises);
  const skipped = useGame((s) => s.skipped);
  const [skipping, setSkipping] = useState(false);
  const done = isLessonComplete(lesson, records);
  const wasSkipped = Boolean(skipped[lesson.id]) && !done;
  const started = lesson.exercises.some((e) => records[e.id]);
  const open = started || isLessonUnlocked(lesson, YEARS, records, skipped);
  const grade = lessonGrade(lesson, records);
  const icon = done ? "✅" : wasSkipped ? "👻" : !open ? "🔒" : lesson.kind === "trial" ? "🏁" : lesson.kind === "revision" ? "📚" : "🪄";

  return (
    <li className="lesson-row">
      <button
        className={`quest-card ${done ? "done" : wasSkipped ? "skipped" : open ? "open" : "locked"} kind-${lesson.kind}`}
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
            {wasSkipped && <span className="skipped-tag">skipped</span>}
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
      {canSkip(lesson, YEARS, records, skipped) && (
        <button className="btn ghost small skip-btn" onClick={() => setSkipping(true)} title="Peeves' Bargain: skip this lesson" data-testid={`skip-${lesson.id}`}>
          👻 Skip
        </button>
      )}
      {skipping && <SkipDialog lesson={lesson} onClose={() => setSkipping(false)} />}
    </li>
  );
}
