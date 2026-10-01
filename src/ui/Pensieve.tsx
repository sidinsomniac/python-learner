import { useEffect, useState } from "react";
import { grantBadge } from "../lore/applyEggs";
import { python } from "../runtime/pythonRunner";
import { stackFrames } from "../engine/pensieve";
import type { DeskFiles, TraceOutcome, TraceStep } from "../runtime/types";

const NO_FILES: DeskFiles = {};

function describe(step: TraceStep, index: number, total: number) {
  if (step.line === null) return "The spell has finished. Here is everything it remembered.";
  if (step.event === "return") return `Step ${index + 1} of ${total}: ${step.scope}() hands back ${step.value} from line ${step.line}.`;
  return `Step ${index + 1} of ${total}: about to run line ${step.line}${step.scope !== "main" ? ` inside ${step.scope}()` : ""}.`;
}

/** Replay a spell line by line, watching the variables and the call stack change. */
export function Pensieve({
  code,
  inputs,
  files = NO_FILES,
  onClose,
}: {
  code: string;
  inputs: string[];
  files?: DeskFiles;
  onClose: () => void;
}) {
  const [trace, setTrace] = useState<TraceOutcome | null>(null);
  const [failed, setFailed] = useState("");
  const [step, setStep] = useState(0);

  const filesKey = JSON.stringify(files);
  useEffect(() => {
    let alive = true;
    python
      .trace(code, inputs, JSON.parse(filesKey) as DeskFiles)
      .then((t) => {
        if (!alive) return;
        setTrace(t);
        setStep(0);
        grantBadge("pensieve");
      })
      .catch((err) => alive && setFailed(String(err)));
    return () => {
      alive = false;
    };
  }, [code, inputs, filesKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (!trace) return;
      if (e.key === "ArrowRight") setStep((s) => Math.min(trace.steps.length - 1, s + 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(0, s - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [trace, onClose]);

  const lines = code.replace(/\n$/, "").split("\n");
  const current = trace?.steps[step];
  const previous = trace && step > 0 ? trace.steps[step - 1] : null;
  const last = trace ? trace.steps.length - 1 : 0;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="The Pensieve">
      <div className="card modal pensieve" data-testid="pensieve">
        <div className="row between">
          <h2>🌀 The Pensieve</h2>
          <button className="btn ghost small" onClick={onClose} aria-label="Close the Pensieve">
            ✕
          </button>
        </div>
        {!trace && !failed && <p className="muted">Swirling the memory...</p>}
        {failed && <p className="fb error">The memory is too cloudy: {failed}</p>}
        {trace?.timedOut && <p className="fb error">This spell ran for too long to replay. Is something looping forever?</p>}
        {trace && current && (
          <>
            <p className="muted small">
              {describe(current, step, trace.steps.length)}
              {trace.truncated && " (Only the first 1,500 steps were recorded.)"}
            </p>
            <div className="pensieve-grid">
              <ol className="pensieve-code">
                {lines.map((text, i) => (
                  <li key={i} className={current.line === i + 1 ? (current.event === "return" ? "here returning" : "here") : ""}>
                    <code>{text || " "}</code>
                  </li>
                ))}
              </ol>
              <div>
                <h3>Variables</h3>
                {Object.keys(current.vars).length === 0 ? (
                  <p className="muted small">No variables yet.</p>
                ) : (
                  <table className="vars">
                    <tbody>
                      {Object.entries(current.vars).map(([name, value]) => (
                        <tr key={name} className={previous && previous.vars[name] !== value ? "changed" : ""}>
                          <th>{name}</th>
                          <td>
                            <code>{value}</code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {current.stack.length > 1 && (
                  <>
                    <h3>
                      Call stack <span className="muted small">({current.stack.length - 1} spell{current.stack.length > 2 ? "s" : ""} deep)</span>
                    </h3>
                    <ol className="call-stack" data-testid="call-stack">
                      {stackFrames(current.stack).map((frame, i) =>
                        frame.folded ? (
                          <li key={i} className="folded muted small">
                            ... {frame.folded} more frames ...
                          </li>
                        ) : (
                          <li key={i} className={i === 0 ? "top" : ""}>
                            <code>{frame.label}</code>
                            {i === 0 && current.event === "return" && <span className="small"> → {current.value}</span>}
                          </li>
                        ),
                      )}
                    </ol>
                  </>
                )}
                <h3>Output so far</h3>
                <pre className="console">{trace.stdout.slice(0, current.out) || " "}</pre>
                {step === last && trace.error && (
                  <p className="fb error small">
                    The spell stopped with {trace.error.type}: {trace.error.message}
                    {trace.error.line ? ` (line ${trace.error.line})` : ""}
                  </p>
                )}
              </div>
            </div>
            <div className="row">
              <button className="btn small" onClick={() => setStep(0)} disabled={step === 0}>
                ⏮
              </button>
              <button className="btn" onClick={() => setStep(step - 1)} disabled={step === 0} aria-label="Previous step">
                ◀ Back
              </button>
              <input
                type="range"
                min={0}
                max={last}
                value={step}
                onChange={(e) => setStep(Number(e.target.value))}
                aria-label="Step"
                className="pensieve-slider"
              />
              <button className="btn primary" onClick={() => setStep(step + 1)} disabled={step === last} aria-label="Next step">
                Next ▶
              </button>
              <button className="btn small" onClick={() => setStep(last)} disabled={step === last}>
                ⏭
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
