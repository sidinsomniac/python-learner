def insertion_sort(pages):
    moves = 0
    for i in range(1, len(pages)):
        page = pages[i]
        j = i - 1
        while j >= 0 and pages[j] > page:
            pages[j + 1] = pages[j]
            j -= 1
            moves += 1
        pages[j + 1] = page
    return moves
