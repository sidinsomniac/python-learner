def sort_with_swaps(pages):
    swaps = []
    for start in range(len(pages) - 1):
        smallest = start
        for i in range(start + 1, len(pages)):
            if pages[i] < pages[smallest]:
                smallest = i
        if smallest != start:
            pages[start], pages[smallest] = pages[smallest], pages[start]
            swaps.append((start, smallest))
    return swaps
