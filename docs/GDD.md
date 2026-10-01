# Game Design Document: Parseltongue Academy

*A gamified Python learning game that goes from beginner to proficient.*

## Vision
This is a "master game" for learning Python through quests, trivia, rewards, lore and practicals.

The defining rule: **the game never hands over the answer.** A Socratic mentor gives conceptual pseudocode, points out architectural flaws, and asks guiding questions until the learner fixes the problem themselves.

### Constraints
- **Platform**: web app. Python runs in the browser through Pyodide (WebAssembly), so no server is needed.
- **Audience**: a single personal learner. There are no accounts, and progress is stored locally.
- **Theme**: a Harry Potter fan setting. Python is *Parseltongue*, taught at Hogwarts. It has the real houses, spells and characters, used as cameos and easter eggs. This is a personal, non-commercial project, and all franchise references live in `src/lore/` so they can be swapped out in one place if it's ever shared.

### Design documents
| Document | Contents |
|---|---|
| This file | Systems, mechanics, architecture, roadmap |
| [curriculum.md](curriculum.md) | The 7-year syllabus: every lesson, part, twist and ★ algorithm problem |
| [exercise-design.md](exercise-design.md) | Lesson anatomy, tiers, the twist catalog, grades, and the authoring rules the validator enforces |
| [story.md](story.md) | The cast, the yearly mystery arcs, and Year 1's scene-by-scene script |

---

## 1. World and metaphors
- The learner is a first-year Hogwarts student studying Parseltongue. The **7 school Years** are the 7 curriculum tiers.
- **Sorting**: a 4-question Sorting Hat quiz places you in Gryffindor, Hufflepuff, Ravenclaw or Slytherin, and you can ask the Hat to reconsider. The house is cosmetic: its colours, and house points for every quest.
- **The Mentor**: Professor Ashwood, an original Hogwarts professor who *only speaks in guiding questions*. This makes the "no answers" rule part of the character, not a restriction the player bumps into. Canon characters appear as cameos: Hermione corrects "Leviosar", Peeves scrambles code, Dobby's sock is a badge, and Snape assigns page 394.

| Game concept | Python meaning |
|---|---|
| Spells | functions |
| Wand | the code editor |
| Creatures | bugs |
| Potion repair | debugging |
| Spellbook pages | reference notes, unlocked as you learn |
| Galleons | coins, spent on cosmetics |
| Owl post | daily challenges |

## 2. Learning design at a glance
Full detail is in [exercise-design.md](exercise-design.md).

- **About 98 lessons over 7 years**, 12–15 per year, plus *Revision in the Library* lessons that mix earlier topics.
- **Every lesson has the same shape:**
  1. A story beat.
  2. A lecture with inline checkpoints and a sandbox.
  3. Exercises: 🌱 Warm-up, 🔥 Core challenge with a **twist**, ⭐ optional Outstanding challenge.
  4. A recap.
- **Parts:** complex topics, or topics with gotchas, split into Part 1 / Part 2 (/ Part 3).
- **No copy-paste:** the validator runs every lecture code block against each core challenge's tests, and they must fail. Core challenges always hide edge-case tests.
- **The algorithms ladder:** small puzzles from Year 1, formal DSA from Year 3, and Easy → Medium → Hard problems up to dynamic programming and graphs in Year 7.
- **Leaving Hogwarts** (Year 6–7 lessons): install Python, VS Code, venv, pip, git and pytest, then build a real project on your own machine.

### Exercise formats
| Format | What it is |
|---|---|
| **Spell Practice** | Write code that passes hidden tests |
| **Function spell** (Year 2 onward) | Tests call your function with many inputs |
| **Potion Repair** | Fix code that almost works |
| **Divination** | Predict the output |
| **Spell Scramble** | Put shuffled lines in order (Years 1–2) |
| **Transfiguration** | Refactor working code to be cleaner, keeping behaviour. Checked by tests plus AST rules |
| **Pensieve trace** | "What is `x` after line 4 on the third pass?" |
| **Explain it back** (optional, needs AI) | Explain your solution in plain words |
| **Trial** | The multi-stage boss at the end of each year, which unlocks the next year |

