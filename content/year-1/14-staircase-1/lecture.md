# Lesson 10, Part 1: The Forked Staircase

So far every spell ran every line. Now spells can **decide**.

## `if`

```python
temperature = 3
if temperature < 5:
    print("Wear your scarf!")
print("Off to Herbology.")
```

- The line ends with a **colon** `:`.
- The lines that belong to the `if` are **indented** (4 spaces). They only
  run when the condition is True.
- The first line that isn't indented is *outside* the `if` - it always runs.

## `else`

```python
answer = "Caput Draconis"
if answer == "Wattlebird":
    print("Correct!")
else:
    print("Wrong password.")
```

## `elif`: more than two roads

`elif` ("else if") adds more roads. Python checks them **top to bottom** and
takes the **first** one that is True - then skips all the rest.

```python
hour = 13
if hour < 12:
    print("Good morning")
elif hour < 18:
    print("Good afternoon")
else:
    print("Good evening")
```

```checkpoint
q: 'With `x = 7`: `if x > 5:` print A, `elif x > 3:` print B, `else:` print C. What prints?'
options: ["A", "A and B", "B"]
answer: 0
why: x > 5 is True, so A runs - and elif/else are skipped entirely, even though x > 3 is also True.
```

```checkpoint
q: What does the indentation (the spaces at the start of a line) tell Python?
options: ["Nothing - it's just for looks", "Which lines belong inside the if", "How important the line is"]
answer: 1
why: In Python indentation is grammar - it decides which lines are inside the if.
```
