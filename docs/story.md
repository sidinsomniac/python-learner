# Story Bible

> This is a personal, non-commercial fan project. The canon cast appears as quest-givers. The mysteries and the villains of each year are original, so the story is new even for someone who knows the books by heart.

## The world

**Python is Parseltongue.** Everything a program does, a spell does. Every lesson happens somewhere in the castle, and every year has a mystery that **only your code can solve**. The story isn't decoration: the answer to the mystery comes out of the programs you write.

### The cast

| Character | Role in the game | Typical line |
|---|---|---|
| **Professor Ashwood** (original) | Your mentor. Speaks only in questions. | "What does your spell believe `total` is on the first pass?" |
| **Hermione** | Spec-reading twists and precision | "It says *ignore capital letters*. Did you?" |
| **Ron** | Asks the confused question the learner might be too shy to ask | "Hang on, why does `'3' * 3` give three threes?" |
| **Hagrid** | Warm introductions to new topics and creature-themed puzzles | "Nothin' to be scared of! Loops are just like feedin' Fang, over an' over." |
| **Fred & George** | Outstanding challenges, the Forbidden Forest, easter eggs | "Solemnly swear you're up to something clever?" |
| **Neville** | Potion Repair (debugging), and good at growing things | "I followed the recipe exactly... so why did it explode?" |
| **Luna** | Inversion twists, divination, thinking sideways | "Perhaps the answer is hiding at the *end* of the list." |
| **Professor McGonagall** | Refactoring (Transfiguration) and the Trials | "Correct is not the same as elegant, Mr or Miss ___." |
| **Professor Snape** | Code review after you pass. Dry, cutting, secretly fair | "Five identical if statements. Fascinating. In the way a troll is fascinating." |
| **Draco** | Your rival. His times and grades appear on your quests | "Took you *that* long?" |
| **Peeves** | Chaos: scrambles, sabotage, red herrings | "Wheee! Line three goes first now!" |
| **Dobby** | Rewards and the shop | "Dobby has brought a sock! And also some Galleons!" |
| **Dumbledore** | The end of each year, and the lesson behind the lesson | Short, warm, wise. Never long speeches. |

### Rules for writing scenes
- **2–6 lines per story beat.** Players come here to code. The story is seasoning.
- **Every beat ends with a reason to code:** a clue, a problem, or a dare.
- **No canon quote longer than a few words.** Characters speak in their own *style*, in new lines.
- **Clues are found in program output.** The learner's correct solution *prints* the clue. They literally decode the mystery.

---

## Year 1: The Jinxed Ledger

**The premise.** Hogwarts has an enchanted **Spell Ledger**, a great book in the Library that records every spell cast in the castle. The castle runs on it: staircases check it before moving, candles before lighting. This year it has started **misfiring**: spells come out backwards, sums come out wrong, staircases send students to the wrong floor.

**Suspects (red herrings):**
- **Peeves**, who is obviously causing chaos.
- **Draco**, who was caught near the Library after hours.
- A **new portrait** in the Library that no one remembers hanging.

**The truth.** The portrait is **Grimwald Knott**, the Ledger's *original* keeper. He was painted two hundred years ago and forgotten when the Library was rebuilt. Lonely and bitter, he has been *rewriting* spells in the Ledger so that someone would finally notice him. He isn't evil, just unnoticed. At the end he is given a job: keeper of the Pensieve review room. He becomes a friendly recurring character.

### Scene-by-scene

