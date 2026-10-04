import { readdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const SAVE_KEY = "parseltongue-save-v1";

type Save = Record<string, unknown>;

/** Story and level-up pop-ups appear at unpredictable moments; close them whenever they get in the way. */
async function autoDismissPopups(page: Page) {
  // noWaitAfter: several scenes can be queued, each with its own Skip button.
  await page.addLocatorHandler(page.getByTestId("scene-skip"), (skip) => skip.click(), { noWaitAfter: true });
  await page.addLocatorHandler(page.getByRole("button", { name: "Wonderful!" }), (ok) => ok.click(), { noWaitAfter: true });
}

async function seed(page: Page, state: Save = {}, version = 3) {
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
function completed(lessons: string[]) {
  const rec = { completedAt: "2026-01-01", attempts: 1, hintsUsed: 0, xpEarned: 1, grade: "E" };
  const out: Record<string, typeof rec> = {};
  for (const id of lessons) {
    const slots = id.endsWith("-trial") ? ["stage1", "stage2", "stage3", "stage4"] : id.includes("-r") ? ["r1", "r2", "r3"] : ["warmup", "core"];
    for (const slot of slots) out[`${id}.${slot}`] = rec;
  }
  return out;
}

const YEAR1 = ["y1-l01", "y1-l02", "y1-l03", "y1-r1", "y1-l04a", "y1-l04b", "y1-l05", "y1-l06", "y1-l07", "y1-l08a", "y1-l08b", "y1-r2", "y1-l09", "y1-l10a", "y1-l10b", "y1-l11", "y1-l12", "y1-l13a", "y1-l13b", "y1-r3", "y1-l14a", "y1-l14b", "y1-l15"];
const YEAR2 = ["y2-l01a", "y2-l01b", "y2-l02", "y2-l03a", "y2-l03b", "y2-l03c", "y2-r1", "y2-l04", "y2-l05", "y2-l06a", "y2-l06b", "y2-l07", "y2-r2", "y2-l08", "y2-l09", "y2-l10", "y2-l11", "y2-l12", "y2-r3", "y2-l13", "y2-l14"];
const YEAR2_TO_L06 = ["y2-l01a", "y2-l01b", "y2-l02", "y2-l03a", "y2-l03b", "y2-l03c", "y2-r1", "y2-l04", "y2-l05", "y2-l06a", "y2-l06b"];

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

  // The year's prologue pops up on the Great Hall, one line at a time.
  const prologue = page.getByTestId("cutscene");
  await expect(prologue).toContainText("The Welcome Feast");
  await prologue.getByTestId("scene-next").click();
  await expect(prologue).toContainText("Parseltongue");
  await prologue.getByTestId("scene-skip").click();
  await expect(prologue).toHaveCount(0);
  await expect(page.getByText("This year's mystery: The Jinxed Ledger")).toBeVisible();
  await expect(page.getByTestId("lesson-y1-l02")).toBeDisabled();
  await page.getByTestId("lesson-y1-l01").click();

  // The lesson's story beat pops up too, and can't be missed.
  const scene = page.getByTestId("cutscene");
  await expect(scene).toContainText("Every witch and wizard begins");
  await scene.getByTestId("scene-next").click();
  await expect(scene).toContainText("olleH");
  await scene.getByTestId("scene-next").click();
  await scene.getByTestId("scene-next").click();
  await expect(scene).toHaveCount(0);
  // Afterwards it stays on the page as a story card that can be read again.
  await expect(page.getByTestId("story-card").first()).toContainText("Story");

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

test("Peeves' Bargain skips a lesson for Galleons and XP", async ({ page }) => {
  await seed(page, { galleons: 200, xp: 150, bestLevel: 2 });
  await page.goto("/");
  await page.getByTestId("skip-y1-l01").click();
  const dialog = page.getByTestId("skip-dialog");
  await expect(dialog).toContainText("75 Galleons");
  await expect(dialog).toContainText("60 XP");
  await dialog.getByTestId("skip-confirm").click();
  await expect(page).toHaveURL(/lesson\/y1-l02/);
  await expect(page.getByTestId("galleons")).toContainText("125");
  await page.goto("/");
  await expect(page.getByTestId("lesson-y1-l01")).toContainText("skipped");
  await expect(page.getByTestId("lesson-y1-l02")).toBeEnabled();
});

test("the Trial can never be skipped", async ({ page }) => {
  await seed(page, { galleons: 999, exercises: completed(YEAR1) });
  await page.goto("/#/lesson/y1-trial");
  await expect(page.getByRole("heading", { name: "Trial Sorting Hat Reforged", exact: true })).toBeVisible();
  await expect(page.getByTestId("skip-lesson")).toHaveCount(0);
});

test("Diagon Alley sells a familiar that appears in the header", async ({ page }) => {
  await seed(page, { galleons: 100 });
  await page.goto("/#/shop");
  await expect(page.getByTestId("purse")).toContainText("100");
  await expect(page.getByTestId("perk-fam-toad")).toContainText("Does:");
  await page.getByTestId("buy-fam-toad").click();
  await expect(page.getByTestId("purse")).toContainText("40");
  await expect(page.locator(".header")).toContainText("🐸");
});

test("the Time-Turner reviews cards from finished lessons", async ({ page }) => {
  await seed(page, { bestLevel: 2, exercises: completed(["y1-l01"]) });
  await page.goto("/#/time-turner");
  await waitForPython(page);
  await page.getByTestId("review-start").click();
  for (let i = 0; i < 3; i++) {
    const card = page.getByTestId("review-card");
    const answers = card.locator(".btn.answer");
    if (await answers.count()) await answers.first().click();
    else {
      await card.getByLabel("Your prediction").fill("x");
      await card.getByRole("button", { name: "Check" }).click();
    }
    await page.getByTestId("review-next").click();
  }
  await expect(page.getByTestId("review-summary")).toContainText("Session complete");
});

test("a duel in the Dueling Club runs to a result", async ({ page }) => {
  await seed(page, { bestLevel: 3, exercises: completed(["y1-l01", "y1-l02", "y1-l03"]) });
  await page.goto("/#/dueling-club");
  await page.getByTestId("duel-neville").click();
  for (let i = 0; i < 5; i++) {
    await page.getByTestId("duel-round").locator(".btn.answer").first().click();
    await page.getByTestId("duel-next").click();
  }
  await expect(page.getByTestId("duel-result")).toContainText(/Victory|Defeated|draw/);
});

test("the living background changes weather between screens, and can be turned off", async ({ page }) => {
  await seed(page, { exercises: completed(["y1-l01"]) });
  await page.goto("/#/lesson/y1-l01");
  const first = await page.getByTestId("ambience").getAttribute("data-preset");
  await page.goto("/#/lesson/y1-l02");
  await expect(page.getByTestId("ambience")).not.toHaveAttribute("data-preset", first!);
  await page.goto("/#/settings");
  await page.getByTestId("ambience-toggle").uncheck();
  await expect(page.getByTestId("ambience")).toHaveCount(0);
});

test("reduced motion turns the living background off", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await seed(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "The Great Hall" })).toBeVisible();
  await expect(page.getByTestId("ambience")).toHaveCount(0);
  await context.close();
});

