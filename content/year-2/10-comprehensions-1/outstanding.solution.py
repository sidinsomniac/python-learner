grid = [[1, 2, 3], [4, 5, 6]]
print([row[::-1] for row in grid])
print([[row[c] for row in grid] for c in range(len(grid[0]))])
print([value for row in grid for value in row])
