events = [("Nick's head vanishes", 3, 0), ("A clank from upstairs", 1, 23), ("Filch counts his items", 1, 9)]
timeline = []
for what, day, hour in events:
    timeline.append((day, hour, what))
for day, hour, what in sorted(timeline):
    print(f"Day {day}, {hour:02d}:00 - {what}")
