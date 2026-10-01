def first_faded(n, is_faded):
    lo, hi = 1, n
    first = None
    while lo <= hi:
        mid = (lo + hi) // 2
        if is_faded(mid):
            first = mid
            hi = mid - 1
        else:
            lo = mid + 1
    return first