## 3. Core loop
1. **Enter the castle hub.** Check the House Cup and the Daily Prophet (the daily challenge).
2. **Review.** Do today's **Time-Turner review**, about 5 spaced-repetition cards.
3. **Take the next lesson:** story beat, lecture and checkpoints, Warm-up, then the Core challenge.
4. **Optionally** attempt the ⭐ Outstanding challenge, or act on Snape's code review, for an **O** grade.
5. **Collect rewards:** grade, XP, Galleons, house points, a Spellbook page, and maybe a Chocolate Frog card.
6. **Move the story on.** Each lesson reveals a clue, and the Trial solves the year's mystery.

## 4. Progression, rewards and immersion
**Rewards:**
- **Grades.** Every exercise gets an O.W.L. grade (O, E, A, P; D and T are joke easter eggs). Grades never block progress, and a replay can improve one. There is a year-end report card.
- **XP and levels.** Fewer hints earn more XP.
- **Galleons.** Spent in **Diagon Alley** (see *The economy* below) on cosmetics and a few rare learning aids, or on Peeves' Bargain to skip a lesson.
- **House points and the House Cup.** Rival houses are simulated and earn points through the year. The cup is decided at each year-end ceremony.
- **Chocolate Frog cards.** Collectible trivia about Python and computing history: Guido van Rossum, Ada Lovelace, Grace Hopper, Alan Turing, Donald Knuth, and more. Complete sets unlock easter eggs.
- **Badges.** These include secret badges, and "Rivalry" badges for beating Draco's times.

**Other immersion:**
- **Story.** A yearly original mystery with the canon cast, told in short cutscenes with character portraits. Clues are printed by *your* correct programs.
- **The Golden Snitch.** One hidden bonus challenge per year.
- **Ambient sound**, optional and off by default.

### The economy ✅ built
**Diagon Alley** (`#/shop`, catalogue in `src/lore/shop.ts`):

| Kind | Examples | Shows up |
|---|---|---|
| Wands | holly (starting wand), yew, vine... elder (level 5+, Ollivanders) | header icon |
| Familiars | toad, cat, owl, phoenix | header; cheers in the corner when you pass an exercise |
| Robes | house-neutral colours | header accent |
| Editor themes | parchment, dungeon, starlight | the code editor |
| Titles | "the Unflappable"... | under your name |
| Common-room banners | | the Great Hall map |

**Learning aids** (rare; 3 of each per year; they never reveal answers):
- **Felix Felicis** (60 Galleons): your next hint costs no XP and doesn't lower your grade.
- **Time-Turner Sand** (80 Galleons): resets a finished exercise's hints and attempts, so you can replay it for a better grade.

**Peeves' Bargain (skipping).** Only the next unfinished lesson can be skipped, never a Trial. The price rises by half with each skip that year: 75 Galleons and 60 XP, then 113 and 90, then 150 and 120... XP can't go below zero, and levels already reached (and their rewards) are kept. A skipped lesson opens the next one but gives no clue, grade or Spellbook page. Finishing it later removes the "skipped" mark.

**Levels** run to 20 (`src/lore/levels.ts`). Every level from 2 gives something:

| Level | Unlocks |
|---|---|
| 2 | the Time-Turner |
| 3 | the Dueling Club |
| 5 | Ollivanders' premium wands in Diagon Alley |
| 8 | the Duel Masters (Hermione and Snape) |
| others | free familiars, editor themes, titles, banners and Galleon bonuses |

A level-up pop-up shows the reward; the Trophy Room shows the whole track.

### Living castle ✅ built
- **Year themes.** Each `year.yaml` has a `theme` (mood, gold, gold2, bg, bg2, card, card2, line). The page takes the colours of the year you're in: candlelit navy and gold for Year 1, serpent green and stone for Year 2.
- **Story pop-ups.** Prologues, lesson scenes and outros open as a modal the first time - click through line by line, or Skip. Afterwards they stay on the page as a "📜 Story" card that can be read again.
- **Living backgrounds** (`src/ui/Ambience.tsx`). Ten weather presets, picked at random for each screen and never the same twice in a row: Enchanted Ceiling (floating candles), First Snow, Storm over the Lake, Goblet Embers, Dementor Mist, Forbidden Forest fireflies, Autumn Grounds, Aurora, Astronomy Tower shooting stars and Owl Post. They draw in the current year's colours, pause when the tab is hidden, and switch off in Settings or with the system's reduced-motion setting.
- **Celebrations.** Sparkles when you pass, a golden flare for an O, fireworks on level-up, a dawn glow when a year's mystery is solved.

