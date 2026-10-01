def first_sighting(days, day):
    lo, hi = 0, len(days) - 1
    found = -1
    while lo <= hi:
        mid = (lo + hi) // 2
        here = days[mid]
        if here < day:
            lo = mid + 1
        else:
            if here == day:
                found = mid
            hi = mid - 1
    return found
