# Game Design Document: Parseltongue Academy

*A gamified Python learning game that goes from beginner to proficient.*

## Vision
This is a "master game" for learning Python through quests, trivia, rewards, lore and practicals.

The defining rule: **the game never hands over the answer.** A Socratic mentor gives conceptual pseudocode, points out architectural flaws, and asks guiding questions until the learner fixes the problem themselves.

### Constraints
- **Platform**: web app. Python runs in the browser through Pyodide (WebAssembly), so no server is needed.
- **Audience**: a single personal learner. There are no accounts, and progress is stored locally.
- **Theme**: a Harry Potter fan setting. Python is *Parseltongue*, taught at Hogwarts. It has the real houses, spells and characters, used as cameos and easter eggs. This is a personal, non-commercial project, and all franchise references live in `src/lore/` so they can be swapped out in one place if it's ever shared.

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
0. ✅ **Design docs**: this file and `curriculum.md`.
1. ✅ **Vertical slice** (includes the DeepSeek/Claude mentor and the easter eggs):
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
