EIGHT = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def live_neighbours(board, r, c):
    alive = 0
    for dr, dc in EIGHT:
        nr, nc = r + dr, c + dc
        if 0 <= nr < len(board) and 0 <= nc < len(board[0]) and board[nr][nc] == "#":
            alive += 1
    return alive


def next_generation(board):
    new = [row[:] for row in board]
    for r, row in enumerate(board):
        for c, square in enumerate(row):
            alive = live_neighbours(board, r, c)
            new[r][c] = "#" if alive == 3 or (square == "#" and alive == 2) else "."
    return new


def key_of(board):
    return tuple("".join(row) for row in board)


def generations_until_repeat(board):
    seen = {key_of(board)}
    steps = 0
    while True:
        board = next_generation(board)
        steps += 1
        if key_of(board) in seen:
            return steps
        seen.add(key_of(board))
