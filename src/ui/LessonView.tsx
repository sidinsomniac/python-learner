import { useEffect, useMemo, useState } from "react";
import { displayNumber, LESSONS, lessonById, YEARS } from "../engine/content";
import {
  canSkip,
  compareProphecy,
  GRADE_NAME,
  isExerciseUnlocked,
  isLessonComplete,
  isLessonUnlocked,
  lessonGrade,
  reviewRulesFor,
} from "../engine/progress";
import { useFx, useGame, type Reward } from "../engine/store";
import { isRequired, TIER_LABEL, TYPE_LABEL, type Exercise, type Lesson } from "../engine/types";
import { applyEggs } from "../lore/applyEggs";
import { badgeById } from "../lore/badges";
import { HOUSES, levelTitle } from "../lore/lore";
import { buildFeedback, type FeedbackItem } from "../mentor/feedback";
import { python } from "../runtime/pythonRunner";
import type { ReviewRemark } from "../runtime/types";
import { Cutscene } from "./Cutscene";
import { renderMarkdown } from "./md";
import { MentorPanel } from "./MentorPanel";
import { CodeEditor, Console, InputsBox, Lesson as Lecture, splitInputs, useRunner } from "./parts";
import { Pensieve } from "./Pensieve";
import { SkipDialog } from "./SkipDialog";
import { go } from "./router";

const FAMILIAR_CHEERS = ["Hoo-hoo! Well cast!", "*happy squeak*", "Purrfect spell!", "Nicely done!", "*excited flapping*", "Brilliant!"];

