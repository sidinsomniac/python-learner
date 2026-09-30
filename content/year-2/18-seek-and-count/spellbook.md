# Seek and count

- Linear search: check each item in turn - O(n). `x in list` and `list.index` do this.
- A loop inside a loop over the same data: O(n²). 20,000 items -> 400,000,000 steps.
- Sets and dictionaries look up in one step. Build one when you'll search many times.
- Two pointers on sorted lists: compare the fronts, take the smaller, move that pointer on; then add what's left.
- Grouping: a signature per item as a dictionary key - one pass, O(n).
