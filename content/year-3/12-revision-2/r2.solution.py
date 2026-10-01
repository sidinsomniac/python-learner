def find_page(pages, wanted):
    lo, hi = 0, len(pages) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if pages[mid] == wanted:
            return mid
        if pages[mid] < wanted:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
