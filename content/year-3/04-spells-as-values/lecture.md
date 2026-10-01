# Lesson 3: Spells as Values

## A function is a value

A function's name is just a name for a value, like any variable. You can
store it, put it in a list, and pass it to another function. **Without the
brackets**, you're talking about the spell itself; **with** them, you're
casting it:

```python
def shout(text):
    return text.upper() + "!"

spell = shout              # no brackets: the spell itself
print(spell("lumos"))      # brackets: cast it
for charm in [shout, str.lower, len]:
    print(charm("Nox"))
```

## A function that takes a function

```python
def twice(spell, value):
    return spell(spell(value))

def add_three(n):
    return n + 3

print(twice(add_three, 10))
print(twice(shout, "nox"))
```

## Sorting by your own rule: `key=`

`sorted`, `min` and `max` accept a `key`: a function that is called on each
item to get the thing that's **actually compared**:

```python
spells = ["Lumos", "Wingardium Leviosa", "Nox", "Accio"]
print(sorted(spells))            # alphabetical
print(sorted(spells, key=len))   # by length
print(max(spells, key=len))      # the longest
```

The key is called **once per item**. The items themselves come back, in the
new order.

Python's sort is **stable**: items with equal keys keep their original order.
In the length sort above, "Lumos" stays ahead of "Accio".

```checkpoint
q: 'What does `min(["owl", "toad", "cat"], key=len)` give?'
options: ["3", "'owl'", "'cat'"]
answer: 1
why: min returns the item, not its key. 'owl' and 'cat' tie at 3 letters, and the first one wins.
```

## Tiny spells: `lambda`

For a one-off key, writing a whole `def` is fussy. `lambda` makes a small,
nameless function in place: `lambda arguments: expression`:

```python
students = [("Harry", 3), ("Ginny", 2), ("Percy", 6)]
print(sorted(students, key=lambda student: student[1]))
```

A lambda can only hold one expression, and it returns that expression
automatically.

Two of Snape's pet hates:
- `key=lambda s: len(s)` is just `key=len` with extra steps. Pass the spell itself.
- `double = lambda x: x * 2` gives a lambda a name. If it deserves a name, use `def`.

## Sorting by several things

Make the key return a **tuple**. Tuples compare item by item: the first
item decides, and the next only breaks ties:

```python
students = [
    {"name": "Harry", "house": "Gryffindor", "year": 3},
    {"name": "Cedric", "house": "Hufflepuff", "year": 5},
    {"name": "Ron", "house": "Gryffindor", "year": 3},
    {"name": "Fred", "house": "Gryffindor", "year": 5},
]
for s in sorted(students, key=lambda s: (s["house"], -s["year"])):
    print(s["house"], s["year"], s["name"])
```

The minus sign flips a **number** so that bigger comes first, while the rest
of the key still sorts upwards. For "everything backwards", use
`reverse=True`.

```checkpoint
q: 'Which key sorts by year, highest first, and then by name A to Z?'
options: ["key=lambda s: (s['year'], s['name'])", "key=lambda s: (-s['year'], s['name'])", "key=lambda s: (s['name'], -s['year'])"]
answer: 1
why: The year decides first, flipped by the minus; the name only breaks ties.
```

## `map` and `filter`

`map(spell, items)` casts a spell on every item; `filter(test, items)` keeps
the items the test says True to. Both give back a lazy stream, so wrap
them in `list(...)` to see the result:

```python
words = ["  nox", "LUMOS ", " accio "]
print(list(map(str.strip, words)))
print(list(filter(str.isupper, ["NOX", "Lumos", "ACCIO"])))
```

A comprehension can do the same jobs, and often reads more clearly. Use
whichever says what you mean.
