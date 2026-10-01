# Curriculum: The Seven Years

This curriculum takes a complete beginner to expert-level Python and problem solving. It follows the rules in [exercise-design.md](exercise-design.md): every lesson has a 🌱 Warm-up, a 🔥 Core challenge with a twist, and an optional ⭐ Outstanding challenge. Heavy topics are split into parts.

**Key**
- **Pt1 / Pt2**: the lesson is split into parts.
- **★**: algorithm or DSA content.
- **(twist)**: the twist used by the core challenge.
- **R**: a *Revision in the Library* lesson, which mixes earlier concepts with no new material.

| Year | Theme | Lessons | Finale |
|---|---|---|---|
| 1 | The Philosopher's Syntax: fundamentals | 15 + 3R | Trial: Sorting Hat Reforged |
| 2 | The Chamber of Collections: data structures and functions | 14 + 3R | Trial: Messages of the Chamber |
| 3 | The Prisoner of Recursion: errors, files, recursion, first algorithms | 13 + 3R | Trial: The Time-Turner Escape |
| 4 | The Goblet of Objects: OOP and hand-built data structures | 14 + 3R | Trial: The Triwizard Tournament |
| 5 | The Order of Algorithms: patterns and complexity | 13 + 3R | The O.W.L. exams |
| 6 | The Half-Blood Pythonista: advanced Python, trees and graphs, real tools | 15 + 3R | Trial: The Prince's Puzzle |
| 7 | The Deathly Algorithms: dynamic programming, advanced graphs, capstone | 14 + 2R | N.E.W.T.s and the Battle of Hogwarts |
| ∞ | Auror Academy (after the game) | endless | daily challenges, interview sets, projects |

---

## The algorithms ladder (★)

Algorithmic thinking starts on day one, as small puzzles. Formal DSA begins in Year 3, once the learner can write functions.

