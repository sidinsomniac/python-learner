LEAP_EXAMPLES = [
    (1996, True),
    (2023, False),
    (1900, False),
    (2000, True),
    (1600, True),
    (1896, True),
]


def check_is_leap(candidate):
    for year, expected in LEAP_EXAMPLES:
        if candidate(year) != expected:
            return False
    return True
