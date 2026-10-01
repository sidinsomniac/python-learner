# Binary search

- Only on **sorted** data. Each look halves the possibilities: a million items take ~20 looks.
- `lo, hi = 0, len(items) - 1`; `while lo <= hi:`; `mid = (lo + hi) // 2`.
- Too small: `lo = mid + 1`. Too big: `hi = mid - 1`. Never `lo = mid` in this style.
- Not found when `lo > hi`.
- First of several matches: on a match, remember it and keep looking LEFT.
- Test the edges: empty, one item, first, last, missing on either side.
