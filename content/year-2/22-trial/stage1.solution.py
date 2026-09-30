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