| Year | Level | Topics |
|---|---|---|
| 1 | 🌱 Seeds | digit sum, palindrome, Collatz, FizzBuzz variant, primes, max without `max()`, second largest, remove duplicates, reverse in place |
| 2 | 🌱 Foundations | linear search, frequency maps, merging two sorted lists, anagrams, Caesar cipher and frequency analysis |
| 3 | 🟢 Formal basics | Big-O by counting steps, binary search, selection and insertion sort, sort keys, grids and flood fill, simple string algorithms, Game of Life |
| 4 | 🟢 Structures | stacks, queues, linked lists, build-your-own hash map, breadth-first search in a maze |
| 5 | 🟡 Patterns | two pointers, sliding window, prefix sums, hashing patterns, merge sort, quicksort, binary search on the answer, backtracking, intervals |
| 6 | 🟡 to 🔴 Trees and graphs | binary search trees, traversals, heaps, graph representations, BFS/DFS, N-Queens |
| 7 | 🔴 Advanced | dynamic programming (memoization, tabulation, grids, longest common subsequence), greedy, Dijkstra, union-find, topological sort, tries, bit manipulation |

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
| 3 | Dictionaries **Pt1/Pt2/Pt3** | `get`, `in`, `items`, `del`; counting and grouping; nested dicts | what came back (KeyError repair) · ⭐ reverse lookup with clashes · the tally of the missing (messy keys) · ⭐ most wanted at 50,000 items · the loudest place · ⭐ merge two nested reports without changing either |
| R1 | Revision I: Filch Objects | | aliasing, a duplicate detector, Filch's alibi |
| 4 | Sets | uniqueness, `& \| - ^`, fast membership | present at every vanishing · ⭐ 20,000-name registry, fast and in order |
| 5 | Nested Data | lists of dicts, missing fields, building an index | the delivery ledger (unsigned deliveries) · ⭐ items sent by two shops |
| 6 | Comprehensions **Pt1/Pt2** | list, dict and set comprehensions; filters; `x if c else y`; `any`/`all` | sorting the fan mail · ⭐ flip, transpose and flatten with no `for` · Lockhart's one-line spell · ⭐ a word index, comprehensions only |
| 7 | Functions **Pt1** | `def`, parameters, `return` vs `print`, `None` | honest spells that build on each other · ⭐ `collect_admirers` and `top_admirer` (returns None on purpose) |
| R2 | Revision II: The Clues So Far | | print-inside-a-call trap, `common_floor` repair, a case file |
| 8 | Functions **Pt2** | defaults, keyword arguments, returning tuples, docstrings, `None` as "not given" | `find_items(items, shiny=True, limit=None)` where limit=0 matters · ⭐ one-pass bounds and rescaling |
| 9 | Scope and Mutability | local vs global, shared list arguments, the mutable default | repair `collect(item, bag=[])` · ⭐ un-collect without touching the evidence |
| 10 | Modules | `math`, `random`, seeds, import styles | predict the Cabinet from its seed · ⭐ farthest pair and a seeded patrol |
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
| 2 | y3-l02 | The Restricted Section: Files | `open`, `with`, reading lines, `strip`, writing files, CSV-style `split(",")` | 🌱 count the names in `register.txt` · 🔥 the corrupted 1926 enrolment ledger: missing fields, blank lines, stray spaces *(edge case)* · ⭐ write a cleaned copy to `clean.txt` and return how many lines were dropped *(combination)* |
| 3 | y3-l03 | Spells as Values | functions as values, `lambda`, `sorted(key=)`, `min`/`max` with `key`, `map`/`filter` | 🌱 sort prophecies by length · 🔥 Trelawney's prophecies by date, then by certainty, highest first *(spec reading)* · ⭐ `pipeline(spells, value)` applies a list of spells in order *(inversion)* |
| R1 | y3-r1 | Library Revision I | lessons 1–3 | predict `try/except/else/finally` order · repair a file reader that crashes on a blank line · `top_n(records, n, key)` |
| 4 | y3-l04 | Flexible Spells | `*args`, `**kwargs`, unpacking in calls | 🌱 `total(*amounts)` · 🔥 the Map's `log(*sightings, sep=..., level=...)`, including zero sightings *(edge case)* · ⭐ `counted(spell)` returns a wrapped spell that counts its calls *(combination)* |
| 5 | y3-l05a | The Time-Turner: Recursion **Pt1** | base case and recursive case, recursion on numbers and strings | 🌱 ★ a recursive countdown · 🔥 ★ sum of digits with no loops *(constraint)* · ⭐ ★ reverse a string recursively, then check palindromes with it |
| 5 | y3-l05b | The Time-Turner: Recursion **Pt2** | recursion on lists, the call stack (in the Pensieve), `RecursionError`, a memoization teaser | 🌱 repair the Turner that has no base case *(debug)* · 🔥 ★ flatten nested lists of any depth, empty lists included *(edge case)* · ⭐ ★ every subset of 3 ingredients, in a stated order |
| 6 | y3-l06 | ★ Counting Steps: Big-O | O(1), O(n), O(n²), O(log n), measured by counting steps | 🌱 divination: count each of 4 spells' steps · 🔥 predict which of 4 spells survives 10⁶ owls, then speed up a slow one *(scale)* · ⭐ ★ find a pair of owls that sum to a target in 20,000, in O(n) |
| 7 | y3-l07a | ★ Binary Search **Pt1** | halving, `lo`/`hi`, off-by-one errors | 🌱 ★ find a spell in a sorted list · 🔥 ★ the first sighting of a day in a log with repeats *(edge case)* · ⭐ ★ the insert position, without `bisect` *(constraint)* |
| 7 | y3-l07b | ★ Binary Search **Pt2** | searching on a condition | 🌱 guess the number in at most 7 tries · 🔥 ★ the first page where the ink fades: 1,000,000 pages, and every look is counted *(scale)* · ⭐ ★ integer square root by halving |
| R2 | y3-r2 | Library Revision II | lessons 4–7 | predict a recursion's output · repair a binary search that loops forever · count the calls a recursive spell makes |
| 8 | y3-l08 | ★ Sorting by Hand | selection sort, insertion sort, counting swaps | 🌱 one pass of selection sort · 🔥 ★ insertion sort that counts its moves: which sort does fewer on nearly sorted pages? *(comparison)* · ⭐ ★ sort the diary pages with at most n−1 swaps *(constraint)* |
| 9 | y3-l09 | ★ Sorting Smart | stability, tuple keys, custom orderings | 🌱 sort by a custom house order · 🔥 order the Thestral carriages by 3 rules *(spec reading)* · ⭐ show that two stable passes give the same order as one tuple key |
| 10 | y3-l10 | ★ The Marauder's Grid | 2-D lists, neighbours, bounds, recursive flood fill | 🌱 count a square's neighbours, edges included · 🔥 ★ fill a flooded room, and what if you start on a wall? *(edge case)* · ⭐ ★ count the separate islands |
| 11 | y3-l11 | How Wizards Solve Problems | understand, plan, pseudocode, test; writing your own edge-case tests | 🌱 write tests for a spec; they must catch 3 broken spells · 🔥 tests *first*, then the Turner's `turns_needed(start, target)` *(spec reading)* · ⭐ one test that catches all 3 hidden bugs |
| R3 | y3-r3 | Library Revision III | lessons 8–11 | predict a stable sort · repair a flood fill that never stops (no visited set) · an islands variant |
| 12 | y3-l12 | ★ String Spells | two-pointer palindromes, run-length encoding, longest common prefix | 🌱 ★ RLE encode · 🔥 ★ RLE decode, with counts of more than one digit *(edge case)* · ⭐ ★ the longest palindromic substring |
| 13 | y3-l13 | ★ The Enchanted Board | simulation: Game of Life on a grid | 🌱 the next state of one square · 🔥 one generation, with the board-copying trap from Year 1 *(debug)* · ⭐ ★ how many generations until the board repeats? |
| 🏁 | y3-trial | **Trial: The Time-Turner Escape** | everything | **Stage 1:** `load_maze(path)`: read the maze from a file and raise clear errors for corrupt maps. **Stage 2:** find the start and the exit. **Stage 3:** flood fill: can the exit be reached? **Stage 4:** `escape_report(path)`: a polite report for every case (corrupt, trapped, or free after visiting N hours). |

