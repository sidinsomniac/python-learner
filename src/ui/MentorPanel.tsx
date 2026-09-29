import { useState } from "react";
import { useGame } from "../engine/store";
import type { Quest } from "../engine/types";
import { MENTOR } from "../lore/lore";
import type { FeedbackItem } from "../mentor/feedback";
import { askMentor, mentorReady, MentorError, PROVIDER_LABEL, type ChatTurn } from "../mentor/llm";
import { contextBlock } from "../mentor/prompt";
import { renderMarkdown, renderUntrusted } from "./md";

const RUNGS: { key: keyof Quest["hints"]; label: string }[] = [
  { key: "nudge", label: "Nudge" },
  { key: "question", label: "Guiding question" },
  { key: "pseudocode", label: "Pseudocode" },
  { key: "flaw", label: "Flaw pointer" },
  { key: "analogous", label: "A similar (but different) spell" },
];

export function MentorPanel({ quest, code, feedback }: { quest: Quest; code: string; feedback: FeedbackItem[] }) {
  const unlocked = useGame((s) => s.hintsUnlocked[quest.id] ?? 0);
  const unlockHint = useGame((s) => s.unlockHint);
  const done = useGame((s) => Boolean(s.completed[quest.id]));

  return (
    <aside className="card mentor" aria-label="Professor Ashwood">
      <div className="mentor-head">
        <span className="portrait" aria-hidden>
          {MENTOR.portrait}
        </span>
        <div>
          <strong>{MENTOR.name}</strong>
          <div className="muted small">{MENTOR.title}</div>
        </div>
      </div>

      {feedback.length > 0 && (
        <div className="feedback" data-testid="feedback">
          {feedback.map((f, i) => (
            <div key={i} className={`fb ${f.tone}`}>
              <strong>{f.title}</strong>
              <p>{f.body}</p>
              {f.detail && <code className="small">{f.detail}</code>}
            </div>
          ))}
        </div>
      )}

      <div className="hints">
        <h3>Hint ladder</h3>
        <p className="muted small">
          Each of the first four hints lowers this quest's XP a little ({done ? "quest already complete" : "−15% each"}). Try
          thinking first!
        </p>
        {RUNGS.slice(0, unlocked).map((rung, i) => (
          <div key={rung.key} className="hint" data-testid={`hint-${i + 1}`}>
            <span className="hint-label">
              {i + 1}. {rung.label}
            </span>
            <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(quest.hints[rung.key]) }} />
          </div>
        ))}
        {unlocked < RUNGS.length && (
          <button className="btn" onClick={() => unlockHint(quest.id)} data-testid="unlock-hint">
            {unlocked === 0
              ? "I'm stuck. Give me a nudge"
              : unlocked < 4
                ? `Unlock hint ${unlocked + 1}: ${RUNGS[unlocked].label}`
                : "Still stuck? Show me a similar spell"}
          </button>
        )}
        {unlocked >= RUNGS.length && (
          <p className="muted small">
            That's every hint. The Professor will never write your answer. Try explaining your spell line by line to a
            rubber duck. 🦆
          </p>
        )}
      </div>

      <AskProfessor quest={quest} code={code} feedback={feedback} hintsUnlocked={unlocked} />
    </aside>
  );
}

function AskProfessor({
  quest,
  code,
  feedback,
  hintsUnlocked,
}: {
  quest: Quest;
  code: string;
  feedback: FeedbackItem[];
  hintsUnlocked: number;
}) {
  const settings = useGame((s) => s.mentor);
  const [turns, setTurns] = useState<{ shown: string; sent: string; role: ChatTurn["role"] }[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ready = mentorReady(settings);

  const send = async (question: string) => {
    if (!question.trim() || busy) return;
    const lastFeedback = feedback.map((f) => `${f.title}: ${f.body}`).join("\n");
    const sent = `${contextBlock({ quest, code, lastFeedback, hintsUnlocked })}\n\n[Student's question]\n${question.trim()}`;
    const next = [...turns, { role: "user" as const, shown: question.trim(), sent }];
    setTurns(next);
    setDraft("");
    setBusy(true);
    setError("");
    try {
      const reply = await askMentor(settings, next.map((t) => ({ role: t.role, content: t.sent })));
      setTurns([...next, { role: "assistant", shown: reply, sent: reply }]);
    } catch (err) {
      setError(err instanceof MentorError ? err.message : String(err));
      setTurns(turns);
      setDraft(question);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ask">
      <h3>🦉 Ask the Professor</h3>
      {!ready ? (
        <p className="muted small">
          The Professor's owl is out. To chat with her, add a <strong>Claude</strong> or <strong>DeepSeek</strong> API key in{" "}
          <a href="#/settings">Settings</a>. The hint ladder above always works, even without a key.
        </p>
      ) : (
        <>
          <p className="muted small">Powered by {PROVIDER_LABEL[settings.provider]}. She'll ask questions, not give answers.</p>
          <div className="chat">
            {turns.map((t, i) => (
              <div key={i} className={`bubble ${t.role}`}>
                {t.role === "assistant" ? (
                  <div className="prose" dangerouslySetInnerHTML={{ __html: renderUntrusted(t.shown) }} />
                ) : (
                  t.shown
                )}
              </div>
            ))}
            {busy && <div className="bubble assistant muted">The Professor is thinking... 🪶</div>}
          </div>
          {error && <p className="fb error small">{error}</p>}
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
          >
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask about your spell..." disabled={busy} />
            <button className="btn" disabled={busy || !draft.trim()}>
              Send
            </button>
          </form>
          {turns.length === 0 && (
            <button className="btn ghost small" onClick={() => send("I'm confused about my latest result. Can you help me think it through?")}>
              Help me understand my latest result
            </button>
          )}
        </>
      )}
    </div>
  );
}
