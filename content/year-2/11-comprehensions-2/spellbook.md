# More comprehensions

- Dictionary: `{k: v for k, v in d.items() if ...}`. Flip: `{v: k for k, v in d.items()}`.
- Set: `{x.lower() for x in names}` - curly brackets, no colon.
- Choose: `a if condition else b`. In a comprehension's expression it keeps every item.
- `if` at the END filters; `if ... else` in the expression chooses.
- `any(...)` - at least one true; `all(...)` - every one true.
