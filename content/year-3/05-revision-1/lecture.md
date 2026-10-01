# Revision I: errors, files and sorting

Three mixed challenges on Lessons 1-3.

```checkpoint
q: In `try / except / else / finally`, which block runs when no error happens at all?
options: ["except and finally", "else and finally", "only finally"]
answer: 1
why: else is the no-error branch, and finally always runs.
```

```checkpoint
q: 'What is left in `log.txt` after `open("log.txt", "w")` and then writing "a" and "b"?'
options: ["ab", "a then b, on separate lines", "Whatever was there before, then ab"]
answer: 0
why: "Mode w starts from empty, and write adds no newlines of its own."
```

```checkpoint
q: Which sorts words longest first, keeping ties in their original order?
options: ["sorted(words, key=len, reverse=True)", "sorted(words, key=-len)", "sorted(words, reverse=len)"]
answer: 0
why: reverse=True flips the order and keeps the sort stable. `-len` isn't a function you can pass.
```

**Tip:** in a file spell, decide first what an *unusable* line looks like
(blank? too few fields? a smudged number?), then skip it on purpose.
