# The Trial: The Time-Turner Escape

The prototype Time-Turner has folded the sealed room into a **maze of
hours**. Tobias's diary pages describe it, one row per line:

```text
#########
#S..#...#
#.#.#.#.#
#.#...#E#
#########
```

| Square | Meaning |
|---|---|
| `#` | a wall of time: no way through |
| `.` | an hour you can walk through |
| `S` | where Tobias is now |
| `E` | the exit: the hour he started from |

He can move up, down, left and right, but not diagonally, and never
through a wall. Some pages are damaged, so your spells must refuse a
corrupt map **politely**, with a clear error.

You'll build the rescue in **four stages**. Each stage is a complete spell
of its own: when a stage needs an earlier function, paste your working
version into it.

| Stage | Spell | Job |
|---|---|---|
| 1 | `load_maze(path)` | read the map from a file, and raise `ValueError` for a corrupt one |
| 2 | `find(maze, symbol)` | where is `S`? where is `E`? |
| 3 | `reachable(maze)` | every square Tobias can walk to (flood fill) |
| 4 | `escape_report(path)` | the whole rescue, reported in plain words |

The file `maze.txt` is on your desk. Try reading it in the sandbox:

```python
with open("maze.txt") as page:
    for row in page.read().splitlines():
        print(row, len(row))
```

```checkpoint
q: In the maze above, what is at row 3, column 7 (counting from 0)?
options: ["S", "E", "#"]
answer: 1
why: Row 3 is "#.#...#E#" and its character at position 7 is E.
```

```checkpoint
q: Which Third Year idea finds every square Tobias can reach?
options: ["Binary search", "Flood fill", "Insertion sort"]
answer: 1
why: Spread from S to every open neighbour, remembering where you've been.
```
