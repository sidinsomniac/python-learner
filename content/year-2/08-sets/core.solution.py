sightings = [["Draco", "Ginny", "Filch", "Draco"], ["Ginny", "Myrtle"], ["Myrtle", "Draco", "Nick"]]
if sightings:
    every = set(sightings[0])
    anyone = set()
    for names in sightings:
        every &= set(names)
        anyone |= set(names)
    if every:
        print(f"At every vanishing: {', '.join(sorted(every))}")
    else:
        print("At every vanishing: nobody - it isn't a person!")
    print(f"Seen at least once: {len(anyone)}")
else:
    print("No vanishings recorded.")
