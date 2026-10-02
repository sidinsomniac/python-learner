# Curriculum: The Seven Years

This curriculum takes a learner from their first `print` to interview-ready problem solving **and** real-world Python. It follows the rules in [exercise-design.md](exercise-design.md): every lesson has a 🌱 Warm-up, a 🔥 Core challenge with a twist, and an optional ⭐ Outstanding challenge. Heavy topics are split into parts.

## Who this is for (redesigned 2026-10-02)

The owner is an experienced **front-end (JS/TS) developer** learning Python to stay ready for a shifting market, and heading towards **AI agents**. From Year 4 the curriculum gives **equal weight** to two goals:

- **★ Interviews:** the data structures and patterns that technical interviews test, starting as early as the prerequisites allow.
- **🛠 Practical Python:** the skills that pay off at work, focused on **backend APIs** (JSON, HTTP, FastAPI, async) and **AI/LLM apps** (the Messages API, streaming, tool use, agent loops).

**What this changes:**
- From Year 4, every year alternates ★ interview lessons with 🛠 practical lessons.
- Object-oriented basics are compressed, because a TypeScript developer already knows classes.
- Low-value topics were cut:
  - hand-written O(n²) sorts;
  - building your own hash map;
  - a long object-oriented run;
  - a whole lesson on reading the standard library docs.
- **Tuples and sets stay, and they matter:**
  - a `seen` set gives O(1) membership checks, the core of countless interview problems;
  - `(row, col)` tuples are the natural keys for grids and graphs;
  - tuples are how Python returns several values, sorts by several keys, and orders `heapq` entries.

**Key**
- **Pt1 / Pt2**: the lesson is split into parts.
- **★**: an interview (algorithm or DSA) lesson. **🛠**: a practical lesson.
- **(twist)**: the twist used by the core challenge.
- **R**: a *Revision in the Library* lesson, which mixes earlier concepts with no new material.
- **🖥 local**: done on your own machine (from Year 6), verified by pasting terminal output.

| Year | Theme | Lessons | Finale |
|---|---|---|---|
| 1 | The Philosopher's Syntax: fundamentals | 15 + 3R | Trial: Sorting Hat Reforged |
| 2 | The Chamber of Collections: data structures and functions | 14 + 3R | Trial: Messages of the Chamber |
| 3 | The Prisoner of Recursion: errors, files, recursion, first algorithms | 13 + 3R | Trial: The Time-Turner Escape |
| 4 | The Goblet of Objects: hashing, stacks, queues and heaps · classes, types, JSON and HTTP | 14 + 3R | Trial: The Triwizard Tournament |
| 5 | The Order of Algorithms: the core interview patterns and trees · decorators, generators, async, testing | 14 + 3R | The O.W.L. exams |
| 6 | The Half-Blood Pythonista: graphs · Leaving Hogwarts, FastAPI and services | 13 + 3R | Trial: The Prince's Puzzle |
| 7 | The Deathly Algorithms: dynamic programming and mock interviews · LLM apps and agents | 13 + 3R | Capstone, N.E.W.T.s and the Battle of Hogwarts |
| ∞ | Auror Academy (after the game) | endless | daily challenges, interview sets, projects |

---

## The algorithms ladder (★)

Algorithmic thinking starts on day one, as small puzzles. Formal DSA begins in Year 3, once the learner can write functions. The interview patterns start in Year 3 and fill Year 4 onwards.

| Year | Level | Topics |
|---|---|---|
| 1 | 🌱 Seeds | digit sum, palindrome, Collatz, FizzBuzz variant, primes, max without `max()`, second largest, remove duplicates, reverse in place |
| 2 | 🌱 Foundations | linear search, frequency maps (and `Counter`), merging two sorted lists, anagrams, Caesar cipher and frequency analysis |
| 3 | 🟢 Formal basics | Big-O by counting steps, recursion, binary search, **two pointers and sliding window**, sort keys, grids and flood fill, simple string algorithms, Game of Life |
| 4 | 🟢 to 🟡 The toolkit | hashing patterns (`Counter`, `defaultdict`), stacks and monotonic stacks, `deque` and BFS shortest paths, `heapq` and top-k, linked lists, matrix patterns |
| 5 | 🟡 Patterns | advanced two pointers and sliding window, prefix sums, binary search on the answer, intervals, merge sort and quickselect, backtracking, trees and BSTs |
| 6 | 🟡 to 🔴 Graphs | graph representations, DFS/BFS, topological sort, Dijkstra, union-find, tries |
| 7 | 🔴 Advanced | dynamic programming (memoization, tabulation, grids, LCS, edit distance, knapsack), greedy, bit manipulation, timed mock interviews |