### The castle hub
| Location | Purpose |
|---|---|
| Great Hall | House Cup, Daily Prophet challenge, feasts and ceremonies |
| Classrooms | Lessons, grouped by subject |
| Library | Spellbook (your notes), search, Revision lessons |
| Pensieve room (kept by Grimwald Knott) | The mistake journal, step-through replays, the mastery map |
| Room of Requirement | Free sandbox and open-ended projects |
| Forbidden Forest | All ⭐ Outstanding and 🔴 Hard problems, any time |
| Dueling Club ✅ | Five 20-second rounds of review cards against Neville, Draco, Hermione or Snape; speed earns bonus points, wins pay Galleons and badges |
| Owlery | The daily challenge |
| Hogsmeade | The shop |

### Retention systems
- **Time-Turner review** ✅. Spaced repetition on intervals of 1, 3, 7, 16, then 35 days; a miss sends a card back to the start. Cards from finished lessons (predict-the-output and misconception multiple-choice) join your deck. Up to 5 a day, missed cards first. Days in a row earn streak badges.
- **Mastery map.** Strength per concept, fed by exercises and review.
- **Mistake journal.** Each error you hit is saved in the Pensieve and comes back later as a review card.
- **Revision in the Library.** Interleaved practice about every 4 lessons.

### The Pensieve step-through
Replay any spell line by line: the current line is highlighted, and a panel shows the variables and data structures. ✅ From Year 3 it also shows the **call stack**, one frame per call, with every `return` as a step of its own, so recursion can be watched going down and coming back up (very deep stacks are folded in the middle). It works by running the code under `sys.settrace` inside Pyodide and recording each step. It powers:
- the debugging lessons
- algorithm visualisations
- "Pensieve trace" exercises

This is the most important learning tool to build next.

## 5. The mentor: never give the answer

### 5.1 Hint ladder
Each quest authors 4 rungs, and they unlock one at a time:
1. **Nudge**: the concept to think about. Example: "What data structure remembers order *and* lets you add items?"
2. **Guiding question** about *your* code. Example: "What is `total` equal to on the first loop pass?"
3. **Conceptual pseudocode**: structure only, no Python syntax.
4. **Flaw pointer**: names the line or region and the class of mistake. It still doesn't give the fix.

There is **no rung 5**. If you're still stuck, the mentor offers a worked example of an *analogous but different* problem.

### 5.2 Automated feedback (free, works offline)
When you submit code, it runs in Pyodide and goes through three checks:
- **Tests**: failing test cases become questions. Example: "Your function returns `None` for an empty list. What *should* it return?"
- **Error translation**: tracebacks become beginner-friendly questions. Example: `NameError` becomes "Where did you create this variable? Is it spelled the same?"
- **AST flaw detectors**: reusable checks written with Python's `ast` module, run inside Pyodide. Examples:
  - mutable default argument
  - shadowing a builtin
  - `range(len(x))` where `enumerate` fits
  - nested loops where a set or dict would do
  - bare `except`
  - an over-long "god function"
  - global mutation

  Each detector outputs a *question*, never a fix.

### 5.3 Optional AI mentor: Claude or DeepSeek
- It is turned on by choosing a provider and pasting an API key into Settings. The key is stored locally.
- **Claude**: the official `@anthropic-ai/sdk`, called directly from the browser. The default is `claude-opus-5-5` at low effort, with server-side refusal fallbacks turned on.
- **DeepSeek**: an OpenAI-compatible `/chat/completions` endpoint, with `deepseek-chat` as the default. It goes through the Vite dev/preview proxy (`/llm/deepseek`) to avoid CORS, and falls back to a direct call if no proxy is found.
- Both providers share one system prompt, context builder and leak guard (`src/mentor/`), so switching provider doesn't change the experience.
- The prompt includes:
  - the quest goal
  - the learner's code
  - test results
  - flaw-detector output
  - the hint rung reached
- The system prompt enforces the Socratic rule.
- **Leak guard**: a reply with more than 2 lines of code (fenced or not) is regenerated once with a stricter instruction. If it still leaks, the code is redacted. Reference solutions never reach the browser, so the model can't be given them either.

