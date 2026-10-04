import { expect, test, type Page } from "@playwright/test";
import { completed, seed, setCode, YEAR1, YEAR2 } from "./helpers";

// Screenshot tests: catch visual regressions (like a year's background
// pattern leaking into another palette) that behaviour tests can't see.
// Baselines live in visual.spec.ts-snapshots/. After a deliberate visual
// change, refresh them with `npm run e2e:update` and look at the diff.

test.use({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });

const YEARS_1_2 = [...YEAR1, "y1-trial", ...YEAR2, "y2-trial"];
const later = { box: 2, due: "2999-01-01", misses: 0 };

/** Wait until fonts and lazy screens have settled, then compare. */
async function snap(page: Page, name: string) {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".summoning")).toHaveCount(0);
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: false,
    animations: "disabled",
    caret: "hide",
    // The Python chip changes as Python loads, and the header's due count follows today's date.
    mask: [page.locator(".chip"), page.locator(".due-badge")],
    maxDiffPixels: 100, threshold: 0.05,
  });
}

for (const palette of [1, 2, 3]) {
  test(`the Great Hall in Year ${palette}'s castle colours`, async ({ page }) => {
    await seed(page, { exercises: completed(YEARS_1_2), castleColours: palette, bestLevel: 6 });
    await page.goto("/#/");
    await expect(page.locator("html")).toHaveAttribute("data-palette", String(palette));
    await snap(page, `great-hall-y${palette}`);
  });
}

test("Diagon Alley", async ({ page }) => {
  await seed(page, { exercises: completed(YEAR1), galleons: 120, bestLevel: 4 });
  await page.goto("/#/shop");
  await expect(page.locator(".shop-item").first()).toBeVisible();
  await snap(page, "shop");
});

test("Settings", async ({ page }) => {
  await seed(page, { exercises: completed(YEAR1) });
  await page.goto("/#/settings");
  await expect(page.getByTestId("colours-1")).toBeVisible();
  await snap(page, "settings");
});

for (const theme of ["ed-dungeon", "ed-parchment", "ed-pensieve", "ed-ember"]) {
  test(`the quest editor in the ${theme} theme`, async ({ page }) => {
    await seed(page, { owned: { "wand-holly": "start", [theme]: "x" }, equipped: { wand: "wand-holly", editor: theme }, wandFx: false });
    await page.goto("/#/lesson/y1-l01");
    await page.getByTestId("tab-warmup").click();
    const editor = page.getByLabel("Quest code editor");
    await expect(editor.locator(".cm-content")).toBeVisible();
    // A little of everything, so every syntax colour shows.
    await setCode(page, '# brew a potion\ndef brew(drops: int) -> str:\n    if drops > 3 and True:\n        return f"{drops} drops"\n    return "none"\nprint(brew(4), [1, 2.5], None)');
    await page.mouse.click(0, 0);
    await page.evaluate(() => document.fonts.ready);
    await expect(editor).toHaveScreenshot(`editor-${theme}.png`, { animations: "disabled", caret: "hide", maxDiffPixels: 100, threshold: 0.05 });
  });
}

test("a Time-Turner spot-the-bug card", async ({ page }) => {
  await seed(page, {
    bestLevel: 2,
    exercises: completed(["y2-l07"]),
    cards: { "y2-l07#print-none": later, "y2-l07#print-vs-return": later, "y2-l07#early-return": later },
  });
  await page.goto("/#/time-turner");
  await page.getByTestId("review-start").click();
  await expect(page.getByTestId("bug-lines")).toBeVisible();
  await expect(page.getByTestId("review-card")).toHaveScreenshot("time-turner-bug.png", { animations: "disabled", maxDiffPixels: 100, threshold: 0.05 });
});

test("the Marauder's Ledger", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-04T12:00:00"));
  const d = (exercises: number, cards = 0, correct = 0, duels = 0) => ({ exercises, cards, correct, duels });
  await seed(page, {
    bestLevel: 6,
    exercises: completed(YEAR1),
    activity: { "2026-09-28": d(3), "2026-09-30": d(1, 5, 4), "2026-10-01": d(0, 3, 3, 1), "2026-10-03": d(6), "2026-10-04": d(2, 5, 2) },
    duels: { neville: { wins: 3, losses: 0, draws: 1 } },
  });
  await page.goto("/#/progress");
  await expect(page.getByTestId("heatmap")).toBeVisible();
  await snap(page, "ledger");
});
