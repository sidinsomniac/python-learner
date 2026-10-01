DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]


def fill_room(grid, row, col):
    seen = set()

    def spread(r, c):
        if not (0 <= r < len(grid) and 0 <= c < len(grid[0])):
            return
        if grid[r][c] != "." or (r, c) in seen:
            return
        seen.add((r, c))
        for dr, dc in DIRECTIONS:
            spread(r + dr, c + dc)

    spread(row, col)
    return len(seen)
