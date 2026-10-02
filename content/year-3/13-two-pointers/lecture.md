# ★ Lesson 8: Two Pointers and Sliding Window

Many problems ask about **pairs** or **stretches** in a list. Trying every
pair, or every stretch, is O(n²). Two indexes moving cleverly through the
list can often do it in **one pass**: O(n).

## Two pointers from both ends

Put one pointer at each end, and move them towards each other. You met
this for palindromes. It also works for **sorted** lists. To find two
numbers that add up to a target, look at the smallest and the biggest:

- the sum is too small: only a bigger left number can help, so move `left` right;
- the sum is too big: move `right` left.

Every step rules out one number for good, so it's one pass:

```python
def closest_pair_below(prices, budget):
    """The biggest total of two different prices that is at most budget."""
    left, right = 0, len(prices) - 1
    best = None
    while left < right:
        total = prices[left] + prices[right]
        if total <= budget:
            if best is None or total > best:
                best = total
            left += 1
        else:
            right -= 1
    return best

print(closest_pair_below([2, 5, 8, 12, 20], 15))
```

```checkpoint
q: In a sorted list, the two pointers' sum is too BIG. Which pointer moves?
options: ["left moves right", "right moves left", "both move"]
answer: 1
why: Only a smaller right-hand number can bring the sum down, and every pair using the current right number is already too big.
```

## Two pointers moving the same way

A slow pointer can mark "where the next keeper goes" while a fast pointer
reads ahead, as in squeezing repeats out of a sorted list, in place:

```python
pages = [1, 1, 2, 3, 3, 3, 4]
write = 1
for read in range(1, len(pages)):
    if pages[read] != pages[write - 1]:
        pages[write] = pages[read]
        write += 1
print(pages[:write])
```

## A window of fixed size

For "the best run of exactly k pages", slide a window along. When it moves
one step, **add** the page coming in and **subtract** the page going out,
rather than adding up all k again:

```python
drops = [3, 1, 4, 1, 5, 9, 2, 6]
k = 3
window = sum(drops[:k])
best = window
for right in range(k, len(drops)):
    window += drops[right] - drops[right - k]
    best = max(best, window)
print(best)
```

## A window that grows and shrinks

Sometimes the window's size isn't fixed. Grow it on the right, one page at
a time. Whenever it breaks the rule, shrink it from the left until it's
valid again. Each page enters once and leaves at most once, so it's still
O(n):

```python
def longest_within_budget(costs, budget):
    """The longest run of consecutive costs whose total stays within budget."""
    left = 0
    total = 0
    best = 0
    for right, cost in enumerate(costs):
        total += cost                   # grow
        while total > budget:           # broken? shrink
            total -= costs[left]
            left += 1
        best = max(best, right - left + 1)
    return best

print(longest_within_budget([4, 2, 1, 7, 1, 1, 3], 8))
```

The rule inside the window can be anything you can keep up to date as
pages come and go: a total, a count, or a **set** of what's inside.

```checkpoint
q: In a grow-and-shrink window over n pages, how many times can a page leave the window?
options: ["Up to n times", "At most once", "Exactly k times"]
answer: 1
why: The left pointer only ever moves forward, so each page leaves at most once. That's why the whole thing is O(n).
```
