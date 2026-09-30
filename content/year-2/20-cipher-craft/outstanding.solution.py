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

def crack_by_e(text):
    counts = {}
    for ch in text.lower():
        if "a" <= ch <= "z":
            counts[ch] = counts.get(ch, 0) + 1
    if not counts:
        return 0, text
    top = None
    for letter in sorted(counts):
        if top is None or counts[letter] > counts[top]:
            top = letter
    shift = (ord(top) - ord("e")) % 26
    return shift, decode(text, shift)
