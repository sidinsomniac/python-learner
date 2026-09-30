import { useEffect, useState } from "react";
import { levelProgress } from "../engine/progress";
import { useGame } from "../engine/store";
import { HOUSES, LOADING_LINES, levelTitle } from "../lore/lore";
import { python, type RunnerStatus } from "../runtime/pythonRunner";

export function Header() {
  const { name, house, xp, galleons, housePoints, marauderMap } = useGame();
  const h = HOUSES[house!];
  const lp = levelProgress(xp);
  const status = usePythonStatus();

  return (
    <header className="header">
      <a href="#/" className="brand" title="The Great Hall">
        <span aria-hidden>🏰</span> Parseltongue Academy
      </a>
      <div className="student">
        <span className="crest" title={h.name}>
          {h.crest}
        </span>
        <div>
          <div className="student-name">{name}</div>
          <div className="muted small">
            Level {lp.level} · {levelTitle(lp.level)}
          </div>
          <div className="xpbar" title={`${lp.into} / ${lp.needed} XP to next level`}>
            <div style={{ width: `${Math.round(lp.fraction * 100)}%` }} />
          </div>
        </div>
        <span className="stat" title="Experience points">
          ✨ {xp} XP
        </span>
        <span className="stat" title="Galleons">
          🪙 {galleons}
        </span>
        <span className="stat" title={`${h.name} house points`}>
          🏆 {housePoints}
        </span>
      </div>
      <nav className="nav">
        <a href="#/">Great Hall</a>
        <a href="#/casefile">Case File</a>
        <a href="#/spellbook">Spellbook</a>
        <a href="#/trophies">Trophies</a>
        {marauderMap && <a href="#/marauders-map">🗺️ Map</a>}
        <a href="#/settings">Settings</a>
        <PythonChip status={status} />
      </nav>
    </header>
  );
}

function usePythonStatus() {
  const [status, setStatus] = useState<RunnerStatus>(python.status);
  useEffect(() => python.onStatus(setStatus), []);
  return status;
}

function PythonChip({ status }: { status: RunnerStatus }) {
  const [line] = useState(() => LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)]);
  if (status === "ready") return <span className="chip ok" title="Python is ready">🐍 Ready</span>;
  if (status === "failed") return <span className="chip bad" title="Python failed to load - try refreshing">🐍 Asleep</span>;
  return <span className="chip" title={line}>🐍 Waking...</span>;
}
