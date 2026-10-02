# Revision III: sorting, grids and testing

Three mixed challenges on Lessons 8-11.

```checkpoint
q: A grow-and-shrink window finds the longest run with no repeated colour. When a repeat arrives, what happens?
options: ["Start a new window at the repeat", "Shrink from the left until the earlier copy has left", "Shrink from the right"]
answer: 1
why: Pages leave from the left until the window is clean again. Each page enters once and leaves at most once, so it's O(n).
```

```checkpoint
q: Sort by house, then by name within each house - with two stable passes. Which pass comes LAST?
options: ["By name", "By house"]
answer: 1
why: The last pass is the most important rule; stability keeps the earlier name order within each house.
```

```checkpoint
q: A flood fill crashes with RecursionError on a tiny 2 by 2 room. What's the most likely cause?
options: ["The room is too big", "It never remembers which squares it has already filled", "Grids can't be recursive"]
answer: 1
why: Without a seen set, two neighbouring squares keep spreading back to each other forever.
```

**Tip:** before fixing a bug, write down one small example that shows it.
Then you'll know for certain when it's gone.
