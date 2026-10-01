def total_galleons(path):
    with open(path) as vault:
        lines = vault.read().splitlines()[1:]
    total = 0
    for line in lines:
        parts = line.split(",")
        if len(parts) != 2:
            continue
        try:
            total += int(parts[1])
        except ValueError:
            continue
    return total
