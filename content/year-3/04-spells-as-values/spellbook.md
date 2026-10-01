# Spells as values

- A function is a value: `spell = shout` (no brackets) - then `spell("x")`.
- Functions can be passed in: `def twice(spell, value): return spell(spell(value))`.
- `sorted(items, key=len)`, `min(..., key=...)`, `max(..., key=...)` - the key is called once per item.
- Sorting is **stable**: equal keys keep their original order.
- `lambda item: item[1]` - a tiny, nameless one-expression function.
- Several keys: return a tuple `(first, second)`. Flip a number with `-n` to sort it biggest-first.
- `list(map(spell, items))`, `list(filter(test, items))`.
- Snape: `key=len`, not `key=lambda s: len(s)`; and `def`, never `name = lambda ...`.
