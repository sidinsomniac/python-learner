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
  | "time-turner";

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

/** A random preset - never the same as the one before. */
export function pickPreset(previous: Preset | null, rng: () => number = Math.random): Preset {
  const choices = PRESETS.map((p) => p.id).filter((id) => id !== previous);
  return choices[Math.floor(rng() * choices.length) % choices.length];
}
