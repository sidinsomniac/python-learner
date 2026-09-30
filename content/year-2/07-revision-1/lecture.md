# Revision I: collections so far

Three mixed challenges on lists, copies, tuples and dictionaries.

```checkpoint
q: 'After `a = [1, 2]`, `b = a`, `b += [3]`, what is `a`?'
options: ["[1, 2]", "[1, 2, 3]"]
answer: 1
why: "`b` is another name for the same list, and `+=` on a list changes it in place."
```

```checkpoint
q: 'What does `{"x": 1, "y": 2}.get("z", "?")` give?'
options: ["None", "?", "A KeyError"]
answer: 1
why: get returns the default you gave it for a missing key.
```

```checkpoint
q: Which could be a dictionary KEY?
options: ["[2, 'east']", "(2, 'east')", "{'floor': 2}"]
answer: 1
why: Keys must be unchangeable. Tuples are; lists and dictionaries are not.
```

**Tip:** for each challenge, first say in plain words which collection fits
the data - a list (ordered, changeable), a tuple (fixed group), or a
dictionary (look up by name).
