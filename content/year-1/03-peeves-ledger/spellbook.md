# Order of execution and reassignment

- Code runs **top to bottom**.
- `x = x + 1` works out the right side first (using the old `x`), then stores
  the result back in `x`.
- Using a variable before giving it a value raises a `NameError`.
- The same steps in a different order can give a different answer:
  (10 + 5) × 2 = 30, but 10 × 2 + 5 = 25.
