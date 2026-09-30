# Lesson 8, Part 2: Steps and Reversing

A slice can take a third number - the **step**: `text[start:stop:step]`.

```python
letters = "abcdefghij"
print(letters[::2])
print(letters[1::2])
```

`[::2]` takes every second character starting at 0, and `[1::2]` every
second character starting at 1.

```checkpoint
q: 'What is `"Gryffindor"[::3]`?'
options: ["Gfdr", "Gyfno", "Grr"]
answer: 0
why: Positions 0, 3, 6 and 9 - G, f, d and r.
```

## Backwards: a negative step

A negative step walks **backwards**. The famous one, `[::-1]`, reverses a
whole string:

```python
print("stressed"[::-1])
```

```checkpoint
q: 'What is `"Nox"[::-1]`?'
options: ["Nox", "xoN", "xon"]
answer: 1
why: Every character in reverse order - and the capital N stays capital.
```

## Comparing strings

`==` compares strings exactly - capitals included. `"Owl" == "owl"` is
`False`. If capitals shouldn't matter, make both sides lowercase first.