export function LessonView({ lessonId }: { lessonId: string }) {
  const lesson = lessonById(lessonId);
  const records = useGame((s) => s.exercises);
  const skipped = useGame((s) => s.skipped);
  if (!lesson) {
    return (
      <div className="card">
        <h2>This corridor doesn't exist.</h2>
        <a href="#/">Back to the Great Hall</a>
      </div>
    );
  }
  const started = lesson.exercises.some((e) => records[e.id]);
  if (!started && !isLessonUnlocked(lesson, YEARS, records, skipped)) {
    return (
      <div className="card">
        <h2>🔒 This door is locked.</h2>
        <p>Finish the earlier lessons first. (Alohomora won't help here!)</p>
        <a href="#/">Back to the Great Hall</a>
      </div>
    );
  }
  return <LessonScreen key={lesson.id} lesson={lesson} />;
}

type Tab = "lesson" | string;

function firstOpenExercise(lesson: Lesson, records: Record<string, unknown>): Exercise | undefined {
  return lesson.exercises.find((e) => isRequired(e) && !records[e.id]);
}

function LessonScreen({ lesson }: { lesson: Lesson }) {
  const records = useGame((s) => s.exercises);
  const skipped = useGame((s) => s.skipped);
  const [skipping, setSkipping] = useState(false);
  const [tab, setTab] = useState<Tab>(() => {
    const started = lesson.exercises.some((e) => records[e.id]);
    return started ? (firstOpenExercise(lesson, records)?.id ?? "lesson") : "lesson";
  });
  const complete = isLessonComplete(lesson, records);
  const grade = lessonGrade(lesson, records);
  const next = LESSONS[LESSONS.findIndex((l) => l.id === lesson.id) + 1];
  const exercise = lesson.exercises.find((e) => e.id === tab);

  // The opening scene pops up even when the lesson reopens on an exercise tab.
  useEffect(() => {
    useFx.getState().queueScene({ id: lesson.id, lines: lesson.scene });
  }, [lesson]);

  return (
    <div className="quest">
      <div className="quest-top">
        <a href="#/" className="small">
          ← Great Hall
        </a>
        <h1>
          <span className="lesson-no">{displayNumber(lesson)}</span> {lesson.title}
          {lesson.part && <span className="muted small"> (Part {lesson.part.n} of {lesson.part.of})</span>}
        </h1>
        <p className="muted small">
          📍 {lesson.location} · {lesson.concepts.join(", ")}
          {grade && (
            <>
              {" · "}
              <span className={`grade grade-${grade}`} title={GRADE_NAME[grade]}>
                {grade}
              </span>
            </>
          )}
        </p>
        {skipped[lesson.id] && !complete && (
          <p className="fb info small">👻 You skipped this lesson with Peeves' Bargain. Finish it any time to earn its clue, grade and Spellbook page.</p>
        )}
        {canSkip(lesson, YEARS, records, skipped) && (
          <button className="btn ghost small" onClick={() => setSkipping(true)} data-testid="skip-lesson">
            👻 Skip this lesson (Peeves' Bargain)
          </button>
        )}
        {skipping && <SkipDialog lesson={lesson} onClose={() => setSkipping(false)} />}
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "lesson"} className={tab === "lesson" ? "active" : ""} onClick={() => setTab("lesson")}>
          📖 {lesson.kind === "trial" ? "Briefing" : lesson.kind === "revision" ? "Revision" : "Lesson"}
        </button>
        {lesson.exercises.map((e) => {
          const open = isExerciseUnlocked(e, lesson, records);
          const t = TIER_LABEL[e.tier];
          const rec = records[e.id];
          return (
            <button
              key={e.id}
              role="tab"
              aria-selected={tab === e.id}
              className={`${tab === e.id ? "active" : ""} ${open ? "" : "locked-tab"}`}
              disabled={!open}
              onClick={() => setTab(e.id)}
              data-testid={`tab-${e.slot}`}
              title={open ? e.title : "Finish the earlier exercises first"}
            >
              {open ? t.icon : "🔒"} {e.tier === "stage" || e.tier === "review" ? e.title : t.label}
              {rec && <span className={`grade grade-${rec.grade}`}>{rec.grade}</span>}
            </button>
          );
        })}
      </div>

      {tab === "lesson" || !exercise ? (
        <div className="stack">
          <Cutscene id={lesson.id} lines={lesson.scene} />
          <div className="card">
            <Lecture markdown={lesson.lecture} />
            {lesson.exercises[0] && (
              <button className="btn primary" onClick={() => setTab(firstOpenExercise(lesson, records)?.id ?? lesson.exercises[0].id)}>
                {complete ? "Back to the exercises →" : "I'm ready - to the exercises →"}
              </button>
            )}
          </div>
          {complete && <LessonComplete lesson={lesson} next={next} />}
        </div>
      ) : (
        <ExerciseScreen
          key={exercise.id}
          lesson={lesson}
          exercise={exercise}
          onGoTo={(target) => setTab(target)}
          next={next}
        />
      )}
    </div>
  );
}

function LessonComplete({ lesson, next }: { lesson: Lesson; next?: Lesson }) {
  const records = useGame((s) => s.exercises);
  const outstanding = lesson.exercises.find((e) => e.tier === "outstanding");
  return (
    <div className="stack">
      {lesson.clue && (
        <div className="card clue" data-testid="clue">
          <strong>🔍 Clue discovered</strong>
          <p dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.clue) }} />
        </div>
      )}
      <Cutscene id={`${lesson.id}:outro`} lines={lesson.outro} />
      {lesson.spellbook && (
        <details className="card">
          <summary>📖 Your Spellbook page for this lesson</summary>
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.spellbook) }} />
        </details>
      )}
      <div className="row">
        {next && (
          <button className="btn primary" onClick={() => go(`/lesson/${next.id}`)}>
            Next: {displayNumber(next)} {next.title} →
          </button>
        )}
        {outstanding && !records[outstanding.id] && <span className="muted small">⭐ The Outstanding challenge is still waiting, if you dare.</span>}
      </div>
    </div>
  );
}

interface Solved {
  reviewClean: boolean;
  remarks: ReviewRemark[];
}

