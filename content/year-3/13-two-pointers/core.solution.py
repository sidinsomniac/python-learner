def longest_clean_run(inks):
    window = set()
    left = 0
    best = 0
    for right, ink in enumerate(inks):
        while ink in window:
            window.remove(inks[left])
            left += 1
        window.add(ink)
        best = max(best, right - left + 1)
    return best
