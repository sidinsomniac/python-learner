import { describe, expect, it } from "vitest";
import { ITEMS } from "../../lore/shop";
import { add, advance, LOOKS, MAX_PARTICLES, spawn, spawnPuff, type Particle, type WandEffect } from "./effects";

const EFFECTS = Object.keys(LOOKS) as WandEffect[];

describe("wand effects", () => {
  it("gives every wand in Ollivanders its own effect", () => {
    const wands = ITEMS.filter((i) => i.kind === "wand");
    expect(wands.every((w) => w.effect && LOOKS[w.effect])).toBe(true);
    expect(new Set(wands.map((w) => w.effect)).size).toBe(wands.length);
  });

  it("casts something for every effect, and every particle eventually fades away", () => {
    for (const effect of EFFECTS) {
      const list: Particle[] = [];
      add(list, spawn(effect, 100, 100, 5, { x: 140, y: 40 }));
      add(list, spawnPuff(effect, 100, 100));
      expect(list.length, effect).toBeGreaterThan(0);
      for (let i = 0; i < 400 && list.length; i++) advance(list, 1 / 60);
      expect(list.length, effect).toBe(0);
    }
  });

  it("turns a falling raindrop into a ripple where it lands", () => {
    const list = spawn("ripples", 50, 80, 1).filter((p) => p.part === "drop");
    for (let i = 0; i < 60 && list.some((p) => p.part === "drop"); i++) advance(list, 1 / 60);
    expect(list.some((p) => p.part === "ring" && p.y === 80)).toBe(true);
  });

  it("throws the Elder Wand's lightning only every fifth keystroke", () => {
    const bolts = (n: number) => spawn("patronus", 0, 0, n, { x: 30, y: -30 }).filter((p) => p.part === "bolt").length;
    expect(bolts(5)).toBe(1);
    expect(bolts(10)).toBe(1);
    expect(bolts(3)).toBe(0);
  });

  it("never holds more than the particle cap, however fast you type", () => {
    const list: Particle[] = [];
    for (let i = 0; i < 200; i++) add(list, spawn("patronus", i, 0, i, { x: 0, y: 0 }));
    expect(list.length).toBe(MAX_PARTICLES);
  });
});
