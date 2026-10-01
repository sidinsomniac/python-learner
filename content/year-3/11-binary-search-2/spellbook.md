# Binary search on a condition

- Needs a yes/no question that's "no, no, ..., yes, yes, ..." - once yes, always yes.
- Finds the **first yes** in about log₂(n) questions.
- On a yes: remember `mid`, then `hi = mid - 1` (look left for an earlier yes).
- On a no: `lo = mid + 1`.
- Afterwards, the remembered value is the first yes - or None if there never was one.
- Use it to search answers too: "the smallest speed that's fast enough", "the biggest r with r*r <= n".
