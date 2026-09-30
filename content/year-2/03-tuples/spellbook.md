# Tuples and unpacking

- A **tuple** `(a, b)` is a list that can't change. One item needs a comma: `(x,)`.
- Unpack: `floor, corridor = spot` (the counts must match).
- Swap: `a, b = b, a`.
- Loop over pairs: `for name, kind in pairs:`
- `enumerate(items, start=1)` gives `(number, item)` - no manual counter.
- Tuples compare left to right; sorting a list of tuples sorts by the first item, then the second...
- `divmod(a, b)` returns `(a // b, a % b)`.
