def rle_encode(text):
    if not text:
        return ""
    pieces = []
    current, count = text[0], 1
    for ch in text[1:]:
        if ch == current:
            count += 1
        else:
            pieces.append(f"{count}{current}")
            current, count = ch, 1
    pieces.append(f"{count}{current}")
    return "".join(pieces)