Shortest paths are left for Year 4's breadth-first search, so the Trial asks only whether the exit can be reached and how much of the maze can be reached.

## Year 4: The Goblet of Objects

*Requires Year 3. Ends able to design programs with classes and to build classic data structures from scratch.*

| # | Lesson | Concepts | Core twist, and ★ problems |
|---|---|---|---|
| 1 | Conjuring Objects | classes, `__init__`, attributes | model a `Wand` from a spec *(design)* |
| 2 | Methods and `self` | methods, state that changes | a `Cauldron` with methods to add, stir and brew; the order rules matter |
| 3 | Class vs Instance **Pt1/Pt2** | class attributes, the shared-list gotcha from Year 1 in class form | repair the "every student shares one trunk" bug |
| R1 | Library Revision I | | |
| 4 | Dunder Magic | `__str__`, `__repr__`, `__eq__`, `__lt__`, `__len__` | make `sorted()` work on Champions |
| 5 | Inheritance | subclasses, `super()`, overriding | a creature family tree |
| 6 | Composition vs Inheritance | "has-a" vs "is-a" design | redesign a bad inheritance tree *(refactor, design)* |
| 7 | Guarded Vaults | properties, validation, encapsulation | a Gringotts account whose balance can never go negative *(edge case)* |
| R2 | Library Revision II | | |
| 8 | Dataclasses and Enums | `@dataclass`, `Enum` | refactor a noisy class into a dataclass |
| 9 | ★ Stacks | push, pop, peek | 🟢 undo a spell stack · 🟡 matching brackets · 🔴 evaluate reverse-Polish arithmetic |
| 10 | ★ Queues | `deque`, first-in-first-out | 🟢 an owl delivery queue · 🟡 a hot-potato elimination game · 🔴 a queue built from 2 stacks |
| 11 | ★ Linked Lists **Pt1/Pt2** | nodes, traversal, insert and delete, reversing | 🟢 find length · 🟡 reverse the list · 🔴 detect a cycle (two pointers) |
| R3 | Library Revision III | | |
| 12 | ★ Build Your Own Hash Map | hashing, buckets, collisions, resizing | implement `get`, `put` and `delete`, then compare with `dict` *(scale)* |
| 13 | ★ Breadth-First Search | BFS on a grid, shortest path | 🟢 is it reachable? · 🟡 shortest path length · 🔴 the path itself |
| 14 | Designing a Program | responsibilities, interfaces, simple diagrams | design and build a small shop simulation |
| 🏁 | **Trial: The Triwizard Tournament** | | **Task 1, the Dragon:** a stack- and queue-based simulation. **Task 2, the Lake:** search under a time limit. **Task 3, the Maze:** an object-oriented maze plus BFS. |

