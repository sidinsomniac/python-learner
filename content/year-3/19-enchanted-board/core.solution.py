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
            if alive == 3 or (square == "#" and alive == 2):
                new[r][c] = "#"
            else:
                new[r][c] = "."
    return new
