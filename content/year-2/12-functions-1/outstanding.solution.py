def collect_admirers(letters, minimum):
    chosen = []
    seen = set()
    for sender, hearts in letters:
        if hearts >= minimum and sender not in seen:
            chosen.append(sender)
            seen.add(sender)
    return chosen

def top_admirer(letters):
    totals = {}
    for sender, hearts in letters:
        totals[sender] = totals.get(sender, 0) + hearts
    best = None
    for sender in totals:
        if best is None or totals[sender] > totals[best]:
            best = sender
    return best
