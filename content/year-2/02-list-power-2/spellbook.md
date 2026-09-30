# Copies and grids

- Lists can hold lists: `grid[row][col]`.
- `a.copy()` and `a[:]` are **shallow**: a new outer list, but the same inner lists.
- Deep copy by copying each inner list: loop and `append(inner.copy())`.
- **The grid trap:** `[[0] * 3] * 3` repeats ONE row three times. Build each row separately.
