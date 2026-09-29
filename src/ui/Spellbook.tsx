import { QUESTS } from "../engine/content";
import { useGame } from "../engine/store";
import { renderMarkdown } from "./md";

export function Spellbook() {
  const completed = useGame((s) => s.completed);
  const pages = QUESTS.filter((q) => completed[q.id]);

  return (
    <div className="stack">
      <section className="card hero">
        <h1>📖 Your Spellbook</h1>
        <p>Every quest you complete adds a page. These are your own Python notes, to come back to whenever you like.</p>
      </section>
      {pages.length === 0 && <p className="card muted">The pages are blank... for now. Complete a quest to write your first one.</p>}
      {pages.map((q, i) => (
        <article key={q.id} className="card spellbook-page">
          <span className="page-no">p. {i + 1}</span>
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(q.spellbook) }} />
          <a className="small" href={`#/quest/${q.id}`}>
            Revisit "{q.title}"
          </a>
        </article>
      ))}
      <p className="muted small center">
        A note in spiky handwriting is tucked into the back cover: <em>"All of you will turn to page </em>
        <a href="#/spellbook/394" className="sneaky">
          three hundred and ninety-four
        </a>
        <em>."</em>
      </p>
    </div>
  );
}
