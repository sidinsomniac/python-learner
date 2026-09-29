import { useFx, useGame } from "../engine/store";
import { badgeById } from "./badges";
import { detectEggs } from "./easterEggs";

/** Trigger any easter eggs hidden in a spell's output. */
export function applyEggs(stdout: string, code = "") {
  const game = useGame.getState();
  const fx = useFx.getState();
  for (const hit of detectEggs(stdout, code)) {
    fx.toast(hit.message, "egg");
    game.foundEgg(hit.id);
    switch (hit.effect) {
      case "lumos":
        game.setTheme("light");
        break;
      case "nox":
        game.setTheme("dark");
        break;
      case "marauder-open":
        game.setMarauderMap(true);
        break;
      case "marauder-close":
        game.setMarauderMap(false);
        break;
      case "patronus":
      case "fireworks":
      case "duck":
        fx.play(hit.effect);
        break;
      case "levitate":
        fx.play("levitate");
        break;
    }
    if (hit.badge) grantBadge(hit.badge);
  }
}

export function grantBadge(id: string) {
  if (useGame.getState().awardBadge(id)) {
    const badge = badgeById(id);
    if (badge) useFx.getState().toast(`${badge.icon} Badge earned: ${badge.name}!`, "badge");
  }
}
