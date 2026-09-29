import { useState } from "react";
import { useGame } from "../engine/store";
import { HOUSES, SORTING_QUESTIONS, sortIntoHouse, type HouseId } from "../lore/lore";

export function Sorting() {
  const name = useGame((s) => s.name);
  const setHouse = useGame((s) => s.setHouse);
  const [answers, setAnswers] = useState<HouseId[]>([]);
  const [result, setResult] = useState<HouseId | null>(null);
  const [reconsider, setReconsider] = useState(false);

  const q = SORTING_QUESTIONS[answers.length];

  const answer = (house: HouseId) => {
    const next = [...answers, house];
    setAnswers(next);
    if (next.length === SORTING_QUESTIONS.length) setResult(sortIntoHouse(next));
  };

  if (result) {
    const house = HOUSES[result];
    return (
      <div className="letter-wrap">
        <div className="card sorting" style={{ borderColor: house.colors[0] }}>
          <div className="hat" aria-hidden>
            🎩
          </div>
          <p className="hat-speech">"{house.hatLine}"</p>
          <h2>
            {house.crest} Welcome to {house.name}, {name}!
          </h2>
          <p>
            {house.name} values {house.traits}. Every quest you finish earns points for your house.
          </p>
          {!reconsider ? (
            <div className="row">
              <button className="btn primary" onClick={() => setHouse(result)}>
                Take my seat at the {house.name} table
              </button>
              <button className="btn ghost" onClick={() => setReconsider(true)}>
                Not {house.name}...?
              </button>
            </div>
          ) : (
            <>
              <p className="hat-speech">
                "Not {house.name}, eh? Are you sure? Well... it's our <em>choices</em> that show what we truly are.
                Choose, then."
              </p>
              <div className="house-grid">
                {Object.values(HOUSES).map((h) => (
                  <button
                    key={h.id}
                    className="btn house-btn"
                    style={{ background: h.colors[0], color: "#fff" }}
                    onClick={() => setHouse(h.id)}
                  >
                    {h.crest} {h.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="letter-wrap">
      <div className="card sorting">
        <div className="hat" aria-hidden>
          🎩
        </div>
        <p className="hat-speech">
          "Hmm... {answers.length === 0 ? `${name}, is it? Let's see where you belong.` : "Interesting... very interesting..."}"
        </p>
        <h2>{q.prompt}</h2>
        <div className="answers">
          {q.answers.map((a) => (
            <button key={a.text} className="btn answer" onClick={() => answer(a.house)}>
              {a.text}
            </button>
          ))}
        </div>
        <p className="muted">
          Question {answers.length + 1} of {SORTING_QUESTIONS.length}
        </p>
      </div>
    </div>
  );
}
