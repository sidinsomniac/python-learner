def find(spells, target):
    lo, hi = 0, len(spells) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        spell = spells[mid]
        if spell == target:
            return mid
        if spell < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
