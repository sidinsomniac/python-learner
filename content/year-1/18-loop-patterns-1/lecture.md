# Lesson 13, Part 1: Loop Patterns

A handful of loop patterns come up again and again. Spot which one a problem
needs, and you're halfway there.

## Shorthand: `+=`

`total = total + 5` is so common that it has a shortcut: `total += 5`. There
are also `-=` and `*=`.

## Pattern 1: the counter

Start at 0, add 1 whenever something happens:

```python
count = 0
for letter in "Mississippi":
    if letter == "s":
        count += 1
print(count)
```

## Pattern 2: the accumulator

Start at 0 (or an empty string), and add each item as you go:

```python
total = 0
for n in range(1, 5):
    total += n
print(total)
```

```checkpoint
q: What does that last spell print?
options: ["4", "10", "15"]
answer: 1
why: 1 + 2 + 3 + 4 = 10 (range(1, 5) stops before 5).
```

## Pattern 3: the running best

Keep the best so far, and replace it when you find something better. The
tricky part is the **starting value**:

```python
heights = "3 9 4"
best = None
for word in heights.split():
    h = int(word)
    if best is None or h > best:
        best = h
print(best)
```

`None` means "nothing yet" - so the first item always wins, whatever it is.
(Starting at 0 instead would break if every number were negative!)
`text.split()` cuts a string into words - more on that in Year 2.

```checkpoint
q: "You're tracking the lowest temperature, and start with `lowest = 0`. The readings are 5, 8, 3. What goes wrong?"
options: ["Nothing", "It reports 0, which was never a reading", "It crashes"]
answer: 1
why: 0 is lower than every reading, so it's never replaced. Start with None (or the first reading).
```

## Reading until a stop word

Combine a loop with `input` to read any number of values:

```python
entry = input("Name (or done): ")
while entry != "done":
    print("Welcome,", entry)
    entry = input("Name (or done): ")
```
