def brightest(readings, k):
    window = sum(readings[:k])
    best = window
    for i in range(k, len(readings)):
        window += readings[i] - readings[i - k]
        best = max(best, window)
    return best
