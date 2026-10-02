def shortest_run(drops, target):
    left = 0
    total = 0
    best = 0
    for right, drop in enumerate(drops):
        total += drop
        while total >= target:
            length = right - left + 1
            if best == 0 or length < best:
                best = length
            total -= drops[left]
            left += 1
    return best
