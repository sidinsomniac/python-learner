import random

def strike_hours(seed, nights):
    random.seed(seed)
    return [random.randint(0, 23) for _ in range(nights)]

def first_midnight(seed, nights):
    for night, hour in enumerate(strike_hours(seed, nights), start=1):
        if hour == 0:
            return night
    return None
