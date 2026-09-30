# Dictionaries

- `d = {"key": value}`; look up with `d["key"]` (KeyError if missing).
- `d[key] = value` adds or replaces. Keys are unique and unchangeable (str, int, tuple).
- `key in d` checks keys. `d.get(key, default)` never crashes.
- `del d[key]`, or `d.pop(key)` to remove and return.
- `for k in d:` loops over keys; `for k, v in d.items():` over pairs; `d.values()` for values.
- `len(d)` counts pairs. Dictionaries remember insertion order.
