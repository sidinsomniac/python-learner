# Files

- `with open("name.txt") as f:` - read; the file closes when the block ends.
- `for line in f:` - one line at a time, each ending in `\n`; use `line.strip()`.
- `f.read()` (one string), `f.read().splitlines()` (lines without `\n`), `f.readlines()` (with `\n`).
- Skip blank lines: `if not line.strip(): continue`.
- CSV: `parts = [p.strip() for p in line.split(",")]`; the first line is often a header: `lines[1:]`.
- Everything in a file is text - convert numbers yourself, and catch `ValueError`.
- Write: `open(name, "w")` wipes or creates; `"a"` appends. `write` adds no newline.
- A missing file raises `FileNotFoundError`.
