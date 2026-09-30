import { useFx } from "../engine/store";
import { LEVEL_REWARDS } from "../lore/levels";
import { levelTitle } from "../lore/lore";
import { itemById } from "../lore/shop";

/** Celebrates each new level, and shows what it unlocked. */
export function LevelUpHost() {
  const level = useFx((s) => s.levelUps[0]);
  const dismiss = useFx((s) => s.dismissLevelUp);
  const scenesWaiting = useFx((s) => s.scenes.length > 0);
  if (!level || scenesWaiting) return null;
  const reward = LEVEL_REWARDS.find((r) => r.level === level);
  const item = reward?.item ? itemById(reward.item) : undefined;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="levelup-title">
      <div className="card modal levelup-modal" data-testid="level-up">
        <div className="levelup-burst" aria-hidden>
          ⭐
        </div>
        <h2 id="levelup-title">Level {level}!</h2>
        <p className="levelup-title">You are now a {levelTitle(level)}.</p>
        {reward ? (
          <div className="levelup-reward">
            <strong>🎁 Unlocked:</strong> {reward.text}
            {item && (
              <p className="small muted">
                {item.icon} {item.name} is waiting in your trunk - equip it in Diagon Alley.
              </p>
            )}
            {reward.galleons ? <p className="small">🪙 +{reward.galleons} Galleons</p> : null}
          </div>
        ) : (
          <p className="muted">Keep going - more rewards wait at the next levels.</p>
        )}
        <button className="btn primary" onClick={dismiss} autoFocus>
          Wonderful!
        </button>
      </div>
    </div>
  );
}
