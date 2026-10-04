def longest_rise(temps):
    if not temps:
        return 0
    run = best = 1
    for before, now in zip(temps, temps[1:]):
        run = run + 1 if now > before else 1
        best = max(best, run)
    return best
