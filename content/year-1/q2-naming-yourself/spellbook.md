# Variables and input()

- `name = value` stores a value in a variable. Read `=` as "becomes".
- Variable names have no quotes: `print(name)` shows what's inside,
  but `print("name")` shows the word *name*.
- `input("question ")` shows the question and returns what was typed,
  always as a **string**.
- `+` joins strings exactly (add your own spaces). Commas in `print`
  add a space automatically.

```python
name = input("What is your name? ")
print("Hello, " + name + "!")
print("Hello,", name)
```
