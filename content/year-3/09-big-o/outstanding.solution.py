def pair_with_sum(strengths, target):
    first_seen = {}
    for j, strength in enumerate(strengths):
        partner = target - strength
        if partner in first_seen:
            return first_seen[partner], j
        if strength not in first_seen:
            first_seen[strength] = j
    return None
