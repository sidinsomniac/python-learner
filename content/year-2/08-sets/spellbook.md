# Sets

- `{a, b, c}` - no duplicates, no order, no positions. Empty set: `set()` (not `{}`!).
- `set(items)` removes duplicates; `s.add(x)`, `s.discard(x)`.
- `a & b` both, `a | b` either, `a - b` only in a, `a ^ b` exactly one; `&=` narrows in place.
- `x in s` is instant, however big the set. Make a set before checking membership many times.
- `sorted(s)` to print a set in order.
