DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]


def count_rooms(grid):
    seen = set()

    def spread(r, c):
        if not (0 <= r < len(grid) and 0 <= c < len(grid[0])):
            return
        if grid[r][c] != "." or (r, c) in seen:
            return
        seen.add((r, c))
        for dr, dc in DIRECTIONS:
            spread(r + dr, c + dc)

    rooms = 0
    for r, line in enumerate(grid):
        for c, square in enumerate(line):
            if square == "." and (r, c) not in seen:
                rooms += 1
                spread(r, c)
    return rooms
