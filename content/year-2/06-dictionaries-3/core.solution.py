report = {"Monday": {"bathroom": 3, "hall": 1}, "Tuesday": {}, "Wednesday": {"bathroom": 4}}
place_totals = {}
for night, places in report.items():
    night_total = 0
    for place, clanks in places.items():
        night_total += clanks
        place_totals[place] = place_totals.get(place, 0) + clanks
    print(f"{night}: {night_total} clanks")
best = None
for place in sorted(place_totals):
    if best is None or place_totals[place] > place_totals[best]:
        best = place
if best is None or place_totals[best] == 0:
    print("Loudest: nowhere")
else:
    print(f"Loudest: {best} ({place_totals[best]} clanks)")
