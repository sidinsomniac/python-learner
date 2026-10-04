import { expect, type Page } from "@playwright/test";

// Shared by the e2e specs: seeding a save and driving the editor.

export const SAVE_KEY = "parseltongue-save-v1";

export type Save = Record<string, unknown>;

/** Story and level-up pop-ups appear at unpredictable moments; close them whenever they get in the way. */
export async function autoDismissPopups(page: Page) {
  // noWaitAfter: several scenes can be queued, each with its own Skip button.
  await page.addLocatorHandler(page.getByTestId("scene-skip"), (skip) => skip.click(), { noWaitAfter: true });
  await page.addLocatorHandler(page.getByRole("button", { name: "Wonderful!" }), (ok) => ok.click(), { noWaitAfter: true });
}

export async function seed(page: Page, state: Save = {}, version = 3) {
  await autoDismissPopups(page);
  await page.addInitScript(
    ([key, s, v]) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify({ state: { name: "Tester", house: "ravenclaw", ...s }, version: v }));
      }
    },
    [SAVE_KEY, state, version] as const,
  );
}

/** Records for the required exercises of the given lessons. */
export function completed(lessons: string[]) {
  const rec = { completedAt: "2026-01-01", attempts: 1, hintsUsed: 0, xpEarned: 1, grade: "E" };
  const out: Record<string, typeof rec> = {};
  for (const id of lessons) {
    const slots = id.endsWith("-trial") ? ["stage1", "stage2", "stage3", "stage4"] : id.includes("-r") ? ["r1", "r2", "r3"] : ["warmup", "core"];
    for (const slot of slots) out[`${id}.${slot}`] = rec;
  }
  return out;
}

export const YEAR1 = ["y1-l01", "y1-l02", "y1-l03", "y1-r1", "y1-l04a", "y1-l04b", "y1-l05", "y1-l06", "y1-l07", "y1-l08a", "y1-l08b", "y1-r2", "y1-l09", "y1-l10a", "y1-l10b", "y1-l11", "y1-l12", "y1-l13a", "y1-l13b", "y1-r3", "y1-l14a", "y1-l14b", "y1-l15"];
export const YEAR2 = ["y2-l01a", "y2-l01b", "y2-l02", "y2-l03a", "y2-l03b", "y2-l03c", "y2-r1", "y2-l04", "y2-l05", "y2-l06a", "y2-l06b", "y2-l07", "y2-r2", "y2-l08", "y2-l09", "y2-l10", "y2-l11", "y2-l12", "y2-r3", "y2-l13", "y2-l14"];
export const YEAR2_TO_L06 = ["y2-l01a", "y2-l01b", "y2-l02", "y2-l03a", "y2-l03b", "y2-l03c", "y2-r1", "y2-l04", "y2-l05", "y2-l06a", "y2-l06b"];

export async function setCode(page: Page, code: string) {
  const editor = page.getByLabel("Quest code editor").locator(".cm-content");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("Delete");
  await page.keyboard.insertText(code);
}

export async function waitForPython(page: Page) {
  await expect(page.getByText("🐍 Ready")).toBeVisible({ timeout: 60_000 });
}

