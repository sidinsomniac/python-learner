# Exercise Design Guide

This is how every lesson and exercise in Parseltongue Academy is built. It exists so the game keeps its promise: **you learn by thinking, not by copying**.

---

## 1. Lesson anatomy

Every lesson follows the same shape, so the learner always knows where they are:

1. **Story beat.** A short cutscene (2–6 lines of dialogue with character portraits) that advances the year's mystery and gives the lesson a reason to exist ("Hagrid's dragon eggs need counting...").
2. **Lecture**, with **inline checkpoints**:
   - The explanation is short, with runnable examples ("Try it") and a sandbox.
   - About every 2–3 screens there is a checkpoint: a 10-second question in the middle of the reading (predict the output, fill in a blank, spot the bug).
   - Checkpoints aren't graded. They catch misunderstandings *before* the exercises.
3. **Exercises in three tiers** (§2).
4. **Recap.**
   - A Spellbook page is written.
   - The lesson's concepts are added to Time-Turner review.
   - A Chocolate Frog card may drop.

### Parts
A lesson splits into **Part 1 / Part 2 (/ Part 3)** when any of these is true:
- The concept has a **gotcha** worth its own spotlight (float rounding, two names for one list, mutable default arguments, `x == 1 or 2`).
- There is a **basic use and a clever use** (slicing, then slicing with steps and reversal).
- There is a **"works" and a "works fast"** version (linear search, then binary search).
- The exercise set would need more than about 25 minutes.

Each part has its own tiers. Parts unlock in order.

---

## 2. The three tiers

| Tier | Required? | Purpose | Rule |
|---|---|---|---|
| 🌱 **Warm-up** | Yes | Build confidence and apply the idea once | New scenario and new names, never the lecture's own example. At most one step beyond the lecture. |
| 🔥 **Core challenge** | Yes | Make the learner *think* | Must use at least **one twist** (§3). Hidden tests cover edge cases. |
| ⭐ **Outstanding challenge** | Optional | Stretch the strong learner | Two or more twists, or combines 2 or more earlier lessons. Earns the "O" grade, bonus Galleons and a guaranteed Chocolate Frog card. |

Only the Warm-up and the Core challenge gate progress. The Outstanding challenges collect into the **Forbidden Forest**, where they can be done any time later.

---

## 3. The twist catalog

A core challenge must use at least one of these. The examples come from the Year 1–2 plan.

| Twist | What it does | Example |
|---|---|---|
| **Edge case** | Hidden tests include empty, zero, negative, single-item or duplicate inputs | "Count the owls" must also work when no owls arrived today |
| **Combination** | Needs an earlier lesson's concept as well | Slicing plus f-strings: print a wizard's initials, formatted |
| **Constraint** | Bans the obvious built-in or shortcut | Find the tallest giant **without** `max()`; reverse a word **without** slicing |
| **Inversion** | Given the output, write the code, or find the input that produces it | "What number must Neville type so the spell prints `Level 7`?" |
| **Debug** | Code that *almost* works, with one subtle bug | An off-by-one in a range; `=` where `==` was meant; a loop that skips the last item |
| **Refactor** ("Transfiguration") | Make working code cleaner, keeping the same behaviour | Collapse 6 `if` statements into a loop; the AST check requires fewer lines or no repetition |
| **Scale** (Year 3 onward) | Hidden tests use big inputs and a time limit, so slow approaches fail | Search 1,000,000 spell names in under a second |
| **Spec reading** | Small print in the task matters | "Ties go to the student who arrived first"; "ignore capital letters" |
| **Design** (Year 4 onward) | Choose the structure yourself | "Model a creature registry": which classes, which methods? |

### No copy-paste: rules the validator enforces
1. **Lecture code must not solve a core challenge.** Every code block in `lecture.md` is run against the core's tests, and it **must fail**. Otherwise the task is just copying.
2. **Every core challenge has at least 2 hidden edge-case tests.**
3. **Solutions never appear in hints.** No hint may contain a line of `solution.py` (already enforced).
4. **The starter code fails** and **the reference solution passes** (already enforced).
5. **Constraint twists are checked by the AST.** The tests inspect the code's structure, e.g. that `max` is never called.

---

## 4. Exercise formats

| Format | Used for | Graded by |
|---|---|---|
| **Spell Practice** (write) | Most exercises | Hidden tests |
| **Potion Repair** (debug) | Bugs and gotchas | Hidden tests |
| **Divination** (predict the output) | Building a mental model of execution | Line-by-line comparison |
| **Spell Scramble** (reorder lines) | Years 1–2 only, low anxiety | Hidden tests on the assembled code |
| **Transfiguration** (refactor) | Pythonic style | Tests plus AST rules |
| **Function spell** (Year 2 onward) | Tests call the learner's function with many inputs | Hidden tests |
| **Pensieve trace** | "What is `x` after line 4 on the third pass?" | Exact answer |
| **Explain it back** (optional, needs AI) | Understanding in plain words | AI Professor rubric |

---

## 5. Grades

Every exercise gets an **O.W.L. grade**. Grades are feedback and bragging rights. **They never block progress.**

