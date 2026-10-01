EIGHT = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def next_state(board, r, c):
    alive = 0
    for dr, dc in EIGHT:
        nr, nc = r + dr, c + dc
        if 0 <= nr < len(board) and 0 <= nc < len(board[0]) and board[nr][nc] == "#":
            alive += 1
    if board[r][c] == "#" and alive in (2, 3):
        return "#"
    if board[r][c] == "." and alive == 3:
        return "#"
    return "."