## Year 5: The Order of Algorithms (O.W.L. year)

*Requires Year 4. Ends fluent in the core problem-solving patterns and complexity analysis.*

| # | Lesson | ★ Problems (🟢 easy · 🟡 medium · 🔴 hard) |
|---|---|---|
| 1 | Iterators | 🟢 a custom range class · 🟡 an infinite iterator, taken with limits |
| 2 | Generators | 🟢 a Fibonacci generator · 🟡 a pipeline of generators · 🔴 lazily reading a huge scroll |
| 3 | Tools of the Order: `collections` and `itertools` | `Counter`, `defaultdict`, `combinations`, `groupby` |
| R1 | Library Revision I | |
| 4 | ★ Two Pointers | 🟢 pair with a target sum in sorted data · 🟡 three-sum · 🔴 trapping rainwater |
| 5 | ★ Sliding Window | 🟢 best 3-day streak · 🟡 longest substring without repeated letters · 🔴 minimum window containing all ingredients |
| 6 | ★ Prefix Sums | 🟢 range-sum queries · 🟡 count subarrays summing to k |
| 7 | ★ Hashing Patterns | 🟢 two-sum · 🟡 group anagrams · 🔴 longest run of consecutive numbers |
| R2 | Library Revision II | |
| 8 | ★ Merge Sort | 🟢 implement it · 🟡 count inversions |
| 9 | ★ Quicksort and Partitioning | 🟢 partition · 🟡 quickselect for the k-th smallest |
| 10 | ★ Binary Search on the Answer | 🟢 integer square root · 🔴 minimum broom speed to finish in time |
| 11 | ★ Backtracking I | 🟢 subsets · 🟡 permutations · 🔴 combination sum |
| R3 | Library Revision III | |
| 12 | ★ Intervals | 🟢 merge overlapping class times · 🟡 how many classrooms are needed? |
| 13 | Complexity, Formally | time and space complexity of your own earlier solutions |
| 🏁 | **The O.W.L. Exams** | Timed, graded O to T, one paper per subject: Charms (strings), Potions (debugging), Arithmancy (numbers), Divination (tracing), Transfiguration (refactoring), Defence (errors), and Ancient Runes (algorithms). |

## Year 6: The Half-Blood Pythonista

*Requires Year 5. Ends writing professional, idiomatic, tested Python, and working outside the browser.*

