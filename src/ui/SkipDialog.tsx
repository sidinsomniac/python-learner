import { YEARS } from "../engine/content";
import { skipCost, skipsInYear } from "../engine/progress";
import { useFx, useGame } from "../engine/store";
import type { Lesson } from "../engine/types";
import { go } from "./router";

/** Peeves' Bargain: skip a lesson - for a steep price in Galleons and XP. */
export function SkipDialog({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const galleons = useGame((s) => s.galleons);
  const skipped = useGame((s) => s.skipped);
  const cost = skipCost(skipsInYear(lesson.year, skipped, YEARS));
  const affordable = galleons >= cost.galleons;
  const next = YEARS.flatMap((y) => y.lessons)[YEARS.flatMap((y) => y.lessons).findIndex((l) => l.id === lesson.id) + 1];

  const skip = () => {
    const result = useGame.getState().skipLesson(lesson);
    if (!result.ok) {
      useFx.getState().toast(result.reason);
      return;
    }
    useFx.getState().toast(`👻 Peeves cackles and waves you past "${lesson.title}". You can come back to it any time.`);
    onClose();
    if (next) go(`/lesson/${next.id}`);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="skip-title">
      <div className="card modal skip-modal" data-testid="skip-dialog">
        <div className="skip-peeves" aria-hidden>
          👻
        </div>
        <h2 id="skip-title">Peeves' Bargain</h2>
        <p className="hat-speech">
          "Skip <em>{lesson.title}</em>? Peevesy can arrange it, oh yes... for a <strong>price</strong>! Hee hee!"
        </p>
        <ul className="rewards">
          <li>🪙 −{cost.galleons} Galleons (you have {galleons})</li>
          <li>✨ −{cost.xp} XP</li>
        </ul>
        <p className="small muted">
          A skipped lesson opens the next one, but gives <strong>no clue, no grade and no Spellbook page</strong>. Every
          further skip this year costs more. You can always come back and finish it properly - Trials can never be skipped.
        </p>
        <div className="row">
          <button className="btn danger" onClick={skip} disabled={!affordable} data-testid="skip-confirm">
            {affordable ? "Pay Peeves and skip" : "Not enough Galleons"}
          </button>
          <button className="btn primary" onClick={onClose}>
            I'll do the lesson
          </button>
        </div>
      </div>
    </div>
  );
}
