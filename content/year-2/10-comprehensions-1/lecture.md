# Lesson 6, Part 1: List Comprehensions

You've written this pattern many times - an empty list, a loop, and an
`append`:

```python
hearts = [5, 1, 3, 7]
doubled = []
for h in hearts:
    doubled.append(h * 2)
print(doubled)
```

A **list comprehension** says the same thing in one line:

```python
hearts = [5, 1, 3, 7]
doubled = [h * 2 for h in hearts]
print(doubled)
```

Read it aloud: "*`h * 2`, for each `h` in `hearts`*". The part before `for`
is what goes into the new list; the rest is the loop.

```checkpoint
q: 'What is `[len(w) for w in ["owl", "toad"]]`?'
options: ["[3, 4]", "['owl', 'toad']", "7"]
answer: 0
why: Each word is replaced by its length.
```

## Filtering with `if`

Add an `if` at the end to keep only some items:

```python
hearts = [5, 1, 3, 7]
keen = [h for h in hearts if h >= 3]
print(keen)
```

"*`h`, for each `h` in `hearts`, if `h >= 3`*". You can transform and
filter at the same time: `[h * 2 for h in hearts if h >= 3]`.

```checkpoint
q: 'What is `[n * 10 for n in range(5) if n % 2 == 0]`?'
options: ["[0, 20, 40]", "[10, 30]", "[0, 2, 4]"]
answer: 0
why: Keep 0, 2 and 4, then multiply each by 10.
```

## Unpacking inside a comprehension

The loop part can unpack tuples, exactly like a normal `for`:

```python
letters = [("Ann", 5), ("Bob", 1)]
names = [name for name, hearts in letters if hearts > 2]
print(names)
```

## Feeding comprehensions to other spells

`sum`, `max`, `min`, `sorted`, `len` and `", ".join` all happily take a
comprehension:

```python
words = ["Lumos", "Nox", "Accio"]
print(sum([len(w) for w in words]))
print(", ".join([w.upper() for w in words]))
```

## When NOT to use one

A comprehension is for **building a list**. If your loop prints things,
changes other variables, or needs several steps per item, a normal `for`
loop is clearer. Don't squeeze a paragraph into one line - Snape hates that
even more than empty-list-and-append.

From now on Professor Snape expects a comprehension wherever you'd write an
empty list followed by a loop that only appends.
