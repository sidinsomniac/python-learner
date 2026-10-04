import { LESSONS } from "../engine/content";
import { isLessonComplete } from "../engine/progress";
import { useGame } from "../engine/store";
import { useLessonTexts } from "./lessonText";
import { renderMarkdown } from "./md";

export function Spellbook() {
  const records = useGame((s) => s.exercises);
  const pages = LESSONS.filter((l) => l.hasSpellbook && isLessonComplete(l, records));
  const texts = useLessonTexts(pages.map((l) => l.id));

  return (
    <div className="stack">
      <section className="card hero">
        <h1>📖 Your Spellbook</h1>
        <p>Every lesson you complete adds a page. These are your own Python notes, to come back to whenever you like.</p>
      </section>
      {pages.length === 0 && <p className="card muted">The pages are blank... for now. Complete a lesson to write your first one.</p>}
      {pages.length > 0 && !texts && <p className="summoning">📜 Finding your pages…</p>}
      {texts && pages.map((q, i) => (
        <article key={q.id} className="card spellbook-page">
          <span className="page-no">p. {i + 1}</span>
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(texts[q.id]?.spellbook ?? "") }} />
          <a className="small" href={`#/lesson/${q.id}`}>
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
