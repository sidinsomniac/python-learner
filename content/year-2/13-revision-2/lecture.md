# Revision II: sets, nested data, comprehensions, functions

Three mixed challenges. From now on every challenge is a function the
examiners will call - so **return** your answers.

```checkpoint
q: 'What is `sorted({"b", "a"} | {"c", "a"})`?'
options: ["['a', 'b', 'c']", "['a']", "['a', 'a', 'b', 'c']"]
answer: 0
why: Union keeps everything from either set - once each.
```

```checkpoint
q: 'What is `[w for w in ["ox", "owl", "bat"] if w.startswith("o")]`?'
options: ["['ox', 'owl']", "['bat']", "[True, True, False]"]
answer: 0
why: The `if` at the end filters, keeping words that start with "o".
```

```checkpoint
q: A function has no `return` line. What does calling it give back?
options: ["0", "None", "An error"]
answer: 1
why: Every function without a return gives back None.
```
