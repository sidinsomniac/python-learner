// Background music: audio files from the project's `music/` folder, played
// quietly behind the game with no visible player.
//
// Drop .mp3 / .m4a / .ogg / .opus / .wav / .aac / .flac files into `music/`
// and they're picked up at build time. The folder's contents are kept out of
// git (only its README is tracked), so personal copies of music are never
// published; our own tracks can be un-ignored there when they're made.

export interface Track {
  title: string;
  /** The URL Vite gives the file in the build. */
  src: string;
}

export interface MusicSettings {
  /** Music on or off (the 🎵 button in the header). */
  enabled: boolean;
  /** 0 to 100. Kept low by default: the music is a background, not a concert. */
  volume: number;
}

export const DEFAULT_MUSIC: MusicSettings = { enabled: true, volume: 25 };

/** "02 - hedwigs-flight_v2.mp3" -> "Hedwigs Flight V2" */
export function trackTitle(path: string): string {
  const file = path.split("/").pop() ?? path;
  const stem = file.replace(/\.[^.]+$/, "").replace(/^\d+\s*[-_.]\s*/, "");
  return stem
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

/** Turns a glob of file paths -> URLs into tracks, in file-name order. */
export function tracksFrom(files: Record<string, string>): Track[] {
  return Object.keys(files)
    .sort()
    .map((path) => ({ title: trackTitle(path), src: files[path] }));
}

/** A shuffled play order that never starts with the track that just played. */
export function shuffleOrder(count: number, avoidFirst: number | null, rng: () => number = Math.random): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (count > 1 && order[0] === avoidFirst) [order[0], order[1]] = [order[1], order[0]];
  return order;
}

/** Every track in `music/`, found at build time. */
export const TRACKS: Track[] = tracksFrom(
  import.meta.glob("/music/*.{mp3,m4a,ogg,opus,wav,aac,flac}", { query: "?url", import: "default", eager: true }) as Record<string, string>,
);
