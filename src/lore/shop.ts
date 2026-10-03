// Diagon Alley: everything Galleons can buy (or levels can gift).

export type ItemKind = "wand" | "familiar" | "robe" | "editor" | "title" | "banner";
export type AidId = "felix" | "sand";
/** What a wand casts while you type (drawn in `src/ui/wand/`). */
export type WandEffect = "sparks" | "motes" | "ripples" | "tendrils" | "ink" | "embers" | "patronus";

export interface ShopItem {
  id: string;
  kind: ItemKind;
  name: string;
  icon: string;
  price: number;
  description: string;
  /** Ollivanders' premium stock appears once you reach this level. */
  minLevel?: number;
  /** Only obtainable as a level reward. */
  giftOnly?: boolean;
  /** Colour (robes, banners), CSS class suffix (editor themes) or title text. */
  value?: string;
  /** Wands only: the effect it casts at each letter you type. */
  effect?: WandEffect;
  /** What owning and equipping it does (shown on its card). Perks never reveal answers. */
  perk?: string;
}

export interface Aid {
  id: AidId;
  name: string;
  icon: string;
  price: number;
  perYear: number;
  description: string;
}

export const KIND_LABEL: Record<ItemKind, string> = {
  wand: "Wands (Ollivanders)",
  familiar: "Familiars (Magical Menagerie)",
  robe: "Robes (Madam Malkin's)",
  editor: "Editor themes (Flourish & Blotts)",
  title: "Titles (Scrivenshaft's)",
  banner: "Common-room banners (Gladrags)",
};

