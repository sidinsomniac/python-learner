# Lesson 5, Part 1: Recursion

## A spell that casts itself

A **recursive** function is one that calls itself. That sounds like an
endless loop, and it would be, except that each call works on a **smaller**
problem, until the problem is so small the answer is obvious.

```python
def countdown(n):
    if n == 0:
        print("Lift off!")
        return
    print(n)
    countdown(n - 1)

countdown(3)
```

Every recursive spell has two parts:

1. **The base case**: a problem so small you can answer it directly, with
   no more calls (`n == 0`).
2. **The recursive case**: do a little work, then call yourself on a
   **smaller** problem (`n - 1`), one that's closer to the base case.

Open the 🌀 **Pensieve** on that spell (paste it into the sandbox). Watch
the **call stack**: every call to `countdown` stacks a new frame on top,
each with its *own* `n`. When the base case is reached, they finish one by
one, from the top down.

```checkpoint
q: 'In `countdown`, what would happen without the `if n == 0` block?'
options: ["It would stop at 0 anyway", "It would count down forever (until Python gives up)", "It would print nothing"]
answer: 1
why: Without a base case, nothing ever stops the calls. Python stops it with a RecursionError.
```

## Building an answer on the way back

Recursive spells usually **return** something, and each call builds its
answer from the smaller call's answer:

```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
```

`factorial(5)` waits for `factorial(4)`, which waits for `factorial(3)`...
down to `factorial(1)`, which answers `1` straight away. Then the answers
flow back up: 1, 2, 6, 24, 120.

## Trust the smaller call

Don't try to follow every call in your head. Instead, ask:

> *If the smaller call already gives the right answer, how do I turn it
> into the answer for the whole problem?*

For `factorial`: "if `factorial(4)` is right, then `factorial(5)` is
`5 * factorial(4)`". That's all the thinking needed.

## Recursion on strings

A string gets smaller if you take off one character. The base case is
usually the **empty string**:

```python
def count_vowels(text):
    if text == "":
        return 0
    first = 1 if text[0] in "aeiou" else 0
    return first + count_vowels(text[1:])

print(count_vowels("expelliarmus"))
```

`text[1:]` is "everything but the first character", one smaller every
time.

```checkpoint
q: 'For a recursive spell on a list, what is usually the base case?'
options: ["A list with 100 items", "The empty list", "A list containing None"]
answer: 1
why: The empty list is the smallest list there is, and its answer is usually obvious (0, empty, True...).
```

## Recursion or a loop?

Anything recursive *can* be written with a loop, and many simple things
(like `countdown`) are clearer as loops. Recursion shines when a problem
**contains smaller copies of itself**: nested lists, family trees, mazes.
Those are coming next lesson, and in the Trial.
