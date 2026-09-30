import { useEffect } from "react";
import { YEARS } from "../engine/content";
import { isLessonComplete, isLessonUnlocked } from "../engine/progress";
import { useGame } from "../engine/store";
import { grantBadge } from "../lore/applyEggs";
import { YEAR_NAMES } from "../lore/lore";
import { YEAR_TOPICS } from "./MapView";

function useSecret(eggId: string, badge: string) {
  useEffect(() => {
    useGame.getState().foundEgg(eggId);
    grantBadge(badge);
  }, [eggId, badge]);
}

export function Platform934() {
  useSecret("platform", "platform");
  return (
    <div className="card secret">
      <h1>🚂 Platform 9¾</h1>
      <p>
        You walked straight through the wall! The scarlet Hogwarts Express puffs steam, and the trolley witch offers
        you... Python trivia instead of Chocolate Frogs:
      </p>
      <ul>
        <li>
          🐍 Python isn't named after the snake. Its creator, Guido van Rossum, named it after the comedy show{" "}
          <em>Monty Python's Flying Circus</em>.
        </li>
        <li>
          🎩 Type <code>import this</code> in any spell and run it. You'll find a secret poem called <em>The Zen of Python</em>.
        </li>
        <li>
          🎈 <code>import antigravity</code> is a real joke hidden in Python. (In a normal Python install it opens a web comic!)
        </li>
        <li>🔢 In Python, <code>True + True</code> is <code>2</code>. Booleans are secretly numbers. You'll learn why in Year 2.</li>
        <li>📏 Python cares about indentation (spaces at the start of lines). Most languages don't.</li>
      </ul>
      <a href="#/">← Back through the wall</a>
    </div>
  );
}

export function Page394() {
  useSecret("page-394", "page-394");
  return (
    <div className="card secret">
      <h1>📖 Page 394: Werewolves and Wild Loops</h1>
      <p>
        <em>A substitute teacher has skipped ahead in your syllabus...</em>
      </p>
      <p>
        A <strong>loop</strong> is a spell that repeats. Some loops are like werewolves: they transform when a
        condition (the full moon) comes true, and stop when it ends. But a loop whose condition <em>never</em> becomes
        false runs forever. That's an <strong>infinite loop</strong>.
      </p>
      <p>
        If your spell ever seems frozen, the castle will stop it after a few seconds and ask you: <em>"Is something
        looping forever?"</em> You'll meet loops properly in Second Year: The Chamber of Conditionals.
      </p>
      <p className="muted small">(Your professor would prefer you didn't read ahead. But she's secretly pleased that you did.)</p>
      <a href="#/spellbook">← Back to your Spellbook</a>
    </div>
  );
}

export function MaraudersMap() {
  const { exercises, name, marauderMap, setMarauderMap } = useGame();
  if (!marauderMap) {
    return (
      <div className="card secret parchment-blank">
        <p className="muted">Just a blank piece of old parchment.</p>
        <a href="#/">← Great Hall</a>
      </div>
    );
  }
  const all = YEARS.flatMap((y) => y.lessons);
  const skipped = useGame.getState().skipped;
  const current = all.find((l) => !isLessonComplete(l, exercises) && isLessonUnlocked(l, YEARS, exercises, skipped));
  return (
    <div className="card secret marauder">
      <h1>🗺️ The Marauder's Map</h1>
      <p className="small">
        <em>Messrs Moony, Wormtail, Padfoot and Prongs are proud to present every corridor of your journey.</em>
      </p>
      {YEAR_NAMES.map((yearName, i) => {
        const quests = all.filter((l) => l.year === i + 1);
        return (
          <div key={yearName} className="map-floor">
            <strong>{yearName}</strong>
            {quests.length ? (
              <ul>
                {quests.map((q) => (
                  <li key={q.id}>
                    {isLessonComplete(q, exercises) ? "👣" : q === current ? `📍 ${name} is here →` : "·"} {q.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small muted">Secret passage under construction: {YEAR_TOPICS[i]}</p>
            )}
          </div>
        );
      })}
      <button className="btn" onClick={() => setMarauderMap(false)}>
        Mischief managed
      </button>
    </div>
  );
}