| Lesson | Where | Story beat | The clue your code reveals |
|---|---|---|---|
| Intro | Great Hall | The Hogwarts letter and the Sorting Hat. At the feast, every candle flickers at once and Ashwood frowns at the staff table. | None. The mystery begins. |
| 1 First Incantation | Parseltongue classroom | Ashwood teaches your first spell. When the class says "Hello", the blackboard writes it back *backwards*. | Your ⭐ ASCII owl reveals a smudge: **the Ledger's page 1 has been rewritten** |
| 2 The Owl Knows Your Name | Owlery | The owls are delivering letters to the wrong names. Hagrid asks for help. | The misdelivered letters were all addressed from **"the Library"** |
| 3 Peeves' Ledger | Library | Peeves has scrambled a Gringotts page. Obvious suspect? He cackles: "Not *this* one, ickle firsties!" | The fixed ledger shows a page edited **at midnight**, but Peeves was seen at the feast then |
| R1 | Library | Madam Pince quizzes you. You notice a new portrait watching. | None. Atmosphere. |
| 4 Arithmancy (Pt1/Pt2) | Arithmancy tower | Gringotts sums in the Ledger are off by tiny amounts, like float errors. | The rounding errors all add up to exactly **200**. Years? Pages? |
| 5 Transfiguration of Types | Transfiguration | McGonagall's spell turned a teacup into the *string* "teacup". | The broken spells are **old-style**: written the way wizards wrote 200 years ago |
| 6 Formatting Charms | Charms | Flitwick's prize certificates print as garbled columns. | The certificate template is signed with an old monogram: **"G.K."** |
| 7 String Charms | Common room | Draco is framed: a shouted, jumbled message in the Ledger carries his name. | Cleaning up the message proves it was written in **a different hand** |
| 8 Slicing the Scroll (Pt1/Pt2) | Library, Restricted Section | A half-burnt scroll. Only slices of it can be read. | ⭐ The scroll hides two messages: **"I WAS KEEPER"** and, backwards, **"Forgotten!"** |
| R2 | Library | Hermione lays out the clues on a table. | Summary of the clues so far |
| 9 True or False | Quidditch pitch | The Ledger has jinxed who may fly. The eligibility rules are contradictory. | The jinxed rule only fires for portraits: `is_portrait and not remembered` |
| 10 The Forked Staircase (Pt1/Pt2) | Grand Staircase | Staircases route everyone to the Library's 4th floor. | Every route ends at the same spot: **the new portrait's wall** |
| 11 While the Candles Burn | Great Hall | The candles won't stay lit; they relight forever (an infinite loop!). | The loop only stops when someone says **a forgotten name**. What name? |
| 12 For Every Student | Hall of Records | Fred & George bet you can't check every record before breakfast. | The only keeper in the records with **no portrait plaque**: G.K., 1826 (200 years ago) |
| 13 Loop Patterns (Pt1/Pt2) | Hagrid's hut | Counting Hagrid's dragon eggs, and finding the "prime" egg. | Hagrid remembers: "Old keeper Knott? Lonely fellow. Forgot 'im meself." |
| R3 | Library | Ron asks everyone the question the learner might be thinking. | Draco is cleared. The suspects narrow |
| 14 Trunks of Many Things (Pt1/Pt2) | Lost property | A trunk of lost items, all listed in the Ledger twice, because two names pointed at the same list. | The duplicate entries, deduplicated, spell **GRIMWALD** |
| 15 Wizard's Chess | Courtyard | A living chessboard is stuck. Draw it correctly to free it. | The chessboard's pattern forms a map to **the portrait's frame** |
| 🏁 Trial | Library at midnight | You confront the portrait. Grimwald Knott challenges you to rebuild the Sorting Hat's ceremony spell, the one he broke first. When you succeed, he breaks down: nobody had remembered him in 200 years. Dumbledore arrives and offers him a job, and the House Cup is decided. | Mystery solved. Grimwald becomes keeper of the Pensieve |

**Draco's thread (the rival):** he taunts you with his times early on. In the Revision III beat, after he's cleared, he admits he was trying to solve the mystery too. From Year 2 on, he is a rival who respects you.

---

## Year 2: The Hoarder's Cabinet

**The premise.** Second year begins on the Hogwarts Express. At the castle, messages in a strange code are painted on the walls - and prized things start to vanish:
- Nearly Headless Nick's head;
- Filch's confiscated treasures;
- the Quidditch Cup;
- Mrs Norris.

Everything taken is *shiny*. Everything is taken in order, counted and catalogued, as if by something that loves **collections**.

**Suspects (red herrings):**
- **Filch**, a notorious collector of confiscated things.
- **Draco**, whose family owns shares in Borgin and Burkes.
- **Peeves**, as ever.