test("each year has its own colours, and Year 2 opens after the Trial", async ({ page }) => {
  await seed(page, { exercises: completed([...YEAR1, "y1-trial"]) });
  await page.goto("/#/lesson/y1-l01");
  await expect(page.locator("html")).toHaveAttribute("data-year", "1");
  const year1Bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());
  await page.goto("/#/lesson/y2-l01a");
  await expect(page.locator("html")).toHaveAttribute("data-year", "2");
  await expect(page.getByRole("heading", { name: /List Power/ }).first()).toBeVisible();
  const year2Bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());
  expect(year2Bg).not.toBe(year1Bg);
  await page.goto("/");
  await expect(page.getByTestId("lesson-y2-l01a")).toBeEnabled();
  await expect(page.getByTestId("lesson-y2-l01b")).toBeDisabled();
});

test("Year 2 grades functions by calling them, and asks about print versus return", async ({ page }) => {
  await seed(page, { exercises: completed([...YEAR1, "y1-trial", ...YEAR2_TO_L06]) });
  await page.goto("/#/lesson/y2-l07");
  await waitForPython(page);
  await page.getByTestId("tab-warmup").click();
  const best = [
    "def best_letter(letters):",
    "    best_name, best_hearts = letters[0]",
    "    for name, hearts in letters:",
    "        if hearts > best_hearts:",
    "            best_name, best_hearts = name, hearts",
    '    return f"{best_name} ({best_hearts} hearts)"',
  ].join("\n");
  await setCode(page, `def count_admirers(letters):\n    print(len(letters))\n\n${best}`);
  await page.getByTestId("cast").click();
  await expect(page.getByTestId("feedback")).toContainText("Did it RETURN the number");
  await setCode(page, `def count_admirers(letters):\n    return len(letters)\n\n${best}`);
  await page.getByTestId("cast").click();
  await expect(page.getByTestId("reward")).toBeVisible();
});

