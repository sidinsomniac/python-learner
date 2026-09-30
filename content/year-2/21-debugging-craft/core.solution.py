def uncollect(hoard, owner):
    returned = []
    for pair in hoard[:]:
        if pair[1].lower() == owner.lower():
            returned.append(pair[0])
            hoard.remove(pair)
    return returned

hoard = [("mirror", "Myrtle"), ("tiara", "myrtle"), ("head", "Nick"), ("cup", "Myrtle")]
print(uncollect(hoard, "Myrtle"), hoard)
