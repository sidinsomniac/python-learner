def guess_number(ask):
    lo, hi = 1, 100
    while lo <= hi:
        guess = (lo + hi) // 2
        answer = ask(guess)
        if answer == "correct":
            return guess
        if answer == "higher":
            lo = guess + 1
        else:
            hi = guess - 1
    return None
