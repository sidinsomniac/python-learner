def group_anagrams(words):
    shelves = {}
    for word in words:
        signature = "".join(sorted(word.lower()))
        shelves.setdefault(signature, []).append(word)
    return list(shelves.values())
