# Parseltongue Academy: Handoff Guide

This is everything you need to carry on building the game somewhere else: on your own machine, in a new Claude session, or with another tool. Read it alongside the design documents listed in section 10.

> **Keep this guide current.** Whoever works on the project, wherever they work, must update this file **in the same commit** as any change that affects it, and add a line to the change log in §13:
> - what's built, what's next, and counts;
> - formats, rules, commands, and branch names.
>
> That way anyone coming back, including the original Claude session, can `git pull` and read §13 to catch up. If work moves to a new branch, say so in §2 **and** push that note to the old branch too, so the trail isn't lost.

---

## 1. What this is

**Parseltongue Academy** is a Harry Potter–themed game for learning Python, from beginner to expert. It runs entirely in the browser.

**How Professor Ashwood teaches.** She never hands over the answer. She uses:
- guiding questions;
- pseudocode;
- pointers to the flaw in your thinking;
- similar-but-different examples.

**How the game is structured:**
- Seven "Years", each with its own mystery, ending in a Trial.
- Every lesson has a story scene, a lecture with checkpoint questions, and three exercises:
  - 🌱 a warm-up;
  - 🔥 a core challenge that always has a twist;
  - ⭐ an optional Outstanding challenge.
- Every exercise gets an O.W.L. grade.
- After you pass, Professor Snape reviews your code. Acting on his remarks earns an O.

**What the owner asked for, which future work should keep:**

