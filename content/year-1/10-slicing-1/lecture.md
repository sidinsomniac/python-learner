# Lesson 8, Part 1: Slicing the Scroll

## How long is it? `len`

`len(x)` gives the number of characters in a string:

```python
print(len("Hogwarts"))
```

## Indexing: one character

Each character has a position - an **index** - and counting starts at
**0**:

```text
 H  e  d  w  i  g
 0  1  2  3  4  5
-6 -5 -4 -3 -2 -1
```

```python
owl = "Hedwig"
print(owl[0])
print(owl[2])
```

**Negative** indexes count from the end: `owl[-1]` is `g`, the last
character.

```checkpoint
q: 'If `word = "Nimbus"`, what is `word[1]`?'
options: ["N", "i", "m"]
answer: 1
why: Counting starts at 0, so index 1 is the SECOND character.
```

Asking for an index that doesn't exist - `owl[10]` - is an `IndexError`.

## Slicing: a piece of the string

`text[start:stop]` gives the characters from `start` **up to but not
including** `stop`:

```python
spell = "Expelliarmus"
print(spell[0:5])
print(spell[5:9])
```

Leave out `start` to begin at the start, or `stop` to go to the end:

```python
spell = "Expelliarmus"
print(spell[:3])
print(spell[9:])
```

```checkpoint
q: 'What is `"Quidditch"[2:5]`?'
options: ["idd", "uid", "iddi"]
answer: 0
why: Positions 2, 3 and 4 - the stop position (5) is NOT included.
```

Unlike indexing, slices never cause an error - a slice that runs off the end
just stops at the end: `"Ron"[1:100]` is `"on"`.
