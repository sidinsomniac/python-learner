def turn(hours):
    if hours == 0:
        return [0]
    return [hours] + turn(hours - 1)
