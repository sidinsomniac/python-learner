# Lesson 6: Formatting Charms

You met f-strings last lesson: `f"Hello {name}"`. Inside the `{ }` you can add
a **format spec** after a colon, telling the value how to present itself.

## Decimal places: `:.2f`

```python
potion_price = 7.0
print(f"Price: {potion_price:.2f} Galleons")
```

That shows `Price: 7.00 Galleons`. `.2f` means "a float with 2 decimal
places" - it rounds for you.

```checkpoint
q: What does `f"{3.14159:.1f}"` give?
options: ["3.1", "3.14", "3"]
answer: 0
why: "`.1f` means exactly one decimal place."
```

## Width and alignment

A number after the colon sets a **minimum width**. `<` leans left, `>` leans
right, `^` centres:

```python
print(f"[{'owl':<6}]")
print(f"[{'owl':>6}]")
print(f"[{'owl':^6}]")
```

shows `[owl   ]`, `[   owl]` and `[ owl  ]`. Text leans left by default and
numbers lean right.

You can combine them - width first, then decimals:

```python
cost = 4.5
print(f"[{cost:>8.2f}]")
```

shows `[    4.50]`: 8 characters wide, 2 decimals, leaning right.

```checkpoint
q: How many characters wide is `f"{'Lumos':>9}"`?
options: ["5", "9", "14"]
answer: 1
why: The 9 is a minimum width - Lumos (5 letters) gets 4 spaces in front of it.
```

## Big numbers

`,` adds thousands separators: `f"{1234567:,}"` is `1,234,567`.
