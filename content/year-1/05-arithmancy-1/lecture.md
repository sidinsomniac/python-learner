# Lesson 4, Part 1: Arithmancy

Python is an excellent calculator.

| Symbol | Meaning | Example | Result |
|---|---|---|---|
| `+` | add | `5 + 2` | `7` |
| `-` | subtract | `5 - 2` | `3` |
| `*` | multiply | `5 * 2` | `10` |
| `/` | divide | `5 / 2` | `2.5` |
| `//` | divide, keep only the **whole** part | `5 // 2` | `2` |
| `%` | the **remainder** after dividing | `5 % 2` | `1` |
| `**` | power | `5 ** 2` | `25` |

`/` **always** gives a decimal number (a *float*), even when the answer is
whole: `6 / 2` is `3.0`.

## `//` and `%` are best friends

`//` asks *"how many whole times does it fit?"* and `%` asks *"what's left
over?"*. Together they split a number into big units and small units:

```python
minutes = 135
hours = minutes // 60
leftover = minutes % 60
print(hours, "hours and", leftover, "minutes")
```

```checkpoint
q: What is `17 % 5`?
options: ["3", "2", "3.4"]
answer: 1
why: 5 fits into 17 three whole times (15), leaving 2 over.
```

## Order of operations

Python follows the same rules as maths: `**` first, then `* / // %`, then
`+ -`. Brackets go first of all.

```python
print(2 + 3 * 4)
print((2 + 3) * 4)
```

```checkpoint
q: What does `print(10 - 2 * 3)` show?
options: ["24", "4", "12"]
answer: 1
why: Multiplication happens first - 2 * 3 is 6 - then 10 - 6 is 4.
```

## Numbers in variables

Variables can hold numbers too - no quotes this time:

```python
sickles_per_galleon = 17
galleons = 3
print(galleons * sickles_per_galleon)
```

In wizarding money, **1 Galleon = 17 Sickles** and **1 Sickle = 29 Knuts**.