function ExerciseScreen({
  lesson,
  exercise,
  onGoTo,
  next,
}: {
  lesson: Lesson;
  exercise: Exercise;
  onGoTo: (tab: Tab) => void;
  next?: Lesson;
}) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [code, setCode] = useState(() => useGame.getState().drafts[exercise.id] ?? exercise.starter);
  const [reward, setReward] = useState<(Reward & { remarks: ReviewRemark[] }) | null>(null);
  const t = TYPE_LABEL[exercise.type];

  const solved = ({ reviewClean, remarks }: Solved) => {
    const r = useGame.getState().completeExercise(exercise, lesson, reviewClean);
    const fx = useFx.getState();
    for (const id of r.newBadges) {
      const b = badgeById(id);
      if (b) fx.toast(`${b.icon} Badge earned: ${b.name}!`, "badge");
    }
    if (r.lessonCompleted && lesson.kind === "trial") fx.play("dawn");
    else if (r.grade === "O" && (r.firstTime || r.gradeImproved)) fx.play("golden");
    else if (!r.levelUp) fx.play("sparkle");
    fx.cheer(FAMILIAR_CHEERS[Math.floor(Math.random() * FAMILIAR_CHEERS.length)]);
    setReward({ ...r, remarks });
  };

  const board = { lesson, exercise, onFeedback: setFeedback, onSolved: solved };
  const record = useGame((s) => s.exercises[exercise.id]);
  const sand = useGame((s) => s.aids.sand ?? 0);
  const pourSand = () => {
    const r = useGame.getState().pourSand(exercise.id);
    useFx.getState().toast(r.ok ? "⏳ The sand runs backwards... this exercise's hints and attempts are reset. Earn that O!" : r.reason);
  };

  return (
    <div className="quest-grid">
      <div className="stack">
        {exercise.intro && <p className="intro">{exercise.intro}</p>}
        <div className="card task">
          <div className="row between">
            <h2>
              {TIER_LABEL[exercise.tier].icon} {exercise.title}
            </h2>
            <span className="muted small">
              {t.icon} {t.label} · {exercise.xp} XP
            </span>
          </div>
          {exercise.twist && <p className="twist small">🔀 Twist: {exercise.twist}</p>}
          {record && record.grade !== "O" && sand > 0 && (
            <button className="btn ghost small" onClick={pourSand} data-testid="pour-sand">
              ⏳ Use Time-Turner sand ({sand}) to replay for a better grade
            </button>
          )}
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(exercise.task) }} />
        </div>
        {exercise.type === "divination" ? (
          <DivinationBoard {...board} />
        ) : exercise.type === "scramble" ? (
          <ScrambleBoard {...board} code={code} setCode={setCode} />
        ) : (
          <CodeBoard {...board} code={code} setCode={setCode} />
        )}
      </div>
      <MentorPanel lesson={lesson} exercise={exercise} code={exercise.type === "divination" ? "" : code} feedback={feedback} />
      {reward && (
        <RewardModal
          lesson={lesson}
          exercise={exercise}
          reward={reward}
          next={next}
          onGoTo={onGoTo}
          onClose={() => setReward(null)}
        />
      )}
    </div>
  );
}

interface BoardProps {
  lesson: Lesson;
  exercise: Exercise;
  onFeedback: (f: FeedbackItem[]) => void;
  onSolved: (s: Solved) => void;
}

/** Shared "Cast" logic: grade with hidden tests, show feedback, maybe finish. */
function useCaster({ lesson, exercise, onFeedback, onSolved }: BoardProps) {
  const runner = useRunner();
  const [casting, setCasting] = useState(false);

  const cast = async (code: string, inputs: string[]) => {
    setCasting(true);
    useGame.getState().recordAttempt(exercise.id);
    try {
      const result = await python.grade(code, exercise.tests, inputs, reviewRulesFor(lesson.id));
      runner.setOutcome({ stdout: result.stdout, error: result.error, timedOut: result.timedOut });
      onFeedback(buildFeedback(result));
      applyEggs(result.stdout, code);
      if (!result.timedOut && !result.failure && result.total > 0) {
        onSolved({ reviewClean: result.review.length === 0, remarks: result.review });
      }
    } catch (err) {
      onFeedback([{ tone: "error", title: "Python isn't awake yet", body: `Wait a moment and try again. (${String(err)})` }]);
    } finally {
      setCasting(false);
    }
  };
  return { runner, casting, cast };
}

function CodeBoard(props: BoardProps & { code: string; setCode: (c: string) => void }) {
  const { exercise, code, setCode } = props;
  const [inputs, setInputs] = useState(exercise.inputs.join("\n"));
  const [pensieve, setPensieve] = useState<{ code: string; inputs: string[] } | null>(null);
  const { runner, casting, cast } = useCaster(props);
  const saveDraft = useGame((s) => s.saveDraft);

  const change = (v: string) => {
    setCode(v);
    saveDraft(exercise.id, v);
  };
  const busy = runner.busy || casting;

  return (
    <div className="card wand">
      <div className="row between">
        <h3>🪄 Your wand</h3>
        <button
          className="btn ghost small"
          onClick={() => {
            if (confirm("Reset your spell to the starting code?")) change(exercise.starter);
          }}
        >
          Reset
        </button>
      </div>
      <CodeEditor value={code} onChange={change} label="Quest code editor" />
      <InputsBox value={inputs} onChange={setInputs} />
      <div className="row">
        <button className="btn" onClick={() => runner.run(code, splitInputs(inputs))} disabled={busy} data-testid="run">
          ▶ Run
        </button>
        <button className="btn" onClick={() => setPensieve({ code, inputs: splitInputs(inputs) })} disabled={busy} data-testid="pensieve-open">
          🌀 Pensieve
        </button>
        <button className="btn primary" onClick={() => cast(code, splitInputs(inputs))} disabled={busy} data-testid="cast">
          ✨ Cast (check my spell)
        </button>
      </div>
      <Console outcome={runner.outcome} busy={busy} />
      {pensieve && <Pensieve code={pensieve.code} inputs={pensieve.inputs} onClose={() => setPensieve(null)} />}
    </div>
  );
}

