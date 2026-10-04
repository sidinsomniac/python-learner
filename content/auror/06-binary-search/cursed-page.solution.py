def first_cursed(pages, is_cursed):
    lo, hi = 1, pages
    while lo < hi:
        mid = (lo + hi) // 2
        if is_cursed(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo
