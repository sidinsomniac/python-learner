# Sorting by hand

- **Selection sort**: for each position, find the smallest of the rest and swap it in. At most one swap per pass, but always O(n²) looks. Not stable.
- **Insertion sort**: take the next item and slide it left past bigger items. O(n) on nearly sorted data, O(n²) on reversed data. Stable if it only slides past items that are strictly bigger.
- In place: they rearrange the given list (and return nothing).
- In real spells, use `sorted()` / `.sort()`: O(n log n), stable, and well tested.