function ScrambleBoard(props: BoardProps & { code: string; setCode: (c: string) => void }) {
  const { exercise, code, setCode } = props;
  const saveDraft = useGame((s) => s.saveDraft);
  const lines = useMemo(() => code.replace(/\n$/, "").split("\n"), [code]);
  const [pensieve, setPensieve] = useState<string | null>(null);
  const { runner, casting, cast } = useCaster(props);

  const move = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= lines.length) return;
    const next = [...lines];
    [next[i], next[j]] = [next[j], next[i]];
    const joined = next.join("\n") + "\n";
    setCode(joined);
    saveDraft(exercise.id, joined);
  };

  return (
    <div className="card wand">
      <h3>📜 The scrambled scroll</h3>
      <ol className="scramble" data-testid="scramble">
        {lines.map((line, i) => (
          <li key={`${line}-${i}`}>
            <code>{line}</code>
            <span className="row">
              <button className="btn small" aria-label={`Move line ${i + 1} up`} onClick={() => move(i, -1)} disabled={i === 0}>
                ▲
              </button>
              <button
                className="btn small"
                aria-label={`Move line ${i + 1} down`}
                onClick={() => move(i, 1)}
                disabled={i === lines.length - 1}
              >
                ▼
              </button>
            </span>
          </li>
        ))}
      </ol>
      <div className="row">
        <button className="btn" onClick={() => runner.run(code, exercise.inputs)} disabled={runner.busy || casting}>
          ▶ Run
        </button>
        <button className="btn" onClick={() => setPensieve(code)} disabled={runner.busy || casting}>
          🌀 Pensieve
        </button>
        <button className="btn primary" onClick={() => cast(code, exercise.inputs)} disabled={runner.busy || casting} data-testid="cast">
          ✨ Cast
        </button>
      </div>
      <Console outcome={runner.outcome} busy={runner.busy || casting} />
      {pensieve !== null && <Pensieve code={pensieve} inputs={exercise.inputs} onClose={() => setPensieve(null)} />}
    </div>
  );
}

