# Lesson 13, Part 2: Break, Continue and Else

## `break`: stop the loop now

`break` leaves the loop immediately - useful when you've found what you're
looking for:

```python
for letter in "Hufflepuff":
    if letter == "f":
        print("Found an f!")
        break
```

## `continue`: skip to the next pass

`continue` skips the rest of *this* pass and moves on:

```python
for n in range(1, 8):
    if n % 3 == 0:
        continue
    print(n)
```

```checkpoint
q: Which numbers does that last spell print?
options: ["1 2 4 5 7", "3 6", "1 2 3 4 5 6 7"]
answer: 0
why: Multiples of 3 (3 and 6) hit `continue`, so their print is skipped.
```

## `for ... else`: "I looked everywhere and didn't find it"

A loop can have an `else`. It runs only if the loop finished **without**
hitting `break`:

```python
for letter in "Crwth":
    if letter in "aeiou":
        print("Has a vowel")
        break
else:
    print("No vowels at all!")
```

It's perfect for searches: `break` when found, `else` for "never found".

```checkpoint
q: When does a loop's `else` block run?
options: ["When the loop runs zero times only", "When the loop finishes without a break", "After every pass"]
answer: 1
why: The else belongs to the loop - it runs once, at the end, unless a break jumped out.
```

## Prime numbers

A **prime** is a whole number above 1 that divides evenly only by 1 and
itself: 2, 3, 5, 7, 11, 13... 1 is *not* prime, and neither is 0.
