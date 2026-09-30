# Lesson 3, Part 1: Dictionaries

A list finds things by **position**. A **dictionary** finds things by
**name**. It stores pairs: a **key** and the **value** it leads to.

```python
owners = {"Quidditch Cup": "Gryffindor", "Hedwig": "Harry"}
print(owners["Hedwig"])
owners["Trevor"] = "Neville"
owners["Hedwig"] = "Harry Potter"
print(owners)
print(len(owners))
```

- `d[key]` looks a value up.
- `d[key] = value` adds a new pair, or **replaces** the value if the key exists.
- Keys are unique. Values can repeat.
- Keys must be unchangeable things: strings, numbers, tuples. (Not lists.)
- A dictionary remembers the order pairs were added.

```checkpoint
q: 'After `d = {"a": 1}` and `d["a"] = 5`, how many pairs does d have?'
options: ["1", "2"]
answer: 0
why: Keys are unique - assigning to an existing key replaces its value.
```

## Missing keys

Looking up a key that isn't there raises a `KeyError`. Two ways to be safe:

```python
owners = {"Hedwig": "Harry"}
print("Scabbers" in owners)
print(owners.get("Scabbers"))
print(owners.get("Scabbers", "nobody"))
```

- `key in d` checks the **keys** (never the values).
- `d.get(key)` gives `None` for a missing key, and `d.get(key, default)` gives
  your default instead.

```checkpoint
q: 'With `d = {"owl": "Hedwig"}`, what is `"Hedwig" in d`?'
options: ["True", "False"]
answer: 1
why: "`in` looks at keys only. \"Hedwig\" is a value."
```

## Removing

```python
owners = {"Hedwig": "Harry", "Trevor": "Neville"}
del owners["Trevor"]
lost = owners.pop("Hedwig")
print(lost, owners)
```

`del d[key]` removes a pair; `d.pop(key)` removes it **and returns** the value.

## Looping

Looping over a dictionary gives you its **keys**. To get both halves, use
`.items()`, which gives `(key, value)` tuples - unpack them!

```python
houses = {"Harry": "Gryffindor", "Cedric": "Hufflepuff"}
for student in houses:
    print(student)
for student, house in houses.items():
    print(f"{student} is in {house}")
print(list(houses.values()))
```

From now on Professor Snape will sneer at `for k in d.keys():` - plain
`for k in d:` already does exactly that.

```checkpoint
q: 'What does `for x in {"a": 1, "b": 2}:` loop over?'
options: ["The keys", "The values", "(key, value) pairs"]
answer: 0
why: A dictionary loops over its keys. Use `.items()` for pairs and `.values()` for values.
```
