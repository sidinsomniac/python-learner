def shift_letter(ch, k):
    if "A" <= ch <= "Z":
        start = ord("A")
    elif "a" <= ch <= "z":
        start = ord("a")
    else:
        return ch
    return chr((ord(ch) - start + k) % 26 + start)

def caesar(text, k):
    return "".join([shift_letter(ch, k) for ch in text])

def decode(text, k):
    return caesar(text, -k)

print(decode("FKDPEHU RI FROOHFWLRQV LV RSHQ", 3))
