register = ["Dungbomb", "Yo-yo", "Dungbomb", "Quill", "Yo-yo", "Dungbomb"]
counts = {}
for item in register:
    counts[item] = counts.get(item, 0) + 1
duplicates = 0
for item, n in counts.items():
    if n > 1:
        print(f"{item} x{n}")
        duplicates += 1
print(f"Duplicates: {duplicates}")
