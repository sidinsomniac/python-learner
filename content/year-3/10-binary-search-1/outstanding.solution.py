def insert_position(items, x):
    lo, hi = 0, len(items)
    while lo < hi:
        mid = (lo + hi) // 2
        if items[mid] < x:
            lo = mid + 1
        else:
            hi = mid
    return lo
