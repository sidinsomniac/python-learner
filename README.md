# 🐍 Parseltongue Academy

This is a Harry Potter-themed game that teaches Python from absolute zero. Python is Parseltongue, the language of snakes. You're a new Hogwarts student, sorted into a house, learning to cast spells (programs) across seven school years.

The professor **never gives you the answer**. She asks guiding questions, sketches pseudocode, and points out where a flaw is, until you fix it yourself.

> This is a personal, non-commercial fan project. All Harry Potter references live in `src/lore/`, so they can be swapped out in one place.

## Play it

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

Python runs **inside your browser** through [Pyodide](https://pyodide.org), so nothing gets installed and it works offline. Your progress is saved in your browser.

## What's in the game so far

**All of First Year: The Philosopher's Syntax.** That's 15 lessons (several split into parts), 3 revision lessons and a 4-stage Trial - 73 exercises that take you from your first `print` to loops and lists. It's all wrapped in a mystery, **The Jinxed Ledger**: every lesson you finish reveals a clue, and the Trial unmasks the culprit.

Every lesson follows the same shape:
1. **📖 Story and lecture.** A short cutscene, then the lesson itself, with runnable "Try it" examples, **checkpoint questions** inside the reading, and a practice sandbox.
2. **🌱 Warm-up** (required). Use the idea once, in a new situation.
3. **🔥 Core challenge** (required). Always has a **twist**: an edge case, a banned shortcut, a bug to find, working backwards from an answer, or tricky small print.
4. **⭐ Outstanding challenge** (optional). For the brave.

When you're stuck:
- **Automatic feedback.** Failing checks and Python errors are turned into *questions*.
- **The hint ladder.** Nudge, guiding question, pseudocode, flaw pointer, then a similar-but-different example.
- **🌀 The Pensieve.** Replay any spell line by line and watch every variable change, and the call stack grow and shrink as a recursive spell calls itself.
- **Ask the Professor.** An optional AI chat that uses your own API key (below).

After you pass, **Professor Snape reviews your code**. Act on his remarks to earn an **O**.

Every exercise gets an O.W.L. grade (**O**utstanding, **E**xceeds Expectations, **A**cceptable, **P**oor). Grades never block you, and you can replay to improve them. The **Case File** holds your clues and your report card. You also collect XP, levels, Galleons, house points, badges and Spellbook pages.

**Second Year: The Chamber of Collections.** 14 lessons, 3 revisions and a Trial - 67 exercises on lists, tuples, dictionaries, sets, comprehensions, your own functions, modules, parsing, a first taste of algorithms, ciphers and debugging. The mystery is **The Hoarder's Cabinet**: coded messages on the walls, shiny things vanishing, and a cursed Cabinet with a very famous bug.

**Around the castle:**
- **🪙 Diagon Alley.** Spend Galleons on wands, familiars, robes, editor themes, titles and banners - and on rare learning aids (Felix Felicis, Time-Turner Sand) that never give answers away.
- **👻 Peeves' Bargain.** Skip a lesson if you must - for Galleons *and* XP, dearer every time. Trials can't be skipped.
- **⭐ Levels 1–20.** Every level gives something: the Time-Turner, the Dueling Club, Ollivanders, familiars, themes and more.
- **⏳ The Time-Turner.** A few review cards a day from lessons you've finished, spaced out so you remember them.
- **⚔️ The Dueling Club.** Quick-fire duels against Neville, Draco, Hermione and Snape.
- **The living castle.** Each year has its own colours; ten kinds of moving weather drift behind the lessons (switch them off in Settings); and the story pops up as scenes you click through.

**Third Year: The Prisoner of Recursion.** 16 lessons, 3 revisions and a Trial - 61 exercises on catching and raising errors, reading and writing files, functions as values, `*args` and `**kwargs`, recursion (watch the call stack grow in the Pensieve), Big-O, binary search, sorting by hand and by several rules, flood fill on grids, testing your own spells, string algorithms and the Game of Life. The mystery is **The Prisoner of the Loop**: Dementors at the gates, and a fading boy who walks the third floor at 3:03 every afternoon.

**Coming next:** Years 4–7 (see the [curriculum](docs/curriculum.md)), one year at a time, then the mastery map and the House Cup.

## The AI Professor: Claude or DeepSeek

To use it:
1. Go to **Settings → AI Professor**.
2. Pick **Claude (Anthropic)** or **DeepSeek** and paste your API key.
3. Press **Test the owl post** to check that it works.

**Claude** is called directly from your browser. The default model is `claude-opus-5-5`, which you can change in Settings.

**DeepSeek** is called through a small proxy built into `npm run dev` / `npm run preview`, which avoids browser CORS issues. The default model is `deepseek-chat`, and you can change it in Settings.

Both use the same Socratic rules. A *leak guard* checks every reply: a reply containing more than 2 lines of code is regenerated once, and redacted if it still leaks. Your keys are stored only in your browser and are never included in save-file exports.

Without a key, everything else (feedback and the hint ladder) still works.

## 🪄 Secrets

There are a lot of Harry Potter easter eggs hidden in the castle. Some starting points:
- Try `print()`-ing famous spells.
- Look around King's Cross.
- Read the notes in your Spellbook carefully.
- Remember that the Weasley twins love a secret code...

The Trophy Room keeps count of what you've found.

## For developers

| Command | What it does |
|---|---|
| `npm run dev` | Starts the game with hot reload |
| `npm test` | Runs the unit tests (Vitest) |
| `npm run validate-content` | Checks that every quest's `solution.py` passes its tests, the starter code fails them, and no hint gives away a solution line |
| `npm run e2e` | Runs the browser tests (Playwright). Set `CHROMIUM_PATH` to use a system Chromium |
| `npm run build` | Makes a production build in `dist/` |

### Adding a lesson

Lessons live in `content/year-N/<folder>/`. The rules every exercise must follow are in [docs/exercise-design.md](docs/exercise-design.md).

```
lesson.yaml             id, order, number, title, location, concepts, the story
                        (scene / outro, speakers from content/cast.yaml), the clue,
                        and the exercise list, e.g. [warmup, core, outstanding]
lecture.md              the lesson. ```python blocks get "Try it" buttons, and
                        ```checkpoint blocks (q / options / answer / why) become
                        inline questions
spellbook.md            the notes page the student unlocks
warmup.yaml             one file per exercise: tier, type, title, twist, task,
core.yaml               inputs, starter, tests, hints (nudge / question /
outstanding.yaml        pseudocode / flaw / analogous), snippet or lines,
                        and optional files (name -> text) laid on the desk
warmup.solution.py      reference solutions - used only by the validator,
core.solution.py        never shipped to the browser
review.yaml             2-4 Time-Turner / Dueling Club cards (choice or predict)
```

Each year folder also has a `year.yaml`: title, mystery, the prologue scene, and the year's colour `theme`.

`tests` can use these helpers from `src/runtime/harness.py`:
- `run_student(inputs)` and `run_with(name=value)` run the student's code, the second with some starting values swapped for others. They return `.stdout`, `.lines` and `.ns`.
- `student_function(name)` gets a function the student defined; `call(fn, ...)` calls it safely (the student's crashes are reported as theirs), and `printed()` returns what that call printed. `raised(fn, ...)` expects an error and returns its `(type, message)`, or None.
- `source()` and `tree()` give the student's code as text or as an AST.
- `calls(name)`, `uses(ast.For)` and `count_nodes(...)` check the code's structure; `recursive(name)` checks that a function calls itself.
- `timed(fn, ...)` fails a slow solution.
- `write_files({...})` replaces the files on the desk (the spell's working folder), and `read_file(name)` reads one back, or gives None. Every run and every test starts from a fresh desk holding the exercise's `files`.
- `check(condition, question)` fails the test with your question if the condition is false.

Tests run in order and stop at the first failure.

`npm run validate-content` checks:
- every reference solution passes and gets a clean code review;
- no starter code passes already;
- **no lecture example solves a core challenge**;
- no hint contains a solution line;
- scenes and checkpoints are well formed.

## Docs

- [Game Design Document](docs/GDD.md)
- [Curriculum: the Seven Years](docs/curriculum.md)
- [Exercise Design Guide](docs/exercise-design.md)
- [Story Bible](docs/story.md)
- [Handoff Guide](docs/HANDOFF.md) - everything needed to continue development elsewhere
