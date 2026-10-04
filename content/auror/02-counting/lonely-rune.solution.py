from collections import Counter


def first_lonely(runes):
    counts = Counter(runes)
    for i, rune in enumerate(runes):
        if counts[rune] == 1:
            return i
    return -1
