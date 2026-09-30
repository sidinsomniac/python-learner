myrtle = {"Mon": {"bathroom": 3}, "Tue": {"pipes": 2}}
nick = {"Mon": {"bathroom": 2, "hall": 1}}
merged = {}
for ghost_report in [myrtle, nick]:
    for night, places in ghost_report.items():
        inner = merged.setdefault(night, {})
        for place, clanks in places.items():
            inner[place] = inner.get(place, 0) + clanks
for night in sorted(merged):
    for place in sorted(merged[night]):
        print(night, place, merged[night][place])
