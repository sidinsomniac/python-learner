# Lesson 6, Part 2: Dictionary and Set Comprehensions

The comprehension idea works for dictionaries and sets, too.

## Dictionary comprehensions

Put `key: value` before the `for`, inside curly brackets:

```python
wands = ["holly", "yew", "elder"]
lengths = {w: len(w) for w in wands}
print(lengths)
```

You can filter, and you can loop over another dictionary's `.items()`:

```python
prices = {"quill": 2, "cauldron": 15, "ink": 1}
cheap = {item: cost for item, cost in prices.items() if cost < 5}
print(cheap)
```

A handy trick is **flipping** a dictionary, so the values become keys:
`{v: k for k, v in d.items()}` (if two keys share a value, the last one wins).

```checkpoint
q: 'What is `{n: n * n for n in range(3)}`?'
options: ["{0: 0, 1: 1, 2: 4}", "[0, 1, 4]", "{0, 1, 4}"]
answer: 0
why: "A `key: value` pair before the `for` makes a dictionary."
```

## Set comprehensions

Curly brackets with **no colon** make a set - duplicates vanish:

```python
names = ["Ron", "ron", "RON", "Ginny"]
print({n.lower() for n in names})
```

## Choosing between two values

A **conditional expression** picks one of two values in a single line:

```python
hearts = 4
label = "keen" if hearts >= 3 else "polite"
print(label)
```

Read it as "*`"keen"` if `hearts >= 3`, otherwise `"polite"`*". It fits
perfectly inside a comprehension's expression:

```python
hearts = [5, 1, 3]
print(["keen" if h >= 3 else "polite" for h in hearts])
```

Notice the difference: an `if` **at the end** of a comprehension *filters*
items out. An `if ... else` **in the expression** keeps every item but
chooses what to put in.

```checkpoint
q: 'How long is `["a" if n > 1 else "b" for n in [1, 2, 3]]`?'
options: ["3", "2", "1"]
answer: 0
why: The if/else is in the expression, so no item is filtered out - it only chooses between "a" and "b".
```

## `any` and `all`

- `any(...)` is `True` if **at least one** value is true.
- `all(...)` is `True` if **every** value is true.

```python
hearts = [5, 1, 3]
print(any([h > 4 for h in hearts]))
print(all([h > 0 for h in hearts]))
```

(You can even drop the square brackets: `any(h > 4 for h in hearts)`.)
