def majority(votes):
    tally = {}
    for house in votes:
        tally[house] = tally.get(house, 0) + 1
        if tally[house] * 2 > len(votes):
            return house
    return None