| Request | Detail |
|---|---|
| Difficulty | **Medium**: challenging, never blocking. The owner playtested this and called it "perfect". |
| Pace | Start from zero ("I'm a noob"), then climb steadily to expert. Data structures and algorithms come later, with walkthroughs. |
| Goals (2026-10-02) | The owner is an experienced **front-end (JS/TS) developer**. From Year 4, give **equal weight** to **★ interview prep** (patterns, data structures) and **🛠 practical Python** for **backend APIs** (JSON, HTTP, FastAPI, async) and **AI/LLM apps and agents**. Don't spend lessons on what a TS developer already knows, and don't drop tuples or sets: they're interview-core. See `docs/curriculum.md`, "Who this is for". |
| Story | Harry Potter flavour: an original mystery each year with the canon cast, plenty of easter eggs, and rich immersion. |
| AI professor | Claude **and** DeepSeek API keys, both optional. Keys stay in the browser and are never exported. |
| Living backgrounds | **18 random presets** (10 at first, plus 8 more on 2026-10-02 at the owner's request: richer and higher quality), deliberately **not** tied to particular years. Subtle mouse parallax and a cross-fade between presets. No animation library. |
| Story scenes | A modal you click through or skip, which then stays on the page as a "📜 Story" card. |
| Delivery | One Year at a time: write the year's script in `docs/story.md` first, then its content, then commit and push. |

## 2. Where the code lives

| Item | Value |
|---|---|
| Repository | https://github.com/sidinsomniac/python-learner |
| Working branch | `claude/python-learning-game-design-ofpdni`. All work so far is here, and no pull request has been opened. |
| Main commits | `e5339d5` First Year slice → `af6c995` Year 1 rebuilt → `b93b465` economy and living castle → `efb9c39` Year 2 → `fab1383` Year 3 script → `fd2b732` Year 3 engine → `36a1146`, `5ccdabf`, `5b9a602`, `384408e` Year 3 content (batches A–D) |

To get it on a new machine:
```bash
git clone https://github.com/sidinsomniac/python-learner
cd python-learner
git checkout claude/python-learning-game-design-ofpdni
npm install            # Node 22 was used
npm run dev            # copies Pyodide into public/pyodide, then starts Vite
```

## 3. Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server (Vite). Your save is stored **per address**: `localhost:5173` and `localhost:5174` each keep a separate save. |
| `npm run build` | Typecheck (`tsc -b`) plus a production build into `dist/` |
| `npm run typecheck` | TypeScript only |
| `npm test` | Unit tests (Vitest). **85** pass at the moment, including `src/runtime/harness.test.ts`, which runs the real grader in Pyodide. |
| `npm run validate-content` | Runs every exercise through real Python (Pyodide in Node). **66 lessons and 201 exercises** pass at the moment. Add a lesson id prefix to check only part of the content, e.g. `-- y2-l03`. |
| `npm run e2e` | Browser tests (Playwright). Builds, then serves on port 4173. Set `CHROMIUM_PATH=/path/to/chromium` to use a Chromium you already have (on a Mac with Chrome: `CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`). **22** pass at the moment. |

Before every push, run all four: `validate-content`, `test`, `build` and `e2e`.

## 4. Technology

| Area | Tools |
|---|---|
| App | Vite 8, React 19, TypeScript 7 |
| State | zustand 5 with `persist`, saving to localStorage |
| Editor and text | CodeMirror (`@uiw/react-codemirror`), `marked`, `js-yaml` |
| Python | **Pyodide 314**, running in a module web worker (`src/runtime/pyodide.worker.ts`). A spell that hangs is stopped by a timeout that terminates and restarts the worker. Pyodide's files are copied into `public/pyodide` by `scripts/copy-pyodide.mjs`. That folder is gitignored. |
| AI professor | Calls Claude directly from the browser. DeepSeek goes through the Vite dev proxy, so it **only works with `npm run dev`**. Code is in `src/mentor/llm.ts`, `prompt.ts` and `leakGuard.ts`; `leakGuard` stops the AI's replies from revealing solution code. |

## 5. Code map

```
src/engine/
  types.ts      Lesson, Exercise, Year (with theme), ReviewCard, ExerciseRecord, ...
  content.ts    loads content/** with import.meta.glob; exports YEARS, LESSONS, EXERCISES,
                REVIEW_CARDS, CAST
  progress.ts   levels (xpForLevel = 50*(L-1)*L, MAX_LEVEL 20), grades, unlocking,
                skip rules and cost, review-rule switch-on points
  store.ts      zustand store useGame (the save) and useFx (pop-ups and effects, not saved);
                migrateSave, exportSave
  review.ts     Time-Turner spaced repetition (intervals 1/3/7/16/35 days)
  duel.ts       Dueling Club opponents and scoring (seeded random number generator)
  ambience.ts   the 18 background presets; pickPreset never repeats one back to back
  pensieve.ts   stackFrames: how the Pensieve folds a deep call stack
src/lore/       shop.ts (items, learning aids), levels.ts (LEVEL_REWARDS, feature unlocks),
                badges.ts, lore.ts (titles, YEAR_NAMES), easterEggs.ts
src/ui/backdrop/  the living backgrounds, as hand-written Canvas 2D:
                engine.ts (cached glow sprites, additive light, parallax, quality scaling),
                classic.ts (the first 10 presets), magic.ts (8 more),
                creatures.ts (the Patronus stag and the owls, drawn as detailed silhouettes)
src/runtime/
  harness.py    the Python grader (section 7), the desk of files, the Pensieve tracer
  harness.test.ts  runs harness.py in Pyodide: desk files, call stack, Snape's rules
src/ui/         App (routes, year theme variables), MapView (Great Hall), LessonView,
                Cutscene (story pop-ups), Ambience (weather canvas), Shop, TimeTurner,
                DuelingClub, Pensieve (line-by-line replay), Settings, ...
scripts/validate-content.mjs   the content rules (section 8)
e2e/game.spec.ts               browser tests; seed() writes a save straight into localStorage
```

**Routes:**

| Route | Screen |
|---|---|
| `#/` | the Great Hall |
| `#/lesson/<id>` | a lesson |
| `#/casefile` | the Case File |
| `#/spellbook` | the Spellbook |
| `#/shop` | Diagon Alley |
| `#/time-turner` | the Time-Turner |
| `#/dueling-club` | the Dueling Club |
| `#/trophies` | the Trophy Room |
| `#/settings` | Settings |

## 6. Content format: adding a lesson or a year

```
content/
  cast.yaml               speakers: id -> { name, portrait emoji }
  review-rules.yaml       Snape rule -> the lesson id where it switches on
  year-N/year.yaml        year, title, mystery, theme {mood, gold, gold2, bg, bg2, card,
                          card2, line}, intro (the prologue scene)
  year-N/NN-folder/
    lesson.yaml           id, year, order (unique within the year), number (or R1 / Trial),
                          kind (lesson | revision | trial), part {n, of}, title, location,
                          concepts, exercises [warmup, core, outstanding] (or r1-r3 / stage1-4),
                          scene, outro, clue, optional files (for the lecture's "Try it" blocks)
    lecture.md            Markdown. ```python blocks get "Try it" buttons;
                          ```checkpoint blocks (q / options / answer / why) become quiz questions
    spellbook.md          the notes page the student unlocks (ordinary lessons only)
    <slot>.yaml           tier, type (practice | repair | divination | scramble), title, twist,
                          task, starter, tests, hints {nudge, question, pseudocode, flaw,
                          analogous}; divination exercises use `snippet`, scrambles use `lines`;
                          optional `files: {name: text}` are laid on the desk (Year 3 on)
    <slot>.solution.py    reference solution: used by the validator, never sent to the browser
    review.yaml           2-4 cards, at least one of type choice (the Dueling Club uses them)
```

**Lesson ids:**
- `y2-l03a` is Year 2, lesson 3, part a.
- `y2-r1` is a revision lesson; `y2-trial` is the Trial.
- Exercise ids are `<lessonId>.<slot>`, e.g. `y2-l03a.core`.

**Story placeholders:** `{name}` in a scene line is replaced by the player's name.

## 7. Grader helpers for `tests` (from `src/runtime/harness.py`)

| Helper | What it does |
|---|---|
| `run_student(inputs, allow_error=False)` | Runs the student's code. Returns `.stdout`, `.lines` and `.ns` (the variables). |
| `run_with(name=value, ...)` | Runs the code with a starting line like `name = ...` swapped for another value, so the student can't just print a memorised answer. |
| `student_function(name)` | Gets the function the student defined. |
| `call(fn, *args, **kw)` | Calls it safely: a crash counts as the **student's** error and reports their line number, and a runaway loop is stopped. |
| `printed()` | What the last `call` printed. Use it to insist on `return` rather than `print`. |
| `raised(fn, *args)` | Calls the function expecting an error. Returns `(type name, message)`, e.g. `("ValueError", "year must be 1-7")`, or `None` if nothing was raised. |
| `source()`, `tree()` | The student's code, as text or as a parsed tree. |
| `calls(name)`, `uses(ast.X)`, `count_nodes(...)` | Checks on the code's structure. |
| `recursive(name)` | Does the student's function `name` call itself? Pair it with `not uses(ast.For, ast.While, ast.comprehension)` for "no loops". |
| `timed(...)`, or `time.perf_counter()` in a test | Speed tests. |
| `write_files({name: text})` | Replaces every file on the desk, so the spell meets a file it has never seen (the file version of `run_with`). |
| `read_file(name)` | The text of a file on the desk, e.g. one the spell wrote, or `None`. |
| `check(condition, "guiding question")` | Fails the test with your question. **Always phrase failures as questions, never as fixes.** |

Tests run in order and stop at the first failure.

**The desk (Year 3 on).** The spell's working folder is `/tmp/desk` in Pyodide's in-memory filesystem. Every run, every test function and every Pensieve replay starts from a **fresh desk** holding exactly the exercise's `files`. The browser passes `files` through `python.run/grade/trace` to the worker, and then to `run_json`, `grade_json` and `trace_json`. The player sees the files in a "📂 On the desk" panel.

**The Pensieve's call stack (Year 3 on).** Each step of `trace_json` carries `stack` (the learner's frames, outermost first), and every `return` from a learner's function is a step of its own with `event: "return"` and `value`. A function that crashes gets no return step. The default recursion limit of 1000 is kept: it works under the step guard, and the error translator asks about the base case when a `RecursionError` happens.

