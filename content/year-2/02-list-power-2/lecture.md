# Lesson 1, Part 2: Copies and Grids

## Lists inside lists

A list can hold other lists - handy for grids and groups:

```python
floors = [["mirror", "trophy"], ["badge"]]
print(floors[0])
print(floors[0][1])
```

`floors[0][1]` means "the first inner list, then its second item".

## A copy only copies the *outer* list

Last year you met `b = a` (two names, one list) and real copies with
`a.copy()` or `a[:]`. But those copies are **shallow**: they make a new
outer list, filled with the **same** inner lists.

```python
original = [["owl"], ["cat"]]
shallow = original.copy()
shallow.append(["toad"])
shallow[0].append("feather")
print(original)
```

The toad only went into the copy - but the feather appeared in *both*,
because `shallow[0]` and `original[0]` are the same inner list.

```checkpoint
q: 'After `a = [[1], [2]]`, `b = a.copy()` and `b[1].append(9)`, what is `a`?'
options: ["[[1], [2]]", "[[1], [2, 9]]", "[[1], [2], 9]"]
answer: 1
why: The outer list was copied, but both lists share the same inner lists.
```

To copy **deeply**, copy each inner list too:

```python
groups = [["Harry", "Ron"], ["Luna"]]
safe = []
for group in groups:
    safe.append(group.copy())
```

## The grid trap

`[0] * 3` makes `[0, 0, 0]`. So `[[0] * 3] * 3` should make a 3x3 grid...
but it makes **one** row, repeated three times:

```python
trap = [[0] * 3] * 3
trap[0][0] = 5
print(trap)
```

Every row changes. Build each row separately instead - one new list per
pass of a loop.

```checkpoint
q: Why does `[[0] * 2] * 2` behave strangely?
options: ["It makes 4 separate numbers", "Both rows are the same list", "It's a SyntaxError"]
answer: 1
why: The outer `* 2` repeats a reference to one row, rather than making a new row.
```
