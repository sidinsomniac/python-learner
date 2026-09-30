# Loop patterns

- `x += 1` is shorthand for `x = x + 1` (also `-=`, `*=`).
- **Counter**: start at 0, `count += 1` when something happens.
- **Accumulator**: start at 0 (or `""`), add each item.
- **Running best**: start with `None`, replace when the new item is better:
  `if best is None or item > best: best = item`.
- **Read until a stop word**: ask once before the loop, and again at the end
  of each pass.
