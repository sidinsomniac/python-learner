# String spells

- Two pointers: `left, right = 0, len(text) - 1`; move them inwards while the letters match.
- Build long strings with a list of pieces, then `"".join(pieces)`.
- Run-length encoding: `"WWWB"` -> `"3W1B"`. Don't forget the last run when encoding.
- Decoding: counts may have several digits - collect digits until a non-digit arrives.
- Common prefix: compare letter by letter until a word disagrees or runs out.
- Longest palindrome inside a string: spread outwards from each of the 2n - 1 centres.
