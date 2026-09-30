# Lesson 3, Part 2: Counting and Grouping

## The counting pattern

To count how often each thing appears, keep a dictionary of
`thing -> count`. For each item, add one to its count - starting from 0 if
you've never seen it:

```python
votes = ["owl", "cat", "owl", "toad", "owl"]
counts = {}
for pet in votes:
    counts[pet] = counts.get(pet, 0) + 1
print(counts)
```

`counts.get(pet, 0)` means "the count so far, or 0 if this is the first
one". That single line is the heart of the pattern - learn it by heart.

```checkpoint
q: 'Why `counts.get(pet, 0) + 1` instead of `counts[pet] + 1`?'
options: ["It's faster", "The first time a pet appears it isn't a key yet, so [] would raise KeyError", "get() sorts the dictionary"]
answer: 1
why: The first sighting of each key has nothing to add to, so we start from 0.
```

## The grouping pattern

Sometimes you want to *collect* things rather than count them. The value is
then a **list**, and you append to it:

```python
pets = [("Hedwig", "owl"), ("Trevor", "toad"), ("Errol", "owl")]
by_kind = {}
for name, kind in pets:
    if kind not in by_kind:
        by_kind[kind] = []
    by_kind[kind].append(name)
print(by_kind)
```

There's a shortcut: `d.setdefault(key, [])` returns the list for `key`,
creating an empty one first if needed. So the three lines inside the loop
could be `by_kind.setdefault(kind, []).append(name)`.

## Reading a dictionary in order

A dictionary keeps the order keys were first added. To go through it in
**alphabetical** order, loop over `sorted(d)` - which sorts the keys:

```python
counts = {"toad": 1, "owl": 3, "cat": 2}
for pet in sorted(counts):
    print(pet, counts[pet])
print(max(counts.values()))
```

```checkpoint
q: 'What does `sorted({"b": 1, "a": 9})` give?'
options: ["['a', 'b']", "[1, 9]", "[('a', 9), ('b', 1)]"]
answer: 0
why: Sorting a dictionary sorts its keys.
```

## Why not `list.count`?

`items.count(x)` works too, but it walks the **whole list** every time.
Calling it once for every item means walking the list again and again: for
100,000 items that's 10,000,000,000 steps. The dictionary pattern walks the
list **once**. Keep that in mind for this lesson's ⭐ challenge.
