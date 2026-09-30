import { useState } from "react";
import { CAST } from "../engine/content";
import { useGame } from "../engine/store";
import type { SceneLine } from "../engine/types";
import { renderInline } from "./md";

const who = (id: string) => CAST[id] ?? { name: id, portrait: "❔" };

/** Personalise lines: {name} is the student, {house} their house. */
function personalise(text: string, name: string, house: string) {
  return text.replaceAll("{name}", name).replaceAll("{house}", house);
}

/** A story beat, told one line at a time, then kept as a transcript. */
export function Cutscene({ id, lines, title }: { id: string; lines: SceneLine[]; title?: string }) {
  const seen = useGame((s) => Boolean(s.scenesSeen[id]));
  const markSeen = useGame((s) => s.markSceneSeen);
  const name = useGame((s) => s.name);
  const house = useGame((s) => s.house ?? "");
  const houseName = house ? house[0].toUpperCase() + house.slice(1) : "";
  const [shown, setShown] = useState(seen ? lines.length : 1);

  if (lines.length === 0) return null;
  const finished = shown >= lines.length;
  const finish = () => {
    setShown(lines.length);
    markSeen(id);
  };

  return (
    <section className="cutscene card" aria-label={title ?? "Story"} data-testid="cutscene">
      {title && <h3 className="cutscene-title">{title}</h3>}
      <div className="dialogue">
        {lines.slice(0, shown).map((l, i) => {
          const speaker = who(l.who);
          return (
            <div key={i} className={`line ${l.who === "narrator" ? "narration" : ""} ${i === shown - 1 && !finished ? "fresh" : ""}`}>
              <span className="portrait" aria-hidden>
                {speaker.portrait}
              </span>
              <div>
                {speaker.name && <strong className="speaker">{speaker.name}</strong>}
                <p dangerouslySetInnerHTML={{ __html: renderInline(personalise(l.line, name, houseName)) }} />
              </div>
            </div>
          );
        })}
      </div>
      {!finished ? (
        <div className="row">
          <button
            className="btn primary"
            onClick={() => (shown + 1 >= lines.length ? finish() : setShown(shown + 1))}
            data-testid="scene-next"
          >
            Next ▸
          </button>
          <button className="btn ghost small" onClick={finish}>
            Skip
          </button>
        </div>
      ) : (
        seen && (
          <button className="btn ghost small" onClick={() => setShown(1)}>
            ↺ Replay scene
          </button>
        )
      )}
    </section>
  );
}
