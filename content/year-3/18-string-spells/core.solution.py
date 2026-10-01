def rle_decode(code):
    pieces = []
    digits = ""
    for ch in code:
        if ch.isdigit():
            digits += ch
        else:
            pieces.append(ch * int(digits))
            digits = ""
    return "".join(pieces)
