def owl_pair(strengths, weight):
    seen = {}
    for i, strength in enumerate(strengths):
        partner = weight - strength
        if partner in seen:
            return (seen[partner], i)
        seen[strength] = i
    return None
