def mirror(letters):
    left = 0
    right = len(letters) - 1
    while left < right:
        letters[left], letters[right] = letters[right], letters[left]
        left += 1
        right -= 1
