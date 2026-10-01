# Lesson 4: Flexible Spells

`print` takes any number of arguments: `print("a")`, `print("a", "b", "c")`.
Your own spells can do that too.

## `*args`: any number of positional arguments

A parameter with a `*` in front collects **all the remaining positional
arguments** into a tuple:

```python
def list_owls(*owls):
    print(owls, len(owls))

list_owls("Hedwig")
list_owls("Errol", "Pig", "Hermes")
list_owls()
```

The name `args` is just a habit; `*owls` reads better here.

## Keyword-only parameters

Anything **after** `*args` can only be given **by name**. It can't be
swallowed up by accident:

```python
def announce(*names, house="Gryffindor"):
    for name in names:
        print(f"{name} of {house}")

announce("Harry", "Ron")
announce("Cedric", house="Hufflepuff")
announce("Luna", "Ravenclaw")      # Ravenclaw is just another name here!
```

```checkpoint
q: 'With `def f(*names, house="G")`, what is `house` in the call `f("Luna", "Ravenclaw")`?'
options: ["'Ravenclaw'", "'G'", "An error"]
answer: 1
why: Both strings are positional, so both go into names. house can only be set by name.
```

## `**kwargs`: any number of keyword arguments

Two stars collect the **named** arguments nobody else claimed, into a
dictionary:

```python
def make_wand(wood, **details):
    print(wood, details)

make_wand("holly", core="phoenix feather", inches=11)
make_wand("vine")
```

The full order of parameters is:
`def spell(a, b, *args, option=1, **kwargs):`.

## Unpacking when you call

A `*` in a **call** spreads a list or tuple out into separate arguments.
`**` spreads a dictionary out into keyword arguments:

```python
def duel(first, second, rounds=3):
    return f"{first} v {second}, {rounds} rounds"

pair = ["Harry", "Draco"]
settings = {"rounds": 5}
print(duel(*pair))
print(duel(*pair, **settings))
print(*["a", "b", "c"], sep="-")
```

```checkpoint
q: 'What does `print(*[1, 2, 3])` print?'
options: ["[1, 2, 3]", "1 2 3", "(1, 2, 3)"]
answer: 1
why: The star spreads the list out, so print receives three separate arguments.
```

## Passing everything along

A spell can take anything and hand it all on to another spell, untouched:

```python
def loudly(spell, *args, **kwargs):
    print("Casting", spell.__name__)
    return spell(*args, **kwargs)

print(loudly(max, 3, 9, 4))
print(loudly(sorted, ["c", "a"], reverse=True))
```
