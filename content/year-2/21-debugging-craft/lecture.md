# Lesson 14: Debugging Craft

Every wizard's spells go wrong. The difference between a novice and an
expert isn't making fewer mistakes - it's **finding them faster**.

## 1. Read the error - all of it

When Python crashes it prints a **traceback**. Read it from the **bottom**:

```text
Traceback (most recent call last):
  File "<your spell>", line 7, in <module>
    print(report(hoard))
  File "<your spell>", line 3, in report
    return total / len(items)
ZeroDivisionError: division by zero
```

- The last line says **what** went wrong: the error type and a message.
- The lines above say **where**: line 3, inside `report`, which was called
  from line 7.

| Error | Usually means |
|---|---|
| `NameError` | a misspelled name, or a variable used before it's set (or outside its function) |
| `TypeError` | the wrong kind of value - adding a number to a string, calling `None` |
| `KeyError` | a dictionary key that isn't there |
| `IndexError` | a position past the end of a list |
| `ValueError` | the right type but a bad value - `int("ten")`, unpacking the wrong count |
| `AttributeError` | a method the value doesn't have - often because it's `None` |
| `ZeroDivisionError` | dividing by zero - often the length of an empty list |

```checkpoint
q: "`'NoneType' object has no attribute 'append'` - what's the most likely cause?"
options: ["A misspelled method", "A variable holds None when you expected a list - perhaps from a function with no return", "The list is empty"]
answer: 1
why: The value is None. Look for a function that forgot to return, or a result of `.sort()`.
```

## 2. Form a guess, then test it

Don't change code at random. Say out loud what you **think** is happening,
then check. The simplest check is a temporary `print`:

```python
def average(marks):
    total = 0
    for m in marks[1:]:
        total += m
    print("DEBUG total", total, "count", len(marks))
    return total / len(marks)

print(average([10, 20, 30]))
```

The debug line shows the total is 50, not 60 - so the loop must be skipping
something. (Can you see what?) Remove debug prints once you've fixed the
bug.

Or use **the Pensieve**: it records every line your spell runs and every
variable's value, so you can step backwards and forwards through time.

## 3. `assert`: make your assumptions loud

`assert condition, "message"` crashes with your message if the condition is
false. Use it to check what you **believe** is true:

```python
def average(marks):
    assert marks, "average() needs at least one mark"
    return sum(marks) / len(marks)

print(average([4, 6]))
```

An assertion that fails points straight at the broken belief.

## 4. The classic traps

- **Off by one**: `range(1, n)` misses 0; `range(n)` misses `n`.
- **Changing a list while looping over it**: removing items makes the loop
  skip the next one. Loop over a copy (`for x in items[:]`), or build a new
  list.
- **`return` inside a loop** when you meant after it.
- **Case**: `"Myrtle" == "myrtle"` is `False`.
- **The mutable default** from Lesson 9.

```python
items = [1, 2, 2, 3]
for x in items:
    if x == 2:
        items.remove(x)
print(items)
```

That prints `[1, 2, 3]` - one 2 survives, because removing the first 2 shifted
the second into the spot the loop had already visited.

## 5. The rubber duck

Explain your code, line by line, to someone - or something. A rubber duck
(or a patient Hufflepuff) works. Very often you'll hear yourself say "...and
then it does *this*..." and realise it doesn't.