| # | Lesson | Concepts and ★ problems |
|---|---|---|
| 1 | Closures | inner functions, `nonlocal`; a counter factory |
| 2 | Decorators **Pt1/Pt2** | timing, logging, caching decorators; decorators that take arguments |
| 3 | Context Managers | `with`, `__enter__`/`__exit__`, `contextlib` |
| R1 | Library Revision I | |
| 4 | Type Hints | annotations, `Optional`, generics; reading type errors |
| 5 | Testing and TDD | `assert`, pytest-style tests, test-first katas |
| 6 | Regular Expressions | patterns and groups; validate Floo addresses |
| 7 | ★ Binary Search Trees | 🟢 insert and search · 🟡 validate a BST · 🔴 delete a node |
| R2 | Library Revision II | |
| 8 | ★ Tree Traversals | 🟢 in-, pre- and post-order · 🟡 level order · 🔴 lowest common ancestor |
| 9 | ★ Heaps and Priority Queues | 🟢 `heapq` basics · 🟡 the k most frequent spells · 🔴 merge k sorted lists |
| 10 | ★ Graphs | adjacency lists and matrices; the Floo Network |
| 11 | ★ Graph Search | 🟢 DFS for connected components · 🟡 BFS for fewest hops · 🔴 cycle detection |
| R3 | Library Revision III | |
| 12 | ★ Backtracking II | 🟡 N-Queens · 🔴 a Sudoku solver |
| 13 | The Prince's Margin Notes | Pythonic idioms; Snape reviews your Year 1–5 code |
| 14 | **Leaving Hogwarts I** | install Python and VS Code; run scripts; `venv`; `pip install` *(guided steps with checklists; verified by pasting terminal output)* |
| 15 | **Leaving Hogwarts II** | git basics, project layout, running pytest on your own machine |
| 🏁 | **Trial: The Prince's Puzzle** | A multi-part project on your own machine: a tested command-line spell index with a priority-queue scheduler. |

## Year 7: The Deathly Algorithms (N.E.W.T. year)

*Requires Year 6. Ends expert level, ready for real projects and technical interviews.*

| # | Lesson | ★ Problems |
|---|---|---|
| 1 | ★ Dynamic Programming I: Memoization | 🟢 the moving staircases (climbing stairs) · 🟡 house robber · 🔴 decode ways |
| 2 | ★ Dynamic Programming II: Tabulation | 🟢 Gringotts coin change (ways) · 🟡 fewest coins · 🔴 0/1 knapsack (the Room of Requirement's capacity) |
| 3 | ★ Dynamic Programming III: Grids and Strings | 🟡 unique grid paths · 🔴 longest common subsequence, then edit distance |
| R1 | Library Revision I | |
| 4 | ★ Greedy | 🟢 activity selection · 🟡 jump game · 🔴 when greedy fails, and why |
| 5 | ★ Shortest Paths: Dijkstra | the Floo Network with travel times |
| 6 | ★ Union-Find | members of the Order in connected safe houses |
| 7 | ★ Topological Sort | the potion brewing order; detecting impossible recipes |
| 8 | ★ Tries | spell autocomplete |
| R2 | Library Revision II | |
| 9 | ★ Bit Manipulation | flags, the single-number trick, subsets as bitmasks |
| 10 | Performance | profiling, `lru_cache`, choosing the right structure |
| 11 | Async Basics | `async`/`await`, concurrency ideas *(run locally)* |
| 12 | Reading the Standard Library Docs | finding answers yourself |
| 13–14 | **Capstone** | Your own project on your own machine, with tests, a README, and a code review from the Professor |
| 🏁 | **N.E.W.T.s and the Battle of Hogwarts** | Seven Horcruxes, each a hard problem mixing patterns from every year, followed by the final multi-stage battle. |

## Auror Academy (after the game)
- **Daily Prophet challenge:** a new problem each day, rotating through difficulties.
- **Auror interview sets:** timed sets of problems in the style of technical interviews.
- **Room of Requirement projects:** open-ended builds with suggested milestones.
