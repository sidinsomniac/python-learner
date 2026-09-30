# Lesson 14, Part 1: Trunks of Many Things

A **list** holds many values, in order, inside square brackets:

```python
trunk = ["robes", "wand", "cauldron"]
print(trunk)
print(len(trunk))
```

## Indexing - just like strings

```python
trunk = ["robes", "wand", "cauldron"]
print(trunk[0])
print(trunk[-1])
print(trunk[1:])
```

## Lists can change

Unlike strings, lists can be changed in place:

```python
trunk = ["robes"]
trunk.append("telescope")
trunk[0] = "dress robes"
print(trunk)
```

`append` adds to the end. You can start with an empty list, `[]`, and fill
it up as you go:

```python
names = []
entry = input("Name (or done): ")
while entry != "done":
    names.append(entry)
    entry = input("Name (or done): ")
print(len(names), "names")
```

```checkpoint
q: 'After `pets = []` and then `pets.append("toad")` twice, what is `len(pets)`?'
options: ["0", "1", "2"]
answer: 2
why: Each append adds one item - even a duplicate.
```

## Asking questions about lists

```python
galleons = [12, 3, 40]
print("wand" in ["wand", "robes"])
print(sum(galleons), min(galleons), max(galleons))
```

## Looping over a list

```python
for item in ["quill", "ink", "parchment"]:
    print("- " + item)
```

```checkpoint
q: 'What does `sum([])` give?'
options: ["0", "An error", "None"]
answer: 0
why: The sum of nothing is 0. But careful - `max([])` IS an error, and so is dividing by `len([])`!
```
