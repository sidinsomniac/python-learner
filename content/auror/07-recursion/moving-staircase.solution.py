remembered = {}


def ways(n):
    if n <= 1:
        return 1
    if n not in remembered:
        remembered[n] = ways(n - 1) + ways(n - 2)
    return remembered[n]
