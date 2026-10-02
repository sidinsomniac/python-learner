# Parseltongue Academy: notes for Claude

A Harry Potter–themed Python learning game: Vite, React, TypeScript, zustand, with Python running in the browser through Pyodide. **The full handoff is in `docs/HANDOFF.md`. Read it first.** The design documents are `docs/GDD.md`, `docs/curriculum.md`, `docs/exercise-design.md` and `docs/story.md`.

## Keep the handoff current (required)
Whoever works on this project, in any tool or session, must update `docs/HANDOFF.md` in the **same commit** as any change that affects it, and add a line to its change log (§13). That covers:
- **status (§11):** what's built, what's next;
- **counts (§3):** lessons, exercises, tests;
- **formats (§6, §9):** content, saves, or the save version;
- **rules (§7, §8):** grader helpers, review rules, validator traps;
- **commands and setup (§2–§4)**, including branch names.

Update this file too when a standing rule changes.

Before starting work, `git pull` the branch and read the change log (§13) to see what happened since you last looked.

## Rules that always apply
- **The mentor never gives answers.** Feedback, hints and AI replies are guiding questions, pseudocode, flaw pointers or similar-but-different examples.
- **Difficulty is medium.** The owner playtested it and called it "perfect". Beginner-friendly at the start, climbing steadily.
- **Build one Year at a time:** script the year in `docs/story.md` first, then write its content, then validate, test, commit and push.
- **API keys** (Claude, DeepSeek) stay in localStorage and are never exported.
- The living backgrounds are 10 presets picked at random, **not** tied to years.

## Before every push
```bash
npm run validate-content && npm test && npm run build && CHROMIUM_PATH=/path/to/chromium npm run e2e
```

## Content traps
- Quote any YAML value that contains `: `.
- Inside `tests: |` blocks, write `\n`, not `\\n`.
- The validator stops a spell after 200,000 executed lines, so keep scale tests to 20,000–50,000 items.
- Hints must not contain solution lines of 12 characters or more. Describe them in words instead.
- Sort sets before printing them in predict cards or divination snippets.
- Function-style tests use `student_function` with `call()` and `printed()`, `raised()` for spells that should raise, and `recursive()` for spells that must call themselves.
- File exercises (Year 3 on) put files in `files:` (name → text, as `|` blocks). Every run and test starts from a fresh desk. Tests swap files with `write_files()` and check output with `read_file()`.
- A new Snape rule goes into `review-rules.yaml` in the same commit as the lesson it starts at, or the validator fails.
- Reference solutions must pass Snape's review rules active at that lesson (`content/review-rules.yaml`).

## Saves
localStorage key `parseltongue-save-v1`, stored as `{state, version: 3}`. Any new save field needs a default in `initialData`, and a step in `migrateSave` if old saves need converting. Bump `SAVE_VERSION` only together with a migration step.

`detectSaveVersion` judges a save's version from its contents, so a mislabelled save is never wiped. Settings can paste a save in any form, and keeps 3 automatic backups. Details are in HANDOFF §9.
