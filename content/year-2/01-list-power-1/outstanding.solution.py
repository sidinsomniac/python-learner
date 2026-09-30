shelf = ["a", "b", "c", "d"]
k = 1

if shelf:
    for _ in range(k % len(shelf)):
        shelf.insert(0, shelf.pop())
print(shelf)
