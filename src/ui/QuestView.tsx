import { useMemo, useState } from "react";
import { QUESTS, questById } from "../engine/content";
import { compareProphecy, isQuestUnlocked } from "../engine/progress";
import { useFx, useGame, type Reward } from "../engine/store";
import { QUEST_TYPE_LABEL, type Quest } from "../engine/types";
import { applyEggs } from "../lore/applyEggs";
import { badgeById } from "../lore/badges";
import { HOUSES, levelTitle } from "../lore/lore";
import { buildFeedback, type FeedbackItem } from "../mentor/feedback";
import { python } from "../runtime/pythonRunner";
import { renderMarkdown } from "./md";
import { MentorPanel } from "./MentorPanel";
import { CodeEditor, Console, InputsBox, Lesson, splitInputs, useRunner } from "./parts";
import { go } from "./router";

export function QuestView({ questId }: { questId: string }) {
  const quest = questById(questId);
  const completed = useGame((s) => s.completed);
  if (!quest) {
    return (
      <div className="card">
        <h2>This corridor doesn't exist.</h2>
        <a href="#/">Back to the Great Hall</a>
      </div>
    );
  }
  if (!completed[quest.id] && !isQuestUnlocked(quest, QUESTS, completed)) {
    return (
      <div className="card">
        <h2>🔒 This door is locked.</h2>
        <p>Finish the earlier quests first. (Alohomora won't help here!)</p>
        <a href="#/">Back to the Great Hall</a>
      </div>
    );
  }
  return <QuestScreen quest={quest} />;
}

function QuestScreen({ quest }: { quest: Quest }) {
  const done = useGame((s) => Boolean(s.completed[quest.id]));
  const [tab, setTab] = useState<"lesson" | "task">(done ? "task" : "lesson");
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [reward, setReward] = useState<Reward | null>(null);
  const [code, setCode] = useState(() => useGame.getState().drafts[quest.id] ?? quest.starter);
  const t = QUEST_TYPE_LABEL[quest.type];

  const finish = () => {
    const r = useGame.getState().completeQuest(quest);
    for (const id of r.newBadges) {
      const b = badgeById(id);
      if (b) useFx.getState().toast(`${b.icon} Badge earned: ${b.name}!`, "badge");
    }
    setReward(r);
  };

  return (
    <div className="quest">
      <div className="quest-top">
        <a href="#/" className="small">
          ← Great Hall
        </a>
        <h1>
          {t.icon} {quest.title}
        </h1>
        <p className="muted small">
          Year {quest.year} · {t.label} · {quest.concepts.join(", ")} · {quest.xp} XP
          {done && " · ✅ completed"}
        </p>
        {quest.intro && <p className="intro">{quest.intro}</p>}
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "lesson"} className={tab === "lesson" ? "active" : ""} onClick={() => setTab("lesson")}>
          📖 Lesson
        </button>
        <button role="tab" aria-selected={tab === "task"} className={tab === "task" ? "active" : ""} onClick={() => setTab("task")}>
          📜 Task
        </button>
      </div>

      {tab === "lesson" ? (
        <div className="card">
          <Lesson markdown={quest.lecture} />
          <button className="btn primary" onClick={() => setTab("task")}>
            I'm ready - show me the task →
          </button>
        </div>
      ) : (
        <div className="quest-grid">
          <div className="stack">
            <div className="card prose task" dangerouslySetInnerHTML={{ __html: renderMarkdown(quest.task) }} />
            {quest.type === "divination" ? (
              <DivinationBoard quest={quest} onFeedback={setFeedback} onSolved={finish} />
            ) : quest.type === "scramble" ? (
              <ScrambleBoard quest={quest} code={code} setCode={setCode} onFeedback={setFeedback} onSolved={finish} />
            ) : (
              <CodeBoard quest={quest} code={code} setCode={setCode} onFeedback={setFeedback} onSolved={finish} />
            )}
            {done && quest.spellbook && (
              <details className="card">
                <summary>📖 Your Spellbook page for this quest</summary>
                <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(quest.spellbook) }} />
              </details>
            )}
          </div>
          <MentorPanel quest={quest} code={quest.type === "divination" ? "" : code} feedback={feedback} />
        </div>
      )}

      {reward && <RewardModal quest={quest} reward={reward} onClose={() => setReward(null)} />}
    </div>
  );
}

interface BoardProps {
  quest: Quest;
  onFeedback: (f: FeedbackItem[]) => void;
  onSolved: () => void;
}

/** Shared "Cast" logic: grade with hidden tests, show feedback, maybe finish. */
function useCaster({ quest, onFeedback, onSolved }: BoardProps) {
  const runner = useRunner();
  const [casting, setCasting] = useState(false);

  const cast = async (code: string, inputs: string[]) => {
    setCasting(true);
    useGame.getState().recordAttempt(quest.id);
    try {
      const result = await python.grade(code, quest.tests, inputs);
      runner.setOutcome({ stdout: result.stdout, error: result.error, timedOut: result.timedOut });
      onFeedback(buildFeedback(result));
      applyEggs(result.stdout, code);
      if (!result.timedOut && !result.failure && result.total > 0) onSolved();
    } catch (err) {
      onFeedback([{ tone: "error", title: "Python isn't awake yet", body: `Wait a moment and try again. (${String(err)})` }]);
    } finally {
      setCasting(false);
    }
  };
  return { runner, casting, cast };
}

