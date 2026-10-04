def slot_for(shelf, number):
    lo, hi = 0, len(shelf)
    while lo < hi:
        mid = (lo + hi) // 2
        if shelf[mid] < number:
            lo = mid + 1
        else:
            hi = mid
    return lo
