# List comprehensions

- `[expression for item in items]` - build a new list by transforming.
- `[item for item in items if condition]` - filter.
- Both: `[x * 2 for x in nums if x > 0]`. Unpacking works: `[a for a, b in pairs]`.
- Feed them to `sum`, `max`, `sorted`, `", ".join(...)`.
- Only for building lists. If each item needs several steps or printing, use a normal loop.