function CodeBoard(props: BoardProps & { code: string; setCode: (c: string) => void }) {
  const { quest, code, setCode } = props;
  const [inputs, setInputs] = useState(quest.inputs.join("\n"));
  const { runner, casting, cast } = useCaster(props);
  const saveDraft = useGame((s) => s.saveDraft);

  const change = (v: string) => {
    setCode(v);
    saveDraft(quest.id, v);
  };

  return (
    <div className="card wand">
      <div className="row between">
        <h3>🪄 Your wand</h3>
        <button
          className="btn ghost small"
          onClick={() => {
            if (confirm("Reset your spell to the starting code?")) change(quest.starter);
          }}
        >
          Reset
        </button>
      </div>
      <CodeEditor value={code} onChange={change} label="Quest code editor" />
      <InputsBox value={inputs} onChange={setInputs} />
      <div className="row">
        <button className="btn" onClick={() => runner.run(code, splitInputs(inputs))} disabled={runner.busy || casting} data-testid="run">
          ▶ Run
        </button>
        <button className="btn primary" onClick={() => cast(code, splitInputs(inputs))} disabled={runner.busy || casting} data-testid="cast">
          ✨ Cast (check my spell)
        </button>
      </div>
      <Console outcome={runner.outcome} busy={runner.busy || casting} />
    </div>
  );
}

function ScrambleBoard(props: BoardProps & { code: string; setCode: (c: string) => void }) {
  const { quest, code, setCode } = props;
  const saveDraft = useGame((s) => s.saveDraft);
  const lines = useMemo(() => code.replace(/\n$/, "").split("\n"), [code]);
  const { runner, casting, cast } = useCaster(props);

  const move = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= lines.length) return;
    const next = [...lines];
    [next[i], next[j]] = [next[j], next[i]];
    const joined = next.join("\n") + "\n";
    setCode(joined);
    saveDraft(quest.id, joined);
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
        <button className="btn" onClick={() => runner.run(code, [])} disabled={runner.busy || casting}>
          ▶ Run
        </button>
        <button className="btn primary" onClick={() => cast(code, [])} disabled={runner.busy || casting} data-testid="cast">
          ✨ Cast
        </button>
      </div>
      <Console outcome={runner.outcome} busy={runner.busy || casting} />
    </div>
  );
}

function DivinationBoard({ quest, onFeedback, onSolved }: BoardProps) {
  const [prophecy, setProphecy] = useState("");
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);

  const reveal = async () => {
    setBusy(true);
    useGame.getState().recordAttempt(quest.id);
    try {
      const actual = await python.run(quest.snippet ?? "", quest.inputs);
      const verdict = compareProphecy(prophecy, actual.stdout);
      if (verdict.correct) {
        setRevealed(actual.stdout);
        onFeedback([{ tone: "success", title: "Your inner eye sees true!", body: "Every line of your prophecy came to pass." }]);
        onSolved();
      } else if (verdict.predictedLineCount !== verdict.expectedLineCount) {
        onFeedback([{
          tone: "question",
          title: "The crystal ball is cloudy...",
          body: `Your prophecy has ${verdict.predictedLineCount} line(s). How many times does the spell call print? Each call makes one line.`,
        }]);
      } else {
        onFeedback([{
          tone: "question",
          title: `Line ${verdict.firstWrongLine} of your prophecy doesn't come true`,
          body: `Look at the print that makes output line ${verdict.firstWrongLine}. Say its calculation out loud: what *type* of value does it produce?`,
        }]);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card wand">
      <h3>🔮 The spell in the crystal ball</h3>
      <CodeEditor value={quest.snippet ?? ""} readOnly minHeight="120px" label="Code to predict" />
      <label className="inputs-box">
        <span className="small muted">Your prophecy - what will it print? (one line per output line)</span>
        <textarea
          value={prophecy}
          onChange={(e) => setProphecy(e.target.value)}
          rows={8}
          spellCheck={false}
          data-testid="prophecy"
        />
      </label>
      <button className="btn primary" onClick={reveal} disabled={busy || !prophecy.trim()} data-testid="reveal">
        🔮 Reveal the prophecy
      </button>
      {revealed !== null && <pre className="console">{revealed}</pre>}
    </div>
  );
}

function RewardModal({ quest, reward, onClose }: { quest: Quest; reward: Reward; onClose: () => void }) {
  const house = useGame((s) => HOUSES[s.house!]);
  const idx = QUESTS.findIndex((q) => q.id === quest.id);
  const next = QUESTS[idx + 1];
  const fresh = reward.xp > 0;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reward-title">
      <div className="card modal" data-testid="reward">
        <h2 id="reward-title">✨ Quest complete! ✨</h2>
        {quest.success && <p className="intro">{quest.success}</p>}
        {fresh ? (
          <ul className="rewards">
            <li>✨ +{reward.xp} XP</li>
            <li>🪙 +{reward.galleons} Galleons</li>
            <li>
              {house.crest} +{reward.housePoints} points to {house.name}!
            </li>
            <li>📖 A new page has appeared in your Spellbook</li>
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
          <p className="muted">You already completed this quest, so there are no new rewards. Practice makes perfect, though!</p>
        )}
        <div className="row">
          {next && (
            <button className="btn primary" onClick={() => go(`/quest/${next.id}`)}>
              Next quest: {next.title} →
            </button>
          )}
          <button className="btn" onClick={() => go("/")}>
            Great Hall
          </button>
          <button className="btn ghost" onClick={onClose}>
            Stay here
          </button>
        </div>
      </div>
    </div>
  );
}
