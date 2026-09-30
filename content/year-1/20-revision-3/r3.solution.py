dragons = 0
creatures = 0
name = input("Creature (or done)? ")
while name != "done":
    creatures += 1
    if "dragon" in name.lower():
        dragons += 1
    name = input("Creature (or done)? ")
print(f"{dragons} dragons out of {creatures} creatures")
