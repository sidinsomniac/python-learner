# ★ Lesson 7, Part 1: Binary Search

## The guessing game

"I'm thinking of a number from 1 to 100." The fastest way to find it is to
guess the **middle**, 50. "Higher!" Now the answer is in 51 to 100: half the
possibilities are gone after **one** guess. Keep halving, and any number
from 1 to 100 is found in at most **7** guesses.

That's **binary search**. It needs one thing: the data must be **sorted**.

## Searching a sorted list

Keep two markers, `lo` and `hi`: the answer, if it's there at all, lies
between them. Look at the middle, then throw away the half that can't hold
it:

```python
def search(numbers, target):
    lo, hi = 0, len(numbers) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if numbers[mid] == target:
            return mid
        if numbers[mid] < target:
            lo = mid + 1          # the answer is to the right of mid
        else:
            hi = mid - 1          # the answer is to the left of mid
    return -1                     # lo passed hi: nowhere left to look

shelf = [3, 8, 15, 23, 42, 57, 91]
print(search(shelf, 42), search(shelf, 4))
```

Step through it in the 🌀 Pensieve and watch `lo` and `hi` close in.

```checkpoint
q: Binary search on a sorted list of 1,000,000 items needs at most about how many looks?
options: ["1,000,000", "500,000", "20"]
answer: 2
why: Halving a million down to one takes about 20 steps (2 to the 20th is just over a million).
```

## Where the bugs live

Binary search is famous for being easy to describe and hard to get exactly
right. The usual traps:

| Trap | Symptom |
|---|---|
| `lo = mid` instead of `lo = mid + 1` | loops forever when `hi = lo + 1` |
| `while lo < hi` when `hi` is the last index | misses the very last candidate |
| forgetting the list must be sorted | wrong answers, no error |

Before trusting a binary search, test it on: an empty list, a list of one
item, the first item, the last item, and a missing item, both smaller and
bigger than everything.

```checkpoint
q: 'In `search`, why `lo = mid + 1` and not `lo = mid`?'
options: ["It's faster", "mid has already been checked; and lo = mid can stop the range ever shrinking", "Python requires it"]
answer: 1
why: When lo and hi are next to each other, mid equals lo. Setting lo = mid would change nothing, forever.
```

## When there are repeats

If the target appears several times, the search above returns **one** of
them, whichever its middles happen to land on, not necessarily the first.
Finding the *first* one needs a little more thought: when you find a
match, could there be another match further **left**?
