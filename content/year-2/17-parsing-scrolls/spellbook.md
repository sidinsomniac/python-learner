# Parsing text

- `text.split()` - on any whitespace, no empty pieces. `text.split(",")` - on exactly ",", keeps empty pieces.
- `sep.join(strings)` - the reverse. Only strings! (`str(n)` first.)
- `text.splitlines()` - one piece per line.
- `line.partition(":")` - (before, ":", after), splitting at the FIRST ":" only.
- Clean with `.strip()`, `.lower()`; check with `.isdigit()` before `int()`.
- Skip lines you don't understand rather than crashing.
- `zip(a, b)` pairs lists up; `dict(zip(keys, values))`; `text.ljust(width)` pads on the right.
