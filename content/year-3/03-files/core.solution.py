def to_year(text):
    try:
        return int(text)
    except ValueError:
        return None


def load_ledger(path):
    with open(path) as ledger:
        lines = ledger.read().splitlines()
    rows = []
    for line in lines[1:]:
        parts = [part.strip() for part in line.split(",")]
        if len(parts) < 3:
            continue
        started = to_year(parts[2])
        if started is None:
            continue
        left = to_year(parts[3]) if len(parts) > 3 else None
        rows.append({"name": parts[0], "house": parts[1], "started": started, "left": left})
    return rows
