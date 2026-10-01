DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]


def largest_room(grid):
    seen = set()

    def fill(r, c):
        if not (0 <= r < len(grid) and 0 <= c < len(grid[0])):
            return 0
        if grid[r][c] != "." or (r, c) in seen:
            return 0
        seen.add((r, c))
        return 1 + sum(fill(r + dr, c + dc) for dr, dc in DIRECTIONS)

    best = 0
    for r, line in enumerate(grid):
        for c, square in enumerate(line):
            if square == "." and (r, c) not in seen:
                best = max(best, fill(r, c))
    return best
