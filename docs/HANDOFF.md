# Parseltongue Academy: Handoff Guide

This is everything you need to carry on building the game somewhere else: on your own machine, in a new Claude session, or with another tool. Read it alongside the design documents listed in section 10.

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
| Story | Harry Potter flavour: an original mystery each year with the canon cast, plenty of easter eggs, and rich immersion. |
| AI professor | Claude **and** DeepSeek API keys, both optional. Keys stay in the browser and are never exported. |
| Living backgrounds | **10 random presets**, deliberately **not** tied to particular years. |
| Story scenes | A modal you click through or skip, which then stays on the page as a "📜 Story" card. |
| Delivery | One Year at a time: write the year's script in `docs/story.md` first, then its content, then commit and push. |

## 2. Where the code lives

| Item | Value |
|---|---|
| Repository | https://github.com/sidinsomniac/python-learner |
| Working branch | `claude/python-learning-game-design-ofpdni`. All work so far is here, and no pull request has been opened. |
| Main commits | `e5339d5` First Year slice → `af6c995` Year 1 rebuilt → `b93b465` economy and living castle → `efb9c39` Year 2 |

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
| `npm test` | Unit tests (Vitest). **63** pass at the moment. |
| `npm run validate-content` | Runs every exercise through real Python (Pyodide in Node). **46 lessons and 140 exercises** pass at the moment. Add a lesson id prefix to check only part of the content, e.g. `-- y2-l03`. |
| `npm run e2e` | Browser tests (Playwright). Builds, then serves on port 4173. Set `CHROMIUM_PATH=/path/to/chromium` to use a Chromium you already have. **18** pass at the moment. |

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
  ambience.ts   the 10 weather presets; pickPreset never repeats one back to back
src/lore/       shop.ts (items, learning aids), levels.ts (LEVEL_REWARDS, feature unlocks),
                badges.ts, lore.ts (titles, YEAR_NAMES), easterEggs.ts
src/runtime/
  harness.py    the Python grader (section 7)
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
                          scene, outro, clue
    lecture.md            Markdown. ```python blocks get "Try it" buttons;
                          ```checkpoint blocks (q / options / answer / why) become quiz questions
    spellbook.md          the notes page the student unlocks (ordinary lessons only)
    <slot>.yaml           tier, type (practice | repair | divination | scramble), title, twist,
                          task, starter, tests, hints {nudge, question, pseudocode, flaw,
                          analogous}; divination exercises use `snippet`, scrambles use `lines`
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
| `source()`, `tree()` | The student's code, as text or as a parsed tree. |
| `calls(name)`, `uses(ast.X)`, `count_nodes(...)` | Checks on the code's structure. |
| `timed(...)`, or `time.perf_counter()` in a test | Speed tests. |
| `check(condition, "guiding question")` | Fails the test with your question. **Always phrase failures as questions, never as fixes.** |

Tests run in order and stop at the first failure.

**From Year 2, Lesson 7 onwards, exercises are function-style:** tests call the student's functions.

**Snape's review rules** live in `REVIEW_RULES` in `harness.py`. Each one switches on at the lesson given in `content/review-rules.yaml`, and reference solutions must pass every rule that is active at that point:
- `enumerate-counter`: from y2-l02
- `dict-keys`: from y2-l03a
- `append-comprehension`: from y2-l06a
- `mutable-default`: from y2-l09
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

**Traps learned the hard way:**
1. **Colons in YAML.** A plain value containing `: ` breaks the YAML (for example ``q: What does `{"a": 1}` do?``). Quote it, or use `>-`.
2. **`\n` inside `tests: |` blocks.** Write `\n`, not `\\n`: block scalars don't process escapes.
3. **The step limit.** The validator stops any spell after **200,000 executed lines** (`STEP_LIMIT`). Keep scale tests around 20,000–50,000 items.
4. **Hints that leak.** Pseudocode like `found = False` or `random.seed(seed)` counts as a solution line. Describe it in words: "remember that nothing is found yet".
5. **Unpredictable output.** Predict cards and divination snippets must print the same thing every time. **Sort sets before printing them**, because string hashing is randomised.
6. **Wide code blocks.** Code in task text is cut off past about 60 characters. Put expected results on their own line, as `# -> result`.
7. **Starters that crash on load.** For repair exercises whose starter crashes at the top level, get the function with `run_student(allow_error=True).ns.get(name)`.

