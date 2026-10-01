def find(maze, symbol):
    for r, row in enumerate(maze):
        if symbol in row:
            return r, row.index(symbol)
    return None
