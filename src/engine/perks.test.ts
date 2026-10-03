import { describe, expect, it } from "vitest";
import { ITEMS } from "../lore/shop";
import { TIER_REWARD } from "./types";
import * as perks from "./perks";

describe("Diagon Alley prices and purposes", () => {
  it("gives every item something it does: a wand effect, a perk, or an editor theme", () => {
    for (const item of ITEMS) {
      const purpose = item.effect ?? item.perk ?? (item.kind === "editor" ? item.value : undefined);
      expect(purpose, item.id).toBeTruthy();
    }
  });

  it("keeps the catalogue out of reach of a single year's earnings", () => {
    // A full Year 1: 20 lessons x (warm-up, core, outstanding), 9 review cards, 4 Trial stages, plus level rewards.
    const t = TIER_REWARD;
    const year1 = 20 * (t.warmup.galleons + t.core.galleons + t.outstanding.galleons) + 9 * t.review.galleons + 4 * t.stage.galleons + 55;
    const total = ITEMS.filter((i) => !i.giftOnly).reduce((a, i) => a + i.price, 0);
    expect(year1 / total).toBeLessThan(0.3);
    // ...while every starter item can be bought in Year 1.
    const cheapest = ITEMS.filter((i) => i.price > 0 && !i.minLevel).sort((a, b) => a.price - b.price)[0];
    expect(cheapest.price).toBeLessThan(year1 / 4);
  });
});

describe("perks", () => {
  it("adds Galleons for the Niffler and the Bug-Tamer on repairs", () => {
    expect(perks.exerciseGalleons({}, 10, "practice")).toBe(10);
    expect(perks.exerciseGalleons({ familiar: "fam-niffler" }, 10, "practice")).toBe(12);
    expect(perks.exerciseGalleons({ title: "title-bugtamer" }, 10, "repair")).toBe(15);
    expect(perks.exerciseGalleons({ title: "title-bugtamer" }, 10, "practice")).toBe(10);
  });

  it("gives house points, XP and forgiveness from the right items", () => {
    expect(perks.exerciseHousePoints({ familiar: "fam-puff" }, 5)).toBe(7);
    expect(perks.exerciseXp({ title: "title-prince" }, 100)).toBe(110);
    expect(perks.countedAttempts({ title: "title-unflappable" }, 2)).toBe(1);
    expect(perks.countedAttempts({}, 2)).toBe(2);
    expect(perks.freeFirstHint({ title: "title-curious" })).toBe(true);
  });

  it("pays more for the first daily review with an owl or a toad", () => {
    expect(perks.reviewGalleons({})).toBe(3);
    expect(perks.reviewGalleons({ familiar: "fam-owl" })).toBe(5);
    expect(perks.reviewGalleons({ familiar: "fam-toad" })).toBe(5);
  });

  it("lets the rat save a streak only for one missed day, once a week", () => {
    const rat = { familiar: "fam-rat" };
    expect(perks.ratSavesStreak(rat, null, "2026-10-10", 1)).toBe(true);
    expect(perks.ratSavesStreak(rat, null, "2026-10-10", 2)).toBe(false);
    expect(perks.ratSavesStreak(rat, "2026-10-05", "2026-10-10", 1)).toBe(false);
    expect(perks.ratSavesStreak(rat, "2026-10-01", "2026-10-10", 1)).toBe(true);
    expect(perks.ratSavesStreak({}, null, "2026-10-10", 1)).toBe(false);
  });

  it("caps repeat duel wins, with dragon-hide and silver robes adding to them", () => {
    expect(perks.duelGalleons({}, 15, true)).toBe(15);
    expect(perks.duelGalleons({}, 15, false)).toBe(1);
    expect(perks.duelGalleons({ robe: "robe-dragonhide" }, 15, true)).toBe(19);
    expect(perks.duelHousePoints({ robe: "robe-silver" })).toBe(20);
    expect(perks.duelPerks({ robe: "robe-maroon" }).extraSeconds).toBe(3);
    expect(perks.duelPerks({ robe: "robe-midnight" }).shield).toBe(true);
  });

  it("lets the Niffler pocket once a day, and the phoenix give sand once a year", () => {
    const n = { familiar: "fam-niffler" };
    expect(perks.nifflerPockets(n, null, "2026-10-10")).toBe(true);
    expect(perks.nifflerPockets(n, "2026-10-10", "2026-10-10")).toBe(false);
    const p = { familiar: "fam-phoenix" };
    expect(perks.phoenixRebirth(p, 2, {})).toBe(true);
    expect(perks.phoenixRebirth(p, 2, { 2: "x" })).toBe(false);
  });
});
