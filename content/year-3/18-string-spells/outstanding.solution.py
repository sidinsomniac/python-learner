def grow(text, left, right):
    while left >= 0 and right < len(text) and text[left] == text[right]:
        left -= 1
        right += 1
    return text[left + 1:right]


def longest_palindrome(text):
    best = ""
    for centre in range(2 * len(text) - 1):
        left = centre // 2
        found = grow(text, left, left + centre % 2)
        if len(found) > len(best):
            best = found
    return best
