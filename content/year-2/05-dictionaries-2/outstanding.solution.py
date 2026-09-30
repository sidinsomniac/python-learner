record = ["mirror", "trophy", "mirror", "sock", "trophy", "mirror", "trophy"]
if record:
    tally = {}
    for kind in record:
        tally[kind] = tally.get(kind, 0) + 1
    top = max(tally.values())
    winners = []
    for kind in sorted(tally):
        if tally[kind] == top:
            winners.append(kind)
    if len(winners) == 1:
        print(f"Most wanted: {winners[0]} ({top})")
    else:
        print(f"Most wanted: {', '.join(winners)} ({top} each)")
else:
    print("Nothing vanished.")
