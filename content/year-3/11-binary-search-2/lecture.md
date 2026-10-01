# ★ Lesson 7, Part 2: Binary Search on a Condition

## Not just lists

Last lesson, binary search looked for a value in a sorted list. But the
idea is bigger. Binary search works whenever you have a **yes/no question**
whose answers look like this, as you go up through the possibilities:

```text
no  no  no  no  YES YES YES YES YES
                 ^ the boundary: the first yes
```

Once it's "yes", it stays "yes". Then you can find the **first yes** by
halving, without checking every possibility.

## An example: the slowest broom that's fast enough

Brooms come in speeds 1 to 1000. The question "is this speed fast enough to
reach Hogsmeade in time?" is "no" for slow brooms and "yes" from some speed
upwards. Which is the slowest broom that's fast enough?

```python
def fast_enough(speed):
    return 120 / speed <= 0.5        # hours to fly 120 miles

lo, hi = 1, 1000
best = None
while lo <= hi:
    mid = (lo + hi) // 2
    if fast_enough(mid):
        best = mid           # a yes: remember it, but a smaller yes may exist
        hi = mid - 1
    else:
        lo = mid + 1         # a no: the first yes is to the right
print(best)
```

Notice the shape: on a **yes**, remember it and look **left**; on a **no**,
look **right**. When `lo` passes `hi`, `best` is the first yes, or `None` if
there was never a yes at all.

```checkpoint
q: Why can't this trick find the first "yes" if the answers go no, yes, no, yes...?
options: ["It can, just more slowly", "One look no longer tells you which half to throw away", "Because there are too many yeses"]
answer: 1
why: Halving relies on everything after a yes being yes too. Without that, a no in the middle says nothing about either side.
```

## Count your questions

Sometimes asking the question is expensive (a slow spell, or a fragile old
page). Binary search asks it only about log₂(n) times: about 20 for a
million possibilities, 40 for a million million.

```checkpoint
q: About how many questions does binary search need to find a boundary among 1,000,000 pages?
options: ["1,000", "20", "500,000"]
answer: 1
why: Each question halves the pages left; 2 to the 20th is about a million.
```
