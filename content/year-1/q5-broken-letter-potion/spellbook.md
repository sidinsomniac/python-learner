# Type conversion and f-strings

- `input()` **always** returns a string, even when digits are typed.
- `int("9")` gives `9`, `float("2.5")` gives `2.5`, and `str(42)` gives `"42"`.
- Mixing numbers and text in maths raises a `TypeError`.
- f-strings: `f"Hello {name}"` drops the value of `name` into the text.
  You can even put expressions in them: `f"{11 - age} years"`.

```python
age = int(input("Age? "))
print(f"In ten years you will be {age + 10}.")
```
