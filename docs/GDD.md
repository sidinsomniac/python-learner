# Game Design Document: Serpentine Academy of Code-Craft

*A gamified Python learning game that goes from beginner to proficient.*

## Vision
This is a "master game" for learning Python through quests, trivia, rewards, lore and practicals.

The defining rule: **the game never hands over the answer.** A Socratic mentor gives conceptual pseudocode, points out architectural flaws, and asks guiding questions until the learner fixes the problem themselves.

### Constraints
- **Platform**: web app. Python runs in the browser through Pyodide (WebAssembly), so no server is needed.
- **Audience**: a single personal learner. There are no accounts, and progress is stored locally.
- **Theme**: an original wizarding-school fantasy RPG, inspired by the classic magic-school genre. It deliberately uses no names, houses or characters from existing franchises.

---

## 1. World and metaphors
- The learner is a first-year apprentice at the Academy. The **7 school Years** are the 7 curriculum tiers.
- **Sorting**: at the start, pick one of 4 houses. This is only cosmetic: a house colour, and house points compared with your own past weeks.
- **The Mentor**: a professor NPC who *only speaks in guiding questions*. This makes the "no answers" rule part of the character, not a restriction the player bumps into.

| Game concept | Python meaning |
|---|---|
| Spells | functions |
| Wand | the code editor |
| Creatures | bugs |
| Potion repair | debugging |
| Spellbook pages | reference notes, unlocked as you learn |
| Galleons | coins, spent on cosmetics |
| Owl post | daily challenges |

## 2. Activity types
| Activity | What it is | Why it matters |
|---|---|---|
| **Lecture** | Short lesson and a runnable snippet you can tweak | Information and learning |
| **Spell Practice** | Write code that passes hidden tests | Core practical |
| **Potion Repair** | Fix broken code | Debugging skill |
| **Divination** | Predict the output of code | Mental model of execution |
| **Spell Scramble** | Put shuffled lines into the right order (Parsons problems) | Low-anxiety practice for Years 1–2 |
| **Duel** | Timed trivia, repeated on spaced review (SRS) | Retention |
| **Trial (Boss)** | Multi-part project at the end of each Year | Unlocks the next Year |

## 3. Core loop
Pick a quest on the castle map, then:
1. Lecture
2. 2–4 practicals
3. Mentor hints on demand
4. Pass
5. Earn XP, Galleons, a Spellbook page, and a badge

Duels resurface concepts on an SRS schedule. When a Year's quests are done, its **Trial** unlocks, and passing the Trial unlocks the next Year.

## 4. Rewards and progression
- **XP and level**:
  - Using fewer hints earns more XP. A clean first-try solve earns a bonus.
  - Using hints never blocks progress.
- **Galleons** buy cosmetics: wand skins, editor themes, and an owl avatar.
- **Badges**, for example:
  - "No-Hint Hex" for solving without hints
  - "Bug Tamer" for 10 repairs
  - streak badges for consecutive days
- **Spellbook**: each concept you master unlocks a reference page. Over time this becomes your personal Python notes.
- **Mastery gate**: a Year's Trial must be passed to advance. Mastery is tracked per *concept*, not just per quest.

---

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

### 5.3 Optional Claude mentor
- It is turned on by pasting an API key into Settings. The key is stored locally, and calls go straight from the browser, which is acceptable for personal use.
- The prompt includes:
  - the quest goal
  - the learner's code
  - test results
  - flaw-detector output
  - the hint rung reached
- The system prompt enforces the Socratic rule.
- **Leak guard**: a reply is rejected and regenerated if it contains code longer than 2 lines or matches the reference solution.

---

## 6. Technical architecture
- **Frontend**:
  - Vite, React and TypeScript
  - CodeMirror 6 for the editor
  - Zustand for state
  - Tailwind with a parchment/castle theme
- **Python runtime**:
  - Pyodide runs in a Web Worker.
  - A hard timeout terminates and restarts the worker, which handles infinite loops.
  - stdout and stdin are captured.
- **Persistence**: IndexedDB (via Dexie) holds progress, XP, the SRS schedule and settings. JSON export/import serves as a backup.
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
docs/                   design docs (this file, curriculum.md)
src/engine/             quest runner, grading, progression, SRS
src/runtime/            Pyodide web worker
src/mentor/             hint ladder, error translation, LLM client
src/ui/                 React components
content/                curriculum data
scripts/validate-content.ts
```

---

## 7. Build roadmap
0. **Design docs**: this file and `curriculum.md`.
1. **Vertical slice**:
   - scaffold the app and the Pyodide worker
   - quest loader and test runner
   - hint ladder and XP
   - Year 1, first 5 quests, covering each activity type
2. **Progression**: castle map, badges, Galleons, Spellbook, SRS Duels, save/export.
3. **Automated mentor**: error translator and the first 10 AST flaw detectors.
4. **Claude mentor**: settings, prompt, leak guard.
5. **Content expansion**: finish Years 1–3, then 4–7 with their Trials.
6. **Polish**: theming, sound, animations, daily owl-post challenges.

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
- **Manual check**: play through all of Year 1 in the browser.
