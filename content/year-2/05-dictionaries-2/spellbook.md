# Counting and grouping

- Count: `counts[x] = counts.get(x, 0) + 1`
- Group: `groups.setdefault(key, []).append(item)` (or check `if key not in groups` first).
- `sorted(d)` gives the keys in order; `max(d.values())` the biggest value.
- One pass with a dictionary beats calling `list.count` for every item.
