VALUES = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}


def roman_value(numeral):
    total = 0
    for i, symbol in enumerate(numeral):
        value = VALUES[symbol]
        if i + 1 < len(numeral) and VALUES[numeral[i + 1]] > value:
            total -= value
        else:
            total += value
    return total
