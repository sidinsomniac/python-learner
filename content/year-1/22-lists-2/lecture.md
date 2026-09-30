# Lesson 14, Part 2: Two Names, One Trunk

## `b = a` doesn't copy a list

With lists, `=` doesn't make a copy. It gives the **same** list a second
name:

```python
gryffindor = ["Harry", "Ron"]
team = gryffindor
team.append("Ginny")
print(gryffindor)
```

That prints `['Harry', 'Ron', 'Ginny']` - Ginny joined *both*, because
there's only one list. (Strings never have this problem, because strings can't
change.)

```checkpoint
q: 'After `a = [1, 2]`, `b = a`, `b.append(3)` - what is `len(a)`?'
options: ["2", "3"]
answer: 1
why: a and b are two names for ONE list, so appending through b changes a too.
```

## Making a real copy

Any of these makes a **new** list with the same items:

```python
original = ["wand", "robes"]
copy1 = original[:]
copy2 = list(original)
copy3 = original.copy()
copy1.append("owl")
print(original)
```

## Don't change a list while looping over it

Removing items from a list you're looping over makes the loop skip things.
Loop over a **copy**, or build a new list instead:

```python
scores = [3, 7, 2, 9]
keep = []
for s in scores:
    if s > 5:
        keep.append(s)
print(keep)
```

## Changing items by position

`items[i] = value` replaces one item. Two positions can be swapped with a
spare variable - just like the goblets in Lesson 3.
