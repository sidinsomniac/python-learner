# Lesson 4, Part 2: The Gotchas

## Floats are almost exact

Decimal numbers (floats) are stored in binary, and some decimals - like 0.1 -
can't be stored *exactly*. Usually you never notice. Sometimes you do:

```python
print(0.1 + 0.2)
```

That shows `0.30000000000000004`. The tiny error is real, and every
programming language has it.

## Asking "are these equal?"

`==` asks whether two things are equal, and answers `True` or `False`.
(You'll learn much more about this in Lesson 9.)

```python
print(2 + 2 == 4)
print(0.5 + 0.25 == 0.75)
```

```checkpoint
q: What does `print(0.1 + 0.2 == 0.3)` show?
options: ["True", "False"]
answer: 1
why: The left side is really 0.30000000000000004, which is not *exactly* 0.3.
```

## Comparing floats safely: close enough

Instead of asking "exactly equal?", ask "is the difference tiny?". `abs(x)`
gives the size of a number without its sign (`abs(-3)` is `3`), and `<` asks
"is it smaller?":

```python
measured = 9.81
expected = 9.8
print(abs(measured - expected) < 0.1)
```

## Rounding

`round(x)` rounds to a whole number, and `round(x, 2)` to 2 decimal places.
**But beware**: when a number is exactly halfway, Python rounds to the nearest
**even** number. So `round(2.5)` is `2`, but `round(3.5)` is `4`. This
"banker's rounding" keeps big sums fair - but it surprises everyone at first.

```checkpoint
q: What does `round(4.5)` give?
options: ["4", "5"]
answer: 0
why: Exactly halfway, so Python rounds to the nearest even number - 4.
```
