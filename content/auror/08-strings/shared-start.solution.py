def shared_start(spells):
    if not spells:
        return ""
    first = spells[0]
    for i, letter in enumerate(first):
        for other in spells[1:]:
            if i >= len(other) or other[i] != letter:
                return first[:i]
    return first
