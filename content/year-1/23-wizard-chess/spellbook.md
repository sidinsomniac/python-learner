# Nested loops

```python
for row in range(rows):
    line = ""
    for col in range(cols):
        line += ...
    print(line)
```

- The inner loop runs completely for every pass of the outer loop.
- Build each row as a string, then print it.
- The inner loop can use the outer variable (`row`) to change the pattern.
- `(row + col) % 2` alternates like a chessboard.
