# Lesson 4: Arithmancy - Numbers and Their Types

Every value in Python has a **type**. Today we meet three.

| Type | Meaning | Examples |
|---|---|---|
| `int` | whole number (integer) | `7`, `-2`, `100` |
| `float` | number with a decimal point | `3.5`, `2.0` |
| `str` | text (string) | `"7"`, `"Hedwig"` |

## Arithmetic spells

| Symbol | Meaning | Example | Result |
|---|---|---|---|
| `+` | add | `5 + 2` | `7` |
| `-` | subtract | `5 - 2` | `3` |
| `*` | multiply | `5 * 2` | `10` |
| `/` | divide | `5 / 2` | `2.5` |
| `//` | divide, keep only the whole part | `5 // 2` | `2` |
| `%` | remainder after dividing | `5 % 2` | `1` |

Watch out for `/`: it **always** gives a `float`, even if the answer is
whole. `6 / 2` is `3.0`, not `3`.

## Numbers vs. text

`7` and `"7"` look similar, but they are completely different things:

- `7 + 3` is arithmetic, so the result is `10`.
- `"7" + "3"` joins two strings, so the result is `"73"`!

```python
print(10 / 5)
print(9 // 4)
print("Ha" + "Ha")
```

Try these in the sandbox before you make your prophecy.
