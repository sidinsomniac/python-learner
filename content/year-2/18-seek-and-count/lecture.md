# Lesson 12: ★ Seek and Count

This is a ★ lesson - a first taste of **algorithms**: step-by-step methods
whose *efficiency* matters.

## Linear search

The simplest search walks the list from the start until it finds what it
wants:

```python
def position_of(items, target):
    for i, item in enumerate(items):
        if item == target:
            return i
    return -1

print(position_of(["cup", "mirror", "cat"], "mirror"))
```

For a list of *n* items, the worst case takes *n* steps (the target is last,
or missing). We call that **linear time**, written **O(n)**: double the
list, double the work. `items.index(x)` and `x in items` both work this way.

```checkpoint
q: 'Linear search of 2,000 items. The target is missing. How many comparisons?'
options: ["1", "About 1,000", "2,000"]
answer: 2
why: To be sure it's missing, every item has to be checked.
```

## Counting steps

A loop inside a loop is where the work explodes. This compares every item
with every other item:

```python
items = [3, 1, 3, 2]
steps = 0
for a in items:
    for b in items:
        steps += 1
print(steps)
```

For *n* items that's *n x n* steps - **O(n²)**, or **quadratic**. With 4
items it's 16 steps; with 20,000 it's **400,000,000**. That is why a set or
a dictionary lookup (one step) beats `in` on a list (up to *n* steps)
whenever you search many times.

| Items | O(n) steps | O(n²) steps |
|---|---|---|
| 10 | 10 | 100 |
| 1,000 | 1,000 | 1,000,000 |
| 100,000 | 100,000 | 10,000,000,000 |

## Two pointers: a walkthrough

Suppose two lists are **already sorted**, and you want one sorted list of
both. You *could* join them and sort again - but there's a neater way that
uses the sorting you already have.

Keep a finger (a **pointer**) at the start of each list:

```text
a = [1, 4, 9]      b = [2, 3, 10]
     ^                  ^
```

1. Compare the two items under the fingers: 1 vs 2. The smaller, **1**,
   must be the smallest of everything left. Take it, move that finger on.
2. 4 vs 2 - take **2**, move b's finger.
3. 4 vs 3 - take **3**.
4. 4 vs 10 - take **4**.
5. 9 vs 10 - take **9**. Now `a` is used up...
6. ...so everything left in `b` (**10**) goes on the end, in order.

Result: `[1, 2, 3, 4, 9, 10]`. Every item is looked at about once - O(n) -
and no sorting was needed. This "two pointers" idea will come back again and
again in later years.

```checkpoint
q: 'Merging [5, 6] with [1, 2, 3] using two pointers - which item is taken FIRST?'
options: ["5", "1", "6"]
answer: 1
why: Compare the fronts, 5 and 1; the smaller one is always taken.
```

## Grouping by a signature

To group things that "belong together", compute a **signature** for each -
something identical for every member of a group - and use it as a dictionary
key. For example, grouping words by their length:

```python
groups = {}
for word in ["owl", "cat", "toad", "newt"]:
    groups.setdefault(len(word), []).append(word)
print(list(groups.values()))
```

One pass, one dictionary lookup per word: O(n). Comparing every word with
every other word would be O(n²).