**From Year 2, Lesson 7 onwards, exercises are function-style:** tests call the student's functions.

**Snape's review rules** live in `REVIEW_RULES` in `harness.py`. Each one switches on at the lesson given in `content/review-rules.yaml`, and reference solutions must pass every rule that is active at that point:
- `enumerate-counter`: from y2-l02
- `dict-keys`: from y2-l03a
- `append-comprehension`: from y2-l06a
- `mutable-default`: from y2-l09
- `bare-except` (a bare `except:`, or `except Exception: pass`): from y3-l01a
- `open-without-with`: from y3-l02
- `lambda-assign` (`f = lambda ...`) and `needless-lambda` (`key=lambda s: len(s)`): from y3-l03
- A new rule goes into `review-rules.yaml` in the same commit as its lesson, because the validator rejects a rule that starts at an unknown lesson.
- plus the Year 1 rules (unused variable, shadowed built-in, `str()` inside an f-string, comparing with `== True`, `range(len(...))`, `x = x + ...`, and others).

## 8. Content rules the validator enforces, and their traps

**The rules:**
- Every reference solution passes its tests **and** gets a clean review from Snape.
- No starter code already passes its tests.
- **No code example in the lecture solves a core or ⭐ challenge.**
- **No hint contains a solution line** of 12 characters or more. Lines the student can already see in the starter are exempt.
- Core challenges have at least 3 tests.
- Every scene speaker exists in `content/cast.yaml`.
- Checkpoints and review cards are well formed.
- Every ordinary lesson has 2–4 review cards.
- `files` is a map of names to text, with no absolute paths and no `..`. A lecture example may not open a file its lesson doesn't put on the desk.

