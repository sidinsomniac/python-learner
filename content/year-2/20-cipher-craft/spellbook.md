# Ciphers

- `ord("A")` is 65, `ord("a")` is 97; `chr(65)` is "A".
- Alphabet position: `ord(ch) - ord("A")` (0-25). Back: `chr(pos + ord("A"))`.
- Wrap: `(pos + k) % 26` - works for negative shifts too.
- Decode = encode with `-k`. Keep case; leave non-letters alone.
- Build strings from a list of pieces with `"".join(pieces)`.
- Frequency analysis: in English, E is the most common letter.
