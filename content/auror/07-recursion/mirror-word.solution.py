def is_mirror(word, left=0, right=None):
    if right is None:
        right = len(word) - 1
    if left >= right:
        return True
    if word[left] != word[right]:
        return False
    return is_mirror(word, left + 1, right - 1)