**The truth.** Professor **Gilderoy Lockhart** bought a Vanishing Cabinet from Borgin and Burkes to display his trophies. He enchanted it with a "self-filling" spell of his own invention: *collect everything that shines, and never give it back*. Being Lockhart, he got the spell wrong. It has a **mutable default argument**: every call adds to the *same* bag, forever. The Cabinet sits in Moaning Myrtle's bathroom on the second floor. It is growing, and it writes coded messages on the walls asking to be fed.

**How it ends.** Lockhart never meant any harm. He's mortified, and he tries to take the credit anyway. Myrtle gets her bathroom back, and Nick gets his head.

**New cast:**
| Character | Role |
|---|---|
| **Moaning Myrtle** | Witness. Dramatic, lonely, and surprisingly helpful |
| **Nearly Headless Nick** | A victim, and a ghostly guide to the castle's history |
| **Ginny** | Quick and clever, joins the investigation |
| **Professor Lockhart** | Vain, cheerful, and author of the worst spells in the castle. His buggy code drives the debugging lessons |
| **Filch** | A suspect, and furious about it |

### Scene-by-scene

| Lesson | Where | Story beat | The clue your code reveals |
|---|---|---|---|
| Prologue | Hogwarts Express, then the Great Hall | Ron and Hermione on the train. At the feast, a message appears on the wall in strange letters: `FKDPEHU RI FROOHFWLRQV LV RSHQ`. | The mystery begins (the message is decoded in Lesson 13) |
| 1 List Power (Pt1) | Filch's office | Filch's list of confiscated items is shrinking by itself. | Every vanished item was taken from the **end** of a list, as if someone kept calling `.pop()` |
| 1 List Power (Pt2) | Filch's office | Filch keeps a "safe copy" of his list, and it shrinks too! | Filch's "copy" is the **same list**. Whoever is taking things reads Filch's inventory directly |
| 2 Tuples and Unpacking | The Grand Staircase | Ginny maps each vanishing as a (floor, corridor) pair. | Every vanishing point is on the **second floor** |
| 3 Dictionaries (Pt1) | Trophy Room | Nick's head is gone, and the trophy cabinet is in chaos. | Only **Lockhart's** trophies came back, freshly polished |
| 3 Dictionaries (Pt2) | Trophy Room | Tally what's missing, by type. | Most of what vanished is **shiny**: mirrors, trophies, badges |
| 3 Dictionaries (Pt3) | Second-floor corridor | Myrtle's nested report of strange noises, by night and by hour. | Clanking from **Myrtle's bathroom** every night at midnight |
| R1 | Filch's office | Ron accuses Filch. Filch is outraged: "I *confiscate*. I don't *steal*." | Filch is cleared |
| 4 Sets | The Great Hall | Who was near every vanishing? | *Nobody* was at all of them, so the thief isn't a person. **It's an object** |
| 5 Nested Data | Owl Post office | Delivery records from Diagon Alley and Knockturn Alley. | A **Vanishing Cabinet** was delivered to Hogwarts, signed "G.L." |
| 6 Comprehensions (Pt1) | Lockhart's office | Sorting Lockhart's mountain of fan mail. | The Cabinet arrived the same week as Lockhart's biggest fan-mail delivery |
| 6 Comprehensions (Pt2) | Lockhart's office | A page from Lockhart's notes: a spell written as one line. | The Cabinet's spell *is* a comprehension: collect every item **if it shines** |
| 7 Functions (Pt1) | Defence Against the Dark Arts | Lockhart's "brilliant" spells print things but never *return* anything. | His spellbook contains `collect_admirers()`, which takes and takes and never gives back |
| R2 | The Library | Hermione lays the clues out. Ginny spots the pattern. | Recap: an object, on the second floor, that loves shiny things |
| 8 Functions (Pt2) | Defence classroom | Lockhart demonstrates default arguments, badly. | The Cabinet's spell targets `shiny=True` by default |
| 9 Scope and Mutability | Myrtle's bathroom | The famous `bag=[]` bug. | **Every call adds to the same bag.** The Cabinet's hoard can only ever grow |
| 10 Modules | Divination tower | The Cabinet strikes at "random" times, but random numbers can be *seeded*. | With the seed, the next vanishing can be predicted: **tonight, at midnight** |
| 11 Parsing Scrolls | Owl Post office | The Borgin and Burkes receipt, as a messy scroll. | "One cabinet, self-filling. Charm by G. Lockhart. Deliver to: second-floor girls' bathroom." |
| 12 ★ Seek and Count | Inside the Cabinet's inventory | A catalogue of 2,000 hoarded items. | Mrs Norris is in there, **alive**, at index 1337 |
| R3 | The Library | Draco, embarrassed about Borgin and Burkes, quietly hands over the shop's cipher notes. | Draco helps. The rivalry becomes respect |
| 13 ★ Cipher Craft | Myrtle's bathroom | The wall messages turn out to be Caesar ciphers. | The Cabinet itself writes them: "THE CABINET HUNGERS. FEED IT SHINY THINGS." |
| 14 Debugging Craft | Lockhart's office | Lockhart's "un-collection" counter-spell is full of bugs. | Fixed, it can empty the Cabinet, if you can open it |
| 🏁 Trial | Myrtle's bathroom, at midnight | The Cabinet is sealed with an enciphered password. Build a cipher toolkit, crack the unknown shift, and speak the password. | The Cabinet opens. Everything comes home |

