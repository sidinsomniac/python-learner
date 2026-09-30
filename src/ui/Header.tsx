import { useEffect, useState } from "react";
import { levelProgress } from "../engine/progress";
import { useGame } from "../engine/store";
import { hasFeature } from "../lore/levels";
import { HOUSES, LOADING_LINES, levelTitle } from "../lore/lore";
import { itemById } from "../lore/shop";
import { python, type RunnerStatus } from "../runtime/pythonRunner";
import { useDueCount } from "./TimeTurner";

export function Header() {
  const { name, house, xp, galleons, housePoints, marauderMap, equipped, bestLevel } = useGame();
  const h = HOUSES[house!];
  const lp = levelProgress(xp);
  const status = usePythonStatus();
  const due = useDueCount();
  const wand = equipped.wand ? itemById(equipped.wand) : undefined;
  const familiar = equipped.familiar ? itemById(equipped.familiar) : undefined;
  const title = equipped.title ? itemById(equipped.title)?.value : undefined;
  const robe = equipped.robe ? itemById(equipped.robe)?.value : undefined;

  return (
    <header className="header" style={robe ? { borderBottomColor: robe } : undefined}>
      <a href="#/" className="brand" title="The Great Hall">
        <span aria-hidden>🏰</span> Parseltongue Academy
      </a>
      <div className="student">
        <span className="crest" title={h.name} style={robe ? { textShadow: `0 0 12px ${robe}` } : undefined}>
          {h.crest}
        </span>
        <div>
          <div className="student-name">
            {name}
            {title && <span className="student-title"> {title}</span>}
          </div>
          <div className="muted small">
            Level {lp.level} · {levelTitle(lp.level)}
          </div>
          <div className="xpbar" title={lp.needed ? `${lp.into} / ${lp.needed} XP to next level` : "Maximum level!"}>
            <div style={{ width: `${Math.round(lp.fraction * 100)}%` }} />
          </div>
        </div>
        {(wand || familiar) && (
          <span className="stat" title={[wand?.name, familiar?.name].filter(Boolean).join(" · ")}>
            {wand?.icon}
            {familiar?.icon}
          </span>
        )}
        <span className="stat" title="Experience points">
          ✨ {xp} XP
        </span>
        <span className="stat" title="Galleons" data-testid="galleons">
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
        <a href="#/shop">Diagon Alley</a>
        {hasFeature(bestLevel, "time-turner") && (
          <a href="#/time-turner" data-testid="nav-time-turner">
            Time-Turner{due > 0 && <span className="due-badge">{due}</span>}
          </a>
        )}
        {hasFeature(bestLevel, "dueling-club") && <a href="#/dueling-club">Dueling Club</a>}
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
