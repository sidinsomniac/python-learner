# Nested data

- A list of dictionaries = a table of records. `records[i]["key"][j]` reads left to right.
- `for record in records:` hands you one whole dictionary each pass.
- Missing fields: `record.get("key", default)`.
- Build an index: `index.setdefault(key, []).append(x)` (or `.extend(many)`).
- In f-strings with double quotes, use single-quoted keys: `f"{r['name']}"`.
- Confused? Draw boxes and arrows, or use the Pensieve.
