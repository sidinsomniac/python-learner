def parse_slip(line):
    parts = [part.strip() for part in line.split(",")]
    if len(parts) != 3:
        raise ValueError("expected 3 fields")
    name, year_text, house = parts
    if not name:
        raise ValueError("no name")
    try:
        year = int(year_text)
    except ValueError:
        raise ValueError("year is not a number")
    if not 3 <= year <= 7:
        raise ValueError("year must be 3-7")
    return name, year, house


def check_sack(lines):
    names = []
    problems = []
    for number, line in enumerate(lines, start=1):
        if not line.strip():
            continue
        try:
            name, _, _ = parse_slip(line)
        except ValueError as err:
            problems.append(f"line {number}: {err}")
        else:
            names.append(name)
    return names, problems
