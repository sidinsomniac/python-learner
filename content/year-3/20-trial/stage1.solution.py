ALLOWED = "#.SE"


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