test("a lesson's story pops up even when the lesson reopens on an exercise", async ({ page }) => {
  // No auto-dismiss here: the pop-up itself is what's being checked.
  await page.addInitScript((key) => {
    const warmup = { completedAt: "x", attempts: 1, hintsUsed: 0, xpEarned: 1, grade: "E" };
    localStorage.setItem(key, JSON.stringify({ state: { name: "Tester", house: "ravenclaw", exercises: { "y1-l01.warmup": warmup } }, version: 3 }));
  }, SAVE_KEY);
  await page.goto("/#/lesson/y1-l01");
  await expect(page.getByTestId("tab-core")).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("cutscene")).toContainText("Every witch and wizard begins");
});

test("Year 3 opens after the Second Year Trial", async ({ page }) => {
  await seed(page, { exercises: completed([...YEAR1, "y1-trial", ...YEAR2, "y2-trial"]) });
  await page.goto("/");
  await expect(page.getByTestId("lesson-y3-l01a")).toBeEnabled();
  await expect(page.getByTestId("lesson-y3-l01b")).toBeDisabled();
  await expect(page.getByTestId("lesson-y3-trial")).toBeDisabled();
});

test("Year 3 lays files on the desk, and the Pensieve shows a spell calling itself", async ({ page }) => {
  await seed(page, { exercises: completed([...YEAR1, "y1-trial", ...YEAR2, "y2-trial", "y3-l01a", "y3-l01b"]) });
  await page.goto("/#/lesson/y3-l02");
  await expect(page.locator("html")).toHaveAttribute("data-year", "3");
  await waitForPython(page);
  await page.getByTestId("tab-warmup").click();
  await expect(page.getByTestId("desk-files")).toContainText("register.txt");

  // The spell reads the file on the desk; the examiners also hand it files of their own.
  await setCode(page, ["def count_names(path):", "    with open(path) as register:", "        return sum(1 for line in register if line.strip())"].join("\n"));
  await page.getByTestId("cast").click();
  await page.getByTestId("reward").getByRole("button", { name: "Stay here" }).click();

  // A recursive spell, replayed: the call stack grows one frame per call.
  await setCode(page, ["def countdown(n):", "    if n == 0:", "        return 0", "    return countdown(n - 1)", "", "countdown(2)"].join("\n"));
  await page.getByTestId("pensieve-open").click();
  const pensieve = page.getByTestId("pensieve");
  await expect(pensieve).toContainText("about to run line 1");
  const next = pensieve.getByRole("button", { name: "Next step" });
  await next.click();
  await next.click();
  await expect(pensieve.getByTestId("call-stack")).toContainText("countdown()");
  await expect(pensieve).toContainText("1 spell deep");
  for (let i = 0; i < 4; i++) await next.click();
  await expect(pensieve).toContainText("3 spells deep");
  await next.click(); // line 3, at the bottom of the stack
  await next.click(); // ...which hands its answer back
  await expect(pensieve).toContainText("countdown() hands back 0");
});

