import { useState } from "react";
import { useGame } from "../engine/store";

export function Welcome() {
  const setName = useGame((s) => s.setName);
  const [draft, setDraft] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (draft.trim()) setName(draft.trim());
  };

  return (
    <div className="letter-wrap">
      <div className="letter card">
        <div className="seal" aria-hidden>
          🦁🦡
          <br />
          🦅🐍
        </div>
        <h1>Hogwarts School of Witchcraft and Wizardry</h1>
        <p className="subtitle">Department of Parseltongue - the language of Pythons</p>
        <p>Dear new student,</p>
        <p>
          An owl has brought news: you have been accepted to study <strong>Parseltongue</strong>, better known to
          Muggles as the programming language <strong>Python</strong>.
        </p>
        <p>
          You need no previous magical (or coding) experience. Across seven school years you will learn to cast
          spells (programs), tame bugs, brew working potions out of broken code, and duel with your knowledge.
        </p>
        <p>
          A word of warning: your professor will <em>never</em> simply hand you the answer. She will ask questions
          until you find it yourself. That is how real wizards learn.
        </p>
        <form onSubmit={submit} className="row">
          <label htmlFor="student-name" className="sr-only">
            Your name
          </label>
          <input
            id="student-name"
            placeholder="Sign your name to accept..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
          <button className="btn primary" type="submit" disabled={!draft.trim()}>
            Accept my place ✒️
          </button>
        </form>
        <p className="signature">
          Yours sincerely,
          <br />
          <em>Professor Ashwood</em>, Professor of Parseltongue
        </p>
      </div>
    </div>
  );
}
