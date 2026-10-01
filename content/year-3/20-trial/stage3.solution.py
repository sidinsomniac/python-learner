DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]


def find(maze, symbol):
    for r, row in enumerate(maze):
        if symbol in row:
            return r, row.index(symbol)
    return None


def reachable(maze):
    seen = set()

    def spread(r, c):
        if not (0 <= r < len(maze) and 0 <= c < len(maze[0])):
            return
        if maze[r][c] == "#" or (r, c) in seen:
            return
        seen.add((r, c))
        for dr, dc in DIRECTIONS:
            spread(r + dr, c + dc)

    spread(*find(maze, "S"))
    return seen
