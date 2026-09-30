# Lesson 15: Wizard's Chess

A loop can live **inside** another loop. The inner loop runs completely, for
every single pass of the outer loop:

```python
for row in range(2):
    for col in range(3):
        print("row", row, "col", col)
```

That prints 6 lines - 2 rows x 3 columns.

```checkpoint
q: 'How many times does the inner body run in `for i in range(4):` / `for j in range(5):`?'
options: ["9", "20", "5"]
answer: 1
why: The inner loop runs 5 times for each of the 4 outer passes - 4 x 5 = 20.
```

## Building a row, then printing it

To draw a grid, build each row as a string, then print it:

```python
for row in range(3):
    line = ""
    for col in range(4):
        line += "o"
    print(line)
```

The inner loop can use the outer loop's variable - that's how you make
patterns that change from row to row:

```python
for row in range(1, 4):
    print("#" * row + "." * (3 - row))
```

## Alternating patterns

Is a square "odd" or "even"? `(row + col) % 2` answers it - and it flips
between 0 and 1 as you move along a row *and* down a column.
