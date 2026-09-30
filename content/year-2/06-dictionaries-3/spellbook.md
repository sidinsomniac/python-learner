# Nested dictionaries

- Chain lookups: `report["Mon"]["bathroom"]` (outer first, then inner).
- Make the inner dictionary first: `report.setdefault(night, {})[place] = n`.
- Safe two-level lookup: `report.get(night, {}).get(place, 0)`.
- Walk it: `for night, places in report.items():` then `for place, n in places.items():`.
- Values can be lists too: `d[key].append(x)`.
