import { python as pythonLang } from "@codemirror/lang-python";
import CodeMirror, { Decoration, EditorView } from "@uiw/react-codemirror";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../engine/store";
import { itemById } from "../lore/shop";
import { applyEggs } from "../lore/applyEggs";
import { translateError } from "../mentor/errorTranslator";
import { python } from "../runtime/pythonRunner";
import type { DeskFiles, RunOutcome } from "../runtime/types";
import { splitLecture, type CheckpointSpec } from "../engine/lecture";
import { renderInline, renderMarkdown } from "./md";
import { Pensieve } from "./Pensieve";
import { usePrefersReducedMotion } from "./Ambience";
import { useWandFx } from "./wand/WandOverlay";
import { editorBackground, editorTheme as buildEditorTheme, isLightEditor } from "./editorThemes";

const extensions = [pythonLang()];

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  minHeight = "220px",
  label,
  wandOverride,
  themeOverride,
  errorLine,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  minHeight?: string;
  label: string;
  /** Use this wand's effect instead of the equipped one (Ollivanders' try-out). */
  wandOverride?: string;
  /** Use this editor theme instead of the equipped one (the shop's preview). */
  themeOverride?: string;
  /** The line the last run failed on. With the half-Kneazle equipped, it sits on that line. */
  errorLine?: number | null;
}) {
  const theme = useGame((s) => s.theme);
  const equippedTheme = useGame((s) => (s.equipped.editor ? itemById(s.equipped.editor)?.value : undefined));
  const editorTheme = themeOverride ?? equippedTheme;
  const house = useGame((s) => s.house);
  const coded = useMemo(() => buildEditorTheme(editorTheme, house), [editorTheme, house]);
  const lightInk = theme === "light" || isLightEditor(editorTheme);
  const wandEffect = useGame((s) => {
    const id = wandOverride ?? s.equipped.wand;
    return s.wandFx && id ? itemById(id)?.effect : undefined;
  });
  const reducedMotion = usePrefersReducedMotion();
  const wand = useWandFx(!readOnly && !reducedMotion && wandEffect ? wandEffect : null, lightInk);
  const kneazle = useGame((s) => s.equipped.familiar === "fam-cat");
  const kneazleLine = kneazle && errorLine ? errorLine : null;
  const allExtensions = useMemo(
    () => [...extensions, wand.extension, ...(kneazleLine ? [kneazleMarker(kneazleLine)] : [])],
    [wand.extension, kneazleLine],
  );
  return (
    <div className="editor-wrap">
      <div
        className={`editor ${editorTheme ? `editor-${editorTheme}` : ""} ${coded ? "editor-coded" : ""}`}
        style={coded ? { background: editorBackground(editorTheme, house) } : undefined}
        aria-label={label}
        data-editor-theme={editorTheme ?? "default"}
      >
        <CodeMirror
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          editable={!readOnly}
          extensions={allExtensions}
          theme={coded ?? (theme === "light" ? "light" : "dark")}
          minHeight={minHeight}
          basicSetup={{ foldGutter: false, highlightActiveLine: !readOnly }}
        />
      </div>
      {wand.overlay}
    </div>
  );
}

/** The half-Kneazle's perk: a cat sitting on the line where the last run failed. Where, never what. */
function kneazleMarker(line: number) {
  return EditorView.decorations.of((view) => {
    if (line < 1 || line > view.state.doc.lines) return Decoration.none;
    return Decoration.set([Decoration.line({ class: "cm-kneazle-line" }).range(view.state.doc.line(line).from)]);
  });
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
  const run = async (code: string, inputs: string[], files: DeskFiles = {}) => {
    setBusy(true);
    try {
      const result = await python.run(code, inputs, files);
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

/** The files lying on the desk (the spell's working folder), shown so the learner can read them. */
export function DeskFilesPanel({ files }: { files: DeskFiles }) {
  const names = Object.keys(files);
  if (names.length === 0) return null;
  return (
    <details className="desk-files" data-testid="desk-files">
      <summary>
        📂 On the desk: <code>{names.join(", ")}</code>
      </summary>
      {names.map((name) => (
        <div key={name}>
          <p className="small muted">
            <code>{name}</code>
          </p>
          <pre className="console">{files[name] || " "}</pre>
        </div>
      ))}
    </details>
  );
}

/** A lesson: Markdown with "Try it" buttons and checkpoints, plus a sandbox. */
export function Lesson({ markdown, files = {} }: { markdown: string; files?: DeskFiles }) {
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
        <DeskFilesPanel files={files} />
        <CodeEditor value={code} onChange={setCode} minHeight="120px" label="Sandbox editor" />
        <InputsBox value={inputs} onChange={setInputs} />
        <div className="row">
          <button className="btn" onClick={() => runner.run(code, splitInputs(inputs), files)} disabled={runner.busy}>
            ▶ Run
          </button>
          <button className="btn" onClick={() => setPensieve({ code, inputs: splitInputs(inputs) })} disabled={runner.busy}>
            🌀 Pensieve
          </button>
        </div>
        <Console outcome={runner.outcome} busy={runner.busy} />
      </div>
      {pensieve && <Pensieve code={pensieve.code} inputs={pensieve.inputs} files={files} onClose={() => setPensieve(null)} />}
    </div>
  );
}