**Outro.**
1. The Cabinet disgorges two hundred shiny objects, a very cross Mrs Norris, and Nick's head, which he reattaches with dignity.
2. Lockhart tries to claim he planned it all along.
3. Myrtle cries happily.
4. Dumbledore: "Collections are wonderful things - as long as we remember to give back what we borrow."

**Draco's thread:** from rival to reluctant ally, when he supplies the cipher notes in R3.

---

## Years 3–7: arcs in outline
*Each year's full scene-by-scene script is written when that year is built.*

### Year 3: The Prisoner of the Loop
A figure keeps appearing in the same corridor at the same time every day, like a prisoner caught in time. It's a wizard trapped inside a broken Time-Turner's **recursion**, who never reached his base case. Errors (the Dementors) swarm wherever the loop touches. You learn recursion, exceptions and searching to find where his loop began. **Trial:** the Time-Turner Escape maze that frees him.

### Year 4: The Goblet of Objects
The Triwizard Tournament returns. Beauxbatons and Durmstrang bring their own enchanted objects, and someone is sabotaging the champions' equipment by subclassing it with hidden flaws. You design, inspect and build objects and data structures. **Trial:** the three Triwizard tasks.

### Year 5: The Order of Algorithms
A Ministry inspector bans all "unapproved spells", and your patterns count. In secret, in the Room of Requirement, you train with a revived Dumbledore's Army, whose members each master one pattern (two pointers, sliding window...). **Finale:** the O.W.L. exams, taken under the inspector's watchful eye.

### Year 6: The Half-Blood Pythonista
You find an old Parseltongue textbook covered in brilliant margin notes signed "the Half-Blood Pythonista". The notes are Pythonic idioms and tricks. Who wrote them? The reveal: **Professor Ashwood**, as a student. Apparition lessons are **Leaving Hogwarts**: learning to work outside the castle, on your own machine. **Trial:** the Prince's Puzzle.

### Year 7: The Deathly Algorithms
**The Unraveller**, a dark coder who wants all spells to become tangled, unreadable spaghetti, has hidden **seven Hollow Loops** (Horcrux-like) inside the castle's magic. Each is a hard algorithmic problem. Destroy all seven, then face the Unraveller in the Battle of Hogwarts, a multi-stage final boss mixing every skill from every year. **Epilogue:** nineteen lines later... your capstone project, presented at the Great Hall.

---

## Recurring set pieces

| Set piece | When | What happens |
|---|---|---|
| **The Sorting** | Start of the game | The Hat quiz, and the chance to ask it to reconsider |
| **The feast** | Start of each year | A recap of last year, the new mystery hook, and the House Cup reset |
| **The Hogwarts Express** | Between years | A trivia gauntlet on last year's concepts, for review before moving on |
| **Snape's code review** | After passing any Core challenge | 1–3 dry remarks. Fixing them earns an O |
| **Draco's times** | On quests | Beat his time to earn the "Rivalry" badges |
| **The House Cup** | End of each year | The results ceremony. Your points plus simulated rival houses |
| **The Golden Snitch** | Hidden once per year | A secret bonus challenge, found by exploring |
