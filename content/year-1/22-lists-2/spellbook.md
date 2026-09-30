# Lists: two names, one trunk

- `b = a` makes `b` another **name** for the same list. Changes through one show up in both.
- Real copies: `a[:]`, `list(a)`, `a.copy()`.
- Don't add or remove items from a list while looping over it. Loop over a copy, or build a new list.
- `items[i] = value` replaces one item in place.
