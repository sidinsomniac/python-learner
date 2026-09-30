import { useGame } from "../engine/store";
import { BADGES } from "../lore/badges";
import { LEVEL_REWARDS } from "../lore/levels";
import { levelTitle } from "../lore/lore";

export function Trophies() {
  const earned = useGame((s) => s.badges);
  const eggs = useGame((s) => Object.keys(s.eggsFound).length);
  const bestLevel = useGame((s) => s.bestLevel);

  return (
    <div className="stack">
      <section className="card hero">
        <h1>🏆 The Trophy Room</h1>
        <p>
          Badges earned: {Object.keys(earned).length} / {BADGES.length} · Magical secrets discovered: {eggs}
        </p>
        <p className="muted small">
          Some trophies are secret. Try printing famous spells, exploring odd corners of the castle, or remembering what
          the Weasley twins might type...
        </p>
      </section>
      <div className="badge-grid">
        {BADGES.map((b) => {
          const got = earned[b.id];
          const hidden = b.secret && !got;
          return (
            <div key={b.id} className={`card badge ${got ? "earned" : "unearned"}`}>
              <div className="badge-icon" aria-hidden>
                {hidden ? "❔" : b.icon}
              </div>
              <strong>{hidden ? "???" : b.name}</strong>
              <p className="small muted">{hidden ? "A secret yet to be discovered." : b.description}</p>
              {got && <p className="small">Earned {new Date(got).toLocaleDateString()}</p>}
            </div>
          );
        })}
      </div>
      <section className="card">
        <h2>🎓 The Level Track</h2>
        <p className="muted small">Every level brings something new. Rewards are yours forever once reached.</p>
        <ol className="level-track">
          {LEVEL_REWARDS.map((r) => (
            <li key={r.level} className={bestLevel >= r.level ? "reached" : ""}>
              <span className="level-pill">{r.level}</span>
              <span>
                <strong>{levelTitle(r.level)}</strong>
                <span className="small muted"> - {r.text}</span>
                {r.galleons ? <span className="small"> · 🪙 +{r.galleons}</span> : null}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