**Traps learned the hard way:**
1. **Colons in YAML.** A plain value containing `: ` breaks the YAML (for example ``q: What does `{"a": 1}` do?``). Quote it, or use `>-`.
2. **`\n` inside `tests: |` blocks.** Write `\n`, not `\\n`: block scalars don't process escapes.
3. **The step limit.** The validator stops any spell after **200,000 executed lines** (`STEP_LIMIT`). Keep scale tests around 20,000–50,000 items.
4. **Hints that leak.** Pseudocode like `found = False` or `random.seed(seed)` counts as a solution line. Describe it in words: "remember that nothing is found yet". This includes **short structural lines in the analogous example**: `except ValueError:`, `except ValueError as err:` and `parts = line.split(",")` all count. Use a different error type or variable name in the example.
5. **Unpredictable output.** Predict cards and divination snippets must print the same thing every time. **Sort sets before printing them**, because string hashing is randomised.
6. **Wide code blocks.** Code in task text is cut off past about 60 characters. Put expected results on their own line, as `# -> result`.
7. **Starters that crash on load.** For repair exercises whose starter crashes at the top level, get the function with `run_student(allow_error=True).ns.get(name)`.
8. **Files are text.** In a `files:` map, give every file a `|` block or quoted text. A bare number, or a value with `: `, isn't text. To end a file without a final newline, use `|-`.
9. **Counting looks.** To insist on binary search, pass a `list` subclass that counts `__getitem__`, and charges `len(self)` for `__iter__`, `__contains__` and `index` (see `content/year-3/10-binary-search-1/core.yaml`). For a yes/no oracle, count the calls inside a closure and raise after the limit.
10. **Slow starters in scale tests.** An O(n²) starter is stopped by the validator's step limit (and by the 10-second timeout in the browser), so it fails as it should. Keep the reference solution's run under about 150,000 traced lines.
11. **A YAML value can't start with a backtick.** `` line: `sorted()` is... `` doesn't parse. Quote the whole value.
12. **"Write the checks" exercises.** To grade a student's tests, have them write `check_x(candidate)` returning True/False. The tests then pass it a correct version, which it must accept, and several deliberately broken versions, which it must reject (see `content/year-3/16-solving-problems`). Remember that `return False` is 12 characters, so it can't appear in a hint either.

## 9. Saves (localStorage)

