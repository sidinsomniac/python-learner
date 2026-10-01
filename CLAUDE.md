# Parseltongue Academy: notes for Claude

A Harry Potter–themed Python learning game: Vite, React, TypeScript, zustand, with Python running in the browser through Pyodide. **The full handoff is in `docs/HANDOFF.md`. Read it first.** The design documents are `docs/GDD.md`, `docs/curriculum.md`, `docs/exercise-design.md` and `docs/story.md`.

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
- Function-style tests use `student_function` with `call()` and `printed()`.
- Reference solutions must pass Snape's review rules active at that lesson (`content/review-rules.yaml`).

## Saves
localStorage key `parseltongue-save-v1`, stored as `{state, version: 3}`. A save written without `version` loses its exercises when it's upgraded. Fixing that is the next task, in HANDOFF §11.
