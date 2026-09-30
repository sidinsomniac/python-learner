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

**First Year: The Philosopher's Syntax** has 5 quests, one of each activity type:

| Quest | Type | You learn |
|---|---|---|
| The First Incantation | 🪄 Spell Practice | `print`, strings |
| The Owl Knows Your Name | 🪄 Spell Practice | variables, `input` |
| Peeves and the Scrambled Ledger | 📜 Spell Scramble | order of execution |
| Divining the Cauldron | 🔮 Divination | numbers, types, `/` `//` `%` |
| The Broken Letter Countdown | ⚗️ Potion Repair | `int()`, f-strings, reading errors |

Each quest has a **📖 Lesson** with a practice sandbox and a **📜 Task**. When you're stuck, you have three kinds of help:

- **Automatic feedback.** Failing checks, Python errors and design flaws are all turned into *questions*.
- **The hint ladder.** Hints unlock one at a time: nudge, then guiding question, then pseudocode, then flaw pointer, then a similar-but-different example. Each of the first four hints costs a little XP.
- **Ask the Professor.** This is an optional AI chat that uses your own API key (see below).

There are also rewards: XP and levels, Galleons, house points, badges, and a Spellbook that collects your notes.

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

### Adding a quest

Each quest is a folder in `content/year-N/`:

```
quest.yaml    title, type (practice|scramble|divination|repair), xp, task text, flavour
lecture.md    the lesson ("Try it" buttons are added to every code block)
starter.py    starting code (practice / repair)
tests.py      hidden checks, written with check(condition, "a guiding *question*")
hints.yaml    nudge, question, pseudocode, flaw, analogous
spellbook.md  the reference page the student unlocks
solution.py   used only by the validator and never shipped to the browser
snippet.py    (divination only) the code whose output is predicted
```

`tests.py` can use these helpers from `src/runtime/harness.py`:
- `run_student(inputs)` runs the student's code. It returns `.stdout`, `.lines` and `.ns`.
- `source()` returns the student's code as text.
- `tree()` returns the student's code as an AST.
- `check(condition, question)` fails the test with your question if the condition is false.

Tests run in order and stop at the first failure, so the student focuses on one thing at a time.

## Docs

- [Game Design Document](docs/GDD.md)
- [Curriculum: the Seven Years](docs/curriculum.md)
- [Exercise Design Guide](docs/exercise-design.md)
- [Story Bible](docs/story.md)