## The practical ladder (🛠)

| Year | Level | Topics |
|---|---|---|
| 1–2 | Foundations | the language itself, collections, functions, modules, parsing text, `json` basics |
| 3 | Robust code | exceptions, files and JSON files, functions as values, `*args`/`**kwargs`, writing your own tests |
| 4 | Data and services | classes for TS developers, `@dataclass`, `Enum`, **type hints**, **JSON payloads** and validation, **HTTP** on a simulated client, a small API client, logging and custom errors |
| 5 | The machinery of frameworks | closures and **decorators** (how `@app.get` works), iterators and **generators** (how token streaming works), **`async`/`await`**, professional testing with mocks |
| 6 | Leaving Hogwarts 🖥 | local setup (`uv`/`venv`, `pip`, git, ruff, mypy), **FastAPI** (routes, pydantic, errors, dependencies, tests), `httpx`, environment secrets, `sqlite3`, regular expressions |
| 7 | AI apps 🖥 | the **Messages API**, system prompts, **streaming**, **structured output**, **tool use**, an **agent loop**, retrieval basics, evaluating LLM output; capstone: an agent backend |

**In the browser, mocks stand in for the real thing.** HTTP lessons use a deterministic fake client (`owl_post`), and LLM lessons a deterministic fake model (`Oracle`). Every exercise can be graded, and no API keys are needed. Real calls (FastAPI, `httpx`, the Anthropic SDK) happen only in 🖥 local lessons, verified by pasting terminal output. API keys never appear in exercises.

---

## Year 1: The Philosopher's Syntax ✅ built

