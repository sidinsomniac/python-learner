def collect(item, bag=None):
    if bag is None:
        bag = []
    bag.append(item)
    return bag

print(collect("mirror"))
print(collect("cup"))
