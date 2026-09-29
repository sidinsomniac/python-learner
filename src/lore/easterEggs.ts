// Magic words that do something special when your spell *prints* them.
export type EggEffect =
  | "lumos"
  | "nox"
  | "patronus"
  | "levitate"
  | "marauder-open"
  | "marauder-close"
  | "fireworks"
  | "duck"
  | "none";

export interface EggHit {
  id: string;
  message: string;
  effect: EggEffect;
  badge?: string;
}

interface EggRule {
  id: string;
  test: (out: string, code: string) => RegExpMatchArray | boolean | null;
  hit: (match: RegExpMatchArray | boolean | null) => Omit<EggHit, "id">;
}

const RULES: EggRule[] = [
  {
    id: "leviosar",
    test: (out) => /wingardium\s+levios(ar|aa+)\b/i.test(out),
    hit: () => ({
      effect: "none",
      badge: "leviosa",
      message: '🙋‍♀️ Hermione leans over: "It\'s Levi-O-sa, not Levio-SAR!"',
    }),
  },
  {
    id: "leviosa",
    test: (out) => /wingardium\s+leviosa\b/i.test(out),
    hit: () => ({ effect: "levitate", badge: "leviosa", message: "🪶 Your wand floats gently into the air!" }),
  },
  {
    id: "lumos",
    test: (out) => /\blumos\b/i.test(out) && !/\blumos\s+maxima\b/i.test(out),
    hit: () => ({ effect: "lumos", message: "💡 Lumos! The castle brightens. (Print \"Nox\" to darken it again.)" }),
  },
  {
    id: "lumos-maxima",
    test: (out) => /\blumos\s+maxima\b/i.test(out),
    hit: () => ({ effect: "lumos", message: "🌞 LUMOS MAXIMA! Blinding brilliance fills the room." }),
  },
  {
    id: "nox",
    test: (out) => /^\s*nox\s*!?\s*$/im.test(out),
    hit: () => ({ effect: "nox", message: "🌙 Nox. The castle falls back into candlelight." }),
  },
  {
    id: "patronus",
    test: (out) => /expecto\s+patronum/i.test(out),
    hit: () => ({ effect: "patronus", badge: "patronus", message: "✨ A silvery Patronus bursts from your wand! The Dementors of debugging retreat." }),
  },
  {
    id: "marauder-open",
    test: (out) => /i solemnly swear that i am up to no good/i.test(out),
    hit: () => ({
      effect: "marauder-open",
      badge: "marauder",
      message: "🗺️ Ink spreads across old parchment... The Marauder's Map is revealed! (Find it in the menu.)",
    }),
  },
  {
    id: "marauder-close",
    test: (out) => /mischief managed/i.test(out),
    hit: () => ({ effect: "marauder-close", message: "🗺️ Mischief managed. The map fades to a blank sheet of parchment." }),
  },
  {
    id: "riddikulus",
    test: (out) => /\briddikulus\b/i.test(out),
    hit: () => ({
      effect: "duck",
      badge: "riddikulus",
      message:
        "🦆 Riddikulus! The boggart-bug turns into a rubber duck. Real wizards use 'rubber duck debugging': explain your code to the duck, line by line, out loud. Bugs hate it.",
    }),
  },
  {
    id: "zen",
    test: (out) => /beautiful is better than ugly/i.test(out),
    hit: () => ({
      effect: "none",
      badge: "zen",
      message: "🎩 You've found the Sorting Hat's secret song: the Zen of Python. Every Pythonista lives by it.",
    }),
  },
  {
    id: "avada",
    test: (out) => /avada\s+kedavra/i.test(out),
    hit: () => ({ effect: "none", message: "💀 An Unforgivable Curse?! Professor Ashwood confiscates your wand for a moment... then hands it back. Let's stick to *helpful* spells." }),
  },
  {
    id: "obliviate",
    test: (out) => /\bobliviate\b/i.test(out),
    hit: () => ({ effect: "none", message: "🌀 You feel strangely forgetful... just kidding. Your progress is safe." }),
  },
  {
    id: "alohomora",
    test: (out) => /\balohomora\b/i.test(out),
    hit: () => ({ effect: "none", message: "🔓 *Click.* A door somewhere opens... but quests unlock by learning, not by charms!" }),
  },
  {
    id: "accio",
    test: (out) => out.match(/\baccio\s+([a-z][\w' -]{0,30})/i),
    hit: (m) => {
      const thing = Array.isArray(m) ? m[1].trim() : "something";
      return { effect: "none", message: `🧲 Accio ${thing}! It comes whooshing towards you across the classroom.` };
    },
  },
  {
    id: "mischief-sirius",
    test: (out) => /\bpadfoot\b|\bmoony\b|\bwormtail\b|\bprongs\b/i.test(out),
    hit: () => ({ effect: "none", message: "🐾 Messrs Moony, Wormtail, Padfoot and Prongs send their regards." }),
  },
];

/** Returns every easter egg triggered by a spell's output. */
export function detectEggs(stdout: string, code = ""): EggHit[] {
  const hits: EggHit[] = [];
  for (const rule of RULES) {
    const match = rule.test(stdout, code);
    if (match) hits.push({ id: rule.id, ...rule.hit(match) });
  }
  // A misspelled levitation charm shouldn't also levitate.
  if (hits.some((h) => h.id === "leviosar")) return hits.filter((h) => h.id !== "leviosa");
  return hits;
}

export const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
