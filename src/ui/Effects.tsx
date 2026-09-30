import { useEffect } from "react";
import { useFx, useGame } from "../engine/store";
import { itemById } from "../lore/shop";

export function Effects() {
  const { toasts, fx, dismiss, familiarLine } = useFx();
  const familiar = useGame((s) => (s.equipped.familiar ? itemById(s.equipped.familiar) : undefined));

  useEffect(() => {
    document.body.classList.toggle("levitating", fx === "levitate");
  }, [fx]);

  return (
    <>
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <button key={t.id} className={`toast ${t.kind}`} onClick={() => dismiss(t.id)}>
            {t.text}
          </button>
        ))}
      </div>
      {fx === "patronus" && (
        <div className="fx patronus" aria-hidden>
          🦌
        </div>
      )}
      {fx === "duck" && (
        <div className="fx duck" aria-hidden>
          🦆
        </div>
      )}
      {fx === "fireworks" && (
        <div className="fx fireworks" aria-hidden>
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 5) * 0.25}s` }}>
              {["🎆", "🎇", "✨", "💥"][i % 4]}
            </span>
          ))}
        </div>
      )}
      {fx === "sparkle" && (
        <div className="fx sparkle" aria-hidden>
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} style={{ transform: `rotate(${i * 22.5}deg)` }}>
              <i>✨</i>
            </span>
          ))}
        </div>
      )}
      {fx === "golden" && <div className="fx golden" aria-hidden />}
      {fx === "dawn" && <div className="fx dawn" aria-hidden />}
      {familiar && familiarLine && (
        <div className="familiar-bubble" role="status">
          <span className="familiar-icon" aria-hidden>
            {familiar.icon}
          </span>
          <span>{familiarLine}</span>
        </div>
      )}
    </>
  );
}
