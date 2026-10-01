# The Marauder's Grid

- A grid is a list of rows: `grid[row][col]`; `len(grid)` rows, `len(grid[0])` columns.
- Neighbours: `for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:`.
- Check bounds BEFORE indexing: `0 <= r < len(grid) and 0 <= c < len(grid[0])` - `grid[-1]` is the last row!
- Flood fill: stop if off the map, a wall, or already seen; otherwise mark it and spread to all four neighbours.
- Remember seen squares in a set of `(row, col)` pairs.
- Count separate regions: start a new fill from every unseen floor square, and count the fills.
