DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]


def floor_neighbours(grid, row, col):
    count = 0
    for dr, dc in DIRECTIONS:
        r, c = row + dr, col + dc
        if 0 <= r < len(grid) and 0 <= c < len(grid[0]) and grid[r][c] == ".":
            count += 1
    return count
