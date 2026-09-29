# Lesson 5: Transfiguration of Types, and Magic Strings

## input() always gives back text

Whatever someone types, `input` returns a **string**, even digits.
Typing `9` gives you `"9"`, not the number `9`.

Python refuses to do maths between a number and text:

```python
print(11 - "9")
```

Run that to see a `TypeError`: Python is saying *"I can't subtract text from
a number!"*

## Transfiguration: changing types

You can change (convert) a value into another type:

| Spell | Turns into | Example |
|---|---|---|
| `int(...)` | whole number | `int("9")` gives `9` |
| `float(...)` | decimal number | `float("2.5")` gives `2.5` |
| `str(...)` | text | `str(42)` gives `"42"` |

## f-strings: strings with holes

Put an `f` right before the opening quote, and you can drop variables
straight into the text using curly braces `{ }`:

```python
pet = "toad"
count = 2
print(f"Neville has lost his {pet} {count} times today.")
```

Without the braces, Python just prints the word itself. And without the
`f`, the braces are printed literally!
