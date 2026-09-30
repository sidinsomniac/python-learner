# Types and transfiguration

- Types: `int` (whole), `float` (decimal), `str` (text), `bool` (True/False).
- `type(x)` shows a value's type.
- `input()` **always** returns a string, even when digits are typed.
- `int("9")` is `9`; `int(3.99)` is `3` (it chops, it doesn't round).
- `float("2.5")` is `2.5`; `str(42)` is `"42"`.
- `"ab" * 3` is `"ababab"`; `"ab" + 3` is a `TypeError`.
- Truthiness: `0`, `0.0`, `""` are False. Everything else is True - even `"0"` and `"False"`.
- f-strings: `f"Hello {name}"` drops the value of `name` into the text.