*Requires nothing. Ends able to write small interactive programs with loops and lists.*
The story is [The Jinxed Ledger](story.md#year-1-the-jinxed-ledger); each lesson's clue is revealed when its required exercises are done.

| # | Lesson | Concepts | Exercises: 🌱 Warm-up · 🔥 Core (twist) · ⭐ Outstanding |
|---|---|---|---|
| 1 | The First Incantation | `print`, strings, comments, `\n` | 🌱 two-line greeting · 🔥 Hagrid's words with the quotes and an empty line *(spec reading)* · ⭐ Hedwig in ASCII from **one** print *(constraint)* |
| 2 | The Owl Knows Your Name | variables, `input`, `+` | 🌱 welcome anyone by name · 🔥 pet type and name, including answers with spaces *(edge case)* · ⭐ find the inputs that make an enchanted spell print `abracadabra` *(inversion)* |
| 3 | Peeves' Ledger | running order, reassignment | 🌱 reorder the Gringotts ledger (scramble) · 🔥 the goblet swap that loses the pumpkin juice *(debug)* · ⭐ rotate three goblets using at most 4 assignments *(constraint)* |
| R1 | Library Revision I | lessons 1–3 | predict · repair the Fat Lady's greeting · a name badge |
| 4 | Arithmancy **Pt1** | `+ - * / // % **`, precedence | 🌱 divination on operators · 🔥 split Knuts into Galleons, Sickles and Knuts *(inversion)* · ⭐ seconds on the house clock into hours, minutes and seconds *(combination)* |
| 4 | Arithmancy **Pt2**: gotchas | float error, `abs`, `round` to even | 🌱 divination on float results · 🔥 Neville's potion balance compared with `==` *(debug)* · ⭐ goblin rounding to the nearest 5, halves up *(spec reading)* |
| 5 | Transfiguration of Types | `int/float/str/bool`, truthiness, f-strings | 🌱 repair the letter countdown · 🔥 divination: `bool("False")`, `"7" * 3`, `int(3.99)` *(inversion of expectations)* · ⭐ an Apparition countdown that accepts `11.5` *(edge case)* |
| 6 | Formatting Charms | `:.2f`, width, alignment | 🌱 a Gringotts receipt · 🔥 Slughorn's aligned price list *(spec reading)* · ⭐ a progress bar `[#####-----] 50%` *(combination)* |
| 7 | String Charms | string methods, strings never change | 🌱 clean up a shouted name · 🔥 a message whose method results are thrown away *(debug)* · ⭐ count vowels with no loops *(constraint)* |
| 8 | Slicing the Scroll **Pt1** | `len`, indexing, slices | 🌱 initials · 🔥 spell shorthand `Hogwarts` → `H6s` *(combination)* · ⭐ the middle letter(s) with one slice and no `if` *(constraint)* |
| 8 | Slicing the Scroll **Pt2** | steps, `[::-1]` | 🌱 reverse a spell · 🔥 ★ palindromes, ignoring capitals *(spec reading)* · ⭐ decode two messages woven into one scroll *(inversion)* |
| R2 | Library Revision II | lessons 4–8 | predict · repair the Galleon converter · a wand registry label |
| 9 | True or False | booleans, `and/or/not`, chains, `in` | 🌱 divination on booleans · 🔥 who may fly? several rules at once *(spec reading)* · ⭐ ★ leap years in one expression |
| 10 | The Forked Staircase **Pt1** | `if/elif/else` | 🌱 the Fat Lady's password · 🔥 O.W.L. grades with exact boundaries and impossible scores *(edge case)* · ⭐ the middle judge's mark, no `max/min/sorted` *(constraint)* |
| 10 | The Forked Staircase **Pt2**: trick steps | the `or` trap, elif order, `=` vs `==` | 🌱 predict which branches run · 🔥 a router with all three trick steps *(debug)* · ⭐ untangle nested ifs into one chain *(refactor)* |
| 11 | While the Candles Burn | `while`, ask-until-right | 🌱 countdown to Lumos · 🔥 password attempts, "1 try" vs "3 tries" *(edge case)* · ⭐ ★ Collatz steps (the Hiccuping Hex) |
| 12 | For Every Student | `for`, `range` | 🌱 a times table · 🔥 count vowels **without** `.count` *(constraint)* · ⭐ ★ FizzBuzz, house edition |
| 13 | Loop Patterns **Pt1** | counters, accumulators, `+=`, running best | 🌱 ★ digit sum · 🔥 the highest temperature: negatives, no readings, no `max` *(constraint, edge case)* · ⭐ ★ the second-highest different value |
| 13 | Loop Patterns **Pt2** | `break`, `continue`, `for-else` | 🌱 position of the first vowel · 🔥 ★ is it prime? (0, 1 and 2 are traps) *(edge case)* · ⭐ ★ every prime below n |
| R3 | Library Revision III | lessons 9–13 | predict three loops · repair the endless staircase · count the dragons |
| 14 | Trunks of Many Things **Pt1** | lists, `append`, `in`, `sum/min/max` | 🌱 a shopping list · 🔥 average marks, and what if there are none? *(edge case)* · ⭐ ★ remove duplicates keeping order, no `set` *(constraint)* |
| 14 | Trunks of Many Things **Pt2**: two names, one trunk | aliasing, copying | 🌱 predict with `b = a` · 🔥 Dumbledore's Army's shared-list bug *(debug)* · ⭐ ★ reverse in place with two pointers |
| 15 | Wizard's Chess | nested loops, grids | 🌱 a cauldron pyramid · 🔥 an n×n chessboard *(spec reading, edge case)* · ⭐ an aligned multiplication grid *(combination)* |
| 🏁 | **Trial: Sorting Hat Reforged** | everything | **Stage 1:** ask until the answer is valid. **Stage 2:** tally the houses. **Stage 3:** the tie-breaking rule. **Stage 4:** the full ceremony, which unmasks the culprit. |

## Year 2: The Chamber of Collections ✅ built

*Requires Year 1. Ends able to model data with dictionaries and sets and write reusable functions.*

| # | Lesson | Concepts | Core twist, and ★ problems |
|---|---|---|---|
| 1 | List Power **Pt1/Pt2** | `insert/pop/remove/index`, `sort` vs `sorted`, copies, grids and the shallow-copy trap | the Top Three spell (`sort()` returns None) · Filch's safe copy of a nested list · ⭐ a rotating shelf (pop/insert only, huge k) · ⭐ noughts and crosses |
| 2 | Tuples and Unpacking | tuples, unpacking, swapping, `enumerate`, tuple comparison, `divmod` | Ginny's map, with no manual counter · ⭐ order events with tuple sorting and no `key=` |
| 3 | Dictionaries **Pt1/Pt2/Pt3** | `get`, `in`, `items`, `del`; counting and grouping (with a pointer to `Counter`, taught in Lesson 10; 🔄 2026-10); nested dicts | what came back (KeyError repair) · ⭐ reverse lookup with clashes · the tally of the missing (messy keys) · ⭐ most wanted at 50,000 items · the loudest place · ⭐ merge two nested reports without changing either |
| R1 | Revision I: Filch Objects | | aliasing, a duplicate detector, Filch's alibi |
| 4 | Sets | uniqueness, `& \| - ^`, fast membership | present at every vanishing · ⭐ 20,000-name registry, fast and in order |
| 5 | Nested Data | lists of dicts, missing fields, building an index | the delivery ledger (unsigned deliveries) · ⭐ items sent by two shops |
| 6 | Comprehensions **Pt1/Pt2** | list, dict and set comprehensions; filters; `x if c else y`; `any`/`all` | sorting the fan mail · ⭐ flip, transpose and flatten with no `for` · Lockhart's one-line spell · ⭐ a word index, comprehensions only |
| 7 | Functions **Pt1** | `def`, parameters, `return` vs `print`, `None` | honest spells that build on each other · ⭐ `collect_admirers` and `top_admirer` (returns None on purpose) |
| R2 | Revision II: The Clues So Far | | print-inside-a-call trap, `common_floor` repair, a case file |
| 8 | Functions **Pt2** | defaults, keyword arguments, returning tuples, docstrings, `None` as "not given" | `find_items(items, shiny=True, limit=None)` where limit=0 matters · ⭐ one-pass bounds and rescaling |
| 9 | Scope and Mutability | local vs global, shared list arguments, the mutable default | repair `collect(item, bag=[])` · ⭐ un-collect without touching the evidence |
| 10 | Modules | `math`, `random`, seeds, import styles, `collections` (`Counter`, `defaultdict`) and `json` (🔄 added 2026-10) | predict the Cabinet from its seed · ⭐ the Owl Post manifest: JSON in, group and count with `collections`, JSON out (🔄 replaces the farthest pair) |
| 11 | Parsing Scrolls | `split`, `join`, `partition`, `splitlines`, `zip`, `ljust` | the Borgin and Burkes receipt (repeats, numbers, smudges) · ⭐ parse and pretty-print a table |
| 12 | ★ Seek and Count | linear search, counting steps (O(n), O(n²)), two pointers, signatures | 🟢 find every index · 🟡 merge two sorted lists, fast · 🔴 group 20,000 anagrams |
| R3 | Revision III: An Unexpected Ally | | a None-default tally, Lockhart's search charm, the first repeat (fast) |
| 13 | ★ Cipher Craft | `ord`/`chr`, `%` wrapping, Caesar ciphers, frequency analysis | 🟢 shift a letter · 🟡 encode and decode · 🔴 crack by E |
| 14 | Debugging Craft | tracebacks, print-debugging, `assert`, removing while looping, the Pensieve | the glimmer gauge · the un-collecting counter-spell · ⭐ Lockhart's ledger (four bugs) |
| 🏁 | **Trial: Messages of the Chamber** | | `caesar_shift` → `letter_frequencies` → `crack` (English scoring, fair ties) → `open_cabinet`: decode six notes and speak the password |

## Year 3: The Prisoner of Recursion ✅ built

*Requires Year 2. Ends able to handle errors and files, use recursion, and reason about efficiency.*
The story is [The Prisoner of the Loop](story.md#year-3-the-prisoner-of-the-loop). Every exercise is function-style. There are 20 units: 16 lessons, 3 revisions and the Trial, with 61 exercises.

| # | id | Lesson | Concepts | Exercises: 🌱 Warm-up · 🔥 Core (twist) · ⭐ Outstanding |
|---|---|---|---|---|
| 1 | y3-l01a | Dementor Defence **Pt1** | `try/except/else/finally`, catching specific exceptions | 🌱 `safe_int(text)` returns None for text that isn't a number · 🔥 the Boggart log: average the readings while skipping bad ones, and what if they are all bad? *(edge case)* · ⭐ run a list of spells and report the first error's type, with no bare `except` *(constraint)* |
| 1 | y3-l01b | Dementor Defence **Pt2** | `raise`, error messages, validation | 🌱 `check_year(n)` raises `ValueError` outside 1–7 · 🔥 Hogsmeade permission slips: reject 8 kinds of bad input, each with the right exception and message *(edge case)* · ⭐ check a whole sack of slips and report which line failed and why *(combination)* |
| 2 | y3-l02 | The Restricted Section: Files | `open`, `with`, reading lines, `strip`, writing files, CSV-style `split(",")`, `json.dump` | 🌱 count the names in `register.txt` · 🔥 the corrupted 1926 enrolment ledger: missing fields, blank lines, stray spaces *(edge case)* · ⭐ the ledger as JSON: clean it and write `ledger.json` (🔄 replaces the fair copy) *(combination)* |
| 3 | y3-l03 | Spells as Values | functions as values, `lambda`, `sorted(key=)`, `min`/`max` with `key`, `map`/`filter` | 🌱 sort prophecies by length · 🔥 Trelawney's prophecies by date, then by certainty, highest first *(spec reading)* · ⭐ `pipeline(spells, value)` applies a list of spells in order *(inversion)* |
| R1 | y3-r1 | Library Revision I | lessons 1–3 | predict `try/except/else/finally` order · repair a file reader that crashes on a blank line · `top_n(records, n, key)` |
| 4 | y3-l04 | Flexible Spells | `*args`, `**kwargs`, unpacking in calls | 🌱 `total(*amounts)` · 🔥 the Map's `log(*sightings, sep=..., level=...)`, including zero sightings *(edge case)* · ⭐ `counted(spell)` returns a wrapped spell that counts its calls *(combination)* |
| 5 | y3-l05a | The Time-Turner: Recursion **Pt1** | base case and recursive case, recursion on numbers and strings | 🌱 ★ a recursive countdown · 🔥 ★ sum of digits with no loops *(constraint)* · ⭐ ★ reverse a string recursively, then check palindromes with it |
| 5 | y3-l05b | The Time-Turner: Recursion **Pt2** | recursion on lists, the call stack (in the Pensieve), `RecursionError`, a memoization teaser | 🌱 repair the Turner that has no base case *(debug)* · 🔥 ★ flatten nested lists of any depth, empty lists included *(edge case)* · ⭐ ★ every subset of 3 ingredients, in a stated order |
| 6 | y3-l06 | ★ Counting Steps: Big-O | O(1), O(n), O(n²), O(log n), measured by counting steps | 🌱 divination: count each of 4 spells' steps · 🔥 predict which of 4 spells survives 10⁶ owls, then speed up a slow one *(scale)* · ⭐ ★ find a pair of owls that sum to a target in 20,000, in O(n) |
| 7 | y3-l07a | ★ Binary Search **Pt1** | halving, `lo`/`hi`, off-by-one errors | 🌱 ★ find a spell in a sorted list · 🔥 ★ the first sighting of a day in a log with repeats *(edge case)* · ⭐ ★ the insert position, without `bisect` *(constraint)* |
| 7 | y3-l07b | ★ Binary Search **Pt2** | searching on a condition | 🌱 guess the number in at most 7 tries · 🔥 ★ the first page where the ink fades: 1,000,000 pages, and every look is counted *(scale)* · ⭐ ★ integer square root by halving |
| R2 | y3-r2 | Library Revision II | lessons 4–7 | predict a recursion's output · repair a binary search that loops forever · count the calls a recursive spell makes |
| 8 | y3-l08 | ★ Two Pointers and Sliding Window (🔄 replaces Sorting by Hand) | two pointers from both ends, a window that grows and shrinks, a set inside the window | 🌱 ★ a pair of pages with a target sum (sorted) · 🔥 ★ the longest run of pages with no repeated ink *(edge case)* · ⭐ ★ the shortest run of pages reaching a total *(scale)* |
| 9 | y3-l09 | ★ Sorting Smart | stability, tuple keys, custom orderings | 🌱 sort by a custom house order · 🔥 order the Thestral carriages by 3 rules *(spec reading)* · ⭐ show that two stable passes give the same order as one tuple key |
| 10 | y3-l10 | ★ The Marauder's Grid | 2-D lists, neighbours, bounds, recursive flood fill | 🌱 count a square's neighbours, edges included · 🔥 ★ fill a flooded room, and what if you start on a wall? *(edge case)* · ⭐ ★ count the separate islands |
| 11 | y3-l11 | How Wizards Solve Problems | understand, plan, pseudocode, test; writing your own edge-case tests | 🌱 write tests for a spec; they must catch 3 broken spells · 🔥 tests *first*, then the Turner's `turns_needed(start, target)` *(spec reading)* · ⭐ one test that catches all 3 hidden bugs |
| R3 | y3-r3 | Library Revision III | lessons 8–11 | predict a stable sort · repair a flood fill that never stops (no visited set) · an islands variant |
| 12 | y3-l12 | ★ String Spells | two-pointer palindromes, run-length encoding, longest common prefix | 🌱 ★ RLE encode · 🔥 ★ RLE decode, with counts of more than one digit *(edge case)* · ⭐ ★ the longest palindromic substring |
| 13 | y3-l13 | ★ The Enchanted Board | simulation: Game of Life on a grid | 🌱 the next state of one square · 🔥 one generation, with the board-copying trap from Year 1 *(debug)* · ⭐ ★ how many generations until the board repeats? |
| 🏁 | y3-trial | **Trial: The Time-Turner Escape** | everything | **Stage 1:** `load_maze(path)`: read the maze from a file and raise clear errors for corrupt maps. **Stage 2:** find the start and the exit. **Stage 3:** flood fill: can the exit be reached? **Stage 4:** `escape_report(path)`: a polite report for every case (corrupt, trapped, or free after visiting N hours). |

Shortest paths are left for Year 4's breadth-first search, so the Trial asks only whether the exit can be reached and how much of the maze can be reached.

## Year 4: The Goblet of Objects

*Requires Year 3. Ends with the core interview toolkit (hashing, stacks, queues, heaps) and the everyday tools of service code: classes, type hints, JSON and HTTP.*

| # | Lesson | Concepts | Core twist, and ★ problems |
|---|---|---|---|
| 1 | 🛠 Objects for TypeScript Developers | `class`, `__init__`, `self`, methods, `__repr__`, `__eq__`; what's different from TS (no `private`, no `this` binding, duck typing) | model a Triwizard `Champion` from a spec, and repair the shared-list class attribute *(debug)* |
| 2 | 🛠 Dataclasses, Enums and Type Hints | `@dataclass` (`field`, `frozen`, ordering), `Enum`, annotations, `Optional`, `list[str]`, `dict[str, int]` | refactor a noisy class into a typed dataclass *(refactor)* |
| 3 | ★ Hashing Patterns **Pt1/Pt2** | `Counter`, `most_common`, `defaultdict(list)`, hashable keys, tuples as keys | 🟢 is it an anagram? · 🟡 group anagrams · 🟡 top-k frequent spells · 🔴 longest consecutive run |
| R1 | Library Revision I | | |
| 4 | 🛠 JSON Payloads | `json.loads`/`dumps`, nested dict and list data, validating a payload, turning it into dataclasses | parse a Triwizard scoreboard payload with missing and mistyped fields *(edge case)* |
| 5 | ★ Stacks | stack with a list, matching brackets, the monotonic stack | 🟢 valid brackets · 🟡 next warmer day · 🔴 evaluate reverse-Polish arithmetic |
| 6 | 🛠 HTTP with Owl Post | requests and responses, methods, status codes, headers, JSON bodies, query parameters (on the simulated `owl_post` client) | fetch a champion's record and handle 404, 429 and 500 politely *(edge case)* |
| 7 | ★ Queues and Breadth-First Search | `collections.deque`, BFS on grids and graphs, shortest path length, multi-source BFS | 🟢 is it reachable? · 🟡 shortest path through the maze · 🔴 spreading enchantment (multi-source) |
| R2 | Library Revision II | | |
| 8 | ★ Heaps and Priority Queues | `heapq`, tuples as priorities, top-k, k-th largest | 🟢 the three fastest brooms · 🟡 k-th largest score · 🔴 merge k sorted lists |
| 9 | 🛠 Building an API Client | a client class, pagination, retries with backoff, caching responses | page through every judge's scores, retrying politely *(combination)* |
| 10 | ★ Linked Lists | nodes, fast and slow pointers, reversing | 🟢 the middle node · 🟡 reverse the list · 🔴 detect a cycle and find where it starts |
| 11 | 🛠 Errors and Logging in Services | custom exception classes, `raise ... from`, `logging`, error responses | turn internal errors into clean API error payloads *(design)* |
| R3 | Library Revision III | | |
| 12 | ★ Matrix Patterns | rotate, spiral order, set-matrix-zeroes, in place | 🟢 transpose · 🟡 spiral order · 🔴 rotate in place |
| 13 | ★ Mixed Practice I | choosing the structure: dict, set, stack, queue or heap? | three timed problems, each needing a different structure |
| 14 | 🛠 Designing a Small Service | responsibilities, a typed data layer, a client, errors and logging working together | design and build a scoreboard service over `owl_post` |
| 🏁 | **Trial: The Triwizard Tournament** | | **Task 1, the Dragon:** parse a JSON event feed and replay it with a stack and a queue. **Task 2, the Lake:** BFS rescue against a time limit. **Task 3, the Maze:** an API client that pages through the maze service and ranks the champions with a heap. |

## Year 5: The Order of Algorithms (O.W.L. year)

*Requires Year 4. Ends fluent in the core interview patterns and trees, and in the machinery that frameworks are built from.*

| # | Lesson | ★ Problems (🟢 easy · 🟡 medium · 🔴 hard), or 🛠 practical work |
|---|---|---|
| 1 | 🛠 Closures and Decorators **Pt1/Pt2** | `nonlocal`, wrapping functions, `functools.wraps`, decorators with arguments; build `@timed`, `@retry` and a route-registering `@app.get` like FastAPI's |
| 2 | ★ Two Pointers, Advanced | 🟢 container with most water · 🟡 three-sum · 🔴 trapping rainwater |
| 3 | ★ Sliding Window, Advanced | 🟢 best k-day streak · 🟡 longest substring without repeats · 🔴 minimum window containing all ingredients |
| R1 | Library Revision I | |
| 4 | 🛠 Iterators and Generators | `iter`/`next`, `yield`, generator pipelines, lazy reading; a simulated **token stream** assembled as it arrives (how LLM streaming works) |
| 5 | ★ Prefix Sums | 🟢 range-sum queries · 🟡 count subarrays summing to k (prefix plus hash map) |
| 6 | ★ Binary Search on the Answer | 🟢 the slowest broom that's fast enough · 🔴 split the potions between k cauldrons |
| 7 | 🛠 Async and Await | coroutines, `asyncio.gather`, timeouts, why async suits services that wait on the network; concurrent `owl_post` calls |
| R2 | Library Revision II | |
| 8 | ★ Intervals | 🟢 merge overlapping class times · 🟡 insert a new one · 🔴 how many classrooms are needed (with a heap) |
| 9 | ★ Sorting That Matters | 🟢 merge sort · 🟡 quickselect for the k-th smallest · 🔴 count inversions |
| 10 | ★ Backtracking | 🟢 subsets · 🟡 permutations · 🔴 combination sum, and word search on a grid |
| 11 | ★ Trees I | 🟢 depth and traversals (recursive and iterative) · 🟡 level order with a `deque` · 🔴 the tree's diameter |
| R3 | Library Revision III | |
| 12 | ★ Trees II: Binary Search Trees | 🟢 insert and search · 🟡 validate a BST · 🔴 lowest common ancestor |
| 13 | 🛠 Testing Like a Professional | pytest-style tests, parametrised cases, fixtures in spirit, mocking `owl_post` and the clock |
| 14 | ★ Complexity, Formally | time and space complexity of your own earlier solutions; trading space for time |
| 🏁 | **The O.W.L. Exams** | Timed, graded O to T, one paper per subject: Charms (strings), Potions (debugging), Arithmancy (numbers), Divination (tracing), Transfiguration (refactoring), Defence (errors and HTTP), and Ancient Runes (algorithms). |

## Year 6: The Half-Blood Pythonista

*Requires Year 5. Ends solving graph problems, and building and testing a real web API on your own machine.*

| # | Lesson | Concepts and ★ problems |
|---|---|---|
| 1 | 🛠 🖥 **Leaving Hogwarts I** | install Python; `uv` (or `venv` and `pip`); run scripts; project layout; `.env` and secrets *(guided steps with checklists; verified by pasting terminal output)* |
| 2 | 🛠 🖥 **Leaving Hogwarts II** | git basics, pytest on your own machine, `ruff` and `mypy` |
| 3 | ★ Graphs I | adjacency lists from edge lists; 🟢 DFS for connected components · 🟡 BFS for fewest hops on the Floo Network · 🔴 clone a graph |
| R1 | Library Revision I | |
| 4 | 🛠 🖥 FastAPI I | routes, path and query parameters, pydantic models, automatic docs |
| 5 | 🛠 🖥 FastAPI II | validation errors, HTTP exceptions, dependencies, tests with `TestClient` |
| 6 | ★ Graphs II: Ordering | 🟡 topological sort (the potion brewing order) · 🔴 detect impossible recipes (cycles) |
| 7 | ★ Shortest Paths | 🟡 Dijkstra with `heapq` on the Floo Network · 🔴 cheapest route with at most k stops |
| R2 | Library Revision II | |
| 8 | 🛠 🖥 Talking to Other Services | `httpx` (sync and async), timeouts, retries, calling another API from your FastAPI app |
| 9 | ★ Union-Find | 🟢 connected safe houses · 🟡 the redundant connection |
| 10 | ★ Tries | 🟢 insert and search · 🟡 spell autocomplete |
| 11 | 🛠 🖥 Storing Data | `sqlite3`, a small repository layer, using it from FastAPI |
| R3 | Library Revision III | |
| 12 | 🛠 Text Processing | regular expressions: patterns, groups, validating Floo addresses |
| 13 | The Prince's Margin Notes | Pythonic idioms across all six years; Snape reviews your old code |
| 🏁 | **Trial: The Prince's Puzzle** 🖥 | A tested FastAPI service on your own machine: a spell index with search (a trie) and a scheduler (a priority queue), with its own pytest suite. |

## Year 7: The Deathly Algorithms (N.E.W.T. year)

*Requires Year 6. Ends interview-ready, and able to build LLM-powered apps and agents.*

| # | Lesson | ★ Problems, or 🛠 practical work |
|---|---|---|
| 1 | ★ Dynamic Programming I: Memoization | 🟢 the moving staircases (climbing stairs) · 🟡 house robber · 🔴 decode ways |
| 2 | ★ Dynamic Programming II: Tabulation | 🟢 Gringotts coin change (ways) · 🟡 fewest coins · 🔴 longest increasing subsequence |
| 3 | ★ Dynamic Programming III: Grids and Strings | 🟡 unique grid paths · 🔴 longest common subsequence, then edit distance · 🔴 0/1 knapsack |
| R1 | Library Revision I | |
| 4 | 🛠 LLM Apps I: Messages | roles, system prompts, parameters, conversation state; in the browser on the `Oracle` mock, then 🖥 locally with the Anthropic SDK |
| 5 | 🛠 LLM Apps II: Streaming and Structure | streaming responses (generators again), structured JSON output validated with pydantic |
| 6 | 🛠 LLM Apps III: Tool Use | describing tools, the tool-call loop, returning results, handling errors |
| 7 | ★ Greedy | 🟢 jump game · 🟡 gas station · 🔴 when greedy fails, and why |
| R2 | Library Revision II | |
| 8 | 🛠 Agents | an agent loop with tools, stopping conditions (base cases, again!), step and cost budgets, recovering from tool errors |
| 9 | 🛠 Retrieval Basics | chunking text, keyword and embedding search (ranking with a heap), grounding answers in sources |
| 10 | ★ Bit Manipulation | flags, the single-number trick, subsets as bitmasks |
| 11 | 🛠 Evaluating LLM Output | test sets, graders, regression checks for prompts |
| R3 | Library Revision III | |
| 12 | ★ Mock Interviews I | timed mixed sets, talking through your approach, complexity on demand |
| 13 | ★ Mock Interviews II | harder timed sets mixing every pattern |
| 🎓 | **Capstone** 🖥 | your own agent backend: FastAPI plus Claude with tools, tests and a README, reviewed by the Professor |
| 🏁 | **N.E.W.T.s and the Battle of Hogwarts** | Seven Horcruxes, each a hard problem mixing patterns from every year, followed by the final multi-stage battle. |

## Auror Academy (after the game)
- **Daily Prophet challenge:** a new problem each day, rotating through difficulties.
- **Auror interview sets:** timed sets of problems in the style of technical interviews.
- **Room of Requirement projects:** open-ended builds with suggested milestones.