/** Whether the local, git-ignored music/ folder has any tracks in it (it's empty on a fresh clone). */
const hasTracks = readdirSync("music").some((f) => /\.(mp3|m4a|ogg|opus|wav|aac|flac)$/i.test(f));

test("the music settings match what's in music/: a switch and volume with tracks, an explanation without", async ({ page }) => {
  await seed(page);
  await page.goto("/#/settings");
  if (hasTracks) {
    await expect(page.getByTestId("music-setting")).toBeVisible();
    await expect(page.getByTestId("music-toggle")).toHaveCount(1);
  } else {
    await expect(page.getByTestId("music-none")).toContainText("music/");
    await expect(page.getByTestId("music-toggle")).toHaveCount(0);
  }
});

test("arrows move between unlocked lessons, and stop at a locked one", async ({ page }) => {
  await seed(page, { exercises: completed(["y1-l01"]) });
  await page.goto("/#/lesson/y1-l02");
  await expect(page.getByTestId("lesson-next")).toBeDisabled();
  await page.getByTestId("lesson-prev").click();
  await expect(page).toHaveURL(/lesson\/y1-l01/);
  await expect(page.getByTestId("lesson-prev")).toBeDisabled();
  await page.getByTestId("lesson-next").click();
  await expect(page).toHaveURL(/lesson\/y1-l02/);
});

test("a save pasted in Settings brings the progress back", async ({ page }) => {
  await seed(page);
  await page.goto("/#/settings");
  const lost = { state: { name: "Siddhartha", house: "ravenclaw", xp: 1959, bestLevel: 6, galleons: 370, exercises: completed(["y1-l01", "y1-l02"]) } };
  await page.getByTestId("paste-save").fill(JSON.stringify(lost));
  await page.getByTestId("paste-save-restore").click();
  await expect(page.getByTestId("restore-msg")).toContainText("1959 XP, 370 Galleons");
  await expect(page.getByTestId("galleons")).toContainText("370");
  await page.goto("/");
  await expect(page.getByTestId("lesson-y1-l03")).toBeEnabled();
  await page.goto("/#/settings");
  await expect(page.getByTestId("backups")).toBeVisible();
});

test("the equipped wand casts its effect while you type, and Settings can switch it off", async ({ page }) => {
  await seed(page, { owned: { "wand-holly": "start", "wand-yew": "x" }, equipped: { wand: "wand-yew" } });
  await page.goto("/#/lesson/y1-l01");
  await page.getByTestId("tab-warmup").click();
  const editor = page.getByLabel("Quest code editor").locator(".cm-content");
  await editor.click();
  await page.keyboard.type("Lumos", { delay: 40 });
  const overlay = page.getByTestId("wand-overlay");
  await expect(overlay).toHaveCount(1);
  // Something has been drawn: the canvas holds non-transparent pixels.
  const painted = await overlay.evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return true;
    return false;
  });
  expect(painted).toBe(true);

  await page.goto("/#/settings");
  await page.getByTestId("wandfx-toggle").uncheck();
  await page.goto("/#/lesson/y1-l01");
  await page.getByTestId("tab-warmup").click();
  await expect(page.getByLabel("Quest code editor")).toBeVisible();
  await expect(page.getByTestId("wand-overlay")).toHaveCount(0);
});

