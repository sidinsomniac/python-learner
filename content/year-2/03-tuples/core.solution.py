vanishings = [(2, "east"), (2, "west"), (2, "east")]
if vanishings:
    floors = []
    for number, (floor, corridor) in enumerate(vanishings, start=1):
        print(f"{number}. Floor {floor}, {corridor} corridor")
        floors.append(floor)
    print(f"Floors {min(floors)} to {max(floors)}")
else:
    print("No vanishings yet.")
