def typed(strokes):
    letters = []
    for stroke in strokes:
        if stroke != "#":
            letters.append(stroke)
        elif letters:
            letters.pop()
    return letters


def same_message(a, b):
    return typed(a) == typed(b)