## 9. Saves (localStorage)

- **Key:** `parseltongue-save-v1`.
- **Format:** `{"state": {...}, "version": 3}`. The current version is `SAVE_VERSION = 3`, in `src/engine/store.ts`.
- **⚠️ Never write a save without `"version": 3`.** A save with no version is treated as version 0. The version-1 conversion then runs on it and **wipes `exercises`**. This is the probable cause of the owner's lost progress. Fixing it is still to do: see 11.1.
- **Main fields:**
  - `name`, `house`, `xp`, `bestLevel`, `galleons`, `housePoints`
  - `exercises`: `{ "y1-l01.core": {completedAt, attempts, hintsUsed, xpEarned, grade} }`
  - `clues`: `{lessonId: timestamp}`
  - `scenesSeen`: `{lessonId: true, "<lessonId>:outro": true}`
  - `skipped`, `owned`, `equipped`, `aids`, `cards`, `duels`, `badges`, `drafts`, `hintsUnlocked`
- **Backup and restore:** Settings → Download backup / Restore backup. Restore only accepts the downloaded backup format.

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
| `docs/curriculum.md` | All seven Years, lesson by lesson. Years 1 and 2 are marked ✅ built. |
| `docs/exercise-design.md` | Lesson anatomy, tiers, the catalogue of twists, grades, ★ lessons, review cards, function-style tests |
| `docs/story.md` | The story bible. Year 1 (The Jinxed Ledger) and Year 2 (The Hoarder's Cabinet) are scripted scene by scene; Years 3–7 are outlined. |
| `README.md` | The player's overview and the developer's quick reference |

## 11. Status and what's next

**Built:**
- Year 1, The Philosopher's Syntax: 24 units and 73 exercises.
- Year 2, The Chamber of Collections: 22 units and 67 exercises.
- Systems: story pop-ups, year colour themes, 10 random weather presets, Diagon Alley (cosmetics plus Felix Felicis and Time-Turner Sand), Peeves' Bargain (skipping costs Galleons and XP, and rises with each skip; Trials can't be skipped), level rewards up to level 20, the Time-Turner, the Dueling Club, the Pensieve, the Case File, badges.

**Next, in order:**
1. **Save safety** (planned, not built yet):
   - Make `migrateSave` work out the version from the save's contents: `exercises` present means version 2 or later; `bestLevel` present means version 3.
   - Let `importSave` accept the `{state, version}` form, with a "Paste a save" box in Settings, and rebuild clues and scenes seen after an import.
   - Keep a rolling automatic backup in `parseltongue-save-backup` (last 3 copies), written before any upgrade runs.
2. **Year 3, The Prisoner of Recursion** (errors, files, recursion, first algorithms). First write its full scene-by-scene script in `docs/story.md`, following the Year 3 outline there and the lesson table in `docs/curriculum.md`. Then:
   - add `content/year-3/year.yaml` with a new theme (the planned mood is Time-Turner dusk: silver and indigo);
   - add its badges to `YEAR_BADGES` in `store.ts` and to `badges.ts`;
   - add new Snape rules to `review-rules.yaml` as their ideas are taught.
3. Then Years 4–7, one at a time.
4. Still planned, not built: the mastery map, the House Cup ceremony, Chocolate Frog cards, the Golden Snitch, and Draco's times.

## 12. Commit conventions

- Clear, descriptive commit messages, describing what changed for the player.
- Run all four checks from section 3 before pushing.
- Keep reference solutions out of the browser bundle: they live in `*.solution.py`, which `content.ts` never imports.
