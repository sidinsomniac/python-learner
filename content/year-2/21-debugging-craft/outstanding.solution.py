def ledger_summary(lines, totals=None):
    if totals is None:
        totals = {}
    for line in lines:
        item, colon, count = line.partition(":")
        if colon:
            name = item.strip()
            totals[name] = totals.get(name, 0) + int(count)
    return totals, sum(totals.values())

print(ledger_summary(["mirror: 2", "cup:3", "smudge", "mirror : 1"]))
