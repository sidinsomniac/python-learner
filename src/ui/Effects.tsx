import { useEffect } from "react";
import { useFx } from "../engine/store";

export function Effects() {
  const { toasts, fx, dismiss } = useFx();

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
    </>
  );
}
