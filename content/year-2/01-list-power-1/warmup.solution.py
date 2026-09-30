inventory = ["Fanged Frisbee", "Dungbomb", "Nose-Biting Teacup", "Extendable Ear"]

vanished = inventory.pop()
print(f"Vanished: {vanished}")
inventory.insert(0, "Screaming Yo-yo")
print(sorted(inventory))
print(inventory)
