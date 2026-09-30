# String methods

- `.upper()`, `.lower()`, `.title()` - change the capitals.
- `.strip()` - remove spaces (and newlines) from both ends.
- `.replace(old, new)` - swap every `old` for `new`.
- `.count(x)`, `.find(x)` (position or `-1`), `.startswith(x)`, `.endswith(x)`.
- `x in text` - True if `x` appears anywhere in `text`.
- Methods can be chained: `name.strip().title()`.
- **Strings never change.** A method gives back a *new* string - store it:
  `name = name.strip()`.
