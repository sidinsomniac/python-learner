import { useEffect, useRef, useState } from "react";
import { CAST } from "../engine/content";
import { useFx, useGame } from "../engine/store";
import type { SceneLine } from "../engine/types";
import { renderInline } from "./md";

const who = (id: string) => CAST[id] ?? { name: id, portrait: "❔" };

/** Personalise lines: {name} is the student, {house} their house. */
function usePersonalise() {
  const name = useGame((s) => s.name);
  const house = useGame((s) => s.house ?? "");
  const houseName = house ? house[0].toUpperCase() + house.slice(1) : "";
  return (text: string) => text.replaceAll("{name}", name).replaceAll("{house}", houseName);
}

function Line({ line, fresh }: { line: SceneLine; fresh?: boolean }) {
  const personalise = usePersonalise();
  const speaker = who(line.who);
  return (
    <div className={`line ${line.who === "narrator" ? "narration" : ""} ${fresh ? "fresh" : ""}`}>
      <span className="portrait" aria-hidden>
        {speaker.portrait}
      </span>
      <div>
        {speaker.name && <strong className="speaker">{speaker.name}</strong>}
        <p dangerouslySetInnerHTML={{ __html: renderInline(personalise(line.line)) }} />
      </div>
    </div>
  );
}

/**
 * A story beat. The first time it's met it pops up (see SceneHost) so it
 * can't be missed; afterwards it stays on the page as a story card that can
 * be replayed.
 */
export function Cutscene({ id, lines, title }: { id: string; lines: SceneLine[]; title?: string }) {
  const seen = useGame((s) => Boolean(s.scenesSeen[id]));
  const queueScene = useFx((s) => s.queueScene);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!seen) queueScene({ id, lines, title });
  }, [id, seen, lines, title, queueScene]);

  if (lines.length === 0) return null;
  return (
    <section className="cutscene card" aria-label={title ?? "Story"} data-testid="story-card">
      <div className="row between">
        <h3 className="cutscene-title">📜 {title ?? "Story"}</h3>
        <button className="btn small" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? "Hide" : seen ? "↺ Read again" : "Read"}
        </button>
      </div>
      {open ? (
        <div className="dialogue">
          {lines.map((l, i) => (
            <Line key={i} line={l} />
          ))}
        </div>
      ) : (
        <p className="muted small story-teaser">
          {who(lines[0].who).portrait} {lines.length} line{lines.length === 1 ? "" : "s"} of story
          {!seen && " - waiting to be told"}
        </p>
      )}
    </section>
  );
}

/** Shows queued story scenes as a pop-up, one line at a time. */
export function SceneHost() {
  const scene = useFx((s) => s.scenes[0]);
  const finishScene = useFx((s) => s.finishScene);
  const [shown, setShown] = useState(1);

  const dialogue = useRef<HTMLDivElement>(null);
  useEffect(() => setShown(1), [scene?.id]);
  // Long scenes scroll inside the pop-up; keep the newest line in view.
  useEffect(() => {
    const el = dialogue.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [shown, scene?.id]);
  if (!scene) return null;
  const finished = shown >= scene.lines.length;
  const next = () => (finished ? finishScene() : setShown(shown + 1));

  return (
    <div className="modal-backdrop scene-backdrop" role="dialog" aria-modal="true" aria-label={scene.title ?? "Story"}>
      <div className="card modal scene-modal" data-testid="cutscene">
        {scene.title && <h2 className="cutscene-title">{scene.title}</h2>}
        <div className="dialogue big" ref={dialogue} data-testid="scene-dialogue">
          {scene.lines.slice(0, shown).map((l, i) => (
            <Line key={i} line={l} fresh={i === shown - 1} />
          ))}
        </div>
        <div className="row scene-controls">
          <span className="muted small">
            {shown} / {scene.lines.length}
          </span>
          <button className="btn ghost small" onClick={finishScene} data-testid="scene-skip">
            Skip
          </button>
          <button className="btn primary" onClick={next} autoFocus data-testid="scene-next">
            {finished ? "Continue ▸" : "Next ▸"}
          </button>
        </div>
      </div>
    </div>
  );
}
