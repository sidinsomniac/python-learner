def calls_needed(n):
    if n < 2:
        return 1
    return 1 + calls_needed(n - 1) + calls_needed(n - 2)
