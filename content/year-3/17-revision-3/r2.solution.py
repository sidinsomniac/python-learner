def area(grid, r, c, seen=None):
    if seen is None:
        seen = set()
    if not (0 <= r < len(grid) and 0 <= c < len(grid[0])):
        return 0
    if grid[r][c] == "#" or (r, c) in seen:
        return 0
    seen.add((r, c))
    total = 1
    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        total += area(grid, r + dr, c + dc, seen)
    return total
