import { python as pythonLang } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../engine/store";
import { applyEggs } from "../lore/applyEggs";
import { translateError } from "../mentor/errorTranslator";
import { python } from "../runtime/pythonRunner";
import type { RunOutcome } from "../runtime/types";
import { splitLecture, type CheckpointSpec } from "../engine/lecture";
import { renderInline, renderMarkdown } from "./md";
import { Pensieve } from "./Pensieve";

const extensions = [pythonLang()];

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  minHeight = "220px",
  label,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  minHeight?: string;
  label: string;
}) {
  const theme = useGame((s) => s.theme);
  return (
    <div className="editor" aria-label={label}>
      <CodeMirror
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        editable={!readOnly}
        extensions={extensions}
        theme={theme === "light" ? "light" : "dark"}
        minHeight={minHeight}
        basicSetup={{ foldGutter: false, highlightActiveLine: !readOnly }}
      />
    </div>
  );
}

/** Output of a spell, like a terminal. */
export function Console({ outcome, busy }: { outcome: RunOutcome | null; busy?: boolean }) {
  if (busy) return <pre className="console muted">Casting... 🪄</pre>;
  if (!outcome) return <pre className="console muted">Press Run to see what your spell prints.</pre>;
  if (outcome.timedOut) {
    return (
      <pre className="console" data-testid="console">
        <span className="err">⏳ The spell ran for too long and was stopped. Is something looping forever?</span>
      </pre>
    );
  }
  const t = outcome.error ? translateError(outcome.error) : null;
  return (
    <pre className="console" data-testid="console">
      {outcome.stdout || (!outcome.error && <span className="muted">(The spell ran but printed nothing.)</span>)}
      {outcome.error && (
        <>
          {"\n"}
          <span className="err">
            {outcome.error.formatted}
            {outcome.error.line ? `  (line ${outcome.error.line})` : ""}
          </span>
          {"\n"}
          <span className="hint-line">
            🧙‍♀️ {t!.creature} {t!.question}
          </span>
        </>
      )}
    </pre>
  );
}

export function InputsBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="inputs-box">
      <span className="small muted">Answers for input(), one per line:</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} spellCheck={false} />
    </label>
  );
}

export const splitInputs = (text: string) => (text.trim() === "" ? [] : text.replace(/\r/g, "").split("\n"));

/** Run code, show the output and trigger easter eggs. */
export function useRunner() {
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async (code: string, inputs: string[]) => {
    setBusy(true);
    try {
      const result = await python.run(code, inputs);
      setOutcome(result);
      applyEggs(result.stdout, code);
      return result;
    } catch (err) {
      const failed: RunOutcome = {
        stdout: "",
        error: { type: "RuntimeError", message: String(err), line: null, formatted: `Python couldn't start: ${String(err)}` },
      };
      setOutcome(failed);
      return failed;
    } finally {
      setBusy(false);
    }
  };
  return { outcome, setOutcome, busy, run };
}

function Checkpoint({ spec }: { spec: CheckpointSpec }) {
  const [picked, setPicked] = useState<number | null>(null);
  const right = picked === spec.answer;
  return (
    <div className="checkpoint" data-testid="checkpoint">
      <div className="checkpoint-q">
        <span aria-hidden>❓</span> <span dangerouslySetInnerHTML={{ __html: renderInline(spec.q) }} />
      </div>
      <div className="row">
        {spec.options.map((option, i) => (
          <button
            key={i}
            className={`btn small ${picked === i ? (right ? "picked-right" : "picked-wrong") : ""}`}
            onClick={() => setPicked(i)}
            disabled={right}
            dangerouslySetInnerHTML={{ __html: renderInline(option) }}
          />
        ))}
      </div>
      {picked !== null && (
        <p className={`small ${right ? "ok-text" : "bad-text"}`}>
          {right ? "✔ Correct! " : "✘ Not quite. Have another think. "}
          {right && <span dangerouslySetInnerHTML={{ __html: renderInline(spec.why) }} />}
        </p>
      )}
    </div>
  );
}

/** A lesson: Markdown with "Try it" buttons and checkpoints, plus a sandbox. */
export function Lesson({ markdown }: { markdown: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState("# Try things out here! Press Run.\nprint(\"Lumos\")\n");
  const [inputs, setInputs] = useState("");
  const runner = useRunner();
  const [pensieve, setPensieve] = useState<{ code: string; inputs: string[] } | null>(null);
  const sandboxRef = useRef<HTMLDivElement>(null);
  const segments = useMemo(() => splitLecture(markdown), [markdown]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll(".lecture-md pre > code").forEach((block) => {
      const pre = block.parentElement!;
      if (pre.querySelector(".try-btn")) return;
      const btn = document.createElement("button");
      btn.className = "btn small try-btn";
      btn.textContent = "Try it ▶";
      btn.onclick = () => {
        setCode(block.textContent ?? "");
        runner.setOutcome(null);
        sandboxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      };
      pre.appendChild(btn);
    });
  }, [segments]);

  return (
    <div className="lesson" ref={ref}>
      {segments.map((seg, i) =>
        seg.kind === "md" ? (
          <div key={i} className="prose lecture-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(seg.text) }} />
        ) : (
          <Checkpoint key={i} spec={seg.spec} />
        ),
      )}
      <div ref={sandboxRef} className="sandbox">
        <h3>🧪 Practice sandbox</h3>
        <p className="muted small">Experiment freely here. It won't affect your exercises.</p>
        <CodeEditor value={code} onChange={setCode} minHeight="120px" label="Sandbox editor" />
        <InputsBox value={inputs} onChange={setInputs} />
        <div className="row">
          <button className="btn" onClick={() => runner.run(code, splitInputs(inputs))} disabled={runner.busy}>
            ▶ Run
          </button>
          <button className="btn" onClick={() => setPensieve({ code, inputs: splitInputs(inputs) })} disabled={runner.busy}>
            🌀 Pensieve
          </button>
        </div>
        <Console outcome={runner.outcome} busy={runner.busy} />
      </div>
      {pensieve && <Pensieve code={pensieve.code} inputs={pensieve.inputs} onClose={() => setPensieve(null)} />}
    </div>
  );
}
