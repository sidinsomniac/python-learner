# Lesson 8, Part 2: Defaults, Keywords, and Many Returns

## Default arguments

A parameter can have a **default value**, used when the caller leaves it
out:

```python
def brew(potion, doses=1):
    return f"{doses} x {potion}"

print(brew("Pepperup"))
print(brew("Pepperup", 3))
```

Parameters with defaults must come **after** the ones without.

```checkpoint
q: 'With `def f(a, b=2): return a + b`, what is `f(5)`?'
options: ["5", "7", "An error"]
answer: 1
why: b takes its default, 2.
```

## Keyword arguments

You can name the parameter you're filling in when you call a function.
Named arguments can come in any order, and they make calls easier to read:

```python
def describe(item, shiny=False, owner="nobody"):
    return f"{item} (shiny={shiny}, owner={owner})"

print(describe("cup", owner="Lockhart"))
print(describe(owner="Filch", item="yo-yo", shiny=True))
```

Positional arguments must come before keyword ones in a call:
`describe(owner="Filch", "cup")` is a `SyntaxError`.

You've used keyword arguments already: `sorted(items, reverse=True)`,
`enumerate(items, start=1)` and `print("a", "b", sep="-")`.

```checkpoint
q: 'With `def f(a, b=1, c=2)`, what does `f(0, c=5)` set b to?'
options: ["1", "5", "0"]
answer: 0
why: b wasn't given, so it keeps its default; c was named.
```

## Returning several values

A function can only return **one** thing - but that thing can be a tuple.
Unpack it where you call:

```python
def lowest_and_highest(scores):
    return min(scores), max(scores)

low, high = lowest_and_highest([7, 3, 9])
print(low, high)
```

## Docstrings

A string on the first line of a function describes what it does. It's called
a **docstring**, and `help(function)` shows it:

```python
def brew(potion, doses=1):
    """Return a label like '2 x Pepperup'."""
    return f"{doses} x {potion}"
```

Good docstrings say what goes in, what comes out, and anything surprising.

## `None` as a "not given" default

Sometimes you need to know whether the caller passed a value at all. Use
`None` as the default and check for it:

```python
def greet(name, title=None):
    if title is None:
        return f"Hello, {name}"
    return f"Hello, {title} {name}"

print(greet("Lockhart"), greet("Lockhart", "Professor"))
```

Use `is None` (not `== None`) to check for `None`. Remember this trick - it
will save the castle in the next lesson.
