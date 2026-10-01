# Sorting smart

- Made-up order: `RANK = {"soup": 0, "roast": 1}`; `sorted(items, key=RANK.get)`.
- Several rules: a tuple key `(first, second)`; `-number` flips a number. Strings can't be negated.
- Several stable passes: sort by the LEAST important rule first, the MOST important last.
- Each pass can use its own `reverse=True` - the way to put strings Z to A inside a bigger order.
- `sorted` is O(n log n) and stable.
