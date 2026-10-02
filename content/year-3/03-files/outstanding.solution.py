import json


def to_year(text):
    try:
        return int(text)
    except ValueError:
        return None


def ledger_to_json(source, target):
    with open(source) as ledger:
        lines = ledger.read().splitlines()
    students = []
    for line in lines[1:]:
        parts = [part.strip() for part in line.split(",")]
        if len(parts) < 3:
            continue
        started = to_year(parts[2])
        if started is None:
            continue
        left = to_year(parts[3]) if len(parts) > 3 else None
        students.append({"name": parts[0], "house": parts[1], "started": started, "left": left})
    with open(target, "w") as out:
        json.dump(students, out, indent=2)
    return len(students)
