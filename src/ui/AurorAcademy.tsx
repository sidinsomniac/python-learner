import { useEffect, useState } from "react";
import { AUROR_CASES, AUROR_PATTERNS, aurorCaseById, isCaseSolved, isCaseUnlocked, type AurorCase } from "../engine/auror";
import { lessonById } from "../engine/content";
import { GRADE_NAME } from "../engine/progress";
import { useFx, useGame, type Reward } from "../engine/store";
import type { ReviewRemark } from "../runtime/types";
import { badgeById } from "../lore/badges";
import { CodeBoard, type Solved } from "./LessonView";
import { renderMarkdown } from "./md";
import { MentorPanel } from "./MentorPanel";
import type { FeedbackItem } from "../mentor/feedback";

const TIMERS = [15, 25];

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** The Auror Academy: interview problems grouped by pattern. */
export function AurorAcademy() {
  const records = useGame((s) => s.exercises);
  const times = useGame((s) => s.aurorTimes);
  const solved = AUROR_CASES.filter((c) => isCaseSolved(c, records)).length;

  return (
    <div className="stack">
      <section className="card hero">
        <h1>🛡️ The Auror Academy</h1>
        <p>
          Interview training. Each case is an original problem in the style of a LeetCode Easy, grouped by the
          <strong> pattern</strong> that cracks it. Cases open as you finish the lessons that teach what they need. Start the
          interview timer if you want the pressure of the real thing; nothing is lost if it runs out.
        </p>
        <p className="muted small" data-testid="auror-progress">
          Cases closed: {solved} of {AUROR_CASES.length}
        </p>
      </section>
      {AUROR_PATTERNS.map((p) => {
        const done = p.cases.filter((c) => isCaseSolved(c, records)).length;
        return (
          <section key={p.id} className="card" data-testid={`pattern-${p.id}`}>
            <div className="row between">
              <h2>
                {p.icon} {p.title}
              </h2>
              <span className="chip" data-testid={`pattern-count-${p.id}`}>
                {done} / {p.cases.length}
              </span>
            </div>
            <p className="muted small">{p.blurb}</p>
            <ul className="auror-cases">
              {p.cases.map((c) => {
                const open = isCaseUnlocked(c, records);
                const rec = records[c.exercise.id];
                const needs = lessonById(c.requires);
                return (
                  <li key={c.id}>
                    {open ? (
                      <a href={`#/auror/${c.id}`} data-testid={`case-${c.id}`}>
                        {rec ? "✅" : "📁"} {c.title}
                      </a>
                    ) : (
                      <span className="muted">🔒 {c.title}</span>
                    )}
                    {rec && <span className={`grade grade-${rec.grade}`}>{rec.grade}</span>}
                    {times[c.id] !== undefined && <span className="muted small"> ⏱ {clock(times[c.id])}</span>}
                    {!open && needs && (
                      <span className="muted small">
                        {" "}
                        · opens after Year {needs.year}: {needs.title}
                      </span>
                    )}
                    {open && c.leetcodeLike && <span className="muted small"> · like {c.leetcodeLike}</span>}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/** One case: the brief, the editor, an optional interview timer, and a complexity question once it's solved. */
export function AurorCaseView({ caseId }: { caseId: string }) {
  const c = aurorCaseById(caseId);
  const records = useGame((s) => s.exercises);
  if (!c || !isCaseUnlocked(c, records)) {
    return (
      <div className="card">
        <h2>🔒 This case file is sealed.</h2>
        <p>Finish the lessons it needs first.</p>
        <a href="#/auror">Back to the Auror Academy</a>
      </div>
    );
  }
  return <CaseScreen key={c.id} c={c} />;
}

function CaseScreen({ c }: { c: AurorCase }) {
  const { lesson, exercise } = c;
  const [code, setCode] = useState(() => useGame.getState().drafts[exercise.id] ?? exercise.starter);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [result, setResult] = useState<(Reward & { remarks: ReviewRemark[]; seconds: number | null; inTime: boolean }) | null>(null);
  const timer = useTimer();
  const pattern = AUROR_PATTERNS.find((p) => p.id === c.pattern)!;
  const next = pattern.cases.find((x) => x.id !== c.id && !isCaseSolved(x, useGame.getState().exercises) && isCaseUnlocked(x, useGame.getState().exercises));

  const solved = ({ reviewClean, remarks }: Solved) => {
    const game = useGame.getState();
    const r = game.completeExercise(exercise, lesson, reviewClean);
    const seconds = timer.stop();
    const inTime = seconds !== null && timer.limit !== null && seconds <= timer.limit * 60;
    if (seconds !== null) game.recordAurorTime(c.id, seconds);
    const records = useGame.getState().exercises;
    const earn = (id: string) => useGame.getState().awardBadge(id) && r.newBadges.push(id);
    earn("auror-recruit");
    if (inTime) earn("auror-under-time");
    if (pattern.cases.every((x) => isCaseSolved(x, records))) earn("auror-pattern");
    if (AUROR_CASES.every((x) => isCaseSolved(x, records))) earn("auror-graduate");
    const fx = useFx.getState();
    for (const id of r.newBadges) {
      const b = badgeById(id);
      if (b) fx.toast(`${b.icon} Badge earned: ${b.name}!`, "badge");
    }
    fx.play(r.grade === "O" ? "golden" : "sparkle");
    setResult({ ...r, remarks, seconds, inTime });
  };

  return (
    <div className="quest-grid">
      <div className="stack">
        <div className="card task">
          <p className="muted small">
            <a href="#/auror">🛡️ Auror Academy</a> · {pattern.icon} {pattern.title}
            {c.leetcodeLike && <> · like LeetCode's {c.leetcodeLike}</>}
          </p>
          <div className="row between">
            <h2>📁 {c.title}</h2>
            <span className="muted small">{exercise.xp} XP</span>
          </div>
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(exercise.task) }} />
          <InterviewTimer timer={timer} />
        </div>
        <CodeBoard lesson={lesson} exercise={exercise} onFeedback={setFeedback} onSolved={solved} code={code} setCode={setCode} />
        {result && <CaseClosed c={c} result={result} next={next} />}
      </div>
      <MentorPanel lesson={lesson} exercise={exercise} code={code} feedback={feedback} />
    </div>
  );
}

interface Timer {
  limit: number | null;
  left: number | null;
  start: (minutes: number) => void;
  /** Stops the clock and returns the seconds taken, or null if it wasn't running. */
  stop: () => number | null;
}

function useTimer(): Timer {
  const [limit, setLimit] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (startedAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  const elapsed = startedAt === null ? null : Math.floor((now - startedAt) / 1000);
  return {
    limit,
    left: limit === null || elapsed === null ? null : limit * 60 - elapsed,
    start: (minutes) => {
      setLimit(minutes);
      setStartedAt(Date.now());
      setNow(Date.now());
    },
    stop: () => {
      if (startedAt === null) return null;
      const taken = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      setStartedAt(null);
      return taken;
    },
  };
}

function InterviewTimer({ timer }: { timer: Timer }) {
  if (timer.left === null) {
    return (
      <div className="row interview-timer">
        <span className="muted small">⏱ Interview timer:</span>
        {TIMERS.map((m) => (
          <button key={m} className="btn ghost small" onClick={() => timer.start(m)} data-testid={`timer-${m}`}>
            {m} min
          </button>
        ))}
      </div>
    );
  }
  const over = timer.left < 0;
  return (
    <p className={`interview-timer ${over ? "over" : ""}`} data-testid="timer" role="timer">
      ⏱ {over ? `Time! +${clock(-timer.left)} - keep going, and talk through where you're stuck, as you would in a real interview.` : `${clock(timer.left)} left`}
    </p>
  );
}

function CaseClosed({
  c,
  result,
  next,
}: {
  c: AurorCase;
  result: Reward & { remarks: ReviewRemark[]; seconds: number | null; inTime: boolean };
  next?: AurorCase;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const quiz = c.complexity;
  return (
    <div className="card case-closed" data-testid="case-closed">
      <h3>
        🗂️ Case closed - <span className={`grade grade-${result.grade}`}>{result.grade}</span> {GRADE_NAME[result.grade]}
      </h3>
      <p className="small">
        {result.firstTime ? `✨ +${result.xp} XP · 🪙 +${result.galleons} Galleons` : "Already closed - no new rewards, but the practice counts."}
        {result.seconds !== null && (
          <>
            {" "}
            · ⏱ {clock(result.seconds)} {result.inTime ? "(inside the time)" : "(over time, but solved)"}
          </>
        )}
      </p>
      {result.remarks.length > 0 && (
        <div className="snape">
          <strong>🦇 Professor Snape glances at your spell...</strong>
          <ul>
            {result.remarks.map((r) => (
              <li key={r.id} dangerouslySetInnerHTML={{ __html: renderMarkdown(r.remark) }} />
            ))}
          </ul>
        </div>
      )}
      <div className="complexity" data-testid="complexity">
        <p>
          <strong>The interviewer leans forward:</strong> "{quiz.q}"
        </p>
        <div className="row wrap">
          {quiz.options.map((o, i) => (
            <button
              key={o}
              className={`btn small ${picked === null ? "" : i === quiz.answer ? "correct" : i === picked ? "wrong" : ""}`}
              disabled={picked !== null}
              onClick={() => setPicked(i)}
            >
              {o}
            </button>
          ))}
        </div>
        {picked !== null && (
          <p className="small" data-testid="complexity-why">
            {picked === quiz.answer ? "✅ Exactly." : `Not quite - it's ${quiz.options[quiz.answer]}.`} {quiz.why}
          </p>
        )}
      </div>
      <div className="row">
        {next && (
          <a className="btn primary" href={`#/auror/${next.id}`}>
            Next case: {next.title} →
          </a>
        )}
        <a className="btn ghost" href="#/auror">
          Back to the Academy
        </a>
      </div>
    </div>
  );
}
