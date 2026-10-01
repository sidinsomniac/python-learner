def average_reading(readings):
    good = []
    for reading in readings:
        try:
            good.append(float(reading))
        except ValueError:
            continue
    if not good:
        return None
    return round(sum(good) / len(good), 2)
