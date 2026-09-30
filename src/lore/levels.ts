export type Feature = "time-turner" | "dueling-club" | "ollivanders" | "duel-masters";

export interface LevelReward {
  level: number;
  text: string;
  galleons?: number;
  item?: string;
  unlock?: Feature;
}

/** What each level brings. Levels are never lost once reached (bestLevel). */
export const LEVEL_REWARDS: LevelReward[] = [
  { level: 2, text: "The Time-Turner: daily review to keep every spell fresh", unlock: "time-turner", galleons: 10 },
  { level: 3, text: "The Dueling Club opens its doors", unlock: "dueling-club" },
  { level: 4, text: "A snowy owl familiar", item: "fam-owl" },
  { level: 5, text: "Ollivanders' premium wands appear in the shop", unlock: "ollivanders", galleons: 20 },
  { level: 6, text: "The Ember editor theme", item: "ed-ember" },
  { level: 7, text: 'The title "the Curious"', item: "title-curious", galleons: 25 },
  { level: 8, text: "Duel the masters: Hermione and Professor Snape", unlock: "duel-masters" },
  { level: 9, text: "A half-Kneazle cat familiar", item: "fam-cat" },
  { level: 10, text: "The Hogwarts crest banner", item: "banner-crest", galleons: 50 },
  { level: 11, text: "Midnight robes", item: "robe-midnight", galleons: 30 },
  { level: 12, text: "Phoenix chicks appear in the Magical Menagerie", galleons: 60 },
  { level: 13, text: "The Starlight editor theme", item: "ed-starlight" },
  { level: 14, text: "A purse of Galleons from Gringotts", galleons: 100 },
  { level: 15, text: "Silver dress robes", item: "robe-silver" },
  { level: 16, text: "A Niffler familiar (hold on to your Galleons)", item: "fam-niffler" },
  { level: 17, text: "A goblin-made purse", galleons: 150 },
  { level: 18, text: "The Golden Snitch banner", item: "banner-snitch" },
  { level: 19, text: "A vault upgrade at Gringotts", galleons: 200 },
  { level: 20, text: "A replica of the Elder Wand - you've earned it", item: "wand-elder", galleons: 300 },
];

export const FEATURE_LEVEL: Record<Feature, number> = Object.fromEntries(
  LEVEL_REWARDS.filter((r) => r.unlock).map((r) => [r.unlock!, r.level]),
) as Record<Feature, number>;

export const hasFeature = (bestLevel: number, feature: Feature) => bestLevel >= FEATURE_LEVEL[feature];

export const rewardsBetween = (fromExclusive: number, toInclusive: number) =>
  LEVEL_REWARDS.filter((r) => r.level > fromExclusive && r.level <= toInclusive);
