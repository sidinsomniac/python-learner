# Lesson 11: Parsing Scrolls

Text arrives as one long string. **Parsing** means breaking it into pieces
you can use - lists, numbers, dictionaries.

## `split` and `join`

`text.split()` breaks a string on **any** run of whitespace and drops empty
bits. `text.split(sep)` breaks on exactly `sep`:

```python
print("  one  cabinet   self-filling ".split())
print("quill,ink,,parchment".split(","))
print("a - b - c".split(" - "))
```

Notice that `split(",")` keeps the empty string between `,,` - with an
explicit separator, nothing is dropped.

`join` is the opposite: `sep.join(list_of_strings)` glues them together with
`sep` between each:

```python
words = ["Deliver", "to", "Hogwarts"]
print(" ".join(words))
print("-".join(["2", "floor", "bathroom"]))
```

`join` only works on strings: `", ".join([1, 2])` is a `TypeError`. Convert
first: `", ".join([str(n) for n in nums])`.

```checkpoint
q: 'What is `"a,b,,c".split(",")`?'
options: ["['a', 'b', 'c']", "['a', 'b', '', 'c']", "['a,b,,c']"]
answer: 1
why: With an explicit separator, split keeps the empty piece between the two commas.
```

## Lines

`text.splitlines()` breaks a multi-line string into its lines:

```python
scroll = """Item: Cabinet
Price: 400 Galleons"""
for line in scroll.splitlines():
    print(line.upper())
```

## `partition`: split once

`line.partition(sep)` splits at the **first** `sep` only, and always gives
back three pieces: before, the separator, after. If `sep` isn't there, the
last two are empty:

```python
print("Time: 12:00".partition(":"))
print("no colon here".partition(":"))
```

That's perfect for `key: value` lines where the value itself might contain a
colon. (`line.split(":", 1)` does something similar, giving a list of at most
two pieces.)

```checkpoint
q: 'What is `"Time: 12:00".partition(":")[2]`?'
options: ["' 12:00'", "' 12'", "'00'"]
answer: 0
why: partition splits at the FIRST colon only; [2] is everything after it - including the leading space.
```

## Cleaning up

Real scrolls are messy. Chain the string spells you know:

- `.strip()` removes spaces (and newlines) from both ends;
  `.strip(".,!")` removes those characters instead.
- `.lower()` for comparing without worrying about capitals.
- `.isdigit()` checks whether a string is all digits before you `int()` it.

A good parser **skips** lines it doesn't understand instead of crashing, and
never trusts the spacing.

## Pairing things up with `zip`

When you've split a header and a row, you often want to pair them up.
`zip(a, b)` walks two lists side by side, giving `(a[0], b[0])`,
`(a[1], b[1])`, and so on:

```python
names = ["owl", "to"]
cells = ["Errol", "The Burrow"]
for name, cell in zip(names, cells):
    print(name, "=", cell)
print(dict(zip(names, cells)))
```

`dict(zip(keys, values))` builds a dictionary straight from two lists.

And to pad a string to a width, `text.ljust(10)` adds spaces on the right
(`rjust` on the left) - the same as the `:<10` you met in f-strings.
