# ★ Lesson 6: Counting Steps

## Time is counted in steps

How long a spell takes depends on the computer. How the time **grows** as
the data grows doesn't. So we count **steps**, and ask: *if the input gets
twice as big, what happens to the number of steps?*

## The four shapes you'll meet most

```python
def first(owls):            # O(1): the same, however many owls
    return owls[0]

def count_brown(owls):      # O(n): one look per owl
    found = 0
    for owl in owls:
        if owl == "brown":
            found += 1
    return found

def count_twins(owls):      # O(n²): every owl against every owl
    pairs = 0
    for a in owls:
        for b in owls:
            if a == b:
                pairs += 1
    return pairs

def halvings(n):            # O(log n): halve until nothing's left
    steps = 0
    while n > 1:
        n //= 2
        steps += 1
    return steps

print(first(["grey"]), count_brown(["brown", "grey"]), count_twins(["a", "a"]), halvings(1000))
```

| n (owls) | O(1) | O(log n) | O(n) | O(n²) |
|---|---|---|---|---|
| 10 | 1 | ~3 | 10 | 100 |
| 1,000 | 1 | ~10 | 1,000 | 1,000,000 |
| 1,000,000 | 1 | ~20 | 1,000,000 | 1,000,000,000,000 |

A computer does roughly ten million simple Python steps a second. O(n) on a
million owls is a blink. O(n²) on a million owls takes **days**.

```checkpoint
q: A spell takes 1 second for 1,000 owls and is O(n²). Roughly how long for 10,000?
options: ["10 seconds", "100 seconds", "2 seconds"]
answer: 1
why: Ten times the data, squared, is a hundred times the steps.
```

## Hidden loops

Some single lines hide a whole loop:

| Line | Steps |
|---|---|
| `x in a_list`, `a_list.index(x)`, `a_list.count(x)` | O(n): checks item after item |
| `x in a_set`, `x in a_dict`, `a_dict[key]` | O(1): jumps straight there |
| `sorted(items)` | O(n log n): a bit more than one pass |
| `items[1:]`, `list(items)` | O(n): copies everything |

So a loop that does `if owl in seen_list:` on every pass is secretly
O(n²). With a **set**, the same loop is O(n):

```python
import time

owls = list(range(20000))
start = time.perf_counter()
seen = set()
for owl in owls:
    if owl in seen:
        print("repeat!")
    seen.add(owl)
print(f"set: {time.perf_counter() - start:.3f}s")
```

```checkpoint
q: 'What is the shape of `for x in items: if x in other_list: ...` when both lists have n items?'
options: ["O(n)", "O(n²)", "O(log n)"]
answer: 1
why: n passes, each hiding an n-step search of other_list.
```

## Dropping the details

Big-O keeps only the part that **grows fastest**, and ignores constant
multipliers: `3n + 10` steps is O(n), and `n²/2 + n` is O(n²). For huge
inputs, the fastest-growing part is all that matters.
