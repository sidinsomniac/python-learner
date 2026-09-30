# Lesson 1, Part 1: List Power

Last year you made lists and appended to them. Lists can do much more.

| Method | What it does | Gives back |
|---|---|---|
| `items.append(x)` | adds `x` to the end | `None` |
| `items.insert(i, x)` | puts `x` at position `i`, shuffling the rest along | `None` |
| `items.pop()` | removes and **returns** the last item | the item |
| `items.pop(i)` | removes and returns the item at position `i` | the item |
| `items.remove(x)` | removes the **first** `x` it finds (a `ValueError` if there isn't one) | `None` |
| `items.index(x)` | the position of the first `x` | a number |
| `items.count(x)` | how many times `x` appears | a number |
| `items.extend(more)` | adds every item from another list | `None` |
| `items.reverse()` | reverses the list in place | `None` |

```python
owls = ["Hedwig", "Errol", "Pigwidgeon"]
owls.insert(1, "Hermes")
last = owls.pop()
print(owls, last)
```

```checkpoint
q: 'After `x = [1, 2, 3]`, what does `x.pop(0)` return?'
options: ["3", "1", "[2, 3]"]
answer: 1
why: "`pop(0)` removes and returns the item at position 0 - the first one."
```

## `sort()` versus `sorted()`

There are two ways to sort, and mixing them up is a classic bug:

- `items.sort()` sorts the list **in place** and returns **`None`**.
- `sorted(items)` leaves the list alone and returns a **new**, sorted list.

```python
wands = ["yew", "holly", "elder"]
tidy = sorted(wands)
print(tidy)
print(wands)
```

Both take `reverse=True` for biggest-first.

```checkpoint
q: 'After `nums = [3, 1, 2]` and `result = nums.sort()`, what is `result`?'
options: ["[1, 2, 3]", "None", "[3, 1, 2]"]
answer: 1
why: "`.sort()` changes the list in place and gives back None. Use `sorted(nums)` when you want a new list."
```

## Methods change the list

Unlike string methods, most list methods **change the list itself**. Strings
never change; lists do.
