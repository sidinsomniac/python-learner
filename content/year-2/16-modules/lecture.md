# Lesson 10: Modules

Python comes with hundreds of ready-made spells, grouped into **modules**:
`math`, `random`, `string`, `datetime` and many more - together called the
**standard library**. To use one, `import` it.

## `import`

```python
import math

print(math.pi)
print(math.sqrt(49))
print(math.floor(2.7), math.ceil(2.1))
```

After `import math`, everything in the module is reached with a dot:
`math.sqrt`, `math.pi`. The dot keeps names tidy - your own `sqrt` could never
clash with `math.sqrt`.

## `from ... import`

To use a few names without the prefix:

```python
from math import pi, hypot

print(round(pi, 3))
print(hypot(3, 4))
```

`hypot(3, 4)` is the length of the long side of a right-angled triangle, 5.0.
(`math.dist((x1, y1), (x2, y2))` gives the distance between two points.)

Put your imports at the **top** of your spell, one per line. Avoid
`from math import *` - it dumps every name into your spell, and you can no
longer tell where anything came from.

```checkpoint
q: 'After `from math import sqrt`, which works?'
options: ["math.sqrt(9)", "sqrt(9)", "Both"]
answer: 1
why: Only the name sqrt was imported - the name `math` itself wasn't.
```

## Useful `math` spells

| Spell | Gives |
|---|---|
| `math.sqrt(x)` | square root |
| `math.floor(x)` / `math.ceil(x)` | round down / round up to a whole number |
| `math.pi` | 3.14159... |
| `math.dist(p, q)` | distance between two points |
| `math.gcd(a, b)` | greatest common divisor |

## `random`

```python
import random

print(random.randint(1, 6))
print(random.choice(["Hedwig", "Errol", "Pig"]))
cards = [1, 2, 3, 4]
random.shuffle(cards)
print(cards)
```

- `random.randint(a, b)` - a whole number from `a` to `b`, **including `b`**.
- `random.choice(items)` - one item.
- `random.shuffle(items)` - shuffles the list **in place** (and returns None).
- `random.random()` - a float from 0 up to (not including) 1.

## Seeds: predictable randomness

Random numbers come from a formula. `random.seed(n)` resets the formula to a
starting point - the same seed always gives the **same** sequence:

```python
import random

random.seed(7)
first = [random.randint(1, 100) for _ in range(3)]
random.seed(7)
again = [random.randint(1, 100) for _ in range(3)]
print(first == again)
```

That's how games replay a level, and how scientists repeat experiments. It
also means that if you know the seed, you can predict every "random" number.

```checkpoint
q: 'You call `random.seed(5)` once, then `random.randint(1, 10)` twice. Are the two numbers the same?'
options: ["Always", "Not necessarily - they're the 1st and 2nd numbers of the sequence"]
answer: 1
why: Seeding fixes the whole sequence, but each call moves one step along it.
```
