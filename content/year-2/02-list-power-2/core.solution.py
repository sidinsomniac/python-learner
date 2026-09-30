floors = [["mirror", "trophy"], ["badge"]]
backup = []
for floor in floors:
    backup.append(floor.copy())
backup[0].append("goblet")
print("Floors:", floors)
print("Backup:", backup)
