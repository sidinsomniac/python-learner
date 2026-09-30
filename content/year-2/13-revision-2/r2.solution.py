def common_floor(sightings):
    counts = {}
    for s in sightings:
        counts[s["floor"]] = counts.get(s["floor"], 0) + 1
    best = None
    for floor in sorted(counts):
        if best is None or counts[floor] > counts[best]:
            best = floor
    return best
