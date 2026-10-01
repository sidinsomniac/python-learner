# Big-O

- Count steps; ask how they grow when the input doubles.
- O(1) constant · O(log n) halving · O(n) one pass · O(n log n) sorting · O(n²) every pair.
- One million items: O(n) is instant, O(n²) takes days.
- Hidden loops: `x in list`, `.index`, `.count`, slicing and copying are O(n).
- `x in set` and `x in dict` are O(1) - use them to remember what you've seen.
- Keep only the fastest-growing part: `3n + 10` is O(n).
