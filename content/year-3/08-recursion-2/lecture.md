# Lesson 5, Part 2: Stacks of Time

## The call stack

Each call to a function gets a **frame**: its own private set of variables.
When a function calls another function (or itself), the new frame goes on
**top** of the stack, and the caller waits underneath until it's finished.

```python
def depth(n):
    if n == 0:
        return "bottom"
    return depth(n - 1)

print(depth(3))
```

Replay that in the 🌀 Pensieve and watch the **Call stack** panel: four
`depth()` frames pile up, each with its own `n`, then come back off one by
one, each handing `"bottom"` back to the one below.

## When the stack topples: `RecursionError`

Python only allows about **1,000** frames. A spell that never reaches its
base case, or one that simply needs to go too deep, stops with a
`RecursionError`:

```python
def fall(n):
    return fall(n + 1)

try:
    fall(0)
except RecursionError:
    print("The stack toppled!")
```

If you see a `RecursionError`, ask:
1. Is there a base case?
2. Does **every** call move **closer** to it?

```checkpoint
q: '`def f(n): return 0 if n == 0 else f(n - 2)`. What happens with f(5)?'
options: ["It returns 0", "RecursionError: 5, 3, 1, -1, -3... never hits 0", "It returns 5"]
answer: 1
why: The base case exists, but odd numbers jump straight past it. Every call must get CLOSER to a base case it will actually reach.
```

## Recursion on lists

A list gets smaller if you take off its first item:

```python
def add_all(items):
    if not items:
        return 0
    return items[0] + add_all(items[1:])

print(add_all([3, 4, 5]))
```

## Lists inside lists

Recursion really shines on things that contain **smaller copies of
themselves**. A list can contain lists, which can contain lists...
`isinstance(item, list)` tells you whether an item is itself a list:

```python
def deep_count(items):
    count = 0
    for item in items:
        if isinstance(item, list):
            count += deep_count(item)
        else:
            count += 1
    return count

print(deep_count([1, [2, 3], [[4], []], 5]))
```

Here the loop handles "each item", and recursion handles "each list inside
a list", however deep they go.

```checkpoint
q: 'What does `deep_count([[], [[]]])` give?'
options: ["0", "2", "3"]
answer: 0
why: There are lists inside lists, but not a single non-list item anywhere.
```

## A teaser: remembering answers

Some recursive spells repeat the same work again and again. This one calls
itself **twice**:

```python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(20))
```

`fib(20)` makes over twenty thousand calls, mostly re-working answers it
already found. A dictionary can **remember** each answer the first time:

```python
memory = {}

def fast_fib(n):
    if n < 2:
        return n
    if n not in memory:
        memory[n] = fast_fib(n - 1) + fast_fib(n - 2)
    return memory[n]

print(fast_fib(90))
```

This trick is called **memoization**. You'll meet it properly in Year 7.