- **Key:** `parseltongue-save-v1`.
- **Format:** `{"state": {...}, "version": 3}`. The current version is `SAVE_VERSION = 3`, in `src/engine/store.ts`.
- **How upgrades decide.** zustand only upgrades a stored save when its `version` is a number different from `SAVE_VERSION`. A save with no `version` is loaded as it is. `detectSaveVersion` (in `store.ts`) then judges the real version **from the contents**:
  - has `bestLevel` or `owned` → version 3;
  - has `exercises` → at least version 2;
  - has `completed` → version 1.

  So a mislabelled save can no longer go through the version-1 upgrade and lose its exercises. The version-3 upgrade also keeps owned items, and doesn't pay level rewards twice. Still write `"version": 3` when editing a save by hand.
- **Main fields:**
  - `name`, `house`, `xp`, `bestLevel`, `galleons`, `housePoints`
  - `exercises`: `{ "y1-l01.core": {completedAt, attempts, hintsUsed, xpEarned, grade} }`
  - `clues`: `{lessonId: timestamp}`
  - `scenesSeen`: `{lessonId: true, "<lessonId>:outro": true, "year-N": true}`
  - `skipped`, `owned`, `equipped`, `aids`, `cards`, `duels`, `badges`, `drafts`, `hintsUnlocked`
- **Restoring, in Settings:**
  - **Download backup / Restore backup** for a save file.
  - **Paste a save** accepts a downloaded backup, the raw localStorage value (`{"state": ..., "version": n}`), or a bare state object. All three go through `unwrapSave`.
  - After any import, `rebuildDerived` fills in what can be worked out from the finished exercises: clues, seen scenes, `bestLevel` from XP, and level-reward items. **Badges are not rebuilt.**
- **Automatic backups.** Each time the game loads, before any upgrade, `backupRawSave` copies the raw save to `parseltongue-save-backup`. It keeps the **last 3 different copies**, with timestamps. Settings → **Automatic backups** lists them and restores one.

**Console "cheat code".** Paste this in the browser's DevTools console to edit the save directly:
```js
const s = JSON.parse(localStorage.getItem("parseltongue-save-v1"));
Object.assign(s.state, { xp: 5500, bestLevel: 11, galleons: 9999 }); // level 11 = 5500 XP
s.version = 3;
localStorage.setItem("parseltongue-save-v1", JSON.stringify(s));
location.reload();
```

**To mark lessons done**, add a record for each exercise, e.g. `s.state.exercises["y1-l11.core"] = {completedAt: new Date().toISOString(), attempts: 1, hintsUsed: 0, xpEarned: 50, grade: "O"}`, and also `s.state.clues["y1-l11"] = "<date>"`. A lesson counts as done when its required exercises are done: warm-up and core, `r1`–`r3` for revisions, or `stage1`–`stage4` for a Trial.

## 10. Design documents (read these before writing content)

| Document | Contents |
|---|---|
| `docs/GDD.md` | Vision, game systems, economy, levels, the living castle, mentor rules, architecture, roadmap |
| `docs/curriculum.md` | All seven Years, lesson by lesson. Years 1, 2 and 3 are marked ✅ built. |
| `docs/exercise-design.md` | Lesson anatomy, tiers, the catalogue of twists, grades, ★ lessons, review cards, function-style tests |
| `docs/story.md` | The story bible. Year 1 (The Jinxed Ledger), Year 2 (The Hoarder's Cabinet) and Year 3 (The Prisoner of the Loop) are scripted scene by scene; Years 4–7 are outlined. |
| `README.md` | The player's overview and the developer's quick reference |

## 11. Status and what's next

**Built:**
- Year 1, The Philosopher's Syntax: 24 units and 73 exercises.
- Year 2, The Chamber of Collections: 22 units and 67 exercises.
- Year 3, The Prisoner of Recursion: 20 units and 61 exercises, with the Time-Turner dusk theme (silver and indigo). It has its own engine support: the desk of files, the Pensieve's call stack, `raised()` and `recursive()`, and 4 new Snape rules.
- Systems: story pop-ups, year colour themes, 18 random living-background presets (with parallax, cross-fades and quality that scales down on slow machines), Diagon Alley (cosmetics plus Felix Felicis and Time-Turner Sand), Peeves' Bargain (skipping costs Galleons and XP, and rises with each skip; Trials can't be skipped), level rewards up to level 20, the Time-Turner, the Dueling Club, the Pensieve, the Case File, badges.

