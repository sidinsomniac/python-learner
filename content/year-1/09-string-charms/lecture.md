# Lesson 7: String Charms

Every string carries its own little spells, called **methods**. You cast them
with a dot:

```python
spell = "expelliarmus"
print(spell.upper())
print(spell.title())
```

| Method | What it gives back | `"  hOgWaRtS  "` becomes |
|---|---|---|
| `.upper()` | all capitals | `"  HOGWARTS  "` |
| `.lower()` | all small letters | `"  hogwarts  "` |
| `.title()` | Each Word Capitalised | `"  Hogwarts  "` |
| `.strip()` | spaces removed from both ends | `"hOgWaRtS"` |
| `.replace(a, b)` | every `a` swapped for `b` | |
| `.count(x)` | how many times `x` appears | |
| `.find(x)` | the position of `x`, or `-1` | |
| `.startswith(x)` | `True` or `False` | |

## Chaining

Each method gives back a *new* string, so you can chain them:

```python
shout = "   WINGARDIUM leviosa   "
print(shout.strip().lower())
```

## ⚠️ Strings never change

This is the most common beginner trap in all of Parseltongue. A method
**doesn't change the original string** - it gives back a *new* one. If you
don't store it, it vanishes:

```python
charm = "lumos"
charm.upper()
print(charm)
```

That still prints `lumos`! To keep the result, save it:
`charm = charm.upper()`.

```checkpoint
q: 'After `house = "gryffindor"` and then `house.title()`, what does `print(house)` show?'
options: ["Gryffindor", "gryffindor", "GRYFFINDOR"]
answer: 1
why: The result of `.title()` was never stored, so `house` is unchanged. Strings never change in place.
```

## Asking about strings

`in` asks whether one string appears inside another:

```python
print("owl" in "Hedwig the owl")
```

```checkpoint
q: What does `"banana".count("a")` give?
options: ["1", "3", "6"]
answer: 1
why: The letter a appears three times in banana.
```
