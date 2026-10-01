# Lesson 1, Part 2: Raising Errors

## `raise`

You can raise an error yourself, with a message that explains what went
wrong:

```python
age = -4
if age < 0:
    raise ValueError("age can't be negative")
print("never printed")
```

A raised error behaves exactly like Python's own: it stops the spell unless
something catches it.

## Why raise, instead of returning something?

A function that gets bad input has three choices:

1. Carry on and return nonsense. (The worst. The bug shows up much later, far away.)
2. Return a special value like `None`. (Fine when "nothing" is a normal answer.)
3. **Raise an error.** (Best when the input is simply wrong: the caller *can't* ignore it.)

```python
def galleons_to_knuts(galleons):
    if galleons < 0:
        raise ValueError("galleons can't be negative")
    return galleons * 493

print(galleons_to_knuts(2))
```

## Which error?

Use the built-in type that fits:

- `TypeError`: the value is the **wrong kind** of thing (text where a number should be).
- `ValueError`: the right kind of thing with a **bad value** (a negative age).

`isinstance(value, kind)` asks whether a value is of a type:

```python
print(isinstance(3, int), isinstance("3", int), isinstance(3.0, int))
print(isinstance("Ron", str), isinstance([1], (list, tuple)))
```

```checkpoint
q: A function wants a house name. It is given the number 7. Which error fits best?
options: ["ValueError", "TypeError", "KeyError"]
answer: 1
why: 7 is the wrong *kind* of thing altogether, so it's a TypeError.
```

## Guard clauses

Check the bad cases first, one at a time, each with its own error. What's
left at the bottom is the happy path:

```python
def make_badge(name, house):
    if not isinstance(name, str):
        raise TypeError("name must be text")
    if not name.strip():
        raise ValueError("name is blank")
    return f"{name.strip()} of {house}"

print(make_badge("  Luna ", "Ravenclaw"))
```

Order matters: check that a value is text *before* calling `.strip()` on it,
or the check itself will crash.

## Catching what you raise

The caller decides what to do. With `as err`, it can show your message:

```python
def check_galleons(galleons):
    if galleons < 0:
        raise ValueError("galleons can't be negative")
    return galleons

for amount in [5, -2]:
    try:
        print(check_galleons(amount))
    except ValueError as err:
        print("refused:", err)
```

## A better message: raise inside `except`

Sometimes Python's message is unhelpful. Catch it, then raise your own:

```python
def parse_floor(text):
    try:
        return int(text)
    except ValueError:
        raise ValueError(f"floor {text!r} is not a number")

try:
    parse_floor("second")
except ValueError as err:
    print(err)
```

```checkpoint
q: What does `raise ValueError("bad")` do if nothing catches it?
options: ["Prints 'bad' and carries on", "Stops the spell with ValueError: bad", "Returns None"]
answer: 1
why: A raised error stops everything unless a try/except catches it.
```
