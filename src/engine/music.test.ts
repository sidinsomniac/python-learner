import { describe, expect, it } from "vitest";
import { DEFAULT_MUSIC, shuffleOrder, trackTitle, tracksFrom } from "./music";

describe("background music", () => {
  it("is on, and quiet, by default", () => {
    expect(DEFAULT_MUSIC.enabled).toBe(true);
    expect(DEFAULT_MUSIC.volume).toBeLessThanOrEqual(30);
  });

  it("turns file names into titles", () => {
    expect(trackTitle("/music/02 - great-hall_theme.mp3")).toBe("Great Hall Theme");
    expect(trackTitle("/music/snow.ogg")).toBe("Snow");
    expect(trackTitle("/music/1.mp3")).toBe("1");
  });

  it("lists tracks in file-name order", () => {
    const tracks = tracksFrom({ "/music/b.mp3": "/assets/b.mp3", "/music/a.mp3": "/assets/a.mp3" });
    expect(tracks.map((t) => t.title)).toEqual(["A", "B"]);
    expect(tracks[0].src).toBe("/assets/a.mp3");
  });

  it("shuffles every track once, never starting with the one just played", () => {
    for (let i = 0; i < 50; i++) {
      const order = shuffleOrder(5, 3);
      expect([...order].sort()).toEqual([0, 1, 2, 3, 4]);
      expect(order[0]).not.toBe(3);
    }
    expect(shuffleOrder(1, 0)).toEqual([0]);
    expect(shuffleOrder(0, null)).toEqual([]);
  });
});
