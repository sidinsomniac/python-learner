n = 3
moves = [[0, 0], [1, 1], [0, 2]]

board = []
for _ in range(n):
    board.append(["."] * n)
player = "X"
for row, col in moves:
    board[row][col] = player
    if player == "X":
        player = "O"
    else:
        player = "X"
for row in board:
    print(row)