**Next, in order:**
1. ✅ **Save safety** (done 2026-10-02, see §9). Lessons also gained ← / → arrows to the previous and next lesson; the next arrow shows 🔒 until that lesson is unlocked, and the arrows cross years. *Previously planned, kept for reference:*
   - Make `migrateSave` work out the version from the save's contents: `exercises` present means version 2 or later; `bestLevel` present means version 3.
   - Let `importSave` accept the `{state, version}` form, with a "Paste a save" box in Settings, and rebuild clues and scenes seen after an import.
   - Keep a rolling automatic backup in `parseltongue-save-backup` (last 3 copies), written before any upgrade runs.
2. **Playtest Year 3.** The owner should play it and judge the difficulty against the Year 1 and 2 "perfect" bar. Then adjust the content in place: the validator keeps every change honest.
3. **Curriculum redesign (2026-10-02).** Years 4–7 were re-sequenced for the even split; read `docs/curriculum.md` first. The targeted swaps in the built years are listed there with 🔄:
   - ✅ y3-l08 becomes Two Pointers and Sliding Window;
   - ✅ y3-l02's ⭐ becomes the ledger as JSON;
   - ✅ y2-l03b gains a pointer to `Counter`;
   - ✅ y2-l10 now teaches `Counter`, `defaultdict` and `json`, and its ⭐ is the Owl Post manifest.
   - All the 🔄 swaps are done.
4. **Then Year 4, The Goblet of Objects** (the interview toolkit, plus classes, types, JSON and HTTP). Script it in `docs/story.md` first (the outline is there), then build it. First, split the content bundle (see item 6), and add the `owl_post` mock HTTP module to the harness.
5. Still planned, not built: the mastery map, the House Cup ceremony, Chocolate Frog cards, the Golden Snitch, and Draco's times.
6. **Bundle size.** All content is bundled eagerly by `import.meta.glob(..., eager: true)` in `src/engine/content.ts`. With Year 3, the main chunk (about 1.68 MB, 533 kB gzipped) has passed the 1,600 kB `chunkSizeWarningLimit` in `vite.config.ts`, so `npm run build` prints a warning (it still succeeds). Before Year 4, split content per year (a lazy glob, loaded when a year opens) rather than raising the limit again.

## 12. Commit conventions

- Clear, descriptive commit messages, describing what changed for the player.
- Run all four checks from section 3 before pushing.
- Keep reference solutions out of the browser bundle: they live in `*.solution.py`, which `content.ts` never imports.

## 13. Change log

Newest first. Add one line per session or meaningful change: the date, where the work was done, and what changed (point to the sections you updated).

| Date | Where | What changed |
|---|---|---|
| 2026-10-02 | Claude Code desktop session | **Living backgrounds rebuilt** (no library: hand-written Canvas 2D in `src/ui/backdrop/`):
- cached glow sprites, additive light, depth layers, gentle mouse parallax, a cross-fade between presets, and particle counts that scale down automatically on slow machines;
- the 10 presets redrawn;
- 8 new ones: Patronus, Golden Snitch, Floo fire, Fawkes, the Black Lake, the Hogwarts Express, the Pensieve and the Time-Turner;
- a detailed stag silhouette and proper owls.

