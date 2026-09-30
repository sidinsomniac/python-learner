# Lesson 5: Transfiguration of Types

Every value in Python has a **type**.

| Type | Meaning | Examples |
|---|---|---|
| `int` | whole number | `7`, `-2`, `100` |
| `float` | number with a decimal point | `3.5`, `2.0` |
| `str` | text (string) | `"7"`, `"Hedwig"` |
| `bool` | a truth value | `True`, `False` |

`type(x)` tells you what type something is.

## input() always gives back text

Whatever someone types, `input` returns a **string** - even digits. Typing
`9` gives you `"9"`, not the number 9. And Python refuses to do maths between
a number and text:

```python
print(11 - "9")
```

Run that to see a `TypeError`.

## Transfiguration: changing types

| Spell | Turns into | Example |
|---|---|---|
| `int(...)` | whole number | `int("9")` gives `9`, `int(3.99)` gives `3` |
| `float(...)` | decimal number | `float("2.5")` gives `2.5` |
| `str(...)` | text | `str(42)` gives `"42"` |
| `bool(...)` | True or False | `bool(0)` gives `False` |

Notice `int(3.99)` is `3` - `int` **chops off** the decimals. It doesn't
round.

```checkpoint
q: What does `int("12") + 3` give?
options: ["123", "15", "An error"]
answer: 1
why: '`int("12")` transfigures the text into the number 12, and 12 + 3 is 15.'
```

## Strings can be multiplied

`"ha" * 3` is `"hahaha"` - a string repeated. But `"ha" + 3` is an error.

## Truthiness

`bool` turns anything into True or False. **Empty** things and **zero** are
False; everything else is True:

```python
print(bool(0), bool(42))
print(bool(""), bool("Hermione"))
```

```checkpoint
q: What does `bool("0")` give?
options: ["True", "False"]
answer: 0
why: '`"0"` is a string with one character in it - not empty - so it counts as True. Only `""` is False.'
```

## f-strings: strings with holes

Put an `f` before the opening quote, and you can drop values straight into
text using `{ }`:

```python
pet = "toad"
count = 2
print(f"Neville lost his {pet} {count} times today.")
```
