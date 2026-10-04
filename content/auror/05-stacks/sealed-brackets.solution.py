PARTNER = {")": "(", "]": "[", "}": "{"}


def sealed(spell):
    stack = []
    for bracket in spell:
        if bracket not in PARTNER:
            stack.append(bracket)
        elif not stack or stack.pop() != PARTNER[bracket]:
            return False
    return not stack
