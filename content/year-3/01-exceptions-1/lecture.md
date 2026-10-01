# Lesson 1, Part 1: Catching Errors

## When spells go wrong

You've met plenty of errors already. When one happens, Python **raises** it,
and if nothing catches it, the whole spell stops:

```python
print("Before")
number = int("seven")
print("After")   # never runs
```

Each error has a **type** that says what kind of trouble it is:

| Error | Raised when... |
|---|---|
| `ValueError` | the type is right but the value isn't: `int("seven")` |
| `TypeError` | the type is wrong: `"3" + 4` |
| `KeyError` | a dictionary has no such key |
| `IndexError` | a list has no such position |
| `ZeroDivisionError` | you divide by zero |

## `try` and `except`

Put the risky lines in a `try` block. If one of them raises the error named
in `except`, Python jumps straight to the `except` block instead of stopping:

```python
text = "seven"
try:
    number = int(text)
    print("Got", number)
except ValueError:
    print(text, "isn't a number")
print("The spell carries on")
```

The rest of the `try` block is skipped as soon as the error happens.

```checkpoint
q: 'In the spell above, does `print("Got", number)` run?'
options: ["Yes", "No - the error jumps straight to except"]
answer: 1
why: The moment int() raises, the rest of the try block is skipped.
```

## Catch only what you expect

Name the **specific** error you expect. An `except` only catches errors of
that type; anything else still stops the spell, which is good, because an
error you didn't expect usually means a real bug:

```python
marks = {"Harry": 7}
try:
    print(marks["Ron"])
except KeyError:
    print("No mark for Ron yet")
```

You can have several `except` blocks, or catch several types at once:

```python
for text in ["4", "0", "x"]:
    try:
        print(12 / int(text))
    except ZeroDivisionError:
        print("Can't share between nobody")
    except (ValueError, TypeError):
        print("Not a number:", text)
```

A **bare** `except:` (with no type) catches everything, including your own
typos. Professor Snape regards it as cowardice. Always name the type.

```checkpoint
q: 'Which error does `{"a": 1}["b"]` raise?'
options: ["ValueError", "KeyError", "IndexError"]
answer: 1
why: A dictionary lookup for a missing key raises KeyError.
```

## Looking at the error: `as`

`except ValueError as err:` stores the error in `err`, so you can show its
message:

```python
try:
    int("3.5")
except ValueError as err:
    print("Trouble:", err)
```

## `else` and `finally`

- `else` runs only if the `try` block raised **nothing**.
- `finally` runs **always**, error or not. It's for clean-up.

```python
def divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        print("cannot divide by zero")
    else:
        print("result:", result)
    finally:
        print("done")

divide(6, 3)
divide(1, 0)
```

```checkpoint
q: When does an `else` block after `try/except` run?
options: ["Always", "Only when an error was caught", "Only when no error happened"]
answer: 2
why: else is the 'everything went fine' branch. finally is the one that always runs.
```

## Keep `try` blocks small

Wrap only the line that might fail. A huge `try` block can hide bugs in the
lines you never meant to protect.
