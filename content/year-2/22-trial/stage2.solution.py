def letter_frequencies(text):
    counts = {}
    for ch in text.lower():
        if "a" <= ch <= "z":
            counts[ch] = counts.get(ch, 0) + 1
    return counts
