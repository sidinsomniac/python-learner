HEADER = "name,house,started,left"


def to_year(text):
    try:
        return int(text)
    except ValueError:
        return None


def clean_copy(source, target):
    with open(source) as ledger:
        lines = ledger.read().splitlines()
    kept = [HEADER]
    dropped = 0
    for line in lines[1:]:
        if not line.strip():
            continue
        parts = [part.strip() for part in line.split(",")]
        started = to_year(parts[2]) if len(parts) >= 3 else None
        if started is None:
            dropped += 1
            continue
        left = to_year(parts[3]) if len(parts) > 3 else None
        left_text = "" if left is None else str(left)
        kept.append(f"{parts[0]},{parts[1]},{started},{left_text}")
    with open(target, "w") as fair:
        for line in kept:
            fair.write(line + "\n")
    return dropped
