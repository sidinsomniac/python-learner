# len, indexing and slicing

- `len(text)` - how many characters.
- `text[0]` - first character; `text[-1]` - last. Counting starts at **0**.
- Indexing past the end is an `IndexError`.
- `text[start:stop]` - from `start` up to but **not including** `stop`.
- `text[:3]` - first 3; `text[3:]` - everything from position 3; `text[-3:]` - last 3.
- Slices never raise errors - they stop at the end of the string.
