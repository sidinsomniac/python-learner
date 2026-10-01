# The enchanted board

- Game of Life: alive with 2 or 3 live neighbours stays alive; dead with exactly 3 comes alive; all else dead.
- Eight neighbours, diagonals included. Off the board counts as dead.
- Every square changes at once: READ the old board, WRITE a new one.
- `new = board` is the same board; `board[:]` shares the rows; `[row[:] for row in board]` is a real copy.
- Spotting a repeat: store each board as something hashable, e.g. `tuple("".join(row) for row in board)`, in a set.
