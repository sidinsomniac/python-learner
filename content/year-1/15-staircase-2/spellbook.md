# if gotchas

- **The or-trap:** `x == "a" or "b"` is always truthy. Write
  `x == "a" or x == "b"`.
- **elif order:** only the first True branch runs - check the strictest
  condition first.
- **`=` vs `==`:** `if x = 5:` is a SyntaxError. Use `==` to compare.
- **Nesting:** an `if` inside an `if` works, but `and` or an `elif` chain is
  often clearer.
