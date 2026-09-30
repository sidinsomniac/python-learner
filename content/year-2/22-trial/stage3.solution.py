ENGLISH = {"a": 8.2, "b": 1.5, "c": 2.8, "d": 4.3, "e": 12.7, "f": 2.2, "g": 2.0, "h": 6.1, "i": 7.0,
             "j": 0.15, "k": 0.77, "l": 4.0, "m": 2.4, "n": 6.7, "o": 7.5, "p": 1.9, "q": 0.095, "r": 6.0,
             "s": 6.3, "t": 9.1, "u": 2.8, "v": 0.98, "w": 2.4, "x": 0.15, "y": 2.0, "z": 0.074}


def caesar_shift(text, k):
    pieces = []
    for ch in text:
        if "A" <= ch <= "Z":
            pieces.append(chr((ord(ch) - ord("A") + k) % 26 + ord("A")))
        elif "a" <= ch <= "z":
            pieces.append(chr((ord(ch) - ord("a") + k) % 26 + ord("a")))
        else:
            pieces.append(ch)
    return "".join(pieces)


def letter_frequencies(text):
    counts = {}
    for ch in text.lower():
        if "a" <= ch <= "z":
            counts[ch] = counts.get(ch, 0) + 1
    return counts


def crack(text):
    best_shift, best_score, best_text = 0, -1, text
    for shift in range(26):
        attempt = caesar_shift(text, -shift)
        score = sum([ENGLISH[letter] * n for letter, n in letter_frequencies(attempt).items()])
        if score > best_score:
            best_shift, best_score, best_text = shift, score, attempt
    return best_shift, best_text