export const ITEMS: ShopItem[] = [
  { id: "wand-holly", kind: "wand", effect: "sparks", name: "Holly & phoenix feather", icon: "🪄", price: 0, description: "Your first wand. Reliable and brave." },
  { id: "wand-oak", kind: "wand", effect: "motes", name: "English oak & unicorn hair", icon: "🪄", price: 80, description: "Steady, loyal - never drops a variable." },
  { id: "wand-willow", kind: "wand", effect: "ripples", name: "Willow & dragon heartstring", icon: "🪄", price: 120, description: "Good for healing broken spells." },
  { id: "wand-vine", kind: "wand", effect: "tendrils", name: "Vine & dragon heartstring", icon: "🪄", price: 180, description: "Seeks a wizard with hidden depths." },
  { id: "wand-ebony", kind: "wand", effect: "ink", name: "Ebony & unicorn hair", icon: "🪄", price: 300, description: "For those who stick to their convictions (and their tests)." },
  { id: "wand-yew", kind: "wand", effect: "embers", name: "Yew & phoenix feather", icon: "✨", price: 900, minLevel: 5, description: "Premium Ollivanders stock. Powerful and rare." },
  { id: "wand-elder", kind: "wand", effect: "patronus", name: "The Elder Wand (replica)", icon: "⚡", price: 2000, minLevel: 5, description: "An excellent replica. The shopkeeper swears it's only a replica." },

  { id: "fam-toad", kind: "familiar", name: "Toad", icon: "🐸", price: 60, description: "Prone to wandering off. Very loyal when found.", perk: "Wanders off during your daily review and comes back with +2 extra Galleons." },
  { id: "fam-rat", kind: "familiar", name: "Rat", icon: "🐀", price: 90, description: "Sleeps a lot. Nothing suspicious about that.", perk: "Keeps your review streak alive once a week if you miss a day. (Just napping.)" },
  { id: "fam-puff", kind: "familiar", name: "Pygmy Puff", icon: "🐹", price: 200, description: "Squeaks happily whenever your spell passes.", perk: "+2 house points for every exercise you pass. Squeak!" },
  { id: "fam-cat", kind: "familiar", name: "Half-Kneazle cat", icon: "🐈", price: 400, description: "Excellent at spotting untrustworthy code.", perk: "After a failed run, sits on the line where the error happened. Where, never what." },
  { id: "fam-owl", kind: "familiar", name: "Snowy owl", icon: "🦉", price: 500, description: "Delivers your results with dignity.", perk: "Delivers a recap letter after each lesson, and your first review each day pays 5 Galleons instead of 3." },
  { id: "fam-niffler", kind: "familiar", name: "Niffler", icon: "🦫", price: 900, description: "Loves Galleons. Keep an eye on your purse.", perk: "+15% Galleons from exercises. Pockets 1 Galleon a day for itself." },
  { id: "fam-phoenix", kind: "familiar", name: "Phoenix chick", icon: "🐦‍🔥", price: 1800, minLevel: 12, description: "Bursts into flame when you earn an O.", perk: "Bursts into flame on an O, and once per school year is reborn with a free Time-Turner sand." },

  { id: "robe-midnight", kind: "robe", name: "Midnight robes", icon: "🧥", price: 120, value: "#3b4fa8", description: "Deep blue, embroidered with tiny stars.", perk: "Dueling Club: your first wrong answer in each duel is shielded." },
  { id: "robe-dragonhide", kind: "robe", name: "Dragon-hide trim", icon: "🧥", price: 250, value: "#3f8f5a", description: "Green and tough as a Hungarian Horntail.", perk: "Dueling Club: +25% Galleons from duel wins." },
  { id: "robe-maroon", kind: "robe", name: "Hand-knitted maroon", icon: "🧶", price: 100, value: "#8a2d3b", description: "Lumpy, warm, knitted with love.", perk: "Dueling Club: +3 seconds to answer every duel question." },
  { id: "robe-silver", kind: "robe", name: "Silver dress robes", icon: "🧥", price: 500, value: "#b8c2cc", description: "For the Yule Ball - or a very good day of coding.", perk: "Dueling Club: double house points from duel wins." },

  { id: "ed-dungeon", kind: "editor", name: "Dungeon ink", icon: "🧪", price: 150, value: "dungeon", description: "Your wand's editor in potion-green on stone." },
  { id: "ed-starlight", kind: "editor", name: "Starlight", icon: "🌌", price: 300, value: "starlight", description: "Code written across the night sky." },
  { id: "ed-parchment", kind: "editor", name: "Old parchment", icon: "📜", price: 150, value: "parchment", description: "Ink on aged parchment, even at night." },
  { id: "ed-map", kind: "editor", name: "The Marauder's Map", icon: "🗺️", price: 250, value: "map", description: "Brown ink on old parchment, with someone's footprints wandering across it." },
  { id: "ed-pensieve", kind: "editor", name: "The Pensieve", icon: "🌀", price: 350, value: "pensieve", description: "Silver memories swirl slowly behind your code." },
  { id: "ed-lake", kind: "editor", name: "The Black Lake", icon: "🌊", price: 350, value: "lake", description: "Deep green water, with light rippling down through it." },
  { id: "ed-forest", kind: "editor", name: "The Forbidden Forest", icon: "🌲", price: 300, value: "forest", description: "Dark moss, and fireflies drifting between the lines." },
  { id: "ed-house", kind: "editor", name: "House Pride", icon: "🦁", price: 200, value: "house", description: "Your own house's colours: scarlet and gold, green and silver, blue and bronze, or yellow and black." },
  { id: "ed-wheezes", kind: "editor", name: "Weasleys' Wizard Wheezes", icon: "🎆", price: 400, value: "wheezes", description: "Purple and orange, with the odd firework going off in the margins." },
  { id: "ed-ministry", kind: "editor", name: "Ministry of Magic", icon: "🏛️", price: 250, value: "ministry", description: "Peacock-green tiles and gold. Very orderly. Very official." },
  { id: "ed-honeydukes", kind: "editor", name: "Honeydukes", icon: "🍬", price: 0, giftOnly: true, value: "honeydukes", description: "A level reward: sugar-pink, with candy-striped margins." },
  { id: "ed-ember", kind: "editor", name: "Ember", icon: "🔥", price: 0, giftOnly: true, value: "ember", description: "A level reward: code that glows like the Goblet of Fire." },

  { id: "title-unflappable", kind: "title", name: "the Unflappable", icon: "🎖️", price: 120, value: "the Unflappable", description: "For those who meet a SyntaxError with calm.", perk: "Your first failed attempt on each exercise doesn't count against its XP." },
  { id: "title-bugtamer", kind: "title", name: "the Bug-Tamer", icon: "🎖️", price: 200, value: "the Bug-Tamer", description: "Creatures of the code fear you.", perk: "+50% Galleons from Potion Repair (debugging) exercises." },
  { id: "title-curious", kind: "title", name: "the Curious", icon: "🎖️", price: 0, giftOnly: true, value: "the Curious", description: "A level reward, for asking why.", perk: "The first hint on each exercise (the nudge) costs no XP." },
  { id: "title-prince", kind: "title", name: "the Half-Blood Pythonista", icon: "🎖️", price: 1200, minLevel: 10, value: "the Half-Blood Pythonista", description: "Margin notes optional.", perk: "+10% XP on every exercise. Snape's reviews greet you with grudging respect." },

  { id: "banner-house", kind: "banner", name: "House banner", icon: "🏳️", price: 100, value: "house", description: "Your house colours over the Great Hall.", perk: "Adds the House Colours background: embers in your house's colours." },
  { id: "banner-stars", kind: "banner", name: "Enchanted-ceiling banner", icon: "✨", price: 250, value: "stars", description: "A strip of the Great Hall's ceiling, just for you.", perk: "Adds the Constellations background: Astronomy star charts drawing themselves across the sky." },
  { id: "banner-snitch", kind: "banner", name: "Golden Snitch banner", icon: "🟡", price: 500, value: "snitch", description: "It flutters. It's a little distracting. It's wonderful.", perk: "Adds the Quidditch Pitch background, and the Snitch now and then darts across your lessons." },
  { id: "banner-crest", kind: "banner", name: "Hogwarts crest", icon: "🛡️", price: 0, giftOnly: true, value: "crest", description: "A level reward: all four houses together.", perk: "Adds the Four Houses background: the house sigils glowing in turn." },
];

export const AIDS: Aid[] = [
  {
    id: "felix",
    name: "Felix Felicis",
    icon: "🧪",
    price: 90,
    perYear: 3,
    description: "Liquid luck. Drink it before unlocking a hint: that hint costs no XP and doesn't lower your grade. (It never reveals answers.)",
  },
  {
    id: "sand",
    name: "Time-Turner sand",
    icon: "⏳",
    price: 120,
    perYear: 3,
    description: "Turn back time on a finished exercise: its hints and attempts reset, so you can earn a better grade.",
  },
];

export const itemById = (id: string) => ITEMS.find((i) => i.id === id);
export const aidById = (id: AidId) => AIDS.find((a) => a.id === id)!;
