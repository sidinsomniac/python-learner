def shift_letter(ch, k):
    if "A" <= ch <= "Z":
        start = ord("A")
    elif "a" <= ch <= "z":
        start = ord("a")
    else:
        return ch
    return chr((ord(ch) - start + k) % 26 + start)
