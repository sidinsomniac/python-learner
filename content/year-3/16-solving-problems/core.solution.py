EXAMPLES = [((15, 12), 3), ((2, 22), 4), ((9, 9), 0), ((0, 23), 1)]
IMPOSSIBLE = [(24, 3), (3, -1)]


def check_turns(candidate):
    for (start, target), expected in EXAMPLES:
        if candidate(start, target) != expected:
            return False
    for start, target in IMPOSSIBLE:
        try:
            candidate(start, target)
        except ValueError:
            continue
        return False
    return True


def turns_needed(start, target):
    for hour in (start, target):
        if not isinstance(hour, int) or not 0 <= hour <= 23:
            raise ValueError("hours run from 0 to 23")
    return (start - target) % 24