test("Ollivanders shows what each wand casts, and lets you try one before buying", async ({ page }) => {
  await seed(page);
  await page.goto("/#/shop");
  await expect(page.getByTestId("casts-wand-elder")).toContainText("Patronus sparkles");
  await page.getByTestId("casts-wand-vine").hover();
  await expect(page.getByTestId("trying")).toHaveText("Vine & dragon heartstring");
  await expect(page.getByLabel("Ollivanders test parchment").locator("..").getByTestId("wand-overlay")).toHaveCount(1);
});

test("Flourish & Blotts previews a theme on a sample page, and an equipped theme colours the quest editor", async ({ page }) => {
  await seed(page, { owned: { "wand-holly": "start", "ed-lake": "x" }, equipped: { wand: "wand-holly", editor: "ed-lake" } });
  await page.goto("/#/shop");
  await page.locator(".shop-item strong", { hasText: "The Pensieve" }).click();
  await expect(page.getByTestId("trying-theme")).toHaveText("The Pensieve");
  await expect(page.getByLabel("Flourish & Blotts sample page")).toHaveAttribute("data-editor-theme", "pensieve");
  await page.goto("/#/lesson/y1-l01");
  await page.getByTestId("tab-warmup").click();
  await expect(page.getByLabel("Quest code editor")).toHaveAttribute("data-editor-theme", "lake");
});

test("the half-Kneazle sits on the line where a run failed", async ({ page }) => {
  await seed(page, { owned: { "wand-holly": "start", "fam-cat": "x" }, equipped: { wand: "wand-holly", familiar: "fam-cat" } });
  await page.goto("/#/lesson/y1-l01");
  await waitForPython(page);
  await page.getByTestId("tab-warmup").click();
  await setCode(page, 'print("fine")\nprint(undefined_name)');
  await page.getByTestId("run").click();
  await expect(page.locator(".cm-kneazle-line")).toHaveCount(1);
  await expect(page.locator(".cm-kneazle-line")).toContainText("undefined_name");
});

test("the Snitch banner sends the Snitch across the header, and banner cards say what they add", async ({ page }) => {
  await seed(page, { owned: { "wand-holly": "start", "banner-snitch": "x" }, equipped: { wand: "wand-holly", banner: "banner-snitch" } });
  await page.goto("/#/shop");
  await expect(page.getByTestId("header-snitch")).toHaveCount(1);
  await expect(page.getByTestId("perk-banner-snitch")).toContainText("Quidditch Pitch");
});

test("a long story pop-up scrolls inside the screen, keeping Next reachable", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 500 });
  // No auto-dismiss here: this test reads the pop-up itself.
  await page.addInitScript(
    ([key, s]) => localStorage.setItem(key, JSON.stringify({ state: { name: "Tester", house: "ravenclaw", ...s }, version: 3 })),
    [SAVE_KEY, { exercises: completed([...YEAR1, "y1-trial"]) }] as const,
  );
  await page.goto("/#/");
  const next = page.getByTestId("scene-next");
  await expect(page.getByTestId("cutscene")).toBeVisible();
  // Reveal every line of the Year 2 opening (9 lines); the pop-up must stay on screen throughout.
  for (let i = 0; i < 8; i++) {
    const box = (await page.getByTestId("cutscene").boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(500 + 1);
    await expect(next).toBeInViewport();
    await next.click();
  }
  await expect(next).toBeInViewport();
});

test("Settings lets you keep a favourite year's castle colours", async ({ page }) => {
  await seed(page, { exercises: completed([...YEAR1, "y1-trial"]) });
  await page.goto("/#/settings");
  await expect(page.getByTestId("colours-3")).toBeDisabled();
  const bg = () => page.evaluate(() => document.documentElement.style.getPropertyValue("--bg").trim());
  const year2 = await bg();
  await page.getByTestId("colours-1").click();
  await expect.poll(bg).not.toBe(year2);
  await page.getByTestId("colours-follow").click();
  await expect.poll(bg).toBe(year2);
});
