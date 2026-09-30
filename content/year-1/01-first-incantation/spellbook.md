# print(), strings and comments

- `print(...)` shows what's inside the brackets, then moves to a new line.
- **Strings** are text in quotes: `"hello"` or `'hello'`.
- To show quotes inside a string, wrap it in the *other* kind: `'He said "hi"'`.
- `print()` on its own shows an empty line.
- `\n` inside a string starts a new line.
- `#` starts a comment. Python ignores the rest of that line.

**Common mistakes**
- Forgetting the quotes: `print(Hello)` gives a `NameError`.
- Mismatched quotes: `print("Hello')` gives a `SyntaxError`.
- A capital `P`: `Print(...)` gives a `NameError`, because Python is case-sensitive.