The outgoing canvas uses `data-testid="ambience-leaving"`. Tests: 85 unit, 22 e2e (§1, §5, §11). |
| 2026-10-02 | Claude Code desktop session | Year 2 swaps from the redesign. y2-l10 (Modules) teaches `collections.Counter`, `defaultdict` and `json`, and its ⭐ "The Farthest Vanishings" was replaced by **The Owl Post Manifest** (JSON in, group and count, JSON out). y2-l03b's lecture points ahead to `Counter`. The swap went in Lesson 10, not 3b as planned, because `import` is taught there. Counts unchanged: 66 lessons, 201 exercises (§11). |
| 2026-10-02 | Claude Code desktop session | Year 3 swaps from the redesign. y3-l08 is now **Two Pointers and Sliding Window** (folder `13-two-pointers`; same id, order and clue, so saves are safe). y3-l02 gained a JSON section, and its ⭐ is now **The Ledger as JSON**. Revision III and the story table were updated to match. Counts unchanged: 66 lessons, 201 exercises (§11). |
| 2026-10-02 | Claude Code desktop session | **Curriculum redesign** for the owner's goals: an even split between interviews and practical Python (backend APIs, LLM apps). Rewrote the Year 4–7 plan in `curriculum.md`, adding a practical ladder and the planned swaps in Years 2–3. Re-aimed the Year 4–7 outlines in `story.md`. Added the audience, goals and in-browser mocks (`owl_post`, `Oracle`) to the GDD roadmap. Added the owner's goals to §1 and the plan to §11. |
| 2026-10-02 | Claude Code desktop session | Merged the web session's save safety and lesson arrows (`c076186`) with Year 3 (`207ec70`). Kept both sides' e2e tests and `.gitignore` lines. Counts after the merge: 66 lessons, 201 exercises, 85 unit, 22 e2e (§3, §13). |
| 2026-10-02 | Claude Code web session `session_01QRDafNtZXxe5n2GotwYapD` | **Save safety**: version judged from contents, Paste a save, rebuild after import, 3 automatic backups (§9). **Lesson arrows** ←/→ in the lesson header (`LessonArrow` in `LessonView.tsx`). Corrected §9: a save with no version is loaded as it is, not wiped. Tests: 69 unit, 20 browser (§3). |
| 2026-10-01 | Claude Code desktop session | **Year 3 complete.** Batch D: y3-l12 (string spells: RLE, longest palindrome), y3-l13 (Game of Life and the copying trap) and the Trial (a maze of hours: `load_maze`, `find`, `reachable`, `escape_report`). e2e test that Year 3 opens after the Year 2 Trial. Counts: 66 lessons, 201 exercises, 79 unit, 20 e2e. Docs: README, GDD, curriculum (§2, §3, §10, §11). |
| 2026-10-01 | Claude Code desktop session | Year 3 batch C: y3-l08 (sorting by hand), y3-l09 (sorting smart), y3-l10 (grids and flood fill), y3-l11 (testing: students write checkers that must catch broken spells) and y3-r3. Counts: 63 lessons, 191 exercises, 79 unit, 19 e2e (§3, §8, §11). |
| 2026-10-01 | Claude Code desktop session | Year 3 batch B: y3-l04 (`*args`/`**kwargs`), y3-l05a and y3-l05b (recursion), y3-l06 (Big-O), y3-l07a and y3-l07b (binary search) and y3-r2. `recursive()` test helper. The binary-search tests count looks with a `Shelf(list)` subclass. Counts: 58 lessons, 176 exercises, 79 unit, 19 e2e (§3, §7, §8, §11). |
| 2026-10-01 | Claude Code desktop session | Year 3 batch A: `year.yaml` plus y3-l01a, y3-l01b, y3-l02, y3-l03 and y3-r1 (15 exercises). `raised()` test helper. Snape's 4 Year 3 rules switched on. e2e test for Year 3 files and the call stack. Counts: 51 lessons, 155 exercises, 78 unit, 19 e2e (§3, §7, §8, §11). |
| 2026-10-01 | Claude Code desktop session | Year 3 engine support: the desk of files (`files:` in content, `write_files` and `read_file`), the Pensieve's call stack, `RecursionError` and file-error questions, 4 Snape rules (not switched on yet), Year 3 badges and cast, and harness tests in Pyodide. Tests: 77 unit, 18 e2e (§3, §5–§8, §11). Docs: README, GDD, exercise-design §7c. |
| 2026-10-01 | Claude Code desktop session | Year 3 planned and scripted: the full scene-by-scene story in `story.md`, and the exact lesson table in `curriculum.md`. The build waits for the owner's review of the script (§10, §11). |
| 2026-10-01 | Claude Code web session `session_01QRDafNtZXxe5n2GotwYapD` | Handoff guide and CLAUDE.md created. State: Years 1–2 built; the save-safety fix (§11.1) planned but not built. |
