# Modules

- `import math` then `math.sqrt(x)`; or `from math import sqrt, pi`. Imports go at the top.
- `math`: `sqrt`, `floor`, `ceil`, `pi`, `dist(p, q)`, `hypot(x, y)`, `gcd`.
- `random`: `randint(a, b)` (b included), `choice(items)`, `shuffle(items)` (in place), `random()`.
- `random.seed(n)` - the same seed gives the same sequence every time.
- Avoid `from module import *`.
- `from collections import Counter, defaultdict`: `Counter(items).most_common(k)`; `defaultdict(list)` starts missing keys as `[]`.
- `import json`: `json.loads(text)` -> Python, `json.dumps(obj, sort_keys=True)` -> text. `true`/`null` <-> `True`/`None`.
