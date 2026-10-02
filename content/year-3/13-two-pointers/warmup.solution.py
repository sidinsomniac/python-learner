def pair_with_total(pages, target):
    left, right = 0, len(pages) - 1
    while left < right:
        total = pages[left] + pages[right]
        if total == target:
            return left, right
        if total < target:
            left += 1
        else:
            right -= 1
    return None
