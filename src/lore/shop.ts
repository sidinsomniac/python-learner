// Diagon Alley: everything Galleons can buy (or levels can gift).

export type ItemKind = "wand" | "familiar" | "robe" | "editor" | "title" | "banner";
export type AidId = "felix" | "sand";

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
  { id: "wand-holly", kind: "wand", name: "Holly & phoenix feather", icon: "🪄", price: 0, description: "Your first wand. Reliable and brave." },
  { id: "wand-oak", kind: "wand", name: "English oak & unicorn hair", icon: "🪄", price: 30, description: "Steady, loyal - never drops a variable." },
  { id: "wand-willow", kind: "wand", name: "Willow & dragon heartstring", icon: "🪄", price: 45, description: "Good for healing broken spells." },
  { id: "wand-vine", kind: "wand", name: "Vine & dragon heartstring", icon: "🪄", price: 60, description: "Seeks a wizard with hidden depths." },
  { id: "wand-ebony", kind: "wand", name: "Ebony & unicorn hair", icon: "🪄", price: 90, description: "For those who stick to their convictions (and their tests)." },
  { id: "wand-yew", kind: "wand", name: "Yew & phoenix feather", icon: "✨", price: 200, minLevel: 5, description: "Premium Ollivanders stock. Powerful and rare." },
  { id: "wand-elder", kind: "wand", name: "The Elder Wand (replica)", icon: "⚡", price: 300, minLevel: 5, description: "An excellent replica. The shopkeeper swears it's only a replica." },

  { id: "fam-toad", kind: "familiar", name: "Toad", icon: "🐸", price: 20, description: "Prone to wandering off. Very loyal when found." },
  { id: "fam-rat", kind: "familiar", name: "Rat", icon: "🐀", price: 25, description: "Sleeps a lot. Nothing suspicious about that." },
  { id: "fam-puff", kind: "familiar", name: "Pygmy Puff", icon: "🐹", price: 70, description: "Squeaks happily whenever your spell passes." },
  { id: "fam-cat", kind: "familiar", name: "Half-Kneazle cat", icon: "🐈", price: 90, description: "Excellent at spotting untrustworthy code." },
  { id: "fam-owl", kind: "familiar", name: "Snowy owl", icon: "🦉", price: 120, description: "Delivers your results with dignity." },
  { id: "fam-niffler", kind: "familiar", name: "Niffler", icon: "🦫", price: 150, description: "Loves Galleons. Keep an eye on your purse." },
  { id: "fam-phoenix", kind: "familiar", name: "Phoenix chick", icon: "🐦‍🔥", price: 300, minLevel: 12, description: "Bursts into flame when you earn an O." },

  { id: "robe-midnight", kind: "robe", name: "Midnight robes", icon: "🧥", price: 35, value: "#3b4fa8", description: "Deep blue, embroidered with tiny stars." },
  { id: "robe-dragonhide", kind: "robe", name: "Dragon-hide trim", icon: "🧥", price: 60, value: "#3f8f5a", description: "Green and tough as a Hungarian Horntail." },
  { id: "robe-maroon", kind: "robe", name: "Hand-knitted maroon", icon: "🧶", price: 40, value: "#8a2d3b", description: "Lumpy, warm, knitted with love." },
  { id: "robe-silver", kind: "robe", name: "Silver dress robes", icon: "🧥", price: 110, value: "#b8c2cc", description: "For the Yule Ball - or a very good day of coding." },

  { id: "ed-dungeon", kind: "editor", name: "Dungeon ink", icon: "🧪", price: 50, value: "dungeon", description: "Your wand's editor in potion-green on stone." },
  { id: "ed-starlight", kind: "editor", name: "Starlight", icon: "🌌", price: 80, value: "starlight", description: "Code written across the night sky." },
  { id: "ed-parchment", kind: "editor", name: "Old parchment", icon: "📜", price: 60, value: "parchment", description: "Ink on aged parchment, even at night." },
  { id: "ed-ember", kind: "editor", name: "Ember", icon: "🔥", price: 0, giftOnly: true, value: "ember", description: "A level reward: code that glows like the Goblet of Fire." },

  { id: "title-unflappable", kind: "title", name: "the Unflappable", icon: "🎖️", price: 40, value: "the Unflappable", description: "For those who meet a SyntaxError with calm." },
  { id: "title-bugtamer", kind: "title", name: "the Bug-Tamer", icon: "🎖️", price: 60, value: "the Bug-Tamer", description: "Creatures of the code fear you." },
  { id: "title-curious", kind: "title", name: "the Curious", icon: "🎖️", price: 0, giftOnly: true, value: "the Curious", description: "A level reward, for asking why." },
  { id: "title-prince", kind: "title", name: "the Half-Blood Pythonista", icon: "🎖️", price: 250, minLevel: 10, value: "the Half-Blood Pythonista", description: "Margin notes optional." },

  { id: "banner-house", kind: "banner", name: "House banner", icon: "🏳️", price: 40, value: "house", description: "Your house colours over the Great Hall." },
  { id: "banner-stars", kind: "banner", name: "Enchanted-ceiling banner", icon: "✨", price: 70, value: "stars", description: "A strip of the Great Hall's ceiling, just for you." },
  { id: "banner-snitch", kind: "banner", name: "Golden Snitch banner", icon: "🟡", price: 120, value: "snitch", description: "It flutters. It's a little distracting. It's wonderful." },
  { id: "banner-crest", kind: "banner", name: "Hogwarts crest", icon: "🛡️", price: 0, giftOnly: true, value: "crest", description: "A level reward: all four houses together." },
];

export const AIDS: Aid[] = [
  {
    id: "felix",
    name: "Felix Felicis",
    icon: "🧪",
    price: 60,
    perYear: 3,
    description: "Liquid luck. Drink it before unlocking a hint: that hint costs no XP and doesn't lower your grade. (It never reveals answers.)",
  },
  {
    id: "sand",
    name: "Time-Turner sand",
    icon: "⏳",
    price: 80,
    perYear: 3,
    description: "Turn back time on a finished exercise: its hints and attempts reset, so you can earn a better grade.",
  },
];

export const itemById = (id: string) => ITEMS.find((i) => i.id === id);
export const aidById = (id: AidId) => AIDS.find((a) => a.id === id)!;
