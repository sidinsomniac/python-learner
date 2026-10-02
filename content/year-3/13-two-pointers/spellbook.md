# Two pointers and sliding windows

- **Both ends** (sorted lists, palindromes): `left, right = 0, len(xs) - 1`; move the one that can improve things.
- **Same direction**: a slow `write` pointer keeps, a fast `read` pointer looks ahead - in-place filtering.
- **Fixed window of k**: add the item coming in, subtract the one going out.
- **Grow and shrink**: grow on the right; while the window breaks the rule, shrink from the left; record the best.
- Keep the window's state up to date: a running total, counts, or a `set` of what's inside.
- Each item enters and leaves at most once: O(n) instead of O(n²).
- Hand sorts (selection, insertion) are O(n²) - in real spells, use `sorted()`.
