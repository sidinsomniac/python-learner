def selection_pass(pages, start):
    smallest = start
    for i in range(start + 1, len(pages)):
        if pages[i] < pages[smallest]:
            smallest = i
    pages[start], pages[smallest] = pages[smallest], pages[start]
