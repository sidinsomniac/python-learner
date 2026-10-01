# Lesson 11: How Wizards Solve Problems

Experienced spell-writers don't start by typing. They follow a method.

## 1. Understand

Say the problem in your own words. What goes **in**? What comes **out**?
What exactly does every word in the task mean?

## 2. Examples, especially awkward ones

Write examples **before** writing code, with the answer you expect for each:

- an ordinary case;
- the **smallest** cases: empty, zero, one item;
- the **edges**: the first and the last, the biggest allowed value;
- **ties** and repeats;
- **bad input**: what should happen to it?

Most bugs live in the awkward examples, so finding them first is half the
work.

## 3. Plan in pseudocode

Write the steps in plain words. If you can't explain it in words, you're not
ready to write it in Python.

## 4. Write the checks first

Turn your examples into checks, before the spell exists. Python's `assert`
stops with an `AssertionError` if something isn't true:

```python
def clamp(n, low, high):
    """Keep n between low and high."""
    return max(low, min(n, high))

assert clamp(5, 0, 10) == 5
assert clamp(-3, 0, 10) == 0      # below the range
assert clamp(99, 0, 10) == 10     # above it
assert clamp(0, 0, 10) == 0       # exactly on an edge
print("all checks pass")
```

## 5. A spell that checks spells

Here's a powerful habit: write your checks as a **function that takes the
spell to check**, and returns whether it passed. Then you can try your
checks on deliberately **broken** spells, and see whether they catch the
bugs:

```python
def check_clamp(candidate):
    examples = [((5, 0, 10), 5), ((-3, 0, 10), 0), ((99, 0, 10), 10), ((0, 0, 10), 0)]
    for args, expected in examples:
        if candidate(*args) != expected:
            return False
    return True

def forgets_high(n, low, high):
    return max(low, n)

print(check_clamp(clamp), check_clamp(forgets_high))
```

If your checks pass a broken spell, they're missing an example. That's how
professional testers measure their tests.

```checkpoint
q: Your checks for a sorting spell pass a version that never sorts at all. What's most likely missing?
options: ["Nothing - the spell is fine", "An example that isn't already sorted", "A longer docstring"]
answer: 1
why: If every example was already in order, a spell that does nothing passes them all.
```

## Checking for errors

To check that a spell **raises** an error for bad input, try it, and treat
"no error" as a failure:

```python
def refuses_negative(candidate):
    try:
        candidate(-1)
    except ValueError:
        return True
    return False

def safe_root(n):
    if n < 0:
        raise ValueError("no negative roots")
    return n ** 0.5

print(refuses_negative(safe_root), refuses_negative(abs))
```
