def bounds(scores):
    if not scores:
        return None, None
    lowest = highest = scores[0]
    for score in scores:
        if score < lowest:
            lowest = score
        if score > highest:
            highest = score
    return lowest, highest

def rescale(scores, low=0, high=100):
    lowest, highest = bounds(scores)
    if not scores:
        return []
    if lowest == highest:
        return [low for _ in scores]
    return [round(low + (score - lowest) * (high - low) / (highest - lowest)) for score in scores]
