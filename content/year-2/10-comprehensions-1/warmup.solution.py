hearts = [5, 1, 3, 7, 2]
print([h * 2 for h in hearts])
print([h for h in hearts if h >= 3])
print(f"Odd total: {sum([h for h in hearts if h % 2 == 1])}")
