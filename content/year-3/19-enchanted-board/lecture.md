# ★ Lesson 13: The Enchanted Board

## Simulation

A **simulation** steps a little world forward, one tick at a time, by
fixed rules. The most famous one fits on a postcard: **Conway's Game of
Life**.

The board is a grid of squares, each **alive** (`"#"`) or **dead** (`"."`).
Every square has up to **eight** neighbours, diagonals included. Each
generation, every square looks at how many of its neighbours are alive:

- an **alive** square with **2 or 3** live neighbours stays alive;
- a **dead** square with **exactly 3** live neighbours comes alive;
- every other square is dead in the next generation.

All the squares change **at the same moment**, based on the **old** board.

```checkpoint
q: A live square has 4 live neighbours. What happens to it?
options: ["It stays alive", "It dies (overcrowded)", "It splits in two"]
answer: 1
why: Only 2 or 3 neighbours keep a live square alive.
```

## Eight neighbours

The four directions from the Marauder's grid become eight:

```python
EIGHT = [(-1, -1), (-1, 0), (-1, 1),
         (0, -1),           (0, 1),
         (1, -1),  (1, 0),  (1, 1)]
print(len(EIGHT))
```

Squares off the board count as **dead**. Our board doesn't wrap round.

## The copying trap returns

"All at the same moment" is the hard part. If you change a square while
you're still working through the board, its neighbours, which haven't been
worked out yet, will see the **new** value instead of the old one.

So build a **separate** new board, and read only from the old one. And
remember Year 1 and Year 2: `new = board` makes a second name for the
**same** board, and `new = board[:]` copies only the outer list, so every
row is still shared!

```python
board = [[".", "#"], ["#", "."]]
alias = board
shallow = board[:]
deep = [row[:] for row in board]
board[0][0] = "#"
print(alias[0][0], shallow[0][0], deep[0][0])
```

```checkpoint
q: 'After `new = old[:]` on a list of row lists, then `new[0][0] = "#"`, what has happened to `old[0][0]`?'
options: ["Nothing - it's a copy", 'It is "#" too: the rows are shared', "An error"]
answer: 1
why: The slice copies the outer list only. Both lists hold the very same row lists.
```

## Patterns

Some patterns never change (a 2×2 **block**). Some flip back and forth (a
line of three, the **blinker**). And one, the **glider**, walks across the
board forever, or until it hits a wall.
