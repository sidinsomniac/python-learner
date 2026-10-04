def settle(runes):
    kept = []
    for rune in runes:
        if kept and kept[-1] == rune:
            kept.pop()
        else:
            kept.append(rune)
    return "".join(kept)
