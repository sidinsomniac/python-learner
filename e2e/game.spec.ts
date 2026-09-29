import { expect, test, type Page } from "@playwright/test";

const SAVE_KEY = "parseltongue-save-v1";

async function seed(page: Page, state: Record<string, unknown> = {}) {
  await page.addInitScript(
    ([key, s]) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify({ state: { name: "Tester", house: "ravenclaw", ...s }, version: 1 }));
      }
    },
    [SAVE_KEY, state] as const,
  );
}

async function setCode(page: Page, code: string) {
  const editor = page.getByLabel("Quest code editor").locator(".cm-content");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("Delete");
  await page.keyboard.insertText(code);
}

async function waitForPython(page: Page) {
  await expect(page.getByText("🐍 Ready")).toBeVisible({ timeout: 60_000 });
}

test("a new student is sorted, gets questions (not answers), and completes the first quest", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Sign your name to accept...").fill("Neville");
  await page.getByRole("button", { name: /Accept my place/ }).click();

  for (let i = 0; i < 4; i++) await page.locator(".btn.answer").first().click();
  await page.getByRole("button", { name: /Take my seat/ }).click();

  await expect(page.getByRole("heading", { name: "The Great Hall" })).toBeVisible();
  await expect(page.getByTestId("quest-y1-q2-naming-yourself")).toBeDisabled();
  await page.getByTestId("quest-y1-q1-first-incantation").click();
  await page.getByRole("tab", { name: /Task/ }).click();
  await waitForPython(page);

  // A wrong spell gets a guiding question and never the solution.
  await setCode(page, 'print("hello hogwarts")');
  await page.getByTestId("cast").click();
  const feedback = page.getByTestId("feedback");
  await expect(feedback).toContainText("?");
  await expect(feedback).not.toContainText('print("Hello, Hogwarts!")');

  // Hints unlock one rung at a time.
  await page.getByTestId("unlock-hint").click();
  await expect(page.getByTestId("hint-1")).toBeVisible();
  await expect(page.getByTestId("hint-2")).toHaveCount(0);

  await setCode(page, 'print("Hello, Hogwarts!")\nprint("I am ready to learn magic.")');
  await page.getByTestId("cast").click();
  const reward = page.getByTestId("reward");
  await expect(reward).toContainText("Quest complete");
  await expect(reward).toContainText("XP");
  await expect(reward).toContainText("Dobby's Sock");

  await reward.getByRole("button", { name: "Great Hall" }).click();
  await expect(page.getByTestId("quest-y1-q2-naming-yourself")).toBeEnabled();
});

test("an infinite loop is stopped instead of freezing the castle", async ({ page }) => {
  await seed(page);
  await page.goto("/#/quest/y1-q1-first-incantation");
  await page.getByRole("tab", { name: /Task/ }).click();
  await waitForPython(page);
  await setCode(page, "while True:\n    pass\n");
  await page.getByTestId("run").click();
  await expect(page.getByTestId("console")).toContainText("ran for too long", { timeout: 20_000 });

  // Python restarts and works again afterwards.
  await setCode(page, 'print("still alive")');
  await page.getByTestId("run").click();
  await expect(page.getByTestId("console")).toContainText("still alive", { timeout: 60_000 });
});

test("printing Lumos brightens the castle", async ({ page }) => {
  await seed(page);
  await page.goto("/#/quest/y1-q1-first-incantation");
  await page.getByRole("tab", { name: /Task/ }).click();
  await waitForPython(page);
  await setCode(page, 'print("Lumos")');
  await page.getByTestId("run").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await setCode(page, 'print("Nox")');
  await page.getByTestId("run").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("repairing the broken letter spell via runtime error feedback", async ({ page }) => {
  const done = { completedAt: "2026-01-01", attempts: 1, hintsUsed: 0, xpEarned: 1 };
  await seed(page, {
    completed: {
      "y1-q1-first-incantation": done,
      "y1-q2-naming-yourself": done,
      "y1-q3-scrambled-scroll": done,
      "y1-q4-divining-the-cauldron": done,
    },
  });
  await page.goto("/#/quest/y1-q5-broken-letter-potion");
  await page.getByRole("tab", { name: /Task/ }).click();
  await waitForPython(page);
  await page.getByTestId("cast").click();
  await expect(page.getByTestId("feedback")).toContainText("TypeError");
  await expect(page.getByTestId("console")).toContainText("TypeError");
});

test("divination accepts a correct prophecy", async ({ page }) => {
  const done = { completedAt: "2026-01-01", attempts: 1, hintsUsed: 0, xpEarned: 1 };
  await seed(page, {
    completed: { "y1-q1-first-incantation": done, "y1-q2-naming-yourself": done, "y1-q3-scrambled-scroll": done },
  });
  await page.goto("/#/quest/y1-q4-divining-the-cauldron");
  await page.getByRole("tab", { name: /Task/ }).click();
  await waitForPython(page);
  await page.getByTestId("prophecy").fill("10\n21\n3.5\n3\n2\n73");
  await page.getByTestId("reveal").click();
  await expect(page.getByTestId("feedback")).toContainText("Line 5");
  await page.getByTestId("prophecy").fill("10\n21\n3.5\n3\n1\n73");
  await page.getByTestId("reveal").click();
  await expect(page.getByTestId("reward")).toContainText("Quest complete");
});

test("the scrambled ledger can be put back in order", async ({ page }) => {
  const done = { completedAt: "2026-01-01", attempts: 1, hintsUsed: 0, xpEarned: 1 };
  await seed(page, { completed: { "y1-q1-first-incantation": done, "y1-q2-naming-yourself": done } });
  await page.goto("/#/quest/y1-q3-scrambled-scroll");
  await page.getByRole("tab", { name: /Task/ }).click();
  await waitForPython(page);
  // Start: [*2, print, =10, +5] -> target: [=10, +5, *2, print]
  await page.getByLabel("Move line 3 up").click(); // [*2, =10, print, +5]
  await page.getByLabel("Move line 2 up").click(); // [=10, *2, print, +5]
  await page.getByLabel("Move line 4 up").click(); // [=10, *2, +5, print]
  await page.getByLabel("Move line 3 up").click(); // [=10, +5, *2, print]
  await page.getByTestId("cast").click();
  await expect(page.getByTestId("reward")).toContainText("Quest complete");
});
