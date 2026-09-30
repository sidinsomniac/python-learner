# Lesson 12: For Every Student

`while` repeats *as long as* something is true. A `for` loop repeats **once
for every item** in a collection - no counter to forget, so it can't run
forever.

## Looping over a string

```python
for letter in "Hagrid":
    print(letter)
```

Each pass, `letter` holds the next character: H, a, g, r, i, d.

## `range`: looping over numbers

`range(n)` gives the numbers `0, 1, ..., n-1`:

```python
for i in range(3):
    print("Lap", i)
```

That prints Lap 0, Lap 1, Lap 2. `range(start, stop)` starts somewhere else,
and `range(start, stop, step)` jumps:

```python
for n in range(2, 11, 2):
    print(n)
```

```checkpoint
q: What numbers does `range(1, 5)` give?
options: ["1 2 3 4 5", "1 2 3 4", "0 1 2 3 4"]
answer: 1
why: The stop number is NOT included - just like slicing.
```

```checkpoint
q: How many times does the body of `for i in range(10, 0, -2):` run?
options: ["5", "10", "4"]
answer: 0
why: "It counts 10, 8, 6, 4, 2 - five numbers (0 is the stop, so it isn't included)."
```

## Loops + if

The body of a loop can hold anything - including an `if`:

```python
for letter in "Dumbledore":
    if letter == "e":
        print("Found an e!")
```

## Loops instead of repetition

If you catch yourself writing four nearly identical lines, a loop is almost
always the better spell. (Professor Snape *will* notice.)
