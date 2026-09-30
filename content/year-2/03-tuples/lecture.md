# Lesson 2: Tuples and Unpacking

A **tuple** is like a list that can never change. You write it with round
brackets (or just commas):

```python
spot = (2, "east")
print(spot[0], spot[1])
print(len(spot))
```

You can read a tuple with `[]` and slice it, but you can't `append`, `pop`,
or assign to a position: `spot[0] = 3` is a `TypeError`. That's the point -
use a tuple for a small, fixed group of values that belong together, like a
place, a date, or a (name, score) pair.

A tuple with one item needs a trailing comma: `(5,)`. Without it, `(5)` is
just the number 5 in brackets.

```checkpoint
q: 'Which of these is a tuple with ONE item?'
options: ["(7)", "(7,)", "[7]"]
answer: 1
why: "It's the comma that makes a tuple. `(7)` is just the number 7."
```

## Unpacking

Python can pour a tuple's values straight into several variables:

```python
floor, corridor = (3, "west")
print(floor)
print(corridor)
```

The number of names on the left must match the number of values, or you get
a `ValueError`. Unpacking gives Python its famous **swap**, with no spare
variable needed:

```python
a = "Ron"
b = "Ginny"
a, b = b, a
print(a, b)
```

The right-hand side is built as a tuple *first*, then unpacked - so neither
value is lost.

```checkpoint
q: 'What does `x, y = 1, 2, 3` do?'
options: ["x is 1, y is 2", "x is 1, y is (2, 3)", "A ValueError"]
answer: 2
why: Three values, two names - Python refuses to guess, and raises a ValueError.
```

## Unpacking in a `for` loop

A list of tuples is one of the most common shapes in Python. Unpack each one
right in the loop header:

```python
owls = [("Hedwig", "snowy"), ("Errol", "great grey")]
for name, kind in owls:
    print(f"{name} is a {kind} owl")
```

## `enumerate`: counting without a counter

Last year you counted loop passes by hand with `n = 0` and `n += 1`.
`enumerate` hands you `(position, item)` tuples instead:

```python
for i, owl in enumerate(["Hedwig", "Errol", "Pig"]):
    print(i, owl)
for number, owl in enumerate(["Hedwig", "Errol"], start=1):
    print(f"{number}. {owl}")
```

From this lesson on, Professor Snape expects `enumerate` wherever you would
have kept a counter by hand.

## Comparing tuples

Tuples compare **item by item, left to right** - like words in a dictionary.
The first difference decides; later items only matter on a tie.

```python
print((2, 5) < (3, 0))
print((2, 5) < (2, 9))
print(sorted([(2, "b"), (1, "z"), (2, "a")]))
```

That last line is a secret weapon: sort a list of tuples and Python sorts by
the first item, then breaks ties with the second, and so on.

```checkpoint
q: 'What is `(1, 9, 9) < (2, 0, 0)`?'
options: ["True", "False"]
answer: 0
why: The first items already differ (1 < 2), so the rest are never looked at.
```

## Functions that return several things

Some built-ins give back a tuple you can unpack at once:

```python
whole, left_over = divmod(17, 5)
print(whole, left_over)
```

`divmod(a, b)` gives `(a // b, a % b)` in one go.
