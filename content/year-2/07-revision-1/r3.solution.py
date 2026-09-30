vanishings = [(3, "trophy room"), (4, "bathroom")]
filch = {3: "dungeons", 4: "office", 5: "trophy room"}
suspect = False
for night, place in vanishings:
    if night not in filch:
        print(f"Night {night}: no record of Filch")
    elif filch[night] == place:
        print(f"Night {night}: Filch WAS in the {place}!")
        suspect = True
    else:
        print(f"Night {night}: Filch was in the {filch[night]}, not the {place}")
if suspect:
    print("Filch is a suspect.")
else:
    print("Filch is cleared.")
