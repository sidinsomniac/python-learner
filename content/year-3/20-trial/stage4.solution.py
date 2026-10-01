ALLOWED = "#.SE"
DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]


def load_maze(path):
    with open(path) as page:
        rows = [line.rstrip() for line in page.read().splitlines()]
    rows = [row for row in rows if row]
    if not rows:
        raise ValueError("the map is empty")
    if any(len(row) != len(rows[0]) for row in rows):
        raise ValueError("the rows are not all the same length")
    for r, row in enumerate(rows):
        for c, square in enumerate(row):
            if square not in ALLOWED:
                raise ValueError(f"unknown square {square!r} at row {r}, column {c}")
    if sum(row.count("S") for row in rows) != 1:
        raise ValueError("the map needs exactly one S")
    if sum(row.count("E") for row in rows) != 1:
        raise ValueError("the map needs exactly one E")
    return rows


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


def escape_report(path):
    try:
        maze = load_maze(path)
    except FileNotFoundError:
        return f"No map called {path} on the desk."
    except ValueError as err:
        return f"The map is corrupt: {err}."
    squares = reachable(maze)
    if find(maze, "E") in squares:
        return f"Free! Tobias reaches the exit, passing through {len(squares)} hours."
    return f"Trapped: Tobias can reach {len(squares)} hours, but not the exit."
