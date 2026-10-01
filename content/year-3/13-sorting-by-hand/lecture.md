# ★ Lesson 8: Sorting by Hand

`sorted()` and `.sort()` are fast and correct, so use them in real spells.
But knowing *how* sorting works teaches you to reason about steps, swaps
and edge cases, and some interview questions still ask for it.

Both methods below sort **in place**: they rearrange the list they're given
rather than making a new one.

## Selection sort: find the smallest, put it in place

Look through the whole list for the smallest item, and swap it to the
front. Then do the same for the rest of the list, starting one place
further on:

```python
def selection_sort(items):
    for start in range(len(items) - 1):
        smallest = start
        for i in range(start + 1, len(items)):
            if items[i] < items[smallest]:
                smallest = i
        items[start], items[smallest] = items[smallest], items[start]

books = [42, 7, 19, 3]
selection_sort(books)
print(books)
```

Each pass puts **one** item into its final place, with at most **one swap**.
But every pass must still look at everything that's left, so it's O(n²)
**looks**, even if the list was sorted to begin with.

## Insertion sort: slide each item back to where it belongs

Like sorting a hand of cards. The left part of the list is already sorted.
Take the next item, and slide it left past every bigger item, until it
fits:

```python
def insertion_sort(items):
    for i in range(1, len(items)):
        item = items[i]
        j = i - 1
        while j >= 0 and items[j] > item:
            items[j + 1] = items[j]     # shift a bigger item one place right
            j -= 1
        items[j + 1] = item

cards = [5, 2, 4, 1]
insertion_sort(cards)
print(cards)
```

Step through it in the Pensieve and watch the sorted part grow on the left.

On a list that's **nearly sorted**, each item only slides a step or two, so
insertion sort is close to O(n). On a list in **reverse** order, every item
slides all the way, so it's O(n²) moves.

```checkpoint
q: Which sort does very little work on a list that is already sorted?
options: ["Selection sort", "Insertion sort", "Both do the same amount"]
answer: 1
why: Insertion sort checks one neighbour per item and moves nothing. Selection sort still scans everything that's left, on every pass.
```

## Stability

A sort is **stable** if equal items keep their original order. Insertion
sort is stable as long as it only slides past items that are strictly
**bigger** (`>`), never equal ones. Selection sort's long-distance swaps can
jump an item over its equals, so it isn't stable.

```checkpoint
q: 'In insertion sort, what happens if `items[j] > item` becomes `items[j] >= item`?'
options: ["Nothing changes", "Equal items get shuffled past each other: it's no longer stable, and does extra moves", "It stops working"]
answer: 1
why: The list still ends up sorted, but equal items swap places, which is wasted work and breaks stability.
```
