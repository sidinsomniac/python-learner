// The castle's living-background presets, picked at random for each screen.

export type Preset =
  | "candles"
  | "snow"
  | "storm"
  | "embers"
  | "mist"
  | "fireflies"
  | "leaves"
  | "aurora"
  | "shooting-stars"
  | "owl-post"
  | "patronus"
  | "snitch"
  | "floo"
  | "fawkes"
  | "lake"
  | "express"
  | "pensieve"
  | "time-turner"
  // Only while the matching banner is equipped:
  | "house-colours"
  | "constellations"
  | "quidditch"
  | "four-houses";

export const PRESETS: { id: Preset; name: string }[] = [
  { id: "candles", name: "Enchanted Ceiling" },
  { id: "snow", name: "First Snow" },
  { id: "storm", name: "Storm over the Lake" },
  { id: "embers", name: "Goblet Embers" },
  { id: "mist", name: "Dementor Mist" },
  { id: "fireflies", name: "Forbidden Forest" },
  { id: "leaves", name: "Autumn Grounds" },
  { id: "aurora", name: "Aurora" },
  { id: "shooting-stars", name: "Astronomy Tower" },
  { id: "owl-post", name: "Owl Post" },
  { id: "patronus", name: "Expecto Patronum" },
  { id: "snitch", name: "The Golden Snitch" },
  { id: "floo", name: "The Floo Network" },
  { id: "fawkes", name: "Fawkes" },
  { id: "lake", name: "The Black Lake" },
  { id: "express", name: "The Hogwarts Express" },
  { id: "pensieve", name: "The Pensieve" },
  { id: "time-turner", name: "The Time-Turner" },
];

/** Backgrounds a common-room banner adds to the pool while it's equipped (by the banner's value). */
export const BANNER_PRESETS: Record<string, { id: Preset; name: string }> = {
  house: { id: "house-colours", name: "House Colours" },
  stars: { id: "constellations", name: "Constellations" },
  snitch: { id: "quidditch", name: "The Quidditch Pitch" },
  crest: { id: "four-houses", name: "The Four Houses" },
};

/**
 * A random preset - never the same as the one before. `extra` adds a banner's
 * own background, which counts twice so it turns up a little more often.
 */
export function pickPreset(previous: Preset | null, rng: () => number = Math.random, extra: Preset[] = []): Preset {
  const choices = [...PRESETS.map((p) => p.id), ...extra, ...extra].filter((id) => id !== previous);
  return choices[Math.floor(rng() * choices.length) % choices.length];
}
