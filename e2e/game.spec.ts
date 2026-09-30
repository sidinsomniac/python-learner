import { expect, test, type Page } from "@playwright/test";

const SAVE_KEY = "parseltongue-save-v1";

type Save = Record<string, unknown>;

async function seed(page: Page, state: Save = {}, version = 2) {
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
function completed(lessons: string[]) {
  const rec = { completedAt: "2026-01-01", attempts: 1, hintsUsed: 0, xpEarned: 1, grade: "E" };
  const out: Record<string, typeof rec> = {};
  for (const id of lessons) {
    const slots = id.includes("-r") ? ["r1", "r2", "r3"] : ["warmup", "core"];
    for (const slot of slots) out[`${id}.${slot}`] = rec;
  }
  return out;
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

test("a new student hears the story, answers a checkpoint, and gets questions (not answers)", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Sign your name to accept...").fill("Neville");
  await page.getByRole("button", { name: /Accept my place/ }).click();
  for (let i = 0; i < 4; i++) await page.locator(".btn.answer").first().click();
  await page.getByRole("button", { name: /Take my seat/ }).click();

  // The year's prologue plays on the Great Hall.
  await expect(page.getByText("This year's mystery: The Jinxed Ledger")).toBeVisible();
  await expect(page.getByTestId("lesson-y1-l02")).toBeDisabled();
  await page.getByTestId("lesson-y1-l01").click();

  // Story beat, told line by line.
  const scene = page.getByTestId("cutscene").first();
  await expect(scene).toContainText("Every witch and wizard begins");
  await scene.getByTestId("scene-next").click();
  await expect(scene).toContainText("olleH");

  // An inline checkpoint in the lecture.
  const checkpoint = page.getByTestId("checkpoint").first();
  await checkpoint.getByRole("button", { name: "print(Nox)" }).click();
  await expect(checkpoint).toContainText("Not quite");
  await checkpoint.getByRole("button", { name: 'print("Nox")', exact: true }).click();
  await expect(checkpoint).toContainText("Correct");

  // Exercises unlock in order.
  await expect(page.getByTestId("tab-core")).toBeDisabled();
  await page.getByTestId("tab-warmup").click();
  await waitForPython(page);

  await setCode(page, 'print("hello hogwarts")');
  await page.getByTestId("cast").click();
  const feedback = page.getByTestId("feedback");
  await expect(feedback).toContainText("?");
  await expect(feedback).not.toContainText('print("Hello, Hogwarts!")');

  await page.getByTestId("unlock-hint").click();
  await expect(page.getByTestId("hint-1")).toBeVisible();
  await expect(page.getByTestId("hint-2")).toHaveCount(0);

  await setCode(page, 'print("Hello, Hogwarts!")\nprint("I am ready to learn magic.")');
  await page.getByTestId("cast").click();
  const reward = page.getByTestId("reward");
  await expect(reward).toContainText("Spell mastered");
  await expect(reward).toContainText("Exceeds Expectations"); // one hint used
  await expect(reward).toContainText("Dobby's Sock");
  await reward.getByRole("button", { name: /Next: 🔥/ }).click();
  await expect(page.getByTestId("tab-core")).toHaveAttribute("aria-selected", "true");
});

test("finishing a lesson's required exercises reveals the clue and opens the next lesson", async ({ page }) => {
  await seed(page, { exercises: { "y1-l01.warmup": { completedAt: "x", attempts: 1, hintsUsed: 0, xpEarned: 1, grade: "E" } } });
  await page.goto("/#/lesson/y1-l01");
  await waitForPython(page);
  await page.getByTestId("tab-core").click();
  await setCode(page, `print('Hagrid said "Yer a wizard!"')\nprint()\nprint("Then he sat on the cake.")`);
  await page.getByTestId("cast").click();
  const reward = page.getByTestId("reward");
  await expect(reward).toContainText("Clue discovered");
  await expect(reward).toContainText("page 1 of the Spell Ledger");
  await reward.getByRole("button", { name: /Next: ⭐/ }).click();
  await page.goto("/#/");
  await expect(page.getByTestId("lesson-y1-l02")).toBeEnabled();
  await page.goto("/#/casefile");
  await expect(page.getByText("Clues found: 1 of")).toBeVisible();
});

test("Snape reviews a passing spell, and fixing his remark earns an O", async ({ page }) => {
  await seed(page, { exercises: completed(["y1-l01", "y1-l02", "y1-l03", "y1-r1", "y1-l04a", "y1-l04b", "y1-l05"]) });
  await page.goto("/#/lesson/y1-l06");
  await waitForPython(page);
  await page.getByTestId("tab-warmup").click();
  const solution = 'price = float(input("Price? "))\nqty = int(input("How many? "))\nprint(f"Total: {price * qty:.2f} Galleons")';
  await setCode(page, `spare = 1\n${solution}`);
  await page.getByTestId("cast").click();
  await expect(page.getByTestId("snape-review")).toContainText("never used again");
  await expect(page.getByTestId("reward")).toContainText("Exceeds Expectations");
  await page.getByRole("button", { name: "Stay here" }).click();

  await setCode(page, solution);
  await page.getByTestId("cast").click();
  await expect(page.getByTestId("reward")).toContainText("Grade improved to Outstanding");
  await expect(page.getByTestId("snape-review")).toHaveCount(0);
});

test("the Pensieve replays a spell line by line", async ({ page }) => {
  await seed(page);
  await page.goto("/#/lesson/y1-l01");
  await page.getByTestId("tab-warmup").click();
  await waitForPython(page);
  await setCode(page, 'x = 1\nx = x + 2\nprint(x)');
  await page.getByTestId("pensieve-open").click();
  const pensieve = page.getByTestId("pensieve");
  await expect(pensieve).toContainText("about to run line 1");
  await pensieve.getByRole("button", { name: "Next step" }).click();
  await expect(pensieve.locator(".vars")).toContainText("1");
  await pensieve.getByRole("button", { name: "Next step" }).click();
  await pensieve.getByRole("button", { name: "Next step" }).click();
  await expect(pensieve).toContainText("The spell has finished");
  await expect(pensieve.locator(".console")).toContainText("3");
});

test("an infinite loop is stopped instead of freezing the castle", async ({ page }) => {
  await seed(page);
  await page.goto("/#/lesson/y1-l01");
  await page.getByTestId("tab-warmup").click();
  await waitForPython(page);
  await setCode(page, "while True:\n    pass\n");
  await page.getByTestId("run").click();
  await expect(page.getByTestId("console")).toContainText("ran for too long", { timeout: 20_000 });
  await setCode(page, 'print("still alive")');
  await page.getByTestId("run").click();
  await expect(page.getByTestId("console")).toContainText("still alive", { timeout: 60_000 });
});

test("printing Lumos brightens the castle", async ({ page }) => {
  await seed(page);
  await page.goto("/#/lesson/y1-l01");
  await page.getByTestId("tab-warmup").click();
  await waitForPython(page);
  await setCode(page, 'print("Lumos")');
  await page.getByTestId("run").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("divination and scramble exercises work", async ({ page }) => {
  await seed(page, { exercises: completed(["y1-l01", "y1-l02", "y1-l03", "y1-r1"]) });
  await page.goto("/#/lesson/y1-l04a");
  await waitForPython(page);
  await page.getByTestId("tab-warmup").click();
  await page.getByTestId("prophecy").fill("10\n21\n3.5\n3\n0\n23");
  await page.getByTestId("reveal").click();
  await expect(page.getByTestId("feedback")).toContainText("Line 5");
  await page.getByTestId("prophecy").fill("10\n21\n3.5\n3\n1\n23");
  await page.getByTestId("reveal").click();
  await expect(page.getByTestId("reward")).toContainText("Spell mastered");

  await page.goto("/#/lesson/y1-l03");
  await page.getByTestId("tab-warmup").click();
  // Start: [*2, print, =10, +5] -> target: [=10, +5, *2, print]
  await page.getByLabel("Move line 3 up").click();
  await page.getByLabel("Move line 2 up").click();
  await page.getByLabel("Move line 4 up").click();
  await page.getByLabel("Move line 3 up").click();
  await page.getByTestId("cast").click();
  await expect(page.getByTestId("reward")).toContainText("Spell mastered");
});

test("a save from the first slice is carried over to the new lessons", async ({ page }) => {
  await seed(
    page,
    {
      xp: 180,
      completed: {
        "y1-q1-first-incantation": { completedAt: "x", attempts: 1, hintsUsed: 0, xpEarned: 63 },
        "y1-q2-naming-yourself": { completedAt: "x", attempts: 1, hintsUsed: 0, xpEarned: 75 },
      },
    },
    1,
  );
  await page.goto("/#/lesson/y1-l01");
  await expect(page.getByTestId("tab-warmup")).toContainText("E");
  await expect(page.getByText("✨ 180 XP")).toBeVisible();
});