---

## 5.4 Easter eggs
Printing spells triggers effects:
- `Lumos` switches to the light theme, and `Nox` switches back.
- `Expecto Patronum` sends a Patronus across the screen.
- `Wingardium Leviosa` makes the editor float, and "Leviosar" gets corrected by Hermione.
- The Marauder's Map oath unlocks a secret map, and "Mischief managed" closes it.
- `Riddikulus` teaches rubber-duck debugging.
- `import this` finds the Zen of Python.

Hidden places and codes:
- The brick wall between Platforms 9 and 10 leads to Platform 9¾.
- There's a hidden Spellbook page 394.
- The Konami code triggers Weasleys' Wizard Wheezes fireworks.

Secret badges track the discoveries.

## 6. Technical architecture
- **Frontend**:
  - Vite, React and TypeScript
  - CodeMirror 6 for the editor
  - Zustand for state
  - Plain CSS with theme tokens: "Hogwarts at night" by default, and parchment for Lumos
- **Python runtime**:
  - Pyodide runs in a Web Worker.
  - A hard timeout terminates and restarts the worker, which handles infinite loops.
  - stdout and stdin are captured.
- **Persistence**: Zustand's `persist` middleware stores progress in localStorage. JSON export/import serves as a backup and never includes API keys. This can move to IndexedDB later if the SRS data grows.
- **Content as data**: the curriculum lives in files, so it can grow without engine changes.

```
content/year-1/q03-fstrings/
  quest.yaml      # id, title, type, concepts[], xp, unlocks, flaw_detectors[]
  lecture.md
  starter.py
  tests.py        # hidden; run in Pyodide
  hints.yaml      # 4-rung ladder
  solution.py     # used ONLY by the content validator, never shipped
```

### Repository layout
```
docs/                   design docs (GDD, curriculum, exercise design, story)
src/engine/             quest runner, grading, progression, SRS
src/runtime/            Pyodide web worker
src/mentor/             hint ladder, error translation, LLM client
src/ui/                 React components
content/                curriculum data
scripts/validate-content.ts
```

---

## 7. Build roadmap
0. ✅ **Design docs v1** and the **First Year vertical slice**: Pyodide runtime, hint ladder, the Claude/DeepSeek mentor, easter eggs.
1. ✅ **Design docs v2**: this revision, plus `curriculum.md`, `exercise-design.md` and `story.md`.
2. ✅ **Engine upgrades** (Draco's times and the Chocolate Frog cards are still to come):
   - lessons with parts and tiers, and inline checkpoints
   - story cutscenes
   - function-spell and scale tests
   - grades, and Snape's code review (AST)
   - the **Pensieve step-through**
   - the validator's "lecture code must not solve the core challenge" rule
3. ✅ **Rebuild Year 1 to the new spec**: 24 lessons and 73 exercises, including the Trial. Saves from the first slice are carried over automatically. **Next: you playtest it.**
4. ✅ **Economy and immersion**: story pop-ups, year themes, living backgrounds, Diagon Alley, Peeves' Bargain, level rewards, the Time-Turner and the Dueling Club. *Still to come:* the mastery map, the House Cup, Chocolate Frog cards.
   ✅ **Year 2: The Chamber of Collections**: 22 lesson units and 67 exercises. From Lesson 7, tests call the student's functions.
5. **Years 2–7, one year at a time.** Each year's script is written first, then its content, then a playtest.
6. **Leaving Hogwarts** (Years 6–7): guided local setup, verified by pasting terminal output.
7. **Auror Academy**: daily challenges and interview sets after the game.

## 8. Verification
- **Unit tests** (Vitest): grading, XP maths, SRS scheduling, hint unlocking.
- **Content validator** (CI), for each quest:
  - `solution.py` passes `tests.py`
  - `starter.py` fails it
  - the YAML matches the schema
  - the hints contain no solution code
- **End-to-end tests** (Playwright):
  - Submitting wrong code produces a *question*, not an answer.
  - Hints unlock one rung at a time.
  - Correct code awards XP and unlocks the next quest.
  - An infinite loop is killed by the timeout.
- **Manual check**: play through each new year in the browser.
