# Lists

- `items = ["a", "b"]`, `empty = []`.
- `items[0]`, `items[-1]`, `items[1:]` - index and slice like strings.
- Lists can change: `items.append(x)`, `items[0] = y`.
- `len(items)`, `x in items`, `sum(numbers)`, `min(...)`, `max(...)`.
- `for item in items:` - one pass per item.
- `sum([])` is 0, but `max([])` is an error, and dividing by `len([])` is a ZeroDivisionError.
