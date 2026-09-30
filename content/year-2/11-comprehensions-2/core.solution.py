castle = {"mirror": "Silver", "sock": "wool", "cup": "GOLD"}
shiny_materials = ["silver", "gold", "glass"]
hoard = {item: material.lower() for item, material in castle.items() if material.lower() in shiny_materials}
if hoard:
    print(f"Hoard: {', '.join(sorted(hoard))}")
else:
    print("Hoard: empty")
print(" ".join([f"{item}*" if item in hoard else item for item in castle]))
if all(material.lower() in shiny_materials for material in castle.values()):
    print("Every item shines!")
else:
    print("Something is dull.")
