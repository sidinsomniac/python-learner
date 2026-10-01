# ★ Lesson 10: The Marauder's Grid

## A map as a grid

A map is a list of rows, and each row is a string of squares. `"#"` is a
wall and `"."` is floor:

```python
corridor = [
    "#######",
    "#..#..#",
    "#..#..#",
    "#######",
]
print(len(corridor), "rows,", len(corridor[0]), "columns")
print(corridor[1][2], corridor[1][3])     # row 1, column 2 is floor; column 3 is wall
```

`grid[row][col]`: the **row** first (down the page), then the **column**
(across).

## Neighbours

A square's four neighbours are up, down, left and right. A list of
**directions** saves writing the same line four times:

```python
DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]   # up, down, left, right

row, col = 1, 1
for dr, dc in DIRECTIONS:
    print("neighbour at", row + dr, col + dc)
```

## Staying on the map

At the edge of the map, some "neighbours" don't exist. Row `-1` is a trap:
Python happily reads `grid[-1]` as the **last** row! Always check the
bounds first:

```python
grid = ["..", ".#"]

def on_map(r, c):
    return 0 <= r < len(grid) and 0 <= c < len(grid[0])

print(on_map(0, 0), on_map(-1, 0), on_map(0, 2))
```

```checkpoint
q: 'For a grid of 3 rows, what does `grid[-1]` give?'
options: ["An IndexError", "The last row", "None"]
answer: 1
why: Negative indexes count from the end. That's why bounds must be checked before indexing, not left to Python.
```

## Flood fill: let the paint spread

To find every square you can walk to from a starting square, think
recursively:

> To spread from a square: if it's off the map, or a wall, or already
> painted, stop. Otherwise paint it, and **spread from each of its
> neighbours**.

The "already painted" check is vital. Without it, two neighbouring squares
spread back and forth forever. A **set** of `(row, col)` pairs remembers
what has been painted:

```python
hall = [
    "#####",
    "#..##",
    "##..#",
    "#####",
]
painted = set()

def paint(r, c):
    if not (0 <= r < len(hall) and 0 <= c < len(hall[0])):
        return
    if hall[r][c] == "#" or (r, c) in painted:
        return
    painted.add((r, c))
    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        paint(r + dr, c + dc)

paint(1, 1)
print(sorted(painted))
```

Watch it in the 🌀 Pensieve: the call stack climbs as the paint runs down a
corridor, and unwinds when it hits a dead end.

```checkpoint
q: What goes wrong if the flood fill forgets to check "already painted"?
options: ["It paints too few squares", "Two squares keep spreading back to each other, until RecursionError", "Nothing"]
answer: 1
why: Square A spreads to B, and B spreads back to A, forever. The seen set breaks the cycle.
```