| Grade | Meaning | How it's earned |
|---|---|---|
| **O** Outstanding | Mastery | Core passed with no hints, **and** the Outstanding challenge completed or Snape's code review passed |
| **E** Exceeds Expectations | Strong | Core passed with 0–1 hints |
| **A** Acceptable | Solid | Core passed with 2–4 hints |
| **P** Poor | Scraped through | Core passed only after the analogous-example rung |
| **D** Dreadful | (joke grade) | Never awarded for real. It only appears if you print "Dreadful" (an easter egg) |
| **T** Troll | (joke grade) | Easter egg for giving up and reloading 5 times: "Even trolls get there eventually!" |

Replaying a lesson can raise its grade. The year-end report card shows every grade.

**Snape's code review** appears *after* you pass. It gives 1–3 remarks from AST checks, for example:
- *"You wrote `range(len(x))`. Did you forget `enumerate`, or simply ignore it?"*
- *"Five `if` statements that differ only by a number. How... repetitive."*

Fixing them upgrades the grade to O.

---

## 6. Algorithm and DSA lessons (★)

Every ★ lesson follows this pattern:
1. **Story problem.** The algorithm solves something in the plot (the Floo Network needs shortest paths).
2. **Pensieve visualisation.** Step through a worked run line by line, watching variables and data structures change.
3. **Walkthrough.** The idea in plain words, then pseudocode, then the complexity.
4. **Problems, ramping up:**

   | Level | What it asks for |
   |---|---|
   | 🟢 Easy | The algorithm as taught, on a new problem |
   | 🟡 Medium | A variation, e.g. search for the first match instead of any match |
   | 🔴 Hard | An optional ⭐ that combines the pattern with an earlier one, usually with a scale twist |

5. **Complexity check.** Scale tests force the efficient version. The hint ladder asks *"How many steps does your spell take if there are a million owls?"*

---

## 7. Authoring checklist (per exercise)

- [ ] A new scenario, not a variation of the lecture example.
- [ ] The twist is named in `quest.yaml` (`twist: edge-case`).
- [ ] At least 2 hidden edge-case tests (core tier).
- [ ] Every failing test's message is a **question**, never a fix.
- [ ] A full hint ladder: nudge, question, pseudocode, flaw, analogous example.
- [ ] Spellbook page and concept tags.
- [ ] 2–4 Time-Turner review cards (§8).
- [ ] `npm run validate-content` passes.

---

## 7b. Function-style exercises (Year 2, Lesson 7 onwards)

Once functions are taught, tests call the student's functions instead of reading printed output:

```python
def test_best():
    fn = student_function("best_letter")
    got = call(fn, [("Ann", 3), ("Dora", 5)])
    check(got == "Dora (5 hearts)", f"best_letter returned {got!r}.")
    check(printed() == "", "best_letter should return its string, not print it.")
```

- Always go through `call(fn, ...)`: a crash inside the student's function is reported as *their* error with a line number, and runaway loops are stopped.
- `printed()` is what the last `call` printed - use it to insist on `return` rather than `print`.
- `recursive(name)` checks that a function calls itself (Year 3 on). Pair it with `not uses(ast.For, ast.While, ast.comprehension)` to forbid loops.
- `raised(fn, ...)` checks a spell that should refuse bad input: it returns `(type name, message)`, or `None` if nothing was raised (Year 3 on).
- For repair exercises whose starter crashes at the top level, get the function with `run_student(allow_error=True).ns.get(name)`.

## 7c. Exercises with files (Year 3, Lesson 2 onwards)

An exercise (or a lesson, for its "Try it" examples) can put files on the **desk**, the spell's working folder:

```yaml
files:
  ledger.txt: |
    Tobias Wren,Hufflepuff,1926
    Cedric Diggory,Hufflepuff,
```

- The player sees them in a "📂 On the desk" panel above the editor.
- Every run, every test and every Pensieve replay starts from a fresh desk holding exactly these files, so a spell that writes a file can't leak it into the next test.
- `write_files({...})` hands the spell a different set of files (the file version of `run_with`, so answers can't be memorised). `read_file(name)` checks what the spell wrote, or returns None.
- The validator fails a lecture example that opens a file the lesson doesn't provide.

## 8. Time-Turner review cards

Each lesson contributes small cards that come back on a spaced schedule: 1, 3, 7, 16, then 35 days, reset on a miss. The same cards feed the Dueling Club. They live in the lesson's `review.yaml`:

```yaml
- id: sort-none              # unique within the lesson
  type: choice               # multiple choice - the Dueling Club uses these
  q: After `result = nums.sort()`, what is `result`?
  options: ["`[1, 2, 3]`", "`None`"]
  answer: 1                  # index into options
  why: "`.sort()` sorts in place and gives back None."
- id: swap
  type: predict              # the student types the output
  code: |
    a, b = 3, 8
    a, b = b, a
    print(a, b)
  why: The right side is built first, then unpacked.
```

Rules (checked by the validator):
- every ordinary lesson has **2–4 cards**, at least one of them `choice`;
- a `predict` card's code must run cleanly and print something - and must print the **same thing every time** (sort sets before printing them);
- distractors in `choice` cards are real misconceptions, not jokes;
- YAML tip: quote any `q`, `why` or option containing `: `.

Up to 5 cards a day, missed cards first.

A **Revision in the Library** lesson appears about every 4 lessons. It mixes earlier concepts with no new material, using interleaved practice for retention.