function DivinationBoard({ exercise, onFeedback, onSolved }: BoardProps) {
  const [prophecy, setProphecy] = useState("");
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);

  const reveal = async () => {
    setBusy(true);
    useGame.getState().recordAttempt(exercise.id);
    try {
      const actual = await python.run(exercise.snippet ?? "", exercise.inputs);
      const verdict = compareProphecy(prophecy, actual.stdout);
      if (verdict.correct) {
        setRevealed(actual.stdout);
        onFeedback([{ tone: "success", title: "Your inner eye sees true!", body: "Every line of your prophecy came to pass." }]);
        onSolved({ reviewClean: true, remarks: [] });
      } else if (verdict.predictedLineCount !== verdict.expectedLineCount) {
        onFeedback([
          {
            tone: "question",
            title: "The crystal ball is cloudy...",
            body: `Your prophecy has ${verdict.predictedLineCount} line(s). How many lines will the spell print? Count the prints, and check whether any print shows more than one line.`,
          },
        ]);
      } else {
        onFeedback([
          {
            tone: "question",
            title: `Line ${verdict.firstWrongLine} of your prophecy doesn't come true`,
            body: `Find the code that produces output line ${verdict.firstWrongLine}. Work it out step by step: what *type* of value does it produce, and exactly how is it written?`,
          },
        ]);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card wand">
      <h3>🔮 The spell in the crystal ball</h3>
      <CodeEditor value={exercise.snippet ?? ""} readOnly minHeight="120px" label="Code to predict" />
      <label className="inputs-box">
        <span className="small muted">
          Your prophecy - what will it print? (one line per output line)
          {exercise.inputs.length > 0 && ` The spell will be given these answers to input(): ${exercise.inputs.join(", ")}`}
        </span>
        <textarea value={prophecy} onChange={(e) => setProphecy(e.target.value)} rows={8} spellCheck={false} data-testid="prophecy" />
      </label>
      <button className="btn primary" onClick={reveal} disabled={busy || !prophecy.trim()} data-testid="reveal">
        🔮 Reveal the prophecy
      </button>
      {revealed !== null && <pre className="console">{revealed}</pre>}
    </div>
  );
}

function RewardModal({
  lesson,
  exercise,
  reward,
  next,
  onGoTo,
  onClose,
}: {
  lesson: Lesson;
  exercise: Exercise;
  reward: Reward & { remarks: ReviewRemark[] };
  next?: Lesson;
  onGoTo: (tab: Tab) => void;
  onClose: () => void;
}) {
  const house = useGame((s) => HOUSES[s.house!]);
  const records = useGame((s) => s.exercises);
  // Once the reward is dismissed (however that happens), tell the rest of the story.
  useEffect(() => {
    return () => {
      if (reward.lessonCompleted) {
        useFx.getState().queueScene({ id: `${lesson.id}:outro`, lines: lesson.outro, title: `${lesson.title}: what happened next` });
      }
    };
  }, [reward.lessonCompleted, lesson]);
  const nextExercise = lesson.exercises.find((e) => e.id !== exercise.id && !records[e.id] && isExerciseUnlocked(e, lesson, records));
  const lessonDone = isLessonComplete(lesson, records);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reward-title">
      <div className="card modal" data-testid="reward">
        <h2 id="reward-title">✨ {exercise.tier === "stage" ? "Stage complete!" : "Spell mastered!"} ✨</h2>
        <div className={`big-grade grade-${reward.grade}`} title={GRADE_NAME[reward.grade]}>
          {reward.grade}
          <span>{GRADE_NAME[reward.grade]}</span>
        </div>
        {reward.firstTime ? (
          <ul className="rewards">
            <li>✨ +{reward.xp} XP</li>
            <li>🪙 +{reward.galleons} Galleons</li>
            <li>
              {house.crest} +{reward.housePoints} points to {house.name}!
            </li>
            {reward.levelUp && (
              <li className="levelup">
                🎉 Level up! You are now level {reward.levelUp}: {levelTitle(reward.levelUp)}
              </li>
            )}
            {reward.newBadges.map((id) => {
              const b = badgeById(id)!;
              return (
                <li key={id}>
                  {b.icon} Badge: <strong>{b.name}</strong>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted">
            {reward.gradeImproved ? `Grade improved to ${GRADE_NAME[reward.grade]}!` : "Already mastered - no new rewards, but practice makes perfect."}
          </p>
        )}

        {reward.remarks.length > 0 && (
          <div className="snape" data-testid="snape-review">
            <strong>🦇 Professor Snape glances at your spell...</strong>
            <ul>
              {reward.remarks.map((r) => (
                <li key={r.id} dangerouslySetInnerHTML={{ __html: renderMarkdown(r.remark) }} />
              ))}
            </ul>
            <p className="small muted">Fix {reward.remarks.length === 1 ? "this" : "these"} and cast again to raise your grade to O.</p>
          </div>
        )}

        {reward.clue && (
          <div className="clue small">
            <strong>🔍 Clue discovered:</strong> <span dangerouslySetInnerHTML={{ __html: renderMarkdown(reward.clue) }} />
          </div>
        )}

        <div className="row">
          {nextExercise ? (
            <button className="btn primary" onClick={() => { onClose(); onGoTo(nextExercise.id); }}>
              Next: {TIER_LABEL[nextExercise.tier].icon} {nextExercise.title} →
            </button>
          ) : lessonDone && next ? (
            <button className="btn primary" onClick={() => go(`/lesson/${next.id}`)}>
              Next lesson: {next.title} →
            </button>
          ) : null}
          {lessonDone && (
            <button className="btn" onClick={() => { onClose(); onGoTo("lesson"); }}>
              Lesson summary
            </button>
          )}
          <button className="btn ghost" onClick={onClose}>
            Stay here
          </button>
        </div>
      </div>
    </div>
  );
}
